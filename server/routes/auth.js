import express from 'express';
import { supabase } from '../lib/supabase.js';
import { verifyTelegramWebLoginData, generateWebAuthToken } from '../utils.js';

const router = express.Router();

// ============================================================
// HELPER: Upsert user by OAuth provider
// ============================================================
async function upsertOAuthUser({ provider, providerId, firstName, username, avatarUrl }) {
    // 1. Check if OAuth account already exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('oauth_provider', provider)
        .eq('oauth_provider_id', providerId)
        .single();

    if (existingUser) {
        // Update last activity
        await supabase.from('users').update({ updated_at: new Date() }).eq('id', existingUser.id);
        return existingUser;
    }

    // 2. Create new user
    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            telegram_id: null,
            username: username || null,
            first_name: firstName || 'User',
            avatar_url: avatarUrl || null,
            oauth_provider: provider,
            oauth_provider_id: providerId,
            updated_at: new Date()
        })
        .select()
        .single();

    if (error) throw error;

    // 3. Initialize user_stats for new user
    await supabase.from('user_stats').insert({
        user_id: newUser.id,
        current_balance: 50,  // Welcome bonus
        total_generations: 0,
        level: 1,
        xp: 0
    }).onConflict('user_id').ignore();


    return newUser;
}

// ============================================================
// POST /api/auth/telegram-web — Telegram Login Widget
// ============================================================
router.post('/telegram-web', async (req, res) => {
    try {
        const authData = req.body;
        console.log('--- Telegram Web Auth Request ---');
        console.log('Auth Data:', JSON.stringify(authData, null, 2));

        let verifiedData;
        if (process.env.NODE_ENV !== 'production' && authData.isDevMock) {
            verifiedData = authData;
        } else {
            verifiedData = verifyTelegramWebLoginData(authData);
        }

        console.log('Verified Data:', verifiedData ? 'SUCCESS' : 'FAILED');

        if (!verifiedData) {
            return res.status(401).json({ error: 'Invalid authentication data' });
        }

        const telegramId = verifiedData.id;
        const username = verifiedData.username || '';
        const firstName = verifiedData.first_name || '';

        const { data: userData, error: userError } = await supabase
            .from('users')
            .upsert(
                {
                    telegram_id: telegramId,
                    username: username,
                    first_name: firstName,
                    avatar_url: verifiedData.photo_url || null,
                    oauth_provider: 'telegram',
                    oauth_provider_id: telegramId.toString(),
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

        // Initialize user_stats for new user (if missing)
        await supabase.from('user_stats').insert({
            user_id: userData.id,
            current_balance: 50,  // Welcome bonus
            total_generations: 0,
            level: 1,
            xp: 0
        }).onConflict('user_id').ignore();


        const token = generateWebAuthToken(userData);
        res.json({ success: true, token: `web_auth:${token}`, user: userData });
    } catch (e) {
        console.error('Web Auth Error:', e);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
});

// ============================================================
// POST /api/auth/yandex — Yandex ID OAuth (SDK token flow)
// ============================================================
router.post('/yandex', async (req, res) => {
    try {
        const { access_token } = req.body;
        if (!access_token) {
            return res.status(400).json({ error: 'Missing access token' });
        }

        // 1. Get user info using the token from Yandex SDK
        const userInfoRes = await fetch('https://login.yandex.ru/info?format=json', {
            headers: { 'Authorization': `OAuth ${access_token}` }
        });

        const yandexUser = await userInfoRes.json();

        if (!yandexUser.id) {
            console.error('Yandex user info error:', yandexUser);
            return res.status(401).json({ error: 'Failed to get Yandex user info' });
        }

        // 2. Upsert user
        const userData = await upsertOAuthUser({
            provider: 'yandex',
            providerId: yandexUser.id,
            firstName: yandexUser.first_name || yandexUser.display_name || yandexUser.login,
            username: yandexUser.login,
            avatarUrl: yandexUser.default_avatar_id
                ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200`
                : null
        });

        // 3. Generate JWT
        const token = generateWebAuthToken(userData);
        res.json({ success: true, token: `web_auth:${token}`, user: userData });

    } catch (e) {
        console.error('Yandex Auth Error:', e);
        res.status(500).json({ error: 'Internal server error during Yandex authentication' });
    }
});

// ============================================================
// POST /api/auth/vk — VK ID OAuth
// ============================================================
router.post('/vk', async (req, res) => {
    try {
        const { code, code_verifier, device_id, redirect_uri } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Missing authorization code' });
        }

        const clientId = process.env.VK_CLIENT_ID;
        const clientSecret = process.env.VK_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return res.status(500).json({ error: 'VK OAuth not configured on server' });
        }

        // 1. Exchange code for access token
        const tokenRes = await fetch('https://id.vk.com/oauth2/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                code_verifier: code_verifier || '',
                device_id: device_id || '',
                redirect_uri: redirect_uri || `${process.env.WEB_APP_URL || 'http://localhost:5176'}/auth/callback`
            })
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            console.error('VK token error:', tokenData);
            return res.status(401).json({ error: 'Failed to get VK access token' });
        }

        // 2. Get user info from VK ID
        const userInfoRes = await fetch('https://id.vk.com/oauth2/user_info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                access_token: tokenData.access_token,
                client_id: clientId
            })
        });

        const vkUserData = await userInfoRes.json();
        const vkUser = vkUserData.user || vkUserData;

        if (!vkUser.user_id && !vkUser.id) {
            console.error('VK user info error:', vkUserData);
            return res.status(401).json({ error: 'Failed to get VK user info' });
        }

        // 3. Upsert user
        const userData = await upsertOAuthUser({
            provider: 'vk',
            providerId: (vkUser.user_id || vkUser.id).toString(),
            firstName: vkUser.first_name || 'VK User',
            username: null,
            avatarUrl: vkUser.avatar || vkUser.photo_200 || null
        });

        // 4. Generate JWT
        const token = generateWebAuthToken(userData);
        res.json({ success: true, token: `web_auth:${token}`, user: userData });

    } catch (e) {
        console.error('VK Auth Error:', e);
        res.status(500).json({ error: 'Internal server error during VK authentication' });
    }
});

export default router;
