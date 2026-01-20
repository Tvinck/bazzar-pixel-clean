export default function handler(req, res) {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    res.status(200).json({
        status: 'ok',
        env: isProduction ? 'production' : 'development',
        hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
        timestamp: new Date().toISOString()
    });
}
