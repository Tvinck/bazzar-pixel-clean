
import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { orderId, amount, userId } = req.query;

    if (!orderId || !amount) {
        return res.status(400).send('Missing params');
    }

    // 1. Trigger Webhook (Simulate Bank)
    const webhookUrl = `https://${req.headers.host}/api/payment-webhook`;
    const PASSWORD = 'DFgxaoJ38xAjUrsJ';

    // Construct valid payload for our webhook
    const payload = {
        TerminalKey: '1768938209941DEMO',
        OrderId: orderId,
        Success: true,
        Status: 'CONFIRMED',
        PaymentId: 'MOCK_PAY_' + Date.now(),
        ErrorCode: '0',
        Amount: parseInt(amount),
        CardId: '123456',
        Pan: '4276********0001',
        ExpDate: '1122',
        DATA: {
            userId: userId,
            telegramId: req.query.telegramId
        },
        Token: '' // Will calculate below
    };

    // Calculate Token specifically for our webhook verification
    // V2: Password inside sorted params
    const params = { ...payload };
    delete params.Token;
    params.Password = PASSWORD;

    const keys = Object.keys(params).sort();
    let tokenStr = '';
    for (const key of keys) {
        tokenStr += params[key];
    }

    const crypto = await import('crypto');
    payload.Token = crypto.createHash('sha256').update(tokenStr).digest('hex');

    // Send Webhook (Fire & Forget)
    try {
        console.log('🚀 Firing Mock Webhook to:', webhookUrl);
        // We use fetch but don't await the full result to speed up UI response, 
        // OR we await to ensure crediting before showing UI.
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log('✅ Mock Webhook Sent');
    } catch (e) {
        console.error('❌ Mock Webhook Failed:', e);
    }

    // 2. Return HTML Success Page to User
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Оплата успешна</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 24px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 90%; }
                h1 { color: #10b981; margin-bottom: 10px; }
                p { color: #6b7280; margin-bottom: 30px; }
                .btn { background: #000; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>✅ Оплата прошла!</h1>
                <p>Кредиты успешно начислены.</p>
                <a href="https://t.me/Pixel_ai_bot/app" class="btn">Вернуться в приложение</a>
            </div>
            <script>
                // Auto-close if inside WebApp
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.close();
                }
            </script>
        </body>
        </html>
    `);
}
