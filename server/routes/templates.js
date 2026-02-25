import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

/**
 * GET /api/templates
 * Fetches all active templates, optionally filtered by category.
 */
router.get('/', async (req, res) => {
    console.log(`🔍 [API HIT] /api/templates request received. Query:`, req.query);
    try {
        const { category } = req.query;
        let query = supabase
            .from('templates')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (category && category !== 'all' && category !== 'trends') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Supabase Templates Error:', error);
            throw error;
        }

        console.log(`✅ [API] Found ${data?.length || 0} templates`);
        res.json(data || []);
    } catch (e) {
        console.error('Templates API Error:', e);
        res.status(500).json({
            error: 'Failed to fetch templates',
            details: e.message
        });
    }
});

export default router;
