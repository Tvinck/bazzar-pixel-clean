import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';
const T_BANK_PASSWORD = 'DFgxaoJ38xAjUrsJ';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

// Helper to send messages
async function sendMessage(chatId, text, options = {}) {
    if (!BOT_TOKEN) return;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: options.parse_mode || 'HTML', // HTML for bold text
            disable_web_page_preview: options.disable_web_page_preview || false,
            ...options
        })
    });
}

// Track processed TG updates
const processedUpdates = new Set();
const MAX_CACHE_SIZE = 1000;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('OK');

    const body = req.body;

    // ==========================================
    // 1. IS THIS A T-BANK PAYMENT NOTIFICATION?
    // ==========================================
    if (body.TerminalKey && body.OrderId && body.Token) {
        console.log(`🔔 [Webhook] Incoming Payment: ${body.OrderId} | Status: ${body.Status}`);

        try {
            // --- SIGNATURE VALIDATION ---
            const params = { ...body };
            delete params.Token;
            params.Password = T_BANK_PASSWORD;

            const sortedKeys = Object.keys(params).sort();
            let tokenStr = '';
            for (const key of sortedKeys) {
                if (typeof params[key] !== 'object') tokenStr += params[key];
            }
            const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

            if (calculatedToken !== body.Token) {
                console.error(`❌ [Webhook] Payment Signature Fail!`);
                return res.send('OK');
            }

            if (body.Status !== 'CONFIRMED' && body.Status !== 'AUTHORIZED') {
                return res.send('OK');
            }

            // --- IDEMPOTENCY ---
            const orderId = body.OrderId;
            const { data: existingTx } = await supabase
                .from('transactions')
                .select('id')
                .eq('metadata->>OrderId', orderId)
                .neq('type', 'pending_init') // Ignore initial pending record
                .maybeSingle();

            if (existingTx) {
                console.log(`✅ [Webhook] Payment ${orderId} already processed.`);
                return res.send('OK');
            }

            // --- IDENTIFY USER ---
            let userId = null;
            let telegramId = null;

            // 1. Check Payload DATA
            if (body.DATA?.userId) userId = body.DATA.userId;

            // 2. Check Pending Transaction (Fallback)
            if (!userId) {
                const { data: pendingTx } = await supabase
                    .from('transactions')
                    .select('user_id, metadata')
                    .eq('metadata->>OrderId', orderId)
                    .eq('type', 'pending_init')
                    .maybeSingle();

                if (pendingTx) {
                    userId = pendingTx.user_id;
                    telegramId = pendingTx.metadata?.TelegramId;
                }
            }

            // --- RESOLVE UUID FROM TELEGRAM ID (CRITICAL FIX) ---
            // If userId is a number (Telegram ID), we MUST find the UUID
            if (userId && !String(userId).includes('-') && !isNaN(Number(userId))) {
                console.log(`🔄 [Webhook] Resolving Telegram ID ${userId} to UUID...`);
                const { data: uVal } = await supabase
                    .from('users')
                    .select('id, telegram_id')
                    .eq('telegram_id', userId)
                    .maybeSingle();

                if (uVal) {
                    userId = uVal.id;
                    if (!telegramId) telegramId = uVal.telegram_id;
                    console.log(`✅ [Webhook] Resolved UUID: ${userId}`);
                } else {
                    console.error(`❌ [Webhook] Could not resolve UUID for Telegram ID: ${userId}`);
                    // Cannot credit non-existent user
                    return res.send('OK');
                }
            }

            if (!userId) {
                console.error('❌ [Webhook] FATAL: Could not identify user for payment.');
                return res.send('OK');
            }

            // --- CREDIT USER ---
            const amountRub = Math.round(body.Amount / 100);
            let creditsToAdd = amountRub;

            // Pricing Rules
            if (amountRub === 99) creditsToAdd = 100;
            else if (amountRub >= 490 && amountRub <= 510) creditsToAdd = 525;
            else if (amountRub >= 990 && amountRub <= 1010) creditsToAdd = 1150;
            else if (amountRub >= 1990 && amountRub <= 2010) creditsToAdd = 2400;
            else if (amountRub >= 4990) creditsToAdd = 6500;

            console.log(`💰 [Webhook] Crediting ${creditsToAdd} credits to User ${userId}`);

            // Perform Transaction
            const { data: currentStats } = await supabase
                .from('user_stats')
                .select('current_balance')
                .eq('user_id', userId)
                .maybeSingle();

            const newBalance = (currentStats?.current_balance || 0) + creditsToAdd;

            await supabase.from('user_stats').upsert({
                user_id: userId,
                current_balance: newBalance,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            await supabase.from('transactions').insert({
                user_id: userId,
                amount: creditsToAdd,
                type: 'deposit',
                description: `T-Bank Webhook: ${amountRub}₽`,
                metadata: body,
                created_at: new Date().toISOString()
            });

            // --- NOTIFY USER ---
            try {
                if (!telegramId) {
                    const { data: u } = await supabase.from('users').select('telegram_id').eq('id', userId).single();
                    if (u) telegramId = u.telegram_id;
                }

                if (telegramId) {
                    const msg = `✅ <b>Оплата прошла успешно!</b>\n\n💰 Пополнено: <b>${amountRub}₽</b>\n⚡️ Начислено: <b>${creditsToAdd} кредитов</b>\n💎 Текущий баланс: <b>${newBalance}</b>\n\n<i>Приятного творчества!</i>`;
                    await sendMessage(telegramId, msg);
                }
            } catch (notifyErr) { console.error(notifyErr); }

            return res.send('OK');

        } catch (err) {
            console.error('💥 [Webhook] Payment Error:', err);
            return res.send('OK');
        }
    }

    // ==========================================
    // 2. IS THIS A TELEGRAM UPDATE? (EXISTING LOGIC)
    // ==========================================
    if (body.update_id) {
        // ... (Keep existing bot logic) ...
        const update = body;
        const updateId = update.update_id;

        if (processedUpdates.has(updateId)) return res.status(200).send('OK');
        processedUpdates.add(updateId);
        if (processedUpdates.size > MAX_CACHE_SIZE) processedUpdates.delete(processedUpdates.values().next().value);

        try {
            console.log('📩 Processing TG Update:', updateId);

            if (update.message) {
                const msg = update.message;
                const chatId = msg.chat.id;
                const text = msg.text || '';

                if (text === '/start' || text === 'Главное меню 🏠') {
                    await sendMessage(chatId, `🎉 <b>Добро пожаловать в NanoBanana Bot!</b>\n\nЗдесь ты можешь создавать контент. Открой приложение 👇`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: 'Трендовые фото 🔥', web_app: { url: 'https://bazzar-pixel-clean-4zm4.vercel.app' } }]],
                            resize_keyboard: true
                        }
                    });
                } else if (text === 'Баланс ⚡') {
                    const telegramId = msg.from.id;
                    let balance = 0;
                    try {
                        const { data: u } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
                        if (u) {
                            const { data: s } = await supabase.from('user_stats').select('current_balance').eq('user_id', u.id).single();
                            if (s) balance = s.current_balance;
                        }
                    } catch (e) { }

                    await sendMessage(chatId, `🌟 <b>Ваш баланс: ${balance} кредитов.</b>\n\nПополнить можно в приложении 👇`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: 'Открыть приложение', web_app: { url: 'https://bazzar-pixel-clean-4zm4.vercel.app' } }]]
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Bot Error:', e);
        }

        return res.status(200).send('OK');
    }

    return res.status(200).send('OK');
}
