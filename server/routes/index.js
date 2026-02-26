import galleryRoutes from './gallery.js';
import userRoutes from './user.js';
import { setupMarketingRoutes } from './marketing.js';
import expertsRoutes from './experts.js';
import chatRoutes from './chat.js';
import generationRoutes from './generation.js';
import templatesRoutes from './templates.js';
import stickersRoutes from './stickers.js';

/**
 * Register all modular route groups on the Express app.
 * Called from server/index.js during initialization.
 */
export function registerRoutes(app, bot) {
    // Attach bot to app for access in routers
    app.set('bot', bot);

    // Gallery
    app.use('/api/gallery', galleryRoutes);

    // User (stats + profile)
    app.use('/api/user', userRoutes);

    // Marketing (needs bot for sending messages)
    const marketingRouter = setupMarketingRoutes(bot);
    app.use('/api/marketing', marketingRouter);

    // Experts
    app.use('/api/experts', expertsRoutes);

    // Universal Chat
    app.use('/api/chat', chatRoutes);

    // Generation
    app.use('/api/generation', generationRoutes);

    // Templates
    app.use('/api/templates', templatesRoutes);

    // Stickers
    app.use('/api/stickers', stickersRoutes);

    // Legacy aliases — frontend calls these directly (not via /api/generation/*)
    app.get('/api/stars', async (req, res) => {
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = (await import('../lib/supabase.js')).supabase;
            const { data, error } = await supabase
                .from('stars')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            if (error) throw error;
            res.json({ success: true, stars: data || [] });
        } catch (e) {
            console.error('Stars alias error:', e);
            res.json({ success: true, stars: [] });
        }
    });
    app.use('/api/preview-greeting', (req, res, next) => { req.url = '/preview-greeting'; generationRoutes(req, res, next); });
    app.use('/api/generate-greeting-v2', (req, res, next) => { req.url = '/generate-greeting-v2'; generationRoutes(req, res, next); });
    app.use('/api/generate-stickers', (req, res, next) => { req.url = '/generate-stickers'; stickersRoutes(req, res, next); });
    app.use('/api/create-sticker-pack', (req, res, next) => { req.url = '/create-sticker-pack'; stickersRoutes(req, res, next); });
    app.use('/api/send-result', (req, res, next) => { req.url = '/send-result'; generationRoutes(req, res, next); });
    app.use('/api/send-sticker', (req, res, next) => { req.url = '/send-sticker'; stickersRoutes(req, res, next); });

    console.log('🛣️ Modular routes registered: gallery, user, marketing, experts, chat, generation, templates, stickers');
}
