import { verifyTelegramWebAppData, verifyWebAuthToken } from '../utils.js';

/**
 * Telegram WebApp authentication middleware.
 * Validates initData from headers or body, attaches req.tgUser.
 */
export const authTG = async (req, res, next) => {
    try {
        const initData = req.headers['x-tg-data'] || (req.body && req.body.initData);

        // Dev fallback when no initData and not in production
        if (!initData && process.env.NODE_ENV !== 'production') {
            const devId = req.headers['x-dev-auth-id'];
            req.tgUser = { id: devId ? parseInt(devId) : 603207436, username: 'dev_user' };
            return next();
        }

        if (!initData) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        let tgUser = null;

        // Check if initData is a Custom Web Auth Token
        if (initData.startsWith('web_auth:')) {
            tgUser = verifyWebAuthToken(initData);
        } else {
            // Standard Mini App Login
            tgUser = verifyTelegramWebAppData(initData);
        }

        if (!tgUser) {
            return res.status(401).json({ error: 'Security verification failed. Please reload or login again.' });
        }

        req.tgUser = tgUser;
        next();
    } catch (e) {
        console.error('Auth Middleware Error:', e);
        res.status(500).json({ error: 'Internal Auth Error' });
    }
};
