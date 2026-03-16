import crypto from 'node:crypto';
import https from 'node:https';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
        const { amount, credits, promoCode, description, userId, userEmail, recurrent, connectionType, paymentType } = req.body;

        // Credentials from environment
        const TERMINAL_KEY = process.env.TBANK_TERMINAL_KEY;
        const PASSWORD = process.env.TBANK_PASSWORD;

        let validPromo = null;
        if (promoCode) {
            const { data: promo } = await supabase.from('promo_codes').select('*').eq('code', promoCode.toUpperCase()).single();
            if (promo && promo.is_active && (!promo.expires_at || new Date(promo.expires_at) > new Date()) && (!promo.max_uses || promo.used_count < promo.max_uses)) {
                validPromo = promo;
            } else {
                return res.status(400).json({ error: 'Недействительный промокод' });
            }
        }

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
                telegramId: req.body.telegramId,
                credits: credits || 0, // CRITICAL: Safely embedded credits amount
                promoCode: validPromo ? validPromo.code : null, // Record promo usage
                // CRITICAL: connection_type = Widget for widget integration
                ...(connectionType && { connection_type: connectionType }),
                ...(paymentType && { payment_type: paymentType }) // For analytics
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
