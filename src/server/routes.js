import multer from 'multer';
import { supabase } from '../../bot-supabase.js';
import { aiService } from '../ai-service.js';
import { MODEL_CATALOG, PRICING } from '../config/models.js';
import { verifyTelegramWebAppData } from './utils.js';
import { addGenerationJob } from './queue.js';
import sharp from 'sharp';

const upload = multer({ storage: multer.memoryStorage() });

export const setupRoutes = (app, bot) => {

    // --- Config Endpoint ---
    app.get('/api/config', (req, res) => {
        res.json({
            models: MODEL_CATALOG,
            pricing: Object.fromEntries(
                Object.entries(MODEL_CATALOG).map(([k, v]) => [k, v.cost])
            )
        });
    });

    // --- Generate Endpoint ---
    app.post('/api/generate', upload.any(), async (req, res) => {
        try {
            let { prompt, type, userId, aspectRatio, options, initData } = req.body;
            console.log(`🎨 Generation request`);

            if (typeof options === 'string') {
                try { options = JSON.parse(options); } catch (e) { console.error('Error parsing options:', e); }
            }
            options = options || {};

            // Security: Validate InitData
            let telegramUser = null;
            if (initData) {
                telegramUser = verifyTelegramWebAppData(initData);
                if (!telegramUser) {
                    return res.status(403).json({ error: 'Security verification failed' });
                }
                options.telegramId = telegramUser.id;
            }

            // User Resolution
            if (options.telegramId) {
                const { data: u } = await supabase.from('users').select('id').eq('telegram_id', options.telegramId).single();
                if (u) userId = u.id;
            }

            if (!userId || userId === 'browser_user') {
                return res.status(401).json({ error: 'Unauthorized: No valid user' });
            }

            // 2. BACKEND PAYMENT PROTECTION
            const modelKey = (type || '').toLowerCase();
            let cost = PRICING['default'];

            if (PRICING[modelKey]) {
                cost = PRICING[modelKey];
            } else {
                const sortedKeys = Object.keys(PRICING).sort((a, b) => b.length - a.length);
                for (const key of sortedKeys) {
                    if (key !== 'default' && modelKey.includes(key)) {
                        cost = PRICING[key];
                        break;
                    }
                }
            }

            console.log(`💰 Charging ${cost} credits to ${userId} for ${type}`);

            // Payment Logic (Supabase)
            if (userId !== 'browser_user') {
                const { error: payError } = await supabase.rpc('process_generation_payment', {
                    p_user_id: userId,
                    p_cost: cost,
                    p_xp_reward: 2,
                    p_service_type: 'generation'
                });
                if (payError) {
                    console.error('Payment Failed:', payError);
                    return res.status(402).json({ error: 'Insufficient Credit' });
                }
            }

            // 3. Handle File Uploads (Supabase)
            let imageUrls = [];
            let videoUrls = [];

            if (req.files && req.files.length > 0) {
                console.log(`📂 Uploading ${req.files.length} files to Supabase...`);
                try {
                    for (const file of req.files) {
                        let processedBuffer = file.buffer;
                        let processedMime = file.mimetype;
                        let safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');

                        // Kie.ai Compatibility: Convert all images to actual JPEG bits
                        if (file.mimetype.startsWith('image/')) {
                            try {
                                console.log(`✨ Converting upload ${file.mimetype} to JPEG for Kie...`);
                                processedBuffer = await sharp(file.buffer)
                                    .jpeg({ quality: 90, mozjpeg: true })
                                    .toBuffer();
                                processedMime = 'image/jpeg';

                                // Reset filename extension
                                const nameParts = safeName.split('.');
                                if (nameParts.length > 1) nameParts.pop();
                                safeName = nameParts.join('.') + '.jpg';
                            } catch (e) {
                                console.error('Sharp conversion failed in routes:', e);
                            }
                        }

                        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${safeName}`;

                        const { error } = await supabase.storage
                            .from('uploads')
                            .upload(fileName, processedBuffer, {
                                contentType: processedMime,
                                upsert: false
                            });

                        if (error) throw error;

                        const { data: publicData } = supabase.storage
                            .from('uploads')
                            .getPublicUrl(fileName);

                        const url = publicData.publicUrl;

                        if (file.mimetype.startsWith('video/')) {
                            videoUrls.push(url);
                        } else {
                            imageUrls.push(url);
                        }
                    }
                } catch (uploadError) {
                    console.error('Upload Error:', uploadError);
                    return res.status(500).json({ error: 'File upload failed' });
                }
            }

            // Assign back to options
            if (imageUrls.length > 0) options.source_files = imageUrls;
            if (videoUrls.length > 0) options.video_files = videoUrls;



            // Call AI Service
            // 4. Submit to Persistent Queue (Robustness)
            try {
                const jobId = await addGenerationJob({
                    prompt, type, options, userId, cost,
                    // Pass flattened options for worker
                    options: { ...options, telegramId: options.telegramId, aspect_ratio: aspectRatio }
                });

                if (jobId) {
                    console.log(`✅ Job persisted in queue: ${jobId}`);
                    return res.json({ success: true, status: 'queued', jobId, message: 'Processing started in background' });
                }
            } catch (queueErr) {
                console.warn('⚠️ Queue not active, falling back to synchronous mode.');
            }

            // Fallback: Call AI Service with Refund Logic
            let result;
            try {
                result = await aiService.generateImage(prompt, type, {
                    userId,
                    telegramId: options.telegramId,
                    aspect_ratio: aspectRatio,
                    ...options
                });

                console.log('📦 Generation result:', JSON.stringify(result, null, 2));

                if (!result.success) throw new Error(result.error || 'Generation failed upstream');

            } catch (genError) {
                console.error('❌ Generation Failed:', genError.message);

                // Automatic Refund
                if (userId !== 'browser_user' && options.telegramId) {
                    console.log(`💸 Refunding ${cost} credits to ${options.telegramId}`);
                    try {
                        const { error: refundErr } = await supabase.rpc('add_user_credits', {
                            p_telegram_id: options.telegramId,
                            p_amount: cost,
                            p_reason: 'Refund: Generation Error',
                            p_source: 'system'
                        });

                        if (refundErr) {
                            console.error('❌ Refund Failed DB Error:', refundErr);
                        } else {
                            // Notify user about refund
                            bot.sendMessage(options.telegramId, `⚠️ *Ошибка генерации*\n\nПровайдер вернул ошибку. Мы вернули ${cost} ⚡ кредитов на ваш баланс.`, { parse_mode: 'Markdown' }).catch(e => console.error('Refund notify failed', e));
                        }
                    } catch (e) {
                        console.error('❌ Refund Exception:', e);
                    }
                }

                return res.status(500).json({ error: 'Generation failed. Funds have been refunded.' });
            }

            // Notify user in Telegram
            if (options.telegramId) {
                const isVideo = type.includes('video') || (result.imageUrl && result.imageUrl.match(/\.(mp4|mov|webm)$/i));
                const caption = `✨ Ваша генерация готова!\n\n🎨 ${type}\n📝 "${prompt ? prompt.slice(0, 50) : '...'}"\n\n@bazzar_pixel_bot`;

                try {
                    console.log(`📨 Sending notification to ${options.telegramId} (Video: ${isVideo})`);
                    if (isVideo) {
                        await bot.sendVideo(options.telegramId, result.imageUrl, { caption });
                    } else {
                        await bot.sendPhoto(options.telegramId, result.imageUrl, { caption });
                    }
                } catch (notifyErr) {
                    console.error('⚠️ Failed to send notification to bot:', notifyErr.message);
                }
            }

            res.json({ success: true, data: result });

        } catch (e) {
            console.error('API Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    // --- Send Result Endpoint ---
    app.post('/api/send-result', async (req, res) => {
        try {
            const { telegramId, imageUrl, prompt } = req.body;
            if (!telegramId || !imageUrl) {
                return res.status(400).json({ error: 'Missing telegramId or imageUrl' });
            }

            // Resolve Target ID (Handle UUID vs Numeric)
            let targetChatId = telegramId;
            // If it looks like a UUID (length > 20 and not numeric)
            if (typeof telegramId === 'string' && telegramId.length > 20 && isNaN(Number(telegramId))) {
                // Check for Local Mock User
                if (telegramId === '668d4825-99d9-43c2-ad8d-71b569e29548') {
                    targetChatId = 603207436; // Dev ID
                } else {
                    const { data, error } = await supabase.from('users').select('telegram_id').eq('id', telegramId).single();
                    if (data) targetChatId = data.telegram_id;
                    else {
                        console.error('User not found for UUID:', telegramId);
                        return res.status(404).json({ error: 'User not found' });
                    }
                }
            }

            // Send Photo
            await bot.sendPhoto(targetChatId, imageUrl, {
                caption: `✨ Генерация завершена!\n\n"${prompt || 'Result'}"\n\n@bazzar_pixel_bot`
            });

            res.json({ success: true });
        } catch (err) {
            console.error('[Send Result Error]', err);
            res.status(500).json({ error: err.message });
        }
    });

    // --- Transactions History ---
    app.get('/api/transactions', async (req, res) => {
        try {
            const { initData } = req.query; // Pass initData as query param

            if (!initData) {
                return res.status(401).json({ error: 'Auth required' });
            }

            const telegramUser = verifyTelegramWebAppData(initData);
            if (!telegramUser) {
                return res.status(403).json({ error: 'Invalid auth' });
            }

            // Get User ID
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', telegramUser.id)
                .single();

            if (!user) return res.json({ success: true, transactions: [] });

            // Fetch History
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            res.json({ success: true, transactions });

        } catch (e) {
            console.error('History Error:', e);
            res.status(500).json({ error: e.message });
        }
    });
};
