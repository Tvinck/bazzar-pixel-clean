import { PgBoss } from 'pg-boss';

import { aiService } from './ai-service.js';
import { supabase } from './lib/supabase.js';

let boss;

export const initQueue = async (bot) => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.warn('⚠️ DATABASE_URL not found. Job Queue disabled. Falling back to sync mode.');
        return null;
    }

    try {
        boss = new PgBoss(connectionString);
        boss.on('error', error => console.error('Queue Error:', error));

        await boss.start();
        console.log('✅ Job Queue started (PgBoss)');

        // --- WORKER ---
        await boss.work('generate-image', { teamSize: 19 }, async (job) => {
            const { prompt, type, options, cost, userId } = job.data;
            const jobId = job.id;

            console.log(`⚙️ [Job ${jobId}] Processing: ${type}`);

            try {
                // 1. Generate
                const result = await aiService.generateImage(prompt, type, options);

                if (!result.success) throw new Error(result.error || 'Generation failed');

                // 2. Save to History (DB)
                if (userId) {
                    const isVideoResult = (type.includes('video') || (result.imageUrl && result.imageUrl.match(/\.(mp4|mov)$/i)));

                    const { error: saveErr } = await supabase.from('creations').insert({
                        user_id: userId,
                        generation_id: jobId, // Use raw UUID from pg-boss
                        title: prompt ? prompt.slice(0, 50) : 'Bot Generation',
                        description: prompt || 'Created via Bot',
                        image_url: result.imageUrl,
                        thumbnail_url: result.imageUrl,
                        type: isVideoResult ? 'video' : 'image',
                        prompt: prompt,
                        is_public: false,
                        tags: [type, 'bot']
                    });
                    if (saveErr) {
                        console.error('⚠️ Failed to save bot creation to DB:', saveErr);
                        if (saveErr.code === '22P02') {
                            console.warn('💡 Tip: Run FIX_CREATIONS_UUID.sql if you want to use custom ID formats.');
                        }
                    }
                }

                // 3. Notify User (Telegram)
                if (options.telegramId && bot) {
                    // Check if it's video by model type or file extension
                    const isVideoModel = type.includes('video') || type.includes('kling') || type.includes('sora') || type.includes('veo');
                    const hasVideoExtension = result.imageUrl && result.imageUrl.match(/\.(mp4|mov|webm|avi)$/i);
                    const isVideo = isVideoModel || hasVideoExtension;

                    const caption = `✨ Ваша генерация готова!

🎨 ${type}
📝 "${prompt ? prompt.slice(0, 50) : '...'}${prompt && prompt.length > 50 ? '...' : ''}"

@Pixel_ai_bot`;

                    try {
                        console.log(`📨 [Job ${jobId}] Sending ${isVideo ? 'video' : 'image'} to ${options.telegramId}`);
                        if (isVideo) {
                            await bot.sendVideo(options.telegramId, result.imageUrl, { caption });
                        } else {
                            await bot.sendPhoto(options.telegramId, result.imageUrl, { caption });
                        }
                    } catch (notifyErr) {
                        console.error(`⚠️ [Job ${jobId}] Notify failed:`, notifyErr.message);
                    }
                }

                return { success: true, imageUrl: result.imageUrl };

            } catch (error) {
                console.error(`❌ [Job ${jobId}] Failed:`, error.message);

                // 3. REFUND LOGIC (Moved from routes.js to Worker)
                if (options.telegramId && options.userId !== 'browser_user') {
                    // Check if we should refund (only if cost was provided)
                    if (cost > 0) {
                        console.log(`💸 [Job ${jobId}] Refunding ${cost} credits...`);
                        try {
                            await supabase.rpc('add_user_credits', {
                                p_telegram_id: options.telegramId,
                                p_amount: cost,
                                p_reason: `Refund: Job ${jobId} Failed`,
                                p_source: 'system'
                            });
                            if (bot) {
                                bot.sendMessage(options.telegramId, `⚠️ *Ошибка генерации*\n\nМы вернули ${cost} кредитов.`, { parse_mode: 'Markdown' }).catch(() => { });
                            }
                        } catch (e) {
                            console.error(`❌ [Job ${jobId}] Refund Failed:`, e);
                        }
                    }
                }

                throw error; // Mark job as failed in PgBoss
            }
        });

        return boss;

    } catch (err) {
        console.error('❌ Failed to initialize Queue:', err);
        return null;
    }
};

import crypto from 'crypto';

export const addGenerationJob = async (data) => {
    if (!boss) {
        console.log('⚡ Fallback: Processing job synchronously since pg-boss is not initialized');
        const fallbackJobId = crypto.randomUUID();

        // Execute synchronously to ensure Vercel doesn't kill the background process
        try {
            const { prompt, type, options, cost, userId } = data;
            const result = await aiService.generateImage(prompt, type, options);

            if (!result.success) throw new Error(result.error || 'Generation failed');

            if (userId) {
                const isVideoResult = (type.includes('video') || (result.imageUrl && result.imageUrl.match(/\\.(mp4|mov)$/i)));
                await supabase.from('creations').insert({
                    user_id: userId,
                    generation_id: fallbackJobId,
                    title: prompt ? prompt.slice(0, 50) : 'Web Generation',
                    description: prompt || 'Created via Web',
                    image_url: result.imageUrl,
                    thumbnail_url: result.imageUrl,
                    type: isVideoResult ? 'video' : 'image',
                    prompt: prompt,
                    is_public: false,
                    tags: [type, 'web']
                });
            }
        } catch (error) {
            console.error(`❌ [Fallback Job ${fallbackJobId}] Failed:`, error.message);
            // Refund logic if needed
            if (data.options?.telegramId && data.options?.userId !== 'browser_user' && data.cost > 0) {
                try {
                    await supabase.rpc('add_user_credits', {
                        p_telegram_id: data.options.telegramId,
                        p_amount: data.cost,
                        p_reason: `Refund: Job ${fallbackJobId} Failed`,
                        p_source: 'system'
                    });
                } catch (e) { }
            }
        }

        return fallbackJobId;
    }

    return await boss.send('generate-image', data, {
        retryLimit: 0,
        expireInMinutes: 15
    });
};
