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
            if (typeof params[key] === 'object') continue;
            tokenStr += params[key];
        }

        const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

        console.log('--- Webhook Debug ---');
        console.log('OrderId:', body.OrderId);
        console.log('Status:', body.Status);
        console.log('Token String:', tokenStr);
        console.log('Calculated:', calculatedToken);
        console.log('Received:', receivedToken);

        if (calculatedToken !== receivedToken) {
            console.error('❌ Webhook Signature Mismatch');
            return res.send('OK');
        }

        // 3. Handle Successful Payment
        const status = body.Status;
        if ((status === 'CONFIRMED' || status === 'AUTHORIZED') && supabase) {
            console.log(`✅ Payment ${body.OrderId} ${status}. Processing...`);

            // Extract IDs
            const userId = body.userId || body.DATA?.userId;
            const telegramId = body.telegramId || body.DATA?.telegramId;

            console.log(`IDs found - userId: ${userId}, telegramId: ${telegramId}`);

            if (!userId && !telegramId) {
                console.error('❌ No user identifiers found in webhook');
                return res.send('OK');
            }

            // Calculate Credits
            const amount = body.Amount / 100;
            let credits = 100; // Default for trial
            if (amount >= 4999) credits = 6500;
            else if (amount >= 1999) credits = 2400;
            else if (amount >= 999) credits = 1150;
            else if (amount >= 499) credits = 525;
            else if (amount >= 90) credits = 100;

            // 1. Find User 
            let userData = null;

            // Try by ID (UUID)
            if (userId && userId.length > 20) {
                const { data } = await supabase.from('users').select('id, telegram_id').eq('id', userId).maybeSingle();
                userData = data;
            }

            // Try by Telegram ID
            if (!userData && telegramId) {
                const { data } = await supabase.from('users').select('id, telegram_id').eq('telegram_id', telegramId).maybeSingle();
                userData = data;
            }

            if (!userData) {
                console.error(`❌ User not found for IDs: ${userId} / ${telegramId}`);
                return res.send('OK');
            }

            const targetId = userData.id;
            const targetTg = userData.telegram_id;

            // 2. Update Credits
            const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', targetId).maybeSingle();
            const newBalance = (stats?.current_balance || 0) + credits;

            await supabase.from('user_stats').upsert({
                user_id: targetId,
                current_balance: newBalance,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            // 3. Log 
            await supabase.from('transactions').insert({
                user_id: targetId,
                amount: credits,
                type: 'deposit',
                description: `Пополнение ${amount}₽`,
                metadata: body
            });

            // 4. Notify
            if (targetTg && process.env.TELEGRAM_BOT_TOKEN) {
                try {
                    const msg = `✅ *Оплата прошла!*\n\n💰 Начислено: *${credits}* кредитов\n💎 Новый баланс: *${newBalance}*\n\nПриятного использования! ✨`;
                    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: targetTg, text: msg, parse_mode: 'Markdown' })
                    });
                } catch (e) { console.error('Notify Error:', e); }
            }

            return res.send('OK');
        }

        return res.send('OK');

    } catch (e) {
        console.error('Webhook Fatal Error:', e);
        return res.status(200).send('OK');
    }
}
