import crypto from 'crypto';

// Helper: Verify Telegram Web App Data
export function verifyTelegramWebAppData(telegramInitData) {
    if (!telegramInitData) return null;
    try {
        const urlParams = new URLSearchParams(telegramInitData);
        const hash = urlParams.get('hash');
        if (!hash) return null;

        urlParams.delete('hash');
        const params = Array.from(urlParams.entries())
            .map(([key, value]) => `${key}=${value}`)
            .sort()
            .join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(params).digest('hex');

        if (calculatedHash === hash) {
            return JSON.parse(urlParams.get('user'));
        }
    } catch (e) {
        console.error('Validation Error:', e);
    }
    return null;
}
