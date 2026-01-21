import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
// Hardcoded Fallback for robust operations
const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(
    process.env.PROD_SUPABASE_URL || SUPABASE_URL,
    process.env.PROD_SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('OK');

    try {
        const body = req.body;
        console.log('💰 Payment Webhook Payload:', JSON.stringify(body));

        if (!body.Token) return res.send('OK');

        // 1. PASSWORD (PROD) -> Must match payment-init.js
        const PASSWORD = '7XEqsWfjryCnqCck';

        // 2. Validate Token (Correct Algorithm V2: Password in params)
        const receivedToken = body.Token;
        const params = { ...body };
        delete params.Token;

        // Add password to params for sorting
        params.Password = PASSWORD;

        const keys = Object.keys(params).sort();
        let tokenStr = '';
        for (const key of keys) {
            // Tinkoff V2: Skip Token and skip objects/arrays (like DATA)
            if (typeof params[key] === 'object') continue;
            tokenStr += params[key];
        }
        // Do NOT append password at the end here, it is already in the loop!

        const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

        if (calculatedToken !== receivedToken) {
            console.error('❌ Webhook Signature Mismatch');
            return res.send('OK');
        }

        // 3. Handle Successful Payment (CONFIRMED or AUTHORIZED)
        const status = body.Status;
        if ((status === 'CONFIRMED' || status === 'AUTHORIZED') && supabase) {
            console.log(`✅ Payment ${body.OrderId} ${status}.`);

            // T-Bank flattens DATA in notifications: check root first, then body.DATA
            let userId = body.userId || body.DATA?.userId;
            const telegramId = body.telegramId || body.DATA?.telegramId;

            if (!userId) {
                console.error('❌ Could not extract UserID from payload');
                // Log the whole body for debugging
                console.log('Payload:', JSON.stringify(body));
                return res.send('OK');
            }

            // Calculate Credits Logic (Matching PLANS in PaymentDrawer)
            const amount = body.Amount / 100;
            let credits = 0;

            if (amount >= 4999) credits = 6500;
            else if (amount >= 1999) credits = 2400;
            else if (amount >= 999) credits = 1150;
            else if (amount >= 499) credits = 525;
            else if (amount >= 90) credits = 100; // Trial or lower
            else credits = Math.floor(amount); // Fallback 1:1

            console.log(`💰 Adding ${credits} credits to user ${userId} (TG: ${telegramId}) for ${amount} RUB`);

            // 1. Find user in 'users' table
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

            let userQuery = supabase.from('users').select('id, telegram_id');
            if (isUUID) {
                userQuery = userQuery.eq('id', userId);
            } else {
                userQuery = userQuery.eq('telegram_id', userId);
            }

            const { data: userData, error: fetchError } = await userQuery.maybeSingle();

            if (fetchError) {
                console.error('❌ User Fetch Error:', fetchError);
                return res.send('OK');
            }

            let targetId = userData?.id;

            // Auto-create user if missing in 'users'
            if (!userData) {
                if (!isUUID) {
                    console.log(`⚠️ User ${userId} not found in 'users'. Creating...`);
                    const { data: newUser, error: createUserError } = await supabase
                        .from('users')
                        .insert({ telegram_id: userId, username: 'user_' + userId })
                        .select().single();

                    if (createUserError) {
                        console.error('❌ Failed to create user:', createUserError);
                        return res.send('OK');
                    }
                    targetId = newUser.id;
                } else {
                    console.error('❌ Cannot create user with UUID - must exist in users table');
                    return res.send('OK');
                }
            }

            // 2. Update or Create Balance in 'user_stats' (using UPSERT to be safe)
            console.log(`💰 Crediting user ${targetId} with ${credits} credits...`);

            // First, get current balance
            const { data: currentStats } = await supabase
                .from('user_stats')
                .select('current_balance, total_generations')
                .eq('user_id', targetId)
                .maybeSingle();

            const newBalance = (currentStats?.current_balance || 0) + credits;

            const { error: upsertError } = await supabase
                .from('user_stats')
                .upsert({
                    user_id: targetId,
                    current_balance: newBalance,
                    total_generations: currentStats?.total_generations || 0
                }, { onConflict: 'user_id' });

            if (upsertError) {
                console.error('❌ Failed to upsert user_stats:', upsertError);
                return res.send('OK');
            }

            console.log(`✅ Balance updated to ${newBalance} for user ${targetId}`);

            // 3. Log Transaction
            await supabase.from('transactions').insert({
                user_id: targetId,
                amount: credits,
                type: 'deposit',
                description: `Пополнение ${amount}₽`,
                metadata: body,
                created_at: new Date().toISOString()
            });

            // 4. Send Telegram Notification
            const userNotifyId = body.telegramId || body.DATA?.telegramId || userData?.telegram_id || (isUUID ? null : userId);
            if (userNotifyId && process.env.TELEGRAM_BOT_TOKEN) {
                try {
                    const message = `✅ *Баланс пополнен!*\n\n💰 Сумма: *${amount}₽*\n⚡️ Начислено: *${credits}* кредитов\n💎 Баланс: *${newBalance}*\n\nСпасибо за поддержку! ❤️`;
                    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: userNotifyId, text: message, parse_mode: 'Markdown' })
                    });
                } catch (notifyErr) { console.error('⚠️ Notify failed:', notifyErr); }
            }

            return res.send('OK');
        }

        return res.send('OK');

    } catch (e) {
        console.error('Webhook Fatal Error:', e);
        return res.status(200).send('OK');
    }
}
