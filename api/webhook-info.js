import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

export default async function handler(req, res) {
    try {
        const info = await bot.getWebHookInfo();
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
