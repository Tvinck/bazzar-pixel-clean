import express from 'express';
import { supabase, botAnalytics } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';
import { getUserUUID, getUserBalance, deductCredits } from '../helpers/utils.js';
import { EXPERT_CONFIGS, EXPERT_MESSAGE_COST, FREE_MESSAGES_GLOBAL, EXPERT_SUGGESTIONS } from '../data/experts.js';

const router = express.Router();

// Get all experts list
router.get('/', (req, res) => {
    const experts = Object.entries(EXPERT_CONFIGS).map(([id, config]) => ({
        id,
        name: config.name,
        emoji: config.emoji,
        cost: EXPERT_MESSAGE_COST
    }));

    res.json({
        experts,
        costPerMessage: EXPERT_MESSAGE_COST,
        freeMessagesPerExpert: FREE_MESSAGES_GLOBAL,
        model: 'Gemini 1.5 Flash (via Kie.ai) / GPT-4o-mini (via DEFAPI)'
    });
});

// Main chat endpoint
router.post('/chat', authTG, async (req, res) => {
    try {
        const { expertId, message, imageBase64, history = [] } = req.body;
        const telegramId = req.tgUser?.id;

        if (!expertId || !message) return res.status(400).json({ error: 'Missing expertId or message' });

        const expertConfig = EXPERT_CONFIGS[expertId];
        if (!expertConfig) return res.status(400).json({ error: 'Unknown expert' });

        const userUUID = await getUserUUID(telegramId, req.tgUser);
        if (!userUUID) return res.status(401).json({ error: 'User not found' });

        // Check free trial status (GLOBAL)
        const { data: allTrials } = await supabase
            .from('expert_free_trials')
            .select('expert_id, messages_used')
            .eq('user_id', userUUID);

        const totalMessagesUsed = allTrials?.reduce((sum, t) => sum + (t.messages_used || 0), 0) || 0;
        const currentTrial = allTrials?.find(t => t.expert_id === expertId);
        const freeMessagesUsed = currentTrial?.messages_used || 0;
        const hasFreeMessages = totalMessagesUsed < FREE_MESSAGES_GLOBAL;
        const freeMessagesLeft = Math.max(0, FREE_MESSAGES_GLOBAL - totalMessagesUsed - 1);

        const currentBalance = await getUserBalance(telegramId);
        if (!hasFreeMessages && currentBalance < EXPERT_MESSAGE_COST) {
            return res.status(402).json({
                error: 'Недостаточно зарядов',
                errorCode: 'INSUFFICIENT_BALANCE',
                required: EXPERT_MESSAGE_COST,
                balance: currentBalance,
                freeMessagesLeft: 0,
                message: `Для отправки сообщения нужен ${EXPERT_MESSAGE_COST} заряд. Ваш баланс: ${currentBalance}`
            });
        }

        // Get or create conversation
        let { data: conversation } = await supabase
            .from('expert_conversations')
            .select('*')
            .eq('user_id', userUUID)
            .eq('expert_id', expertId)
            .single();

        if (!conversation) {
            const { data: newConv } = await supabase
                .from('expert_conversations')
                .insert({ user_id: userUUID, expert_id: expertId })
                .select()
                .single();
            conversation = newConv;
        }

        // Build messages
        const apiKey = process.env.KIE_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'AI API key not configured' });

        const chatMessages = [
            { role: 'system', content: expertConfig.systemPrompt + '\n\nОтвечай на русском языке. Будь полезным и дружелюбным.' }
        ];

        if (conversation) {
            const { data: dbMessages } = await supabase
                .from('expert_messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true })
                .limit(20);

            if (dbMessages?.length) {
                dbMessages.forEach(m => chatMessages.push({ role: m.role, content: m.content }));
            }
        }

        let userMessageContent = message;
        let dbMessageContent = message;

        if (imageBase64) {
            userMessageContent = [
                { type: "text", text: message || "Опиши это изображение" },
                { type: "image_url", image_url: { url: imageBase64 } }
            ];
            dbMessageContent = `[Фото] ${message || ''}`.trim();
        }

        chatMessages.push({ role: 'user', content: userMessageContent });

        const validMessages = chatMessages
            .filter(m => m.content && (Array.isArray(m.content) || m.content.trim() !== ''))
            .map(m => ({ role: m.role || 'user', content: m.content }));

        // Helper to finalize response
        const finalizeChatResponse = async (responseText, isFallback) => {
            console.log(`✅ AI Response (${isFallback ? 'Fallback' : 'Primary'}):`, responseText.substring(0, 50) + '...');

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
            }

            let newBalance = currentBalance;
            let isFreeMessage = false;

            if (hasFreeMessages) {
                isFreeMessage = true;
                await supabase.from('expert_free_trials').upsert({
                    user_id: userUUID,
                    expert_id: expertId,
                    messages_used: freeMessagesUsed + 1
                }, { onConflict: 'user_id,expert_id' });
            } else {
                const deductResult = await deductCredits(telegramId, EXPERT_MESSAGE_COST, `Чат: ${expertConfig.name}`, 'expert_chat');
                if (!deductResult.success) {
                    return res.status(402).json({
                        error: deductResult.error || 'Недостаточно зарядов',
                        errorCode: 'INSUFFICIENT_BALANCE',
                        balance: deductResult.balance || currentBalance
                    });
                }
                newBalance = deductResult.newBalance;
            }

            if (telegramId) {
                botAnalytics.trackEvent(telegramId, 'expert_chat', {
                    expertId, cost: isFreeMessage ? 0 : EXPERT_MESSAGE_COST, isFreeMessage
                }).catch(() => { });
            }

            const lowBalanceWarning = !hasFreeMessages && newBalance < 5;

            return res.json({
                success: true,
                response: responseText,
                balance: newBalance,
                freeMessagesLeft: Math.max(0, freeMessagesLeft),
                isFreeMessage,
                expert: { name: expertConfig.name, emoji: expertConfig.emoji },
                lowBalance: lowBalanceWarning,
                lowBalanceMessage: lowBalanceWarning
                    ? `⚠️ Осталось мало зарядов (${newBalance}). Пополните баланс!`
                    : null
            });
        };

        // --- AI CHAIN ---
        try {
            const response = await fetch('https://api.kie.ai/gemini-3-flash/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: validMessages, stream: false, include_thoughts: true })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data.choices?.[0]?.message?.content?.trim();
                if (text) return await finalizeChatResponse(text, false);
            }
        } catch (e) {
            console.error('❌ Kie.ai Error:', e.message);
        }

        // Fallback: DEFAPI
        const defapiKey = process.env.DEFAPI_KEY;
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
                    if (text) return await finalizeChatResponse(text, true);
                }
            } catch (e) {
                console.error('❌ DEFAPI Error:', e.message);
            }
        }

        throw new Error('Все AI сервисы временно недоступны. Попробуйте позже.');

    } catch (e) {
        console.error('🎯 Experts Chat Outer Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// Reset conversation history (New Dialog)
router.post('/:expertId/reset', authTG, async (req, res) => {
    try {
        const { expertId } = req.params;
        const telegramId = req.tgUser.id;

        const userUUID = await getUserUUID(telegramId, req.tgUser);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { data: conversation } = await supabase
            .from('expert_conversations')
            .select('id')
            .eq('user_id', userUUID)
            .eq('expert_id', expertId)
            .single();

        if (conversation) {
            // Delete messages for this conversation
            await supabase.from('expert_messages').delete().eq('conversation_id', conversation.id);
            // Reset message count
            await supabase.from('expert_conversations').update({ message_count: 0 }).eq('id', conversation.id);
        }

        res.json({ success: true, message: 'История диалога очищена' });
    } catch (e) {
        console.error('Reset Chat Error:', e);
        res.status(500).json({ error: 'Failed to reset chat' });
    }
});

// Get conversation history
router.get('/:expertId/conversation', authTG, async (req, res) => {
    try {
        const { expertId } = req.params;
        const telegramId = req.tgUser.id;

        if (!telegramId) return res.status(401).json({ error: 'Unauthorized' });

        const userUUID = await getUserUUID(telegramId, req.tgUser);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        let { data: conversation } = await supabase
            .from('expert_conversations')
            .select('*')
            .eq('user_id', userUUID)
            .eq('expert_id', expertId)
            .single();

        if (!conversation) {
            const { data: newConv, error } = await supabase
                .from('expert_conversations')
                .insert({ user_id: userUUID, expert_id: expertId })
                .select()
                .single();

            if (error) return res.status(500).json({ error: 'Failed to create conversation' });
            conversation = newConv;
        }

        const { data: messages } = await supabase
            .from('expert_messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

        const { data: allTrials } = await supabase
            .from('expert_free_trials')
            .select('messages_used')
            .eq('user_id', userUUID);

        const totalMessagesUsed = allTrials?.reduce((sum, t) => sum + (t.messages_used || 0), 0) || 0;
        const freeMessagesLeft = Math.max(0, FREE_MESSAGES_GLOBAL - totalMessagesUsed);
        const balance = await getUserBalance(telegramId);

        res.json({
            conversationId: conversation.id,
            messages: messages || [],
            freeMessagesLeft,
            freeMessagesUsed: totalMessagesUsed,
            balance,
            expert: EXPERT_CONFIGS[expertId] ? {
                name: EXPERT_CONFIGS[expertId].name,
                emoji: EXPERT_CONFIGS[expertId].emoji
            } : null
        });
    } catch (error) {
        console.error('Get Conversation Error:', error);
        res.status(500).json({ error: 'Failed to get conversation' });
    }
});

// Rate a message
router.post('/messages/:messageId/rate', authTG, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { rating } = req.body;
        const telegramId = req.tgUser?.id;

        if (!telegramId) return res.status(401).json({ error: 'Unauthorized' });
        if (![-1, 0, 1].includes(rating)) return res.status(400).json({ error: 'Invalid rating' });

        const userUUID = await getUserUUID(telegramId, req.tgUser);
        if (!userUUID) return res.status(401).json({ error: 'User not found' });

        const { data: message, error: msgError } = await supabase
            .from('expert_messages')
            .select(`id, conversation_id, expert_conversations!inner(user_id)`)
            .eq('id', messageId)
            .single();

        if (msgError || !message) return res.status(404).json({ error: 'Message not found' });
        if (message.expert_conversations.user_id !== userUUID) return res.status(403).json({ error: 'Forbidden' });

        const { error } = await supabase.from('expert_messages').update({ rating }).eq('id', messageId);
        if (error) return res.status(500).json({ error: 'Failed to save rating' });

        res.json({ success: true, rating });
    } catch (error) {
        console.error('Rate Message Error:', error);
        res.status(500).json({ error: 'Failed to rate message' });
    }
});

// Get suggestions
router.get('/:expertId/suggestions', (req, res) => {
    const { expertId } = req.params;
    res.json({
        suggestions: EXPERT_SUGGESTIONS[expertId] || ['Расскажи о себе', 'Что ты умеешь?', 'Помоги мне']
    });
});

export default router;
