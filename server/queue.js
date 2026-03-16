import { PgBoss } from 'pg-boss';

import { aiService } from './ai-service.js';
import { supabase } from './lib/supabase.js';
import { setCache } from './utils/promptCache.js';
import { sendAdminAlert } from './utils/alerts.js';
import { notifyUserViaWs } from './index.js';

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
                // --- INJECT WEBHOOK URL ---
                const serverUrl = process.env.SERVER_URL || 'https://api.bazzar-pixel.com';
                options.callBackUrl = `${serverUrl}/api/kie/webhook/${jobId}`;

                // 1. Generate
                const result = await aiService.generateImage(prompt, type, options);

                if (!result.success) throw new Error(result.error || 'Generation failed');

                // If async (Webhook mode), it returns pending
                if (result.status === 'pending') {
                    console.log(`⏳ [Job ${jobId}] Task offloaded to Kie.ai (Task ID: ${result.taskId}). Waiting for webhook...`);

                    // Save to DB initially as pending
                    if (userId) {
                        const isVideoResult = type.includes('video') || type.includes('kling');
                        const { error: saveErr } = await supabase.from('creations').insert({
                            id: jobId,
                            user_id: userId,
                            generation_id: result.taskId,
                            title: prompt ? prompt.slice(0, 50) : 'Bot Generation',
                            description: prompt || 'Created via Bot',
                            status: 'pending',
                            type: isVideoResult ? 'video' : 'image',
                            prompt: prompt,
                            model_id: type, // Cache the actual model_id for webhook caching
                            is_public: false,
                            tags: [type, 'bot'],
                            metadata: {
                                cost: cost,
                                telegramId: options.telegramId
                            }
                        });
                        if (saveErr) console.error('⚠️ Failed to save pending creation to DB:', saveErr.message);
                    }

                    // We exit early. The WEBHOOK will handle Cache, DB Update, Telegram and WS Notifications.
                    return { success: true, status: 'pending', taskId: result.taskId };
                }

                // --- SAVE TO CACHE (SYNC FALLBACK ONLY) ---
                if (!options.source_files || options.source_files.length === 0) {
                    setCache(prompt, type, result);
                }

                // 2. Save to History (DB) (SYNC FALLBACK ONLY)
                if (userId) {
                    const isVideoResult = (type.includes('video') || (result.imageUrl && result.imageUrl.match(/\.(mp4|mov)$/i)));

                    const { error: saveErr } = await supabase.from('creations').insert({
                        user_id: userId,
                        generation_id: jobId,
                        title: prompt ? prompt.slice(0, 50) : 'Bot Generation',
                        description: prompt || 'Created via Bot',
                        image_url: result.imageUrl,
                        thumbnail_url: result.imageUrl,
                        status: 'completed',
                        type: isVideoResult ? 'video' : 'image',
                        prompt: prompt,
                        is_public: false,
                        tags: [type, 'bot']
                    });
                    if (saveErr) console.error('⚠️ Failed to save completed creation to DB:', saveErr.message);
                }

                // 3. Notify User (Telegram) (SYNC FALLBACK ONLY)
                if (options.telegramId && bot) {
                    const isVideoModel = type.includes('video') || type.includes('kling') || type.includes('sora') || type.includes('veo');
                    const hasVideoExtension = result.imageUrl && result.imageUrl.match(/\.(mp4|mov|webm|avi)$/i);
                    const isVideo = isVideoModel || hasVideoExtension;

                    const caption = `✨ <b>Генерация готова!</b>\n\n🔹 Модель: <code>${type}</code>\n📝 Промпт: <i>"${prompt ? prompt.slice(0, 100) : '...'}"</i>\n\n@Pixel_ai_bot`;

                    try {
                        console.log(`📨 [Job ${jobId}] Sending ${isVideo ? 'video' : 'image'} to ${options.telegramId}`);
                        if (isVideo) await bot.sendVideo(options.telegramId, result.imageUrl, { caption });
                        else await bot.sendPhoto(options.telegramId, result.imageUrl, { caption });
                    } catch (notifyErr) {
                        console.error(`⚠️ [Job ${jobId}] Notify failed:`, notifyErr.message);
                    }
                }

                // 4. Notify via WS (SYNC FALLBACK ONLY)
                if (userId) {
                    notifyUserViaWs(userId, { type: 'generation_complete', jobId, imageUrl: result.imageUrl });
                }

                return { success: true, imageUrl: result.imageUrl };

            } catch (error) {
                console.error(`❌ [Job ${jobId}] Failed:`, error.message);

                // Alert if it's a critical AI provider failure or token issue
                if (error.message.includes('API') || error.message.includes('401') || error.message.includes('balance')) {
                    sendAdminAlert(`AI Generation Failed (Job: ${jobId}):\nProvider: ${type}\nError: ${error.message}`, 'ERROR');
                }

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

                // Notify via WS on fail
                if (userId) {
                    notifyUserViaWs(userId, {
                        type: 'generation_failed',
                        jobId,
                        error: error.message
                    });
                }

                throw error; // Mark job as failed in PgBoss
            }
        });

        // --- PUBLISH TO CHANNEL WORKER ---
        await boss.work('publish-channel-post', async (job) => {
            const { text, mediaUrl, channelId, isVideo } = job.data;
            try {
                if (bot) {
                    console.log(`📣 [Publish Job] Sending to channel ${channelId}`);
                    if (isVideo) {
                        await bot.sendVideo(channelId, mediaUrl, { caption: text, parse_mode: 'Markdown' });
                    } else {
                        await bot.sendPhoto(channelId, mediaUrl, { caption: text, parse_mode: 'Markdown' });
                    }
                } else {
                    console.warn(`⚠️ [Publish Job] Telegram bot not initialized`);
                }
            } catch (err) {
                console.error(`❌ [Publish Job ${job.id}] Failed:`, err.message);
                throw err;
            }
        });

        // --- BROADCAST MESSAGE WORKER ---
        // Processes individual messages to avoid Telegram rate limits
        await boss.work('broadcast-message', async (job) => {
            const { userId, telegramId, text, mediaUrl, mediaType } = job.data;
            try {
                if (!bot) throw new Error('Telegram bot not initialized');

                // Sleep to respect Telegram limits (max 30 msgs/sec roughly)
                await new Promise(r => setTimeout(r, 50));

                if (mediaUrl) {
                    if (mediaType === 'video') {
                        await bot.sendVideo(telegramId, mediaUrl, { caption: text, parse_mode: 'HTML' });
                    } else {
                        await bot.sendPhoto(telegramId, mediaUrl, { caption: text, parse_mode: 'HTML' });
                    }
                } else {
                    await bot.sendMessage(telegramId, text, { parse_mode: 'HTML' });
                }
            } catch (err) {
                // If blocked by user (error code 403), we might want to flag them as inactive in future
                console.error(`❌ [Broadcast] to ${telegramId} failed:`, err.message);
                throw err;
            }
        });

        return boss;

    } catch (err) {
        console.error('❌ Failed to initialize Queue:', err);
        sendAdminAlert(`Failed to initialize Job Queue (PgBoss):\n${err.message}`, 'ERROR');
        return null;
    }
};

