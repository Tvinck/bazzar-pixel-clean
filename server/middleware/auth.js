import { verifyTelegramWebAppData, verifyWebAuthToken } from '../utils.js';

/**
 * Telegram WebApp authentication middleware.
 * Validates initData from headers or body, attaches req.tgUser.
 */
export const authTG = async (req, res, next) => {
    try {
        let initData = req.headers['x-tg-data'] || (req.body && req.body.initData);

        // Also check Authorization header for Bearer token
        const authHeader = req.headers['authorization'];
        if (!initData && authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token && token !== 'null' && token !== 'undefined') {
                initData = token;
                // If it's a JWT from generateWebAuthToken, it might not have the web_auth: prefix
                // verifyWebAuthToken handles the prefix, so we ensure it's there if it looks like a JWT
                if (!initData.startsWith('web_auth:') && initData.split('.').length === 3) {
                    initData = 'web_auth:' + initData;
                }
            }
        }

        // Clean up initData if it's literally "null" or "undefined" from client side
        if (initData === 'null' || initData === 'undefined') {
            initData = null;
        }

        // Dev fallback — DISABLED FOR SECURITY
        if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_AUTH === 'true') {
            throw new Error('DEV_AUTH не разрешён — используй настоящую авторизацию');
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
