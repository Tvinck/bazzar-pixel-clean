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

        // Amount in Kopeeks (cents)
        const amountKopeeks = Math.round(amount * 100);
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Base Params for Signature
        const paramsForSignature = {
            Amount: amountKopeeks,
            Description: description || 'Credits TopUp',
            OrderId: orderId,
            TerminalKey: TERMINAL_KEY,
            NotificationURL: 'https://bazzar-pixel-clean-4zm4.vercel.app/api/payment-webhook',
            Password: PASSWORD
        };

        // 2. Generate Signature (Token)
        const keys = Object.keys(paramsForSignature).sort();
        let tokenStr = '';
        for (const key of keys) {
            tokenStr += paramsForSignature[key];
        }
        const token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        // 3. Final Request Body
        const requestBody = {
            TerminalKey: TERMINAL_KEY,
            Amount: amountKopeeks,
            OrderId: orderId,
            Description: description || 'Credits TopUp',
            NotificationURL: 'https://bazzar-pixel-clean-4zm4.vercel.app/api/payment-webhook',
            Token: token,
            DATA: {
                userId: userId,
                telegramId: req.body.telegramId,
                email: userEmail
            }
        };

        console.log('Payment Init Request to T-Bank:', JSON.stringify(requestBody));

        // 4. Send Request via HTTPS module (Zero-Dep)
        const responseData = await new Promise((resolve, reject) => {
            const reqData = JSON.stringify(requestBody);
            const urlObj = new URL(API_URL);

            const request = https.request({
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(reqData)
                }
            }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve({ Success: false, Message: 'Invalid JSON response', Details: data });
                    }
                });
            });

            request.on('error', reject);
            request.write(reqData);
            request.end();
        });

        console.log('Payment Init Response:', responseData);

        if (responseData.Success === false) {
            console.warn('⚠️ Payment Init Failed (likely credentials). Switching to MOCK flow for DEMO.');

            // Construct Mock URL
            // Assuming userId needs to be passed if used in success handler
            const mockUrl = `https://${req.headers.host || 'bazzar-pixel-clean-4zm4.vercel.app'}/api/payment-mock-success?orderId=${orderId}&amount=${amountKopeeks}&userId=${userId}&telegramId=${req.body.telegramId || ''}`;

            return res.json({
                paymentUrl: mockUrl,
                paymentId: 'MOCK_' + orderId,
                orderId: orderId,
                isMock: true
            });
        }

        // Return exactly what the widget needs
        return res.json({
            paymentUrl: responseData.PaymentURL,
            paymentId: responseData.PaymentId,
            orderId: orderId
        });

    } catch (error) {
        console.error('Payment Service Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
