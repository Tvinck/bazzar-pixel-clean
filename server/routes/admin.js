import express from 'express';
import { supabase } from '../lib/supabase.js';
import { initQueue } from '../queue.js'; // We might need to access the active queue instance differently
// Note: In server/index.js, 'queue' is initialized. We need to pass it or export it.

const router = express.Router();

// Helper to get boss instance (Needs to be passed or imported)
// For simplicity, we'll assume the main queue export provides access or we pass it in setup.
// BETTER APPROACH: Export a function that accepts 'boss' like setupRoutes does.

export const setupAdminRoutes = (app, boss) => {

    // Dashboard Stats
    app.get('/api/admin/queue/stats', async (req, res) => {
        try {
            if (!boss) return res.status(503).json({ error: 'Queue not initialized' });

            const [active, waiting, completed, failed] = await Promise.all([
                boss.getQueueSize('generate-image', { status: 'active' }),
                boss.getQueueSize('generate-image', { status: 'created' }), // 'created' is waiting
                boss.getQueueSize('generate-image', { status: 'completed' }),
                boss.getQueueSize('generate-image', { status: 'failed' })
            ]);

            res.json({
                active,
                waiting,
                completed,
                failed,
                total: active + waiting + completed + failed
            });
        } catch (e) {
            console.error('Queue Stats Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // Retry Job (RPC)
    app.post('/api/admin/queue/retry', async (req, res) => {
        try {
            const { jobId } = req.body;
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // --- STARS MANAGEMENT ---

    // Get all stars (Admin)
    app.get('/api/admin/stars', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('stars')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            res.json(data);
        } catch (e) {
            console.error('Fetch Stars Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // Create Star
    app.post('/api/admin/stars', async (req, res) => {
        try {
            const { name, slug, description, image_url, preview_video_url, voice_id, sort_order, is_active } = req.body;

            if (!name || !slug || !image_url) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const { data, error } = await supabase
                .from('stars')
                .insert({
                    name,
                    slug,
                    description,
                    image_url,
                    preview_video_url,
                    voice_id,
                    sort_order: sort_order || 0,
                    is_active: is_active !== undefined ? is_active : true
                })
                .select()
                .single();

            if (error) throw error;
            res.json({ success: true, star: data });
        } catch (e) {
            console.error('Create Star Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // Update Star
    app.put('/api/admin/stars/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const { data, error } = await supabase
                .from('stars')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ success: true, star: data });
        } catch (e) {
            console.error('Update Star Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // Delete Star
    app.delete('/api/admin/stars/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('stars')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.json({ success: true });
        } catch (e) {
            console.error('Delete Star Error:', e);
            res.status(500).json({ error: e.message });
        }
    });
};
