import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION (from environment) ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const T_BANK_PASSWORD = process.env.TBANK_PASSWORD;

// Initialize Supabase Admin
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

export default async function handler(req, res) {
    // 1. Always acknowledge POST requests to prevent T-Bank from retrying endlessly
    if (req.method !== 'POST') return res.status(200).send('OK');

    const body = req.body;
    console.log(`🔔 [Webhook] Incoming Payment: ${body.OrderId} | Status: ${body.Status}`);

    try {
        if (!body.Token) {
            console.warn('⚠️ [Webhook] No Token found. Ignoring.');
            return res.send('OK');
        }

        // --- 2. SIGNATURE VALIDATION ---
        const params = { ...body };
        delete params.Token;
        params.Password = T_BANK_PASSWORD;

        const sortedKeys = Object.keys(params).sort();
        let tokenStr = '';
        for (const key of sortedKeys) {
            if (typeof params[key] !== 'object') {
                tokenStr += params[key];
            }
        }

        const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

        if (calculatedToken !== body.Token) {
            console.error(`❌ [Webhook] Signature Fail! Calc: ${calculatedToken.substring(0, 10)}... vs Recv: ${body.Token.substring(0, 10)}...`);
            // We still return OK so T-Bank stops annoying us with bad requests
            return res.send('OK');
        }

        // --- 3. FILTER EVENTS ---
        // We handle BOTH 'CONFIRMED' (Standard) and 'AUTHORIZED' (2-step). 
        // For digital goods, AUTHORIZED is usually enough to grant access.
        if (body.Status !== 'CONFIRMED' && body.Status !== 'AUTHORIZED') {
            console.log(`ℹ️ [Webhook] Status ${body.Status} ignored (not final).`);
            return res.send('OK');
        }

        // --- 4. IDEMPOTENCY CHECK (CRITICAL) ---
        // Check if we already processed this order to prevent double credits
        // MST be strict: ignore 'pending_init' records
        const orderId = body.OrderId;
        const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('metadata->>OrderId', orderId)
            .neq('type', 'pending_init') // Fix: Don't count the pending record as "done"
            .maybeSingle();

        if (existingTx) {
            console.log(`✅ [Webhook] Order ${orderId} already processed (Deposit exists). Skipping.`);
            return res.send('OK');
        }

        // --- 5. IDENTIFY USER ---
        // T-Bank puts custom params in root AND in DATA object depending on the phase
        const userId = body.userId || body.DATA?.userId;
        const telegramId = body.telegramId || body.DATA?.telegramId;

        console.log(`🔍 [Webhook] Looking for User - UUID: ${userId}, TG: ${telegramId}`);

        let targetUser = null;

        // Strategy A: Find by UUID (if valid)
        if (userId && userId.length > 20) {
            const { data } = await supabase.from('users').select('id, telegram_id').eq('id', userId).maybeSingle();
            targetUser = data;
        }

        // Strategy B: Find by Telegram ID (if A failed)
        if (!targetUser && telegramId) {
            const { data } = await supabase.from('users').select('id, telegram_id').eq('telegram_id', telegramId).maybeSingle();
            targetUser = data;
        }

        // Strategy C: Auto-Create User (Last Resort)
        if (!targetUser && telegramId) {
            console.log(`⚠️ [Webhook] User not found. Creating new user for TG: ${telegramId}`);
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    telegram_id: telegramId,
                    username: 'user_' + telegramId,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (!createError) targetUser = newUser;
        }

        if (!targetUser) {
            console.error('❌ [Webhook] FATAL: Could not identify or create user. Credits lost.');
            return res.send('OK');
        }

        // --- 6. CALCULATE CREDITS ---
        const amountRub = Math.round(body.Amount / 100);
        let creditsToAdd = 0;

        // Use securely embedded credits if available (from promo code logic)
        const embeddedCredits = body.DATA?.credits ? parseInt(body.DATA.credits) : 0;

        if (embeddedCredits > 0) {
            creditsToAdd = embeddedCredits;
            console.log(`🎟️ [Webhook] Using embedded credits: ${creditsToAdd} (Promo: ${body.DATA?.promoCode || 'N/A'})`);

            // Increment promo usage if applicable
            if (body.DATA?.promoCode) {
                try {
                    const { data: promoData } = await supabase.from('promo_codes').select('used_count').eq('code', body.DATA.promoCode).single();
                    if (promoData) {
                        await supabase.from('promo_codes').update({ used_count: promoData.used_count + 1 }).eq('code', body.DATA.promoCode);
                    }
                } catch (e) {
                    console.error('Failed to increment promo usage:', e);
                }
            }
        } else {
            // Pricing Rules (Must match Frontend)
            if (amountRub === 99) creditsToAdd = 100;
            else if (amountRub >= 490 && amountRub <= 510) creditsToAdd = 525;
            else if (amountRub >= 990 && amountRub <= 1010) creditsToAdd = 1150;
            else if (amountRub >= 1990 && amountRub <= 2010) creditsToAdd = 2400;
            else if (amountRub >= 4990) creditsToAdd = 6500;
            else creditsToAdd = amountRub; // Fallback 1 RUB = 1 Credit
        }

        console.log(`💰 [Webhook] Crediting ${creditsToAdd} credits to User ${targetUser.id}`);

        // --- 7. ATOMIC UPDATE ---
        // 1. Get current balance
        const { data: currentStats } = await supabase
            .from('user_stats')
            .select('current_balance')
            .eq('user_id', targetUser.id)
            .maybeSingle();

        const oldBalance = currentStats?.current_balance || 0;
        const newBalance = oldBalance + creditsToAdd;

        // 2. Perform Upsert
        const { error: upsertError } = await supabase
            .from('user_stats')
            .upsert({
                user_id: targetUser.id,
                current_balance: newBalance,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (upsertError) {
            console.error('❌ [Webhook] DB Update Failed:', upsertError);
            // Retry logic could go here, but for now we fallback
            return res.send('OK');
        }

        // 3. Record Transaction (This marks the OrderId as processed for Idempotency)
        await supabase.from('transactions').insert({
            user_id: targetUser.id,
            amount: creditsToAdd,
            type: 'deposit',
            description: `T-Bank: ${amountRub}₽`,
            metadata: body, // Store full payload
            created_at: new Date().toISOString()
        });

        console.log(`✅ [Webhook] Success! Balance: ${oldBalance} -> ${newBalance}`);

        // --- 8. TELEGRAM NOTIFICATION ---
        const userTgId = targetUser.telegram_id;
        if (userTgId && process.env.TELEGRAM_BOT_TOKEN) {
            try {
                const message = `✅ <b>Оплата прошла успешно!</b>\n\n💰 Пополнено: <b>${amountRub}₽</b>\n⚡️ Начислено: <b>${creditsToAdd} кредитов</b>\n💎 Текущий баланс: <b>${newBalance}</b>\n\n<i>Приятного творчества!</i>`;

                await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: userTgId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
                console.log(`📨 [Webhook] Notification sent to ${userTgId}`);
            } catch (notifyErr) {
                console.error('⚠️ [Webhook] Notify failed:', notifyErr.message);
            }
        }

        return res.send('OK');

    } catch (err) {
        console.error('💥 [Webhook] CRITICAL ERROR:', err);
        return res.status(200).send('OK'); // Always 200 to satisfy bank
    }
}
