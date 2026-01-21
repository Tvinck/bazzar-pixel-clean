import { PgBoss } from 'pg-boss';

import { aiService } from '../ai-service.js';
import { supabase } from '../../bot-supabase.js';

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
        await boss.work('generate-image', async (job) => {
            const { prompt, type, options, cost } = job.data;
            const jobId = job.id;

            console.log(`⚙️ [Job ${jobId}] Processing: ${type}`);

            try {
                // 1. Generate
                const result = await aiService.generateImage(prompt, type, options);

                if (!result.success) throw new Error(result.error || 'Generation failed');

                // 2. Notify User (Telegram)
                if (options.telegramId && bot) {
                    // Check if it's video by model type or file extension
                    const isVideoModel = type.includes('video') || type.includes('kling') || type.includes('sora') || type.includes('veo');
                    const hasVideoExtension = result.imageUrl && result.imageUrl.match(/\.(mp4|mov|webm|avi)$/i);
                    const isVideo = isVideoModel || hasVideoExtension;

                    const caption = `✨ Ваша генерация готова!

🎨 ${type}
📝 "${prompt ? prompt.slice(0, 50) : '...'}${prompt && prompt.length > 50 ? '...' : ''}"

@bazzar_pixel_bot`;

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

export const addGenerationJob = async (data) => {
    if (!boss) return null;
    return await boss.send('generate-image', data, {
        retryLimit: 0,
        expireInMinutes: 15
    });
};
