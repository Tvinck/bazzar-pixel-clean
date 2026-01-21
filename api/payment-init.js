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
        // OrderId MUST be <= 20 chars for T-Bank
        const orderId = `P_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 1000)}`;

        // 1. Prepare Request Body
        const requestBody = {
            TerminalKey: TERMINAL_KEY,
            Amount: amountKopeeks,
            OrderId: orderId,
            Description: description || 'Pixel AI Credits',
            NotificationURL: 'https://bazzar-pixel-clean-4zm4.vercel.app/api/payment-webhook',
            SuccessURL: `https://${req.headers.host}/profile`,
            FailURL: `https://${req.headers.host}/profile`,
            DATA: {
                userId: userId,
                telegramId: req.body.telegramId,
                email: userEmail
            }
        };

        // 2. Generate Signature (Token)
        const paramsForToken = { ...requestBody };
        delete paramsForToken.DATA;
        delete paramsForToken.Token;
        paramsForToken.Password = PASSWORD;

        // Sort keys and concatenate values (all converted to string)
        const keys = Object.keys(paramsForToken).sort();
        let tokenStr = '';
        for (const key of keys) {
            tokenStr += String(paramsForToken[key]);
        }
        requestBody.Token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        console.log('Payment Init Request:', JSON.stringify(requestBody));

        // 4. Send Request
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
                    try { resolve(JSON.parse(data)); }
                    catch (e) { resolve({ Success: false, Message: 'Invalid JSON', Details: data }); }
                });
            });

            request.on('error', reject);
            request.write(reqData);
            request.end();
        });

        console.log('Payment Init Response:', responseData);

        if (responseData.Success === false) {
            const errorMsg = responseData.Message || 'Ошибка терминала';
            const errorCode = responseData.ErrorCode || 'Unknown';

            console.warn(`❌ T-Bank Init Failed: [${errorCode}] ${errorMsg}`);

            // Return error to frontend so user can see it
            return res.json({
                error: `Ошибка Банка: ${errorMsg} (Код: ${errorCode})`,
                success: false,
                isMock: false
            });
        }

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
