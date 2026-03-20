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

// --- PUBLIC GALLERY & SEARCH ---
router.get('/', async (req, res) => {
    try {
        const { sortBy = 'trending', filterType = 'all', page = 1, limit = 20 } = req.query;
        const viewName = `public_gallery_${sortBy}`;
        
        let query = supabase.from(viewName).select('*', { count: 'exact' });
        
        if (filterType !== 'all') {
            query = query.eq('type', filterType);
        }
        
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        if (error) throw error;
        
        res.json({
            creations: data || [],
            hasMore: data && data.length === parseInt(limit),
            total: count
        });
    } catch (e) {
        console.error('Gallery Fetch Error:', e);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// --- TEMPLATE CATEGORIES ---
router.get('/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('template_categories')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) throw error;
        res.json(data || []);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// --- CREATION MANAGEMENT ---

// Get single creation
router.get('/creations/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('creations')
            .select('*, user:users(username, first_name, avatar_url)')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(404).json({ error: 'Creation not found' });
    }
});

// Get user creations
router.get('/creations/user/:userId', async (req, res) => {
    try {
        const { includePrivate } = req.query;
        let query = supabase
            .from('creations')
            .select('*')
            .eq('user_id', req.params.userId)
            .order('created_at', { ascending: false });
            
        if (includePrivate !== 'true') {
            query = query.eq('is_public', true);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        res.json(data || []);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch user creations' });
    }
});

// Save creation
router.post('/creations', authTG, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('creations')
            .insert(req.body)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update creation
router.put('/creations/:id', authTG, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('creations')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete creation
router.delete('/creations/:id', authTG, async (req, res) => {
    try {
        const { error } = await supabase
            .from('creations')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
