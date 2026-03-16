import crypto from 'node:crypto';
import https from 'node:https';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION (from environment) ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TERMINAL_KEY = process.env.TBANK_TERMINAL_KEY;
const PASSWORD = process.env.TBANK_PASSWORD;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let { paymentId, orderId, userId } = req.body; // userId might be Telegram ID (int) or UUID

    console.log(`🔎 [Payment Check] Start. Order: ${orderId}, Payment: ${paymentId}, UserRaw: ${userId}`);

    try {
        // 0. Resolve PaymentId via OrderId if needed
        if (!paymentId && orderId) {
            const { data: tx } = await supabase
                .from('transactions')
                .select('*')
                .eq('type', 'pending_init')
                .filter('metadata->>OrderId', 'eq', orderId)
                .maybeSingle();

            if (tx && tx.metadata?.PaymentId) {
                paymentId = tx.metadata.PaymentId;
                // If we found the transaction, we can trust the linked user
                if (!userId && tx.user_id) userId = tx.user_id;
            }
        }

        if (!paymentId) return res.status(400).json({ error: 'No PaymentId found' });

        // 1. Resolve UUID from TelegramID (Critical Fix)
        if (userId && !String(userId).includes('-') && !isNaN(Number(userId))) {
            console.log(`🔄 Resolving Telegram ID ${userId} to UUID...`);
            const { data: u } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', userId)
                .maybeSingle();

            if (u) {
                userId = u.id;
                console.log(`✅ Resolved UUID: ${userId}`);
            } else {
                console.error(`❌ Could not resolve Telegram ID ${userId} to any user!`);
                return res.status(400).json({ error: 'User not found' });
            }
        }

        // 2. Check Status at Bank
        console.log(`🏦 Checking T-Bank Status for: ${paymentId}`);
        const tokenParams = { TerminalKey: TERMINAL_KEY, PaymentId: paymentId, Password: PASSWORD };
        const sortedKeys = Object.keys(tokenParams).sort();
        let tokenStr = '';
        for (const key of sortedKeys) tokenStr += String(tokenParams[key]);
        const token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        const bankResponse = await new Promise((resolve, reject) => {
            const reqData = JSON.stringify({ TerminalKey: TERMINAL_KEY, PaymentId: paymentId, Token: token });
            const request = https.request({
                hostname: 'securepay.tinkoff.ru',
                path: '/v2/GetState',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reqData) }
            }, (res) => {
                let d = '';
                res.on('data', c => d += c);
                res.on('end', () => resolve(JSON.parse(d)));
            });
            request.on('error', reject);
            request.write(reqData);
            request.end();
        });

        console.log('🏦 Bank Status:', bankResponse.Status);

        if (bankResponse.Success && (bankResponse.Status === 'CONFIRMED' || bankResponse.Status === 'AUTHORIZED')) {

            // 3. Idempotency (SIMPLIFIED & ROBUST)
            // Separate queries to avoid PostgREST syntax ambiguity
            const { data: txByPayment } = await supabase.from('transactions')
                .select('id').eq('type', 'deposit').eq('metadata->>PaymentId', paymentId).maybeSingle();

            const { data: txByOrder } = await supabase.from('transactions')
                .select('id').eq('type', 'deposit').eq('metadata->>OrderId', orderId).maybeSingle();

            if (txByPayment || txByOrder) {
                console.log(`✅ [Payment Check] DUPLICATE DETECTED. PaymentId: ${txByPayment?.id}, OrderId: ${txByOrder?.id}`);
                return res.status(200).json({ success: true, status: 'ALREADY_CREDITED' });
            }

            // 4. Fallback User Search (if still missing)
            if (!userId) {
                const { data: pendingTx } = await supabase
                    .from('transactions')
                    .select('user_id')
                    .eq('metadata->>PaymentId', paymentId)
                    .eq('type', 'pending_init')
                    .maybeSingle();
                if (pendingTx) userId = pendingTx.user_id;
            }

            if (!userId) return res.status(400).json({ error: 'UserId required' });

            // 5. Calculate Credits
            const amountRub = Math.round(bankResponse.Amount / 100);
            let credits = amountRub;
            if (amountRub === 99) credits = 100;
            else if (amountRub >= 490 && amountRub <= 510) credits = 525;
            else if (amountRub >= 990 && amountRub <= 1010) credits = 1150;
            else if (amountRub >= 1990 && amountRub <= 2010) credits = 2400;
            else if (amountRub >= 4990) credits = 6500;

            console.log(`💰 Crediting ${credits} to ${userId}`);

            // 6. DB Updates
            const { data: userStats } = await supabase.from('user_stats').select('current_balance').eq('user_id', userId).maybeSingle();
            const newBalance = (userStats?.current_balance || 0) + credits;

            await supabase.from('user_stats').upsert({ user_id: userId, current_balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

            // Explicitly save OrderId/PaymentId for search idempotency
            const { error: txError } = await supabase.from('transactions').insert({
                user_id: userId,
                amount: credits,
                type: 'deposit',
                description: `Check: ${amountRub}₽`,
                metadata: { ...bankResponse, manual_check: true, OrderId: orderId, PaymentId: paymentId }
            });

            if (txError) {
                console.error('❌ [Payment Check] CRITICAL: Failed to save DEPOSIT transaction!', txError);
            }

            console.log('✅ [Payment Check] Transaction saved successfully.');

            // 7. Notify
            try {
                const { data: u } = await supabase.from('users').select('telegram_id').eq('id', userId).single();
                if (u && u.telegram_id && process.env.TELEGRAM_BOT_TOKEN) {
                    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: u.telegram_id,
                            text: `✅ <b>Оплата подтверждена!</b>\n\n💰 Пополнено: <b>${amountRub}₽</b>\n⚡️ Начислено: <b>${credits} кредитов</b>`,
                            parse_mode: 'HTML'
                        })
                    });
                }
            } catch (e) { console.error('Notify fail', e); }

            return res.status(200).json({ success: true, status: 'CREDITED', newBalance });
        }

        return res.json({ success: false, status: bankResponse.Status });

    } catch (e) {
        console.error('Check Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
