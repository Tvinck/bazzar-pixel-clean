import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

export default async function handler(req, res) {
    try {
        const webhookUrl = `https://${req.headers.host}/api/webhook`;
        const result = await bot.setWebHook(webhookUrl);
        res.status(200).json({
            success: true,
            webhookUrl,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
