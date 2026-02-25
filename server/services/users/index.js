import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { supabase, botAnalytics, authTG, getUserUUID, getUserBalance, sendTelegramMessage, PORTS } from '../../shared/index.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = PORTS.USERS;
const activeRetentions = new Map();

// --- ROUTES ---

/**
 * GET /api/user/stats
 */
app.get('/api/user/stats', async (req, res) => {
    try {
        const { telegram_id } = req.query;
        if (!telegram_id) return res.status(400).json({ error: 'Missing telegram_id' });

        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegram_id).single();
        if (!user) return res.json(null);

        const stats = await botAnalytics.getUserStats(user.id);
        res.json(stats);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/user/profile
 */
app.get('/api/user/profile', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', userUUID).single();
        res.json({ profile: profile || null, onboardingCompleted: profile?.onboarding_completed || false });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/user/public/:username
 * Fetch public profile details by username
 */
app.get('/api/user/public/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, username, first_name, avatar_url, created_at')
            .eq('username', username)
            .single();

        if (userError || !user) return res.status(404).json({ error: 'User not found' });

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('bio, website, is_public_profile')
            .eq('user_id', user.id)
            .eq('is_public_profile', true)
            .single();

        if (profileError || !profile) return res.status(403).json({ error: 'Profile is private' });

        res.json({ user, profile });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/user/public/stats/:userId
 * Fetch aggregate social stats via RPC
 */
app.get('/api/user/public/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { data: stats, error } = await supabase.rpc('get_public_user_stats', { p_user_id: userId });
        if (error) throw error;
        res.json(stats);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * PUT /api/user/profile
 */
app.put('/api/user/profile', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const profileData = req.body;
        delete profileData.initData; // Clean up

        const { data: existing } = await supabase.from('user_profiles').select('id').eq('user_id', userUUID).single();

        let profile;
        if (existing) {
            const { data } = await supabase.from('user_profiles').update({ ...profileData, updated_at: new Date().toISOString() }).eq('user_id', userUUID).select().single();
            profile = data;
        } else {
            const { data } = await supabase.from('user_profiles').insert({ user_id: userUUID, ...profileData }).select().single();
            profile = data;
        }

        res.json({ success: true, profile });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/user/referrals/stats
 */
app.get('/api/user/referrals/stats', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { data: stats, error } = await supabase.rpc('get_user_referral_analytics', { p_user_id: userUUID });
        if (error) throw error;

        res.json(stats);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/user/referrals/list
 */
app.get('/api/user/referrals/list', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { data: referrals, error } = await supabase
            .from('users')
            .select('username, first_name, created_at')
            .eq('referred_by', userUUID)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Mask names for privacy
        const masked = referrals.map(u => ({
            name: u.first_name ? (u.first_name.length > 2 ? u.first_name.slice(0, 2) + '***' : u.first_name + '***') : 'User***',
            username: u.username ? (u.username.length > 2 ? u.username.slice(0, 2) + '***' : u.username + '***') : null,
            date: u.created_at
        }));

        res.json({ referrals: masked });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/user/marketing/track
 */
app.post('/api/user/marketing/track', authTG, async (req, res) => {
    const { event } = req.body;
    const telegramId = req.tgUser.id;
    res.json({ ok: true }); // Fire & Forget

    if (!telegramId) return;
    const uid = telegramId.toString();

    if (event === 'session_start') {
        if (activeRetentions.has(uid)) clearTimeout(activeRetentions.get(uid));
        const timeout = setTimeout(async () => {
            activeRetentions.delete(uid);
            try {
                const userUUID = await getUserUUID(telegramId);
                if (!userUUID) return;

                const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
                const { count } = await supabase.from('creations').select('*', { count: 'exact', head: true }).eq('user_id', userUUID).gte('created_at', tenMinsAgo);

                if (count === 0) {
                    const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', userUUID).single();
                    await supabase.from('user_stats').update({ current_balance: (stats?.current_balance || 0) + 10 }).eq('user_id', userUUID);

                    await sendTelegramMessage(telegramId, `🎁 *Подарок ждет вас!*\n\nМы заметили, что вы зашли, но так ничего и не создали. Держите *10 бесплатных зарядов* за наш счет!`, {
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: [[{ text: '🎨 Создать (Бесплатно)', web_app: { url: process.env.WEB_APP_URL || 'https://bazzar-pixel.vercel.app' } }]] }
                    });
                }
            } catch (e) { }
        }, 2 * 60 * 1000);
        activeRetentions.set(uid, timeout);
    }

    if (event === 'generation') {
        if (activeRetentions.has(uid)) { clearTimeout(activeRetentions.get(uid)); activeRetentions.delete(uid); }
        const upsellKey = `upsell_${uid}`;
        if (!activeRetentions.has(upsellKey)) {
            const timeout = setTimeout(async () => {
                activeRetentions.delete(upsellKey);
                const balance = await getUserBalance(telegramId);
                if (balance < 100) {
                    const userUUID = await getUserUUID(telegramId);
                    let msg = `⚡ *Скидка сгорает!* ⏳\n\nВы активно творили, но заряды кончаются.\nТолько сейчас: тариф *Start* со скидкой 50%!`;
                    if (userUUID) {
                        const { count } = await supabase.from('creations').select('*', { count: 'exact', head: true }).eq('user_id', userUUID);
                        if (count > 3) msg = `🎨 *Вы создали уже ${count} работ!* 🔥\n\nВаш талант заслуживает большего! Пополните баланс со скидкой *50%* и продолжайте творить без ограничений.`;
                    }
                    await sendTelegramMessage(telegramId, msg, {
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: [[{ text: '💎 Забрать скидку', web_app: { url: process.env.WEB_APP_URL || 'https://bazzar-pixel.vercel.app' } }]] }
                    });
                }
            }, 5 * 60 * 1000);
            activeRetentions.set(upsellKey, timeout);
        }
    }
});

/**
 * API Key Management
 */

app.get('/api/user/dev/keys', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('id, name, key_prefix, is_active, last_used_at, created_at')
            .eq('user_id', userUUID)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ keys });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/user/dev/keys', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { name } = req.body;

        // Generate key: bp_ + random string
        const secret = 'bp_' + crypto.randomBytes(24).toString('hex');
        const keyHash = crypto.createHash('sha256').update(secret).digest('hex');
        const prefix = secret.slice(0, 10) + '...';

        const { data: key, error } = await supabase
            .from('api_keys')
            .insert({
                user_id: userUUID,
                name: name || 'Untitled Project',
                key_prefix: prefix,
                key_hash: keyHash
            })
            .select()
            .single();

        if (error) throw error;

        // Return the full secret ONLY ONCE
        res.json({
            success: true,
            key: { ...key, secret }
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/user/dev/keys/:id', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser.id;
        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { id } = req.params;

        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', id)
            .eq('user_id', userUUID);

        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`👤 User Service running on port ${PORT}`));
