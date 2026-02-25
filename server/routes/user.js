import express from 'express';
import { supabase, botAnalytics } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';
import { getUserUUID, getUserBalance } from '../helpers/utils.js';

const router = express.Router();

// Proxy User Stats (Bypass RLS)
router.get('/stats', async (req, res) => {
    try {
        const { telegram_id } = req.query;
        if (!telegram_id) return res.status(400).json({ error: 'Missing telegram_id' });

        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegram_id).single();
        if (!user) return res.json(null);

        const stats = await botAnalytics.getUserStats(user.id);
        res.json(stats);
    } catch (e) {
        console.error('Stats Proxy Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// Get user profile
router.get('/profile', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser?.id;
        if (!telegramId) return res.status(401).json({ error: 'Unauthorized' });

        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userUUID)
            .single();

        res.json({
            profile: profile || null,
            onboardingCompleted: profile?.onboarding_completed || false
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile (from onboarding)
router.put('/profile', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser?.id;
        if (!telegramId) return res.status(401).json({ error: 'Unauthorized' });

        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const {
            display_name, gender, age_range, location, occupation,
            interests, communication_style, language, onboarding_completed
        } = req.body;

        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', userUUID)
            .single();

        let profile;
        const profileData = {
            display_name, gender, age_range, location, occupation,
            interests, communication_style, language, onboarding_completed
        };

        if (existing) {
            const { data } = await supabase
                .from('user_profiles')
                .update({ ...profileData, updated_at: new Date().toISOString() })
                .eq('user_id', userUUID)
                .select()
                .single();
            profile = data;
        } else {
            const { data } = await supabase
                .from('user_profiles')
                .insert({ user_id: userUUID, ...profileData })
                .select()
                .single();
            profile = data;
        }

        res.json({ success: true, profile });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
