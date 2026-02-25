import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';

const router = express.Router();

// Like a creation
router.post('/like', authTG, async (req, res) => {
    try {
        const { creationId } = req.body;
        const tgId = req.tgUser.id;

        const { data: dbUser } = await supabase.from('users').select('id').eq('telegram_id', tgId).single();
        if (!dbUser) return res.status(401).send('User not found');
        const userId = dbUser.id;

        const { data, error } = await supabase.from('creation_likes').insert({ user_id: userId, creation_id: creationId }).select().single();
        if (error) throw error;
        res.json({ success: true, data });
    } catch (e) {
        if (e.code === '23505') return res.json({ success: false, error: 'Already liked' });
        res.status(500).json({ error: e.message });
    }
});

// Unlike a creation
router.post('/unlike', authTG, async (req, res) => {
    try {
        const { creationId } = req.body;
        const tgId = req.tgUser.id;

        const { data: dbUser } = await supabase.from('users').select('id').eq('telegram_id', tgId).single();
        if (!dbUser) return res.status(401).send('User not found');
        const userId = dbUser.id;

        const { error } = await supabase.from('creation_likes').delete().eq('user_id', userId).eq('creation_id', creationId);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get liked creation IDs for a user
router.get('/liked', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.json([]);

        console.log(`🔍 [API] Fetching liked creations for user: ${userId}`);
        const { data, error } = await supabase.from('creation_likes').select('creation_id').eq('user_id', userId);

        if (error) {
            console.error('Supabase Liked Error:', error);
            throw error;
        }

        const result = data ? data.map(d => d.creation_id) : [];
        console.log(`✅ [API] Found ${result.length} liked items`);
        res.json(result);
    } catch (e) {
        console.error('Liked Gallery Error:', e);
        res.status(500).json({
            error: 'Failed to fetch liked creations',
            details: e.message,
            stack: process.env.NODE_ENV !== 'production' ? e.stack : undefined
        });
    }
});

// Check if specific creation is liked
router.get('/is_liked', async (req, res) => {
    try {
        const { userId, creationId } = req.query;
        const { data } = await supabase.from('creation_likes').select('id').eq('user_id', userId).eq('creation_id', creationId).maybeSingle();
        res.json({ liked: !!data });
    } catch (e) {
        res.json({ liked: false });
    }
});

export default router;
