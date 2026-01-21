import crypto from 'crypto';
import https from 'https';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, description, userId, userEmail } = req.body;

        // PRODUCTION CREDENTIALS
        const TERMINAL_KEY = '1768938209983';
        const PASSWORD = '7XEqsWfjryCnqCck';
        const API_URL = 'https://securepay.tinkoff.ru/v2/Init';

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
            NotificationURL: `https://${req.headers.host}/api/payment-webhook`,
            SuccessURL: `https://${req.headers.host}/profile`,
            FailURL: `https://${req.headers.host}/profile`,
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

        // 3. Token calculation (Include all root fields except objects/Token)
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
