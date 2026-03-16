import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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

// Helper: Verify Telegram Web Login Widget Data
export function verifyTelegramWebLoginData(authData) {
    if (!authData) return null;
    try {
        const { hash, ...dataToCheck } = authData;

        if (!hash) {
            console.error('Web Login Validation Error: Missing hash');
            return null;
        }

        // Telegram only includes these explicit fields in the hash check string
        const allowedKeys = ['auth_date', 'first_name', 'id', 'last_name', 'photo_url', 'username'];

        const dataCheckString = Object.keys(dataToCheck)
            .filter(key => allowedKeys.includes(key) && dataToCheck[key] !== undefined && dataToCheck[key] !== null)
            .sort()
            .map(key => `${key}=${dataToCheck[key]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash === hash) {
            return authData;
        } else {
            console.error('Web Login Validation Error: Hash mismatch!', {
                receivedHash: hash,
                calculatedHash: calculatedHash,
                dataCheckString: dataCheckString
            });
        }
    } catch (e) {
        console.error('Web Login Validation Error:', e);
    }
    return null;
}

// Generate Web Auth Token
export function generateWebAuthToken(user) {
    const JWT_SECRET = process.env.JWT_SECRET || process.env.TELEGRAM_BOT_TOKEN; // Fallback to bot token if no Secret
    return jwt.sign(
        {
            id: user.id, // the UUID
            telegram_id: user.telegram_id, // numeric if Telegram, null/undefined if OAuth
            username: user.username,
            first_name: user.first_name
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

// Verify Web Auth Token
export function verifyWebAuthToken(token) {
    if (!token) return null;
    const JWT_SECRET = process.env.JWT_SECRET || process.env.TELEGRAM_BOT_TOKEN;
    try {
        const decoded = jwt.verify(token.replace('web_auth:', ''), JWT_SECRET);
        return decoded;
    } catch (e) {
        console.error('JWT Verification Error:', e);
        return null;
    }
}
