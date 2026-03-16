import express from 'express';
import { supabase } from '../lib/supabase.js';
import { getQueue } from '../queue.js';
// Note: In server/index.js, 'queue' is initialized. We need to pass it or export it.
import multer from 'multer';
import { authTG } from '../middleware/auth.js';
import { getCacheStats } from '../utils/promptCache.js';

const router = express.Router();

// Helper to verify admin role
async function requireAdmin(req, res, next) {
    try {
        const tgUser = req.tgUser;
        if (!tgUser || !tgUser.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check role in database
        const { data: user, error } = await supabase
            .from('users')
            .select('role')
            .eq('telegram_id', tgUser.id)
            .single();

        if (error || !user || user.role !== 'admin') {
            console.warn(`🚫 Unauthorized admin access attempt by TG ID: ${tgUser.id}`);
            return res.status(403).json({ error: 'Access denied: Admin only' });
        }

        next();
    } catch (e) {
        console.error('Admin Check Error:', e);
        res.status(500).json({ error: 'Internal server error during authorization' });
    }
}

export const setupAdminRoutes = (app) => {
    // --- ADMIN 2FA ---
    app.post('/api/admin/send-2fa', authTG, requireAdmin, async (req, res) => {
        try {
            const user = req.tgUser;
            if (!user || (!user.telegram_id && !user.id)) return res.status(401).json({ error: 'Auth required' });

            // Generate 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // Store in DB
            const { error: dbError } = await supabase
                .from('admin_2fa_codes')
                .upsert({ user_id: user.id, code, expires_at: expiresAt.toISOString() });

            if (dbError) throw dbError;

            // Send via Telegram
            const bot = app.get('bot');
            if (!bot) return res.status(500).json({ error: 'Telegram bot not initialized' });

            const text = `🔐 *Код подтверждения для входа в панель администратора:*\n\n` +
                `*${code}*\n\n` +
                `Этот код действителен 5 минут. Если это были не вы, немедленно обратитесь в поддержку.`;

            await bot.sendMessage(user.telegram_id, text, { parse_mode: 'Markdown' });

            res.json({ success: true });
        } catch (e) {
            console.error('Send 2FA Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/admin/verify-2fa', authTG, requireAdmin, async (req, res) => {
        try {
            const user = req.tgUser;
            const { code } = req.body;

            if (!code) return res.status(400).json({ error: 'Code required' });

            const { data, error } = await supabase
                .from('admin_2fa_codes')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                return res.status(403).json({ error: 'Код не найден или истёк' });
            }

            if (data.code !== code) {
                return res.status(403).json({ error: 'Неверный код' });
            }

            if (new Date(data.expires_at) < new Date()) {
                await supabase.from('admin_2fa_codes').delete().eq('user_id', user.id);
                return res.status(403).json({ error: 'Срок действия кода истёк' });
            }

            // Success: clear code and return ok
            await supabase.from('admin_2fa_codes').delete().eq('user_id', user.id);
            res.json({ success: true });
        } catch (e) {
            console.error('Verify 2FA Error:', e);
            res.status(500).json({ error: e.message });
        }
    });


    // --- PUBLISH TO CHANNEL ---
    app.post('/api/admin/publish-to-channel', authTG, requireAdmin, async (req, res) => {
        try {
            const { text, mediaUrl, channelId, scheduledAt, isVideo } = req.body;
            const boss = getQueue();

            if (scheduledAt) {
                if (boss) {
                    await boss.sendAfter('publish-channel-post',
                        { text, mediaUrl, channelId, isVideo },
                        {}, new Date(scheduledAt));
                } else {
                    return res.status(500).json({ error: 'Background queue not initialized for scheduling' });
                }
            } else {
                const { bot } = await import('../index.js');
                if (!bot) return res.status(500).json({ error: 'Telegram bot not initialized' });
                if (isVideo) {
                    await bot.sendVideo(channelId, mediaUrl, { caption: text, parse_mode: 'Markdown' });
                } else {
                    await bot.sendPhoto(channelId, mediaUrl, { caption: text, parse_mode: 'Markdown' });
                }
            }
            res.json({ success: true });
        } catch (e) {
            console.error('Publish error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // --- SEND MESSAGE / BROADCAST ---
    app.post('/api/admin/message', authTG, requireAdmin, async (req, res) => {
        try {
            const { userId, message, mediaUrl, mediaType, isBroadcast, segment } = req.body;
            const boss = getQueue();

            if (!isBroadcast) {
                // Single message
                if (!userId) return res.status(400).json({ error: 'userId is required for personal messages' });

                const { data: userRow } = await supabase.from('users').select('telegram_id').eq('id', userId).single();
                if (!userRow || !userRow.telegram_id) return res.status(404).json({ error: 'User not found or no TG ID' });

                if (boss) {
                    await boss.send('broadcast-message', {
                        userId, telegramId: userRow.telegram_id, text: message, mediaUrl, mediaType
                    });
                } else {
                    // fallback to sync if boss fails
                    const { bot } = await import('../index.js');
                    if (mediaUrl) {
                        if (mediaType === 'video') await bot.sendVideo(userRow.telegram_id, mediaUrl, { caption: message, parse_mode: 'HTML' });
                        else await bot.sendPhoto(userRow.telegram_id, mediaUrl, { caption: message, parse_mode: 'HTML' });
                    } else {
                        await bot.sendMessage(userRow.telegram_id, message, { parse_mode: 'HTML' });
                    }
                }
                return res.json({ success: true, count: 1 });
            }

            // --- BROADCAST LOGIC ---
            if (!boss) return res.status(500).json({ error: 'Background queue required for broadcasting' });

            let query = supabase.from('users').select('id, telegram_id, user_stats!inner(updated_at, current_balance, total_generations)').not('telegram_id', 'is', null);

            // Apply Segments
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const isoSeven = sevenDaysAgo.toISOString();

            if (segment === 'active') {
                query = query.gte('user_stats.updated_at', isoSeven);
            } else if (segment === 'sleeping') {
                query = query.lt('user_stats.updated_at', isoSeven);
            } else if (segment === 'zerobalance') {
                query = query.eq('user_stats.current_balance', 0);
            } else if (segment === 'newbies') {
                query = query.lt('user_stats.total_generations', 3);
            } else if (segment === 'vip') {
                // Let's identify VIPs. A simple way: they have transaction type='deposit'
                // But we can't join transactions easily without an RPC. Alternatively, balance > 100 or check 'is_premium'.
                query = query.eq('is_premium', true);
            }

            const { data: targetUsers, error } = await query;
            if (error) throw error;

            if (!targetUsers || targetUsers.length === 0) {
                return res.json({ success: true, count: 0, message: 'No users matched the segment' });
            }

            // Enqueue all jobs
            const jobs = targetUsers.map(u => ({
                name: 'broadcast-message',
                data: { userId: u.id, telegramId: u.telegram_id, text: message, mediaUrl, mediaType }
            }));

            await boss.insert(jobs);

            res.json({ success: true, count: jobs.length });
        } catch (e) {
            console.error('Broadcast Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // --- DASHBOARD METRICS ---
    app.get('/api/admin/metrics', authTG, requireAdmin, async (req, res) => {
        try {
            // 1. Cache Stats
            const cacheStats = getCacheStats();

            // 2. Queue Stats
            const boss = getQueue();
            const queueStats = boss ? await boss.getQueueSize('generation') : { active: 0, waiting: 0 };

            // 3. Fetch Aggregated Metrics from Supabase RPC
            const { data: rpcData, error } = await supabase.rpc('get_admin_dashboard_stats');
            if (error) throw error;

            res.json({
                success: true,
                cache: cacheStats,
                queue: queueStats, // Return the object directly to match UI expectations { active, waiting }
                timeline: rpcData.timeline || [],
                topPrompts: rpcData.topPrompts || [],
                conversion: rpcData.conversion || '0%',
                activeUsers24h: rpcData.activeUsers24h || 0,
                totals: rpcData.totals || { users: 0, revenue: 0, recentGens: 0 }
            });
        } catch (e) {
            console.error('Metrics Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // --- SYSTEM HEALTH CHECK ---
    app.get('/api/admin/health', authTG, requireAdmin, async (req, res) => {
        try {
            const status = {
                supabase: 'unknown',
                kie: 'unknown',
                queue: 'unknown',
                timestamp: new Date().toISOString()
            };

            // 1. Check Supabase
            try {
                const { error } = await supabase.from('users').select('id').limit(1).single();
                status.supabase = error ? 'error' : 'healthy';
            } catch (e) { status.supabase = 'error'; }

            // 2. Check Kie API
            try {
                const kieRes = await fetch('https://api.kie.ai/v1/models', {
                    headers: { 'x-api-key': process.env.KIE_API_KEY }
                });
                status.kie = kieRes.ok ? 'healthy' : 'degraded';
            } catch (e) { status.kie = 'error'; }

            // 3. Check Queue (PgBoss)
            const boss = getQueue();
            status.queue = boss ? 'healthy' : 'unavailable';

            res.json({ success: true, status });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // Dashboard Stats
    app.get('/api/admin/queue/stats', authTG, requireAdmin, async (req, res) => {
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
    app.post('/api/admin/queue/retry', authTG, requireAdmin, async (req, res) => {
        try {
            const { jobId } = req.body;
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // --- STARS MANAGEMENT ---

    // Get all stars (Admin)
    app.get('/api/admin/stars', authTG, requireAdmin, async (req, res) => {
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
    app.post('/api/admin/stars', authTG, requireAdmin, async (req, res) => {
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
    app.put('/api/admin/stars/:id', authTG, requireAdmin, async (req, res) => {
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
    app.delete('/api/admin/stars/:id', authTG, requireAdmin, async (req, res) => {
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

    // --- PROMOTIONS & FLASH SALES ---
    app.get('/api/admin/promotions', authTG, requireAdmin, async (req, res) => {
        try {
            const { data, error } = await supabase.from('active_promotions').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            res.json({ success: true, promotions: data });
        } catch (e) {
            console.error('Fetch Promotions Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/admin/promotions', authTG, requireAdmin, async (req, res) => {
        try {
            const { title, discount_percent, ends_at } = req.body;
            const { data, error } = await supabase.from('active_promotions').insert({
                title, discount_percent, ends_at
            }).select().single();
            if (error) throw error;
            res.json({ success: true, promotion: data });
        } catch (e) {
            console.error('Create Promotion Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    app.delete('/api/admin/promotions/:id', authTG, requireAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('active_promotions').delete().eq('id', id);
            if (error) throw error;
            res.json({ success: true });
        } catch (e) {
            console.error('Delete Promotion Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/admin/promo-codes', authTG, requireAdmin, async (req, res) => {
        try {
            const { data, error } = await supabase.from('promo_codes').select(`*, owner:owner_id(username, first_name)`).order('created_at', { ascending: false });
            if (error) throw error;
            res.json({ success: true, promo_codes: data });
        } catch (e) {
            console.error('Fetch Promo Codes Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/admin/promo-codes', authTG, requireAdmin, async (req, res) => {
        try {
            const { code, discount_percent, owner_reward } = req.body;
            // Admins create system promo codes (owner_id = null)
            const { data, error } = await supabase.from('promo_codes').insert({
                code: code.toUpperCase(), discount_percent, owner_reward
            }).select().single();
            if (error) throw error;
            res.json({ success: true, promo_code: data });
        } catch (e) {
            console.error('Create Promo Code Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    app.delete('/api/admin/promo-codes/:id', authTG, requireAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('promo_codes').delete().eq('id', id);
            if (error) throw error;
            res.json({ success: true });
        } catch (e) {
            console.error('Delete Promo Code Error:', e);
            res.status(500).json({ error: e.message });
        }
    });
};
