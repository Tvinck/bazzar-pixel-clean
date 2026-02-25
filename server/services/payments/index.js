import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import https from 'node:https';
import { supabase, authTG, PORTS } from '../../shared/index.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = PORTS.PAYMENTS;
const T_BANK_PASSWORD = process.env.T_BANK_PASSWORD || '7XEqsWfjryCnqCck';
const TERMINAL_KEY = process.env.T_BANK_TERMINAL_KEY || '1768938209983';

// --- ROUTES ---

/**
 * POST /api/payments/init
 * Initialize a new payment with T-Bank
 */
app.post('/api/payments/init', authTG, async (req, res) => {
    try {
        const { amount, description, recurrent, connectionType, paymentType } = req.body;
        const userId = req.tgUser.id; // From authTG middleware
        const userEmail = req.body.userEmail || 'customer@example.com';

        const amountKopeeks = Math.round(Number(amount) * 100);
        const orderId = `BZR_${Date.now().toString().slice(-8)}`;
        const desc = (description || 'Pixel AI Credits').slice(0, 100);

        const requestBody = {
            TerminalKey: TERMINAL_KEY,
            Amount: amountKopeeks,
            OrderId: orderId,
            Description: desc,
            NotificationURL: process.env.PAYMENT_WEBHOOK_URL || `https://${req.headers.host}/api/payments/webhook`,
            SuccessURL: `https://t.me/Pixel_ai_bot?startapp=payment_success__${orderId}`,
            FailURL: 'https://t.me/Pixel_ai_bot?startapp=payment_fail',
            DATA: {
                userId: userId,
                telegramId: userId,
                ...(connectionType && { connection_type: connectionType }),
                ...(paymentType && { payment_type: paymentType })
            },
            Receipt: {
                Email: userEmail,
                Taxation: 'usn_income',
                Items: [{
                    Name: desc, Price: amountKopeeks, Quantity: 1, Amount: amountKopeeks,
                    PaymentMethod: 'full_prepayment', PaymentObject: 'service', Tax: 'none'
                }]
            }
        };

        if (recurrent) {
            requestBody.Recurrent = 'Y';
            requestBody.CustomerKey = String(userId);
        }

        // Token Generation
        const tokenParams = { ...requestBody, Password: T_BANK_PASSWORD };
        delete tokenParams.Token; delete tokenParams.DATA; delete tokenParams.Receipt;
        const sortedKeys = Object.keys(tokenParams).sort();
        const tokenStr = sortedKeys.map(k => String(tokenParams[k])).join('');
        requestBody.Token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        // Call T-Bank
        const responseData = await new Promise((resolve, reject) => {
            const reqData = JSON.stringify(requestBody);
            const request = https.request({
                hostname: 'securepay.tinkoff.ru', path: '/v2/Init', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reqData) }
            }, (response) => {
                let d = ''; response.on('data', chunk => d += chunk);
                response.on('end', () => resolve(JSON.parse(d)));
            });
            request.on('error', reject); request.write(reqData); request.end();
        });

        if (responseData.Success) {
            // Save pending transaction
            const { data: user } = await supabase.from('users').select('id').eq('telegram_id', userId).single();
            if (user) {
                await supabase.from('transactions').insert({
                    user_id: user.id, amount: 0, type: 'pending_init',
                    description: `Init: ${amount}₽`,
                    metadata: { PaymentId: responseData.PaymentId, OrderId: orderId, TelegramId: userId }
                });
            }

            res.json({ paymentUrl: responseData.PaymentURL, paymentId: responseData.PaymentId, orderId });
        } else {
            res.status(400).json({ error: responseData.Message || 'Init failed' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/payments/webhook
 * T-Bank callback
 */
app.post('/api/payments/webhook', async (req, res) => {
    const body = req.body;
    // T-Bank expects 200 OK regardless
    res.send('OK');

    try {
        // Validate Token
        const params = { ...body, Password: T_BANK_PASSWORD };
        delete params.Token;
        const tokenStr = Object.keys(params).sort().filter(k => typeof params[k] !== 'object').map(k => params[k]).join('');
        const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

        if (calculatedToken !== body.Token) return console.error('Token mismatch');
        if (body.Status !== 'CONFIRMED' && body.Status !== 'AUTHORIZED') return;

        const orderId = body.OrderId;
        const { data: existing } = await supabase.from('transactions').select('id').eq('metadata->>OrderId', orderId).neq('type', 'pending_init').maybeSingle();
        if (existing) return;

        const telegramId = body.DATA?.userId || body.userId;
        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
        if (!user) return;

        const amountRub = Math.round(body.Amount / 100);
        let credits = amountRub;
        if (amountRub === 99) credits = 100;
        else if (amountRub >= 490 && amountRub <= 510) credits = 525;
        else if (amountRub >= 990 && amountRub <= 1010) credits = 1150;
        else if (amountRub >= 1990 && amountRub <= 2010) credits = 2400;
        else if (amountRub >= 4990) credits = 6500;

        // Atomic Credit
        const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', user.id).single();
        const newBalance = (stats?.current_balance || 0) + credits;
        await supabase.from('user_stats').upsert({ user_id: user.id, current_balance: newBalance, updated_at: new Date().toISOString() });
        await supabase.from('transactions').insert({ user_id: user.id, amount: credits, type: 'deposit', description: `T-Bank: ${amountRub}₽`, metadata: body });

        // Telegram Notify
        if (process.env.TELEGRAM_BOT_TOKEN) {
            const message = `✅ <b>Оплата прошла успешно!</b>\n\n💰 Пополнено: <b>${amountRub}₽</b>\n⚡️ Начислено: <b>${credits} кредитов</b>\n💎 Текущий баланс: <b>${newBalance}</b>`;
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: telegramId, text: message, parse_mode: 'HTML' })
            }).catch(e => console.error('Notify error', e));
        }
    } catch (e) { console.error('Webhook processing error', e); }
});

/**
 * GET /api/payments/transactions
 */
app.get('/api/payments/transactions', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
        if (!user) return res.json({ transactions: [] });

        const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).neq('type', 'pending_init').order('created_at', { ascending: false }).limit(50);
        res.json({ success: true, transactions: txs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`💳 Payment Service running on port ${PORT}`));
