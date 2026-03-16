import express from 'express';
import { supabase, botAnalytics } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';
import { getUserUUID, getUserBalance } from '../helpers/utils.js';
import { bot } from '../index.js';

const router = express.Router();

// Proxy User Stats (Secure)
router.get('/stats', authTG, async (req, res) => {
    try {
        const telegramId = req.tgUser?.id;
        if (!telegramId) return res.status(401).json({ error: 'Unauthorized' });

        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.json(null);

        // Fetch stats directly using standard query (RLS will handle if configured, 
        // but we explicitly filter by userUUID for safety)
        const { data: stats, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userUUID)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        res.json(stats || null);
    } catch (e) {
        console.error('Stats Error:', e);
        res.status(500).json({ error: 'Failed to fetch statistics' });
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

// Get active promotions (flash sales)
router.get('/active-promotions', authTG, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('active_promotions')
            .select('*')
            .eq('is_active', true)
            .gt('ends_at', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, promotions: data });
    } catch (e) {
        console.error('Get Active Promotions Error:', e);
        res.status(500).json({ error: 'Failed to get promotions' });
    }
});

// Apply promo code logic (validation)
router.post('/apply-promo', authTG, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Missing code' });

        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !promo) return res.status(404).json({ error: 'Промокод не найден' });

        if (!promo.is_active) return res.status(400).json({ error: 'Промокод неактивен' });

        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Срок действия промокода истек' });
        }

        if (promo.max_uses && promo.used_count >= promo.max_uses) {
            return res.status(400).json({ error: 'Лимит использования исчерпан' });
        }

        res.json({ success: true, promo });
    } catch (e) {
        console.error('Apply Promo Error:', e);
        res.status(500).json({ error: 'Failed to apply promo' });
    }
});

// Init Telegram Stars payment
router.post('/stars-init', authTG, async (req, res) => {
    try {
        const { amount, credits, promoCode } = req.body;
        const telegramId = req.tgUser?.id;

        if (!telegramId) return res.status(401).json({ error: 'Unauthorized' });
        if (!bot) return res.status(500).json({ error: 'Bot is not initialized' });

        // Let's ensure promo code is still valid, as extra safety
        let checkedPromo = null;
        if (promoCode) {
            const { data: promo } = await supabase.from('promo_codes').select('*').eq('code', promoCode.toUpperCase()).single();
            if (promo && promo.is_active && (!promo.expires_at || new Date(promo.expires_at) > new Date()) && (!promo.max_uses || promo.used_count < promo.max_uses)) {
                checkedPromo = promo.code;
            } else {
                return res.status(400).json({ error: 'Недействительный промокод' });
            }
        }

        const orderId = `BZR_STARS_${Date.now().toString().slice(-8)}`;
        const payload = JSON.stringify({
            telegramId,
            credits: credits || 0,
            promoCode: checkedPromo,
            orderId
        });

        const invoiceLink = await bot.createInvoiceLink(
            'Заряды Pixel AI', // title
            `Пополнение на ${credits} ⚡ зарядов для генерации`, // description
            payload, // payload
            '', // provider_token (empty for stars)
            'XTR', // currency
            [{ label: 'Заряды', amount: Number(amount) }] // prices
        );

        // Log pending transaction if possible
        const userUUID = await getUserUUID(telegramId);
        if (userUUID) {
            await supabase.from('transactions').insert({
                user_id: userUUID,
                amount: 0,
                type: 'pending_init_stars',
                description: `Init Stars: ${amount} XTR`,
                metadata: { OrderId: orderId, TelegramId: telegramId },
                created_at: new Date().toISOString()
            });
        }

        res.json({ success: true, invoiceLink });
    } catch (e) {
        console.error('Stars Init Error:', e);
        res.status(500).json({ error: 'Failed to initialize Stars payment' });
    }
});

export default router;
