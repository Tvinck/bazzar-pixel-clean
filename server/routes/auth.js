import express from 'express';
import { supabase } from '../lib/supabase.js';
import { verifyTelegramWebLoginData, generateWebAuthToken } from '../utils.js';

const router = express.Router();

/**
 * Handle Telegram Web Login
 * Validates the widget payload and returns a JWT token.
 */
router.post('/telegram-web', async (req, res) => {
    try {
        const authData = req.body;

        // 1. Verify data from telegram widget
        let verifiedData;

        // DEV BYPASS: Allow mock logins when running locally
        if (process.env.NODE_ENV !== 'production' && authData.isDevMock) {
            verifiedData = authData;
        } else {
            verifiedData = verifyTelegramWebLoginData(authData);
        }

        if (!verifiedData) {
            return res.status(401).json({ error: 'Invalid authentication data' });
        }

        const telegramId = verifiedData.id;
        const username = verifiedData.username || '';
        const firstName = verifiedData.first_name || '';

        // 2. Map telegram user data for upsert
        const tgUser = {
            id: telegramId,
            username: username,
            first_name: firstName,
            photo_url: verifiedData.photo_url
        };

        // 3. Upsert user in database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .upsert(
                {
                    telegram_id: telegramId,
                    username: username,
                    first_name: firstName,
                    avatar_url: verifiedData.photo_url || null,
                    updated_at: new Date()
                },
                { onConflict: 'telegram_id' }
            )
            .select()
            .single();

        if (userError) {
            console.error('Error upserting user on web login:', userError);
            return res.status(500).json({ error: 'Database error creating or updating user' });
        }

        // 4. Generate Web Auth Token (JWT)
        const token = generateWebAuthToken(userData);

        res.json({ success: true, token: `web_auth:${token}`, user: userData });
    } catch (e) {
        console.error('Web Auth Error:', e);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
});

export default router;
