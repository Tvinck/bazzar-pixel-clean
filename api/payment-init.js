import crypto from 'node:crypto';
import https from 'node:https';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, description, userId, userEmail, recurrent } = req.body;

        // DEMO CREDENTIALS
        const TERMINAL_KEY = '1768938209941DEMO';
        const PASSWORD = 'DFgxaoJ38xAjUrsJ';

        // 1. Prepare Data
        const amountKopeeks = Math.round(Number(amount) * 100);
        const orderId = `BZR_${Date.now().toString().slice(-8)}`;
        const desc = (description || 'Pixel AI Credits').slice(0, 100);

        // 2. Build Request Body
        const requestBody = {
            TerminalKey: TERMINAL_KEY,
            Amount: amountKopeeks,
            OrderId: orderId,
            Description: desc,
            NotificationURL: `https://${req.headers.host}/api/webhook`,
            // Redirect back to Telegram Bot with OrderId beacon
            SuccessURL: `https://t.me/Pixel_ai_bot?startapp=payment_success__${orderId}`,
            FailURL: 'https://t.me/Pixel_ai_bot?startapp=payment_fail',
            DATA: {
                userId: userId,
                telegramId: req.body.telegramId
            },
            Receipt: {
                Email: userEmail || 'customer@example.com',
                Taxation: 'usn_income',
                Items: [
                    {
                        Name: desc,
                        Price: amountKopeeks,
                        Quantity: 1,
                        Amount: amountKopeeks,
                        PaymentMethod: 'full_prepayment',
                        PaymentObject: 'service',
                        Tax: 'none'
                    }
                ]
            }
        };

        // If Recurring, add Recurrent flag and CustomerKey
        if (recurrent) {
            requestBody.Recurrent = 'Y';
            requestBody.CustomerKey = String(userId || req.body.telegramId); // Must be user unique ID
        }

        // 3. Calc Token
        const tokenParams = {};
        for (const key in requestBody) {
            if (['Token', 'DATA', 'Receipt'].includes(key)) continue;
            tokenParams[key] = requestBody[key];
        }
        tokenParams.Password = PASSWORD;

        const sortedKeys = Object.keys(tokenParams).sort();
        let tokenStr = '';
        for (const key of sortedKeys) {
            tokenStr += String(tokenParams[key]);
        }
        requestBody.Token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        // 4. Send Request
        const responseData = await new Promise((resolve, reject) => {
            const reqData = JSON.stringify(requestBody);
            const request = https.request({
                hostname: 'securepay.tinkoff.ru',
                path: '/v2/Init',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(reqData)
                }
            }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { resolve({ Success: false, Message: 'Invalid JSON' }); }
                });
            });
            request.on('error', reject);
            request.write(reqData);
            request.end();
        });

        if (responseData.Success) {
            // FIRE AND FORGET: Save pending transaction
            if (userId) {
                let finalUserId = null;
                const telegramIdInt = Number(userId);

                // 1. Try to find existing user (or verify UUID)
                if (userId && !String(userId).includes('-') && !isNaN(telegramIdInt)) {
                    const { data: u } = await supabase.from('users').select('id').eq('telegram_id', telegramIdInt).maybeSingle();
                    if (u) finalUserId = u.id;

                    // 2. If not found, CREATE USER (Auto-registration)
                    if (!finalUserId) {
                        console.log(`Creating new user for payment init: ${telegramIdInt}`);
                        const { data: newUser } = await supabase.from('users').insert({
                            telegram_id: telegramIdInt,
                            username: 'user_' + telegramIdInt,
                            created_at: new Date().toISOString()
                        }).select().single();
                        if (newUser) finalUserId = newUser.id;
                    }
                } else {
                    // Assume it is already a UUID
                    finalUserId = userId;
                }

                if (finalUserId) {
                    await supabase.from('transactions').insert({
                        user_id: finalUserId,
                        amount: 0,
                        type: 'pending_init',
                        description: `Init: ${amount}₽`,
                        metadata: {
                            PaymentId: responseData.PaymentId,
                            OrderId: orderId,
                            TelegramId: req.body.telegramId || telegramIdInt
                        },
                        created_at: new Date().toISOString()
                    }).then(({ error }) => {
                        if (error) console.error('Pending Tx Save Error:', error);
                    });
                } else {
                    console.error('Failed to resolve or create user. Transaction trace lost.');
                }
            }

            return res.json({
                paymentUrl: responseData.PaymentURL,
                paymentId: responseData.PaymentId,
                orderId: orderId
            });
        } else {
            return res.json({
                success: false,
                error: responseData.Message || 'Ошибка инициализации'
            });
        }

    } catch (error) {
        console.error('Payment Service Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
