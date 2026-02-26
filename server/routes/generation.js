import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { supabase } from '../lib/supabase.js';
import { aiService } from '../ai-service.js';
import { MODEL_CATALOG } from '../../src/config/models.js';
import { PRICING } from '../services/generation/config.js';
import { verifyTelegramWebAppData } from '../utils.js';
import { addGenerationJob } from '../queue.js';
import { authTG } from '../middleware/auth.js';
import { addBranding } from '../utils/branding.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/generation/config
 * Returns model catalog and pricing.
 */
router.get('/config', (req, res) => {
    res.json({
        models: MODEL_CATALOG,
        pricing: Object.fromEntries(
            Object.entries(MODEL_CATALOG).map(([k, v]) => [k, v.cost])
        )
    });
});

/**
 * GET /api/generation/jobs/:id
 * Checks generation job status.
 */
router.get('/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data: creation } = await supabase
            .from('creations')
            .select('*')
            .eq('generation_id', id)
            .maybeSingle();

        if (creation) {
            // Lazy polling for Kie jobs that are still placeholders
            if (creation.image_url && creation.image_url.includes('loading') && creation.generation_id) {
                try {
                    const kieKey = process.env.KIE_API_KEY;
                    const kRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${creation.generation_id}`, {
                        headers: { 'Authorization': `Bearer ${kieKey}` }
                    });

                    if (kRes.ok) {
                        const kData = await kRes.json();
                        const kState = kData.data?.state || kData.state;

                        if (kState === 'success' || kState === 'completed') {
                            let resultData = kData.data?.resultJson || kData.resultJson || kData.data?.result || kData.result;
                            if (typeof resultData === 'string') { try { resultData = JSON.parse(resultData); } catch (e) { } }

                            let finalUrl = resultData?.resultUrls?.[0] || resultData?.url || (Array.isArray(resultData) && resultData[0]);
                            if (finalUrl) {
                                await supabase.from('creations').update({
                                    image_url: finalUrl,
                                    thumbnail_url: finalUrl,
                                    completed_at: new Date().toISOString()
                                }).eq('id', creation.id);
                                return res.json({ job: { status: 'completed', result_url: finalUrl } });
                            }
                        }
                    }
                } catch (e) { console.error('Lazy polling error:', e); }
            }
            return res.json({ job: { status: 'completed', result_url: creation.image_url } });
        }

        // Check for refunds
        const { data: refund } = await supabase
            .from('transactions')
            .select('*')
            .eq('description', `Refund: Job ${id} Failed`)
            .maybeSingle();

        if (refund) return res.json({ job: { status: 'failed', error_message: 'Generation failed and credits were refunded' } });

        res.json({ job: { status: 'active' } });
    } catch (e) {
        res.status(500).json({ error: 'Status check failed' });
    }
});

/**
 * POST /api/generation/generate
 * Main generation endpoint.
 */
router.post('/generate', upload.any(), async (req, res) => {
    try {
        let { prompt, type, userId, aspectRatio, options, initData } = req.body;
        if (typeof options === 'string') { try { options = JSON.parse(options); } catch (e) { } }
        options = options || {};

        if (initData) {
            const telegramUser = verifyTelegramWebAppData(initData);
            if (!telegramUser) return res.status(403).json({ error: 'Security verification failed' });
            options.telegramId = telegramUser.id;
        }

        if (options.telegramId) {
            const { data: u } = await supabase.from('users').select('id').eq('telegram_id', options.telegramId).single();
            if (u) userId = u.id;
        }

        // DEV_USER_UUID bypass validation
        const DEV_USER_UUID = '37fdfc15-46fd-4be9-ba5a-cfb3e1022137'; // UUID for dev_user 603207436

        if ((!userId || userId === 'browser_user') && process.env.NODE_ENV === 'production' && userId !== DEV_USER_UUID) {
            // Further verification: Check if it's explicitly the dev user id assigned from frontend context
            if (options.telegramId !== 603207436) {
                return res.status(401).json({ error: 'Unauthorized: No valid user' });
            }
        }

        const modelKey = (type || '').toLowerCase();
        let cost = PRICING[modelKey] || PRICING['default'];

        const { data: payData, error: payError } = await supabase.rpc('process_generation_payment', {
            p_user_id: userId,
            p_cost: cost,
            p_xp_reward: 2,
            p_service_type: 'generation'
        });

        if (payError) return res.status(402).json({ error: 'Insufficient Credit' });
        const newBalance = payData?.new_balance;

        // Handle File Uploads
        let sourceFiles = [];
        if (req.files) {
            for (const file of req.files) {
                const processedBuffer = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const { error } = await supabase.storage.from('uploads').upload(fileName, processedBuffer, { contentType: 'image/jpeg' });
                if (!error) sourceFiles.push(supabase.storage.from('uploads').getPublicUrl(fileName).data.publicUrl);
            }
        }
        if (sourceFiles.length > 0) options.source_files = sourceFiles;

        const jobResult = await addGenerationJob({
            prompt, type, userId, cost,
            options: { ...options, aspect_ratio: aspectRatio }
        });

        res.json({
            success: true,
            status: jobResult?.imageUrl ? 'completed' : 'queued',
            jobId: jobResult?.id || jobResult,
            newBalance,
            imageUrl: jobResult?.imageUrl || null
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/generation/send-result
 */
router.post('/send-result', async (req, res) => {
    try {
        const { telegramId, imageUrl, prompt, addBranding: applyBranding } = req.body;
        const bot = req.app.get('bot');
        if (!bot) return res.status(503).json({ error: 'Bot unavailable' });

        let finalUrl = imageUrl;
        if (applyBranding) {
            const isVideo = imageUrl.match(/\.(mp4|mov|webm|gif)$/i);
            finalUrl = await addBranding(imageUrl, isVideo ? 'video' : 'image');
        }

        const caption = `✨ Готово!\n\n${prompt || 'AI Creation'}\n\n🤖 @Pixel_ai_bot`;
        const isVideo = finalUrl.match(/\.(mp4|mov|webm|gif)$/i);

        if (isVideo) await bot.sendVideo(telegramId, finalUrl, { caption, parse_mode: 'Markdown' });
        else await bot.sendPhoto(telegramId, finalUrl, { caption, parse_mode: 'Markdown' });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/generation/stars — Public stars list for greetings
 */
router.get('/stars', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('stars')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        res.json({ success: true, stars: data || [] });
    } catch (e) {
        console.error('Fetch Stars Error:', e);
        res.json({ success: true, stars: [] });
    }
});

/**
 * POST /api/generation/preview-greeting — Generate text preview
 */
router.post('/preview-greeting', authTG, async (req, res) => {
    try {
        const { starId, occasion, targetName } = req.body;
        const { data: star } = await supabase.from('stars').select('*').eq('id', starId).single();
        if (!star) return res.status(404).json({ error: 'Star not found' });

        const prompt = `Напиши короткое поздравление (до 140 символов) от лица ${star.name} для ${targetName}. Повод: ${occasion}. Стиль речи должен быть характерным для ${star.name}. Без кавычек.`;
        const result = await aiService.generateText(prompt);

        res.json({ success: true, text: result || `${targetName}, поздравляю тебя! — ${star.name}` });
    } catch (e) {
        console.error('Preview Greeting Error:', e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/generation/generate-greeting-v2 — Generate video greeting
 */
router.post('/generate-greeting-v2', authTG, async (req, res) => {
    try {
        const { starId, occasion, targetName, customText } = req.body;
        const telegramId = req.tgUser.id;
        const cost = 30;

        const { data: userRow } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
        const userUUID = userRow?.id;
        if (!userUUID) return res.status(401).json({ error: 'User not found' });

        const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', userUUID).single();
        const balance = stats?.current_balance || 0;
        if (balance < cost) return res.status(402).json({ error: 'Insufficient credits' });

        // Deduct credits
        await supabase.rpc('deduct_credits', { user_uuid: userUUID, amount: cost });

        // Fetch star
        const { data: star } = await supabase.from('stars').select('*').eq('id', starId).single();
        if (!star) return res.status(404).json({ error: 'Star not found' });

        // Generate greeting text if not custom
        let greetingText = customText;
        if (!greetingText) {
            const prompt = `Напиши короткое поздравление (до 140 символов) от лица ${star.name} для ${targetName}. Повод: ${occasion}. Стиль: характерный для ${star.name}. Без кавычек.`;
            greetingText = await aiService.generateText(prompt) || `${targetName}, поздравляю! — ${star.name}`;
        }

        // Add video generation job
        const jobResult = await addGenerationJob({
            prompt: greetingText,
            type: 'video',
            cost,
            userId: userUUID,
            options: {
                imageUrl: star.image_url,
                telegramId,
                greetingMode: true,
                starName: star.name
            }
        });

        const newBalance = balance - cost;
        res.json({
            success: true,
            jobId: jobResult?.id,
            newBalance,
            videoUrl: jobResult?.imageUrl || null,
            greetingText
        });
    } catch (e) {
        console.error('Generate Greeting V2 Error:', e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/generation/marketplace/:id/track
 */
router.post('/marketplace/:id/track', async (req, res) => {
    res.json({ ok: true });
});

export default router;
