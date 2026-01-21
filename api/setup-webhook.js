
import fetch from 'node-fetch';

export default async function handler(req, res) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is missing in env' });
    }

    const host = req.headers.host;
    const webhookUrl = `https://${host}/api/webhook`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
        const data = await response.json();

        res.json({
            status: 'attempted',
            webhookUrl: webhookUrl,
            telegramResponse: data
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
