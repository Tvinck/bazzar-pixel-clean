import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';
import { getUserUUID, getUserBalance, deductCredits } from '../helpers/utils.js';
import { CHAT_CONFIGS, FREE_MESSAGES_GLOBAL, EXPERT_MESSAGE_COST, CHAT_SUGGESTIONS } from '../data/experts.js';

const router = express.Router();

// Universal Chat endpoint
router.post('/:chatType', authTG, async (req, res) => {
    try {
        const chatType = req.params.chatType.toLowerCase();
        const { message, imageBase64 } = req.body;
        const telegramId = req.tgUser?.id;

        if (!message && !imageBase64) {
            return res.status(400).json({ error: 'Missing message or image' });
        }

        const chatConfig = CHAT_CONFIGS[chatType];
        if (!chatConfig) {
            return res.status(400).json({ error: 'Unknown chat type' });
        }

        const userUUID = await getUserUUID(telegramId, req.tgUser);
        if (!userUUID) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Get user profile for personalization
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userUUID)
            .single();

        // Check free trial status (GLOBAL)
        const { data: allTrials, error: trialsError } = await supabase
            .from('expert_free_trials')
            .select('expert_id, messages_used')
            .eq('user_id', userUUID);

        if (trialsError) console.error('❌ Error fetching trials:', trialsError);

        const totalMessagesUsed = allTrials?.reduce((sum, t) => sum + (t.messages_used || 0), 0) || 0;
        const hasFreeMessages = totalMessagesUsed < FREE_MESSAGES_GLOBAL;
        const currentBalance = await getUserBalance(telegramId);

        if (!hasFreeMessages && currentBalance < EXPERT_MESSAGE_COST) {
            return res.status(402).json({
                error: 'Недостаточно зарядов',
                errorCode: 'INSUFFICIENT_BALANCE',
                required: EXPERT_MESSAGE_COST,
                balance: currentBalance,
                message: `Для отправки сообщения нужен ${EXPERT_MESSAGE_COST} заряд.`
            });
        }

        // Build messages
        let userMessageContent = message || 'Опиши это изображение';
        let dbMessageContent = message;

        if (imageBase64) {
            userMessageContent = [
                { type: "text", text: message || "Опиши это изображение" },
                { type: "image_url", image_url: { url: imageBase64 } }
            ];
            dbMessageContent = `[Фото] ${message || ''}`.trim();
        }

        const validMessages = [
            { role: 'system', content: chatConfig.systemPrompt + `\n\nОтвечай на русском языке.` },
            { role: 'user', content: userMessageContent }
        ];

        const apiKey = process.env.KIE_API_KEY;
        const defapiKey = process.env.DEFAPI_KEY;

        const finalizeResponse = async (responseText, isFallback = false) => {
            let newBalance = currentBalance;
            if (hasFreeMessages) {
                // Update trials for 'universal' type if we want, or shared
                await supabase.from('expert_free_trials').upsert({
                    user_id: userUUID,
                    expert_id: chatType,
                    messages_used: (allTrials?.find(t => t.expert_id === chatType)?.messages_used || 0) + 1
                }, { onConflict: 'user_id,expert_id' });
            } else {
                const deductResult = await deductCredits(telegramId, EXPERT_MESSAGE_COST, `Chat: ${chatConfig.name}`, 'chat');
                newBalance = deductResult.newBalance;
            }

            // Save to history
            const { data: conversation } = await supabase
                .from('expert_conversations')
                .select('id, message_count')
                .eq('user_id', userUUID)
                .eq('expert_id', `chat_${chatType}`)
                .single();

            if (conversation) {
                await supabase.from('expert_messages').insert([
                    { conversation_id: conversation.id, role: 'user', content: dbMessageContent },
                    { conversation_id: conversation.id, role: 'assistant', content: responseText }
                ]);

                await supabase.from('expert_conversations')
                    .update({
                        updated_at: new Date().toISOString(),
                        message_count: (conversation.message_count || 0) + 2
                    })
                    .eq('id', conversation.id);
            } else {
                const { data: newConv } = await supabase
                    .from('expert_conversations')
                    .insert({ user_id: userUUID, expert_id: `chat_${chatType}`, message_count: 2 })
                    .select()
                    .single();

                if (newConv) {
                    await supabase.from('expert_messages').insert([
                        { conversation_id: newConv.id, role: 'user', content: dbMessageContent },
                        { conversation_id: newConv.id, role: 'assistant', content: responseText }
                    ]);
                }
            }

            return res.json({
                success: true,
                response: responseText,
                balance: newBalance,
                chat: { name: chatConfig.name, emoji: chatConfig.emoji }
            });
        };

        // 1. Kie.ai
        if (apiKey) {
            try {
                const response = await fetch('https://api.kie.ai/gemini-3-flash/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: validMessages, stream: false })
                });
                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content?.trim();
                    if (text) return await finalizeResponse(text);
                }
            } catch (e) { console.error('Kie Error:', e); }
        }

        // 2. Fallback: DEFAPI
        if (defapiKey) {
            try {
                const response = await fetch('https://api.defapi.org/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${defapiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'gpt-4o-mini', messages: validMessages, stream: false })
                });
                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content?.trim();
                    if (text) return await finalizeResponse(text, true);
                }
            } catch (e) { console.error('DEFAPI Error:', e); }
        }

        throw new Error('AI services unavailable');

    } catch (error) {
        console.error('Universal Chat Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get universal chat history
router.get('/:chatType/history', authTG, async (req, res) => {
    try {
        const { chatType } = req.params;
        const telegramId = req.tgUser?.id;

        if (!CHAT_CONFIGS[chatType]) {
            return res.status(400).json({ error: 'Unknown chat type' });
        }

        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentBalance = await getUserBalance(telegramId);

        // Get trial info (GLOBAL check)
        const { data: allTrials } = await supabase
            .from('expert_free_trials')
            .select('messages_used')
            .eq('user_id', userUUID);

        const totalMessagesUsed = allTrials?.reduce((sum, t) => sum + (t.messages_used || 0), 0) || 0;
        const freeMessagesLeft = Math.max(0, FREE_MESSAGES_GLOBAL - totalMessagesUsed);

        // Get conversation
        const { data: conversation } = await supabase
            .from('expert_conversations')
            .select('id')
            .eq('user_id', userUUID)
            .eq('expert_id', `chat_${chatType}`)
            .single();

        let messages = [];
        if (conversation) {
            const { data: dbMessages } = await supabase
                .from('expert_messages')
                .select('id, role, content, rating, created_at')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true });

            messages = dbMessages || [];
        }

        const chatConfig = CHAT_CONFIGS[chatType];
        res.json({
            chatType,
            chat: { name: chatConfig.name, emoji: chatConfig.emoji },
            messages,
            balance: currentBalance,
            freeMessagesLeft
        });
    } catch (error) {
        console.error('Get Chat History Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Reset universal chat history (New Dialog)
router.post('/:chatType/reset', authTG, async (req, res) => {
    try {
        const { chatType } = req.params;
        const telegramId = req.tgUser.id;

        const userUUID = await getUserUUID(telegramId, req.tgUser);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { data: conversation } = await supabase
            .from('expert_conversations')
            .select('id')
            .eq('user_id', userUUID)
            .eq('expert_id', `chat_${chatType}`)
            .single();

        if (conversation) {
            // Delete messages for this conversation
            await supabase.from('expert_messages').delete().eq('conversation_id', conversation.id);
            // Reset message count
            await supabase.from('expert_conversations').update({ message_count: 0 }).eq('id', conversation.id);
        }

        res.json({ success: true, message: 'История диалога очищена' });
    } catch (e) {
        console.error('Reset Universal Chat Error:', e);
        res.status(500).json({ error: 'Failed to reset chat' });
    }
});

// Get chat suggestions
router.get('/:chatType/suggestions', (req, res) => {
    const { chatType } = req.params;
    res.json({
        suggestions: CHAT_SUGGESTIONS?.[chatType] || ['Привет', 'Помоги мне', 'Расскажи что-нибудь']
    });
});

export default router;
