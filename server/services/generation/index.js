import express from 'express';
import cors from 'cors';
import { supabase, authTG, authAPIKey, getUserUUID, getUserBalance, sendTelegramMessage, PORTS } from '../../shared/index.js';
import { aiService } from './ai-logic.js';
import { initQueue, addJob } from './queue-logic.js';
import { PRICING, MODEL_CATALOG } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = PORTS.GENERATION;

// Initialize Queue
initQueue();

// --- LOGGING UTILITY ---
async function logAPIRequest(apiKeyId, userId, endpoint, method, statusCode, responseTime) {
    try {
        await supabase.from('api_logs').insert({
            api_key_id: apiKeyId,
            user_id: userId,
            endpoint,
            method,
            status_code: statusCode,
            response_time_ms: responseTime
        });
    } catch (e) {
        console.error('API Log Error:', e);
    }
}

// --- ROUTES ---

/**
 * GET /api/generation/config
 */
app.get('/api/generation/config', async (req, res) => {
    res.json({ models: MODEL_CATALOG, pricing: PRICING });
});

/**
 * POST /api/generation/external/generate (Public Developer API)
 */
app.post('/api/generation/external/generate', authAPIKey, async (req, res) => {
    const startTime = Date.now();
    try {
        const { prompt, modelId, options = {} } = req.body;
        const user = req.user;
        const apiKeyId = req.apiKeyId;

        if (!prompt || !modelId) {
            return res.status(400).json({ error: 'Missing prompt or modelId' });
        }

        const cost = PRICING[modelId] || PRICING.default;
        const stats = await supabase.from('user_stats').select('current_balance').eq('user_id', user.id).single();
        const balance = stats.data?.current_balance || 0;

        if (balance < cost) {
            await logAPIRequest(apiKeyId, user.id, '/external/generate', 'POST', 402, Date.now() - startTime);
            return res.status(402).json({ error: 'Insufficient credits' });
        }

        // Deduct credits
        const { data: payData, error: payError } = await supabase.rpc('process_generation_payment', {
            p_user_id: user.id, p_cost: cost, p_xp_reward: 1, p_service_type: 'api_generation'
        });

        if (payError || !payData?.success) {
            await logAPIRequest(apiKeyId, user.id, '/external/generate', 'POST', 402, Date.now() - startTime);
            return res.status(402).json({ error: 'Payment failed' });
        }

        // Add to Queue
        const job = await addJob({
            prompt, type: modelId, cost, userId: user.id,
            options: { ...options, isExternal: true, apiKeyId }
        });

        const responseTime = Date.now() - startTime;
        await logAPIRequest(apiKeyId, user.id, '/external/generate', 'POST', 200, responseTime);

        res.json({
            success: true,
            jobId: job?.id,
            status: 'queued',
            checkStatusUrl: `${req.protocol}://${req.get('host')}/api/generation/jobs/${job?.id}`
        });
    } catch (e) {
        console.error('External API Error:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET /api/generation/stars — Public stars list for greetings
 */
app.get('/api/generation/stars', async (req, res) => {
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
app.post('/api/generation/preview-greeting', authTG, async (req, res) => {
    try {
        const { starId, occasion, targetName } = req.body;

        // Fetch star info
        const { data: star } = await supabase.from('stars').select('*').eq('id', starId).single();
        if (!star) return res.status(404).json({ error: 'Star not found' });

        // Generate text using AI
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
app.post('/api/generation/generate-greeting-v2', authTG, async (req, res) => {
    try {
        const { userId, starId, occasion, targetName, customText } = req.body;
        const telegramId = req.tgUser.id;
        const cost = 30;

        const userUUID = await getUserUUID(telegramId);
        const balance = await getUserBalance(userUUID);
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

        // Reconstruct base URL to satisfy Kie API schema requirements for full URLs
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;
        const fullImageUrl = star.image_url?.startsWith('/') ? `${baseUrl}${star.image_url}` : star.image_url;

        // Add video generation job
        const job = await addJob({
            prompt: greetingText,
            type: 'video',
            cost,
            userId: userUUID,
            options: {
                imageUrl: fullImageUrl,
                telegramId,
                greetingMode: true,
                starName: star.name
            }
        });

        res.json({
            success: true,
            jobId: job?.id,
            greetingText,
            videoUrl: null // Will be available after job completes
        });
    } catch (e) {
        console.error('Generate Greeting Error:', e);
        res.status(500).json({ error: e.message });
    }
});
/**
 * POST /api/generation/generate
 */
app.post('/api/generation/generate', authTG, async (req, res) => {
    try {
        const { prompt, modelId, options = {} } = req.body;
        const telegramId = req.tgUser.id;
        const cost = PRICING[modelId] || PRICING.default;

        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const balance = await getUserBalance(telegramId);
        if (balance < cost) return res.status(402).json({ error: 'Insufficient credits' });

        // Deduct credits via RPC
        const { data: payData, error: payError } = await supabase.rpc('process_generation_payment', {
            p_user_id: userUUID, p_cost: cost, p_xp_reward: 2, p_service_type: 'generation'
        });

        if (payError || !payData?.success) return res.status(402).json({ error: 'Payment failed' });

        // Add to Queue
        const job = await addJob({
            prompt, type: modelId, cost, userId: userUUID,
            options: { ...options, telegramId }
        });

        res.json({ success: true, jobId: job?.id, newBalance: payData.new_balance });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/generation/jobs/:id
 */
app.get('/api/generation/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: creation } = await supabase.from('creations').select('*').eq('generation_id', id).maybeSingle();
        if (creation) return res.json({ status: 'completed', result: creation });
        res.json({ status: 'processing' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/generation/upscale
 */
app.post('/api/generation/upscale', authTG, async (req, res) => {
    try {
        const { creationId, options = {} } = req.body;
        const telegramId = req.tgUser.id;
        const modelId = 'upscale';
        const cost = PRICING[modelId] || 10;

        if (!creationId) return res.status(400).json({ error: 'Missing creationId' });

        const userUUID = await getUserUUID(telegramId);
        if (!userUUID) return res.status(404).json({ error: 'User not found' });

        const balance = await getUserBalance(telegramId);
        if (balance < cost) return res.status(402).json({ error: 'Insufficient credits' });

        // Get the source image URL
        const { data: creation } = await supabase.from('creations').select('image_url').eq('id', creationId).single();
        if (!creation) return res.status(404).json({ error: 'Creation not found' });

        // Deduct credits
        const { data: payData, error: payError } = await supabase.rpc('process_generation_payment', {
            p_user_id: userUUID, p_cost: cost, p_xp_reward: 1, p_service_type: 'upscale'
        });

        if (payError || !payData?.success) return res.status(402).json({ error: 'Payment failed' });

        // Add to Queue (We can reuse generate-image worker if we update it to handle upscale type)
        // Or call it directly if it's async enough.
        // For consistency with generation, let's use the queue.
        const job = await addJob({
            prompt: `Upscale: ${creationId}`,
            type: modelId,
            cost,
            userId: userUUID,
            options: { ...options, imageUrl: creation.image_url, telegramId, originalCreationId: creationId }
        });

        res.json({ success: true, jobId: job?.id, newBalance: payData.new_balance });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/generation/public/:id
 * Fetch details of a public creation (no auth required)
 */
app.get('/api/generation/public/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: creation, error } = await supabase
            .from('creations')
            .select(`
                *,
                user:users(id, username, first_name, avatar_url)
            `)
            .eq('id', id)
            .eq('is_public', true)
            .single();

        if (error || !creation) return res.status(404).json({ error: 'Creation not found or private' });
        res.json(creation);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/generation/marketplace
 * Fetch curated prompts
 */
app.get('/api/generation/marketplace', async (req, res) => {
    try {
        const { category } = req.query;
        let query = supabase.from('prompt_marketplace').select('*').order('usage_count', { ascending: false });
        if (category) query = query.eq('category', category);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/generation/marketplace/:id/track
 * Increment usage count
 */
app.post('/api/generation/marketplace/:id/track', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.rpc('increment_prompt_usage', { prompt_id: id });
        if (error) throw error;
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * Experts, Stickers, Templates routes would be added here similar to monolith
 * (Keeping them in one service as planned)
 */

app.listen(PORT, () => console.log(`🚀 Generation Service running on port ${PORT}`));
