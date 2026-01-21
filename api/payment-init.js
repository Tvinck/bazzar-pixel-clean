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
        const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 20);
        const desc = (description || 'Pixel AI Credits').slice(0, 250);

        // 2. Token calculation
        // Tinkoff Rule: All root params except Token and DATA + Password. Sort keys.
        const tokenParams = {
            TerminalKey: TERMINAL_KEY,
            Amount: amountKopeeks,
            OrderId: orderId,
            Description: desc,
            Password: PASSWORD
        };

        const sortedKeys = Object.keys(tokenParams).sort();
        let tokenStr = '';
        for (const key of sortedKeys) {
            tokenStr += String(tokenParams[key]);
        }

        // Log the string for deep debugging
        console.log('Token String (DEBUG):', tokenStr);

        const token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        // 3. Final Request Body
        const requestBody = {
            TerminalKey: TERMINAL_KEY,
            Amount: amountKopeeks,
            OrderId: orderId,
            Description: desc,
            Token: token,
            DATA: {
                userId: userId,
                telegramId: req.body.telegramId,
                email: userEmail
            }
        };

        console.log('Final Request Body:', JSON.stringify(requestBody));

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

        console.log('T-Bank Response:', responseData);

        if (responseData.Success === false) {
            const errorMsg = responseData.Message || 'Ошибка параметров';
            const errorCode = responseData.ErrorCode || '309';

            console.warn(`❌ T-Bank Init Failed: [${errorCode}] ${errorMsg}`);

            // Return error to frontend so user can see it
            return res.json({
                error: `Ошибка Банка: ${errorMsg} (Код: ${errorCode}). Убедитесь, что терминал активен.`,
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
