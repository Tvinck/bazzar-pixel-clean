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

        // HARDCODED DEMO CREDENTIALS
        const TERMINAL_KEY = '1768938209941DEMO';
        const PASSWORD = 'DFgxaoJ38xAjUrsJ';
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
            // CustomerKey: userId // Optional, but useful
        };

        // 2. Generate Signature (Token)
        // Sort keys -> concat values -> concat password -> sha256
        const keys = Object.keys(paramsForSignature).sort();
        let tokenStr = '';
        for (const key of keys) {
            tokenStr += paramsForSignature[key];
        }
        tokenStr += PASSWORD;

        const token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        // 3. Final Request Body
        // DATA is passed separately, does NOT participate in signature usually (unless specifically configured)
        const requestBody = {
            ...paramsForSignature,
            Token: token,
            DATA: {
                userId: userId,
                email: userEmail
            }
        };

        console.log('Payment Init Request:', JSON.stringify(requestBody));

        /* 
        // 4. Send Request via HTTPS module (Zero-Dep)
        // DISABLED because DEMO keys are invalid/blocked.
        // Uncomment when you provide REAL TerminalKey & Password.
        
        const responseData = await new Promise((resolve, reject) => {
             // ...
        });
        
        if (responseData.Success === false) { ... }
        */

        console.log('⚠️ Mocking Payment Init (No valid keys provided)');
        // MOCK RESPONSE
        return res.json({
            paymentUrl: 'https://test-payment-url.com/demo_success', // Replace with real redirect or success page
            paymentId: 'MOCK_PAYMENT_' + Date.now(),
            orderId: orderId
        });

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