import crypto from 'crypto';

export const getQueue = () => boss;

export const addGenerationJob = async (data) => {
    if (!boss) {
        console.log('⚡ Fallback: Processing job synchronously since pg-boss is not initialized');
        const fallbackJobId = crypto.randomUUID();

        // Execute synchronously to ensure Vercel doesn't kill the background process
        try {
            const { prompt, type, options, cost, userId } = data;

            // --- INJECT WEBHOOK URL ---
            const serverUrl = process.env.SERVER_URL || 'https://api.bazzar-pixel.com';
            options.callBackUrl = `${serverUrl}/api/kie/webhook/${fallbackJobId}`;

            const result = await aiService.generateImage(prompt, type, options);

            if (!result.success) throw new Error(result.error || 'Generation failed');

            if (result.status === 'pending') {
                console.log(`⏳ [Fallback Job ${fallbackJobId}] Task offloaded to Kie.ai (Task ID: ${result.taskId}).`);
                if (userId) {
                    const isVideoResult = type.includes('video') || type.includes('kling');
                    await supabase.from('creations').insert({
                        id: fallbackJobId,
                        user_id: userId,
                        generation_id: result.taskId,
                        title: prompt ? prompt.slice(0, 50) : 'Web Generation',
                        description: prompt || 'Created via Web',
                        status: 'pending',
                        type: isVideoResult ? 'video' : 'image',
                        prompt: prompt,
                        model_id: type,
                        is_public: false,
                        tags: [type, 'web'],
                        metadata: {
                            cost: cost,
                            telegramId: options.telegramId
                        }
                    });
                }
                return { id: fallbackJobId, status: 'pending', taskId: result.taskId };
            }

            // Sync fallback logic below
            if (userId) {
                const isVideoResult = (type.includes('video') || (result.imageUrl && result.imageUrl.match(/\.(mp4|mov)$/i)));
                const { error: dbError } = await supabase.from('creations').insert({
                    user_id: userId,
                    title: prompt ? prompt.slice(0, 50) : 'Web Generation',
                    description: prompt || 'Created via Web',
                    image_url: result.imageUrl,
                    thumbnail_url: result.imageUrl,
                    status: 'completed',
                    type: isVideoResult ? 'video' : 'image',
                    prompt: prompt,
                    is_public: false,
                    tags: [type, 'web']
                });
                if (dbError) {
                    console.error('⚠️ [Fallback Job] DB Creations Insert failed:', dbError);
                } else {
                    console.log('✅ [Fallback Job] Saved to creations history successfully.');
                }
            }

            // --- 3. Notify User (Telegram) ---
            if (options?.telegramId) {
                const isVideoModel = type.includes('video') || type.includes('kling') || type.includes('sora') || type.includes('veo');
                const hasVideoExtension = result.imageUrl && result.imageUrl.match(/\.(mp4|mov|webm|avi)$/i);
                const isVideo = isVideoModel || hasVideoExtension;

                const caption = `✨ Ваша генерация готова!\n\n🎨 ${type}\n📝 "${prompt ? prompt.slice(0, 50) : '...'}"\n\n@Pixel_ai_bot`;

                try {
                    console.log(`📨 [Fallback Job] Sending ${isVideo ? 'video' : 'image'} to ${options.telegramId}`);
                    // Ensure bot dependency is passed or use external fetch function here if bot is not imported globals.
                    // But typically fallback has access to the token. We can fallback to raw telegram bot calls if `bot` is undefined.
                    const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
                    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/${isVideo ? 'sendVideo' : 'sendPhoto'}`;

                    const payload = {
                        chat_id: options.telegramId,
                        caption: caption,
                        parse_mode: 'Markdown'
                    };

                    if (isVideo) {
                        payload.video = result.imageUrl;
                    } else {
                        payload.photo = result.imageUrl;
                    }

                    const tgRes = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const tgResText = await tgRes.text();
                    console.log(`📡 [Fallback Job] Telegram API Response: ${tgRes.status} - ${tgResText}`);

                } catch (notifyErr) {
                    console.error(`⚠️ [Fallback Job] Notify failed:`, notifyErr.message);
                }
            }

            return { id: fallbackJobId, imageUrl: result.imageUrl };

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
