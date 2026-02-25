import { PgBoss } from 'pg-boss';
import { supabase, sendTelegramMessage } from '../../shared/index.js';
import { aiService } from './ai-logic.js';

let boss;

export const initQueue = async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) return console.warn('⚠️ No DATABASE_URL, queue disabled');

    try {
        boss = new PgBoss(connectionString);
        await boss.start();
        console.log('✅ Generation Job Queue started');

        await boss.work('generate-image', { teamSize: 10 }, async (job) => {
            const { prompt, type, options, cost, userId } = job.data;
            const jobId = job.id;

            try {
                let result;
                if (type === 'upscale' || type === 'super_resolution') {
                    result = await aiService.upscaleImage(options.imageUrl, options.scale || 4);
                } else {
                    result = await aiService.generateImage(prompt, type, options);
                }

                if (!result.success) throw new Error(result.error || 'Task failed');

                // Save to DB
                if (userId) {
                    await supabase.from('creations').insert({
                        user_id: userId, generation_id: jobId,
                        title: prompt?.slice(0, 50) || 'AI Generation',
                        description: prompt || '', image_url: result.imageUrl,
                        thumbnail_url: result.imageUrl, type: type.includes('video') ? 'video' : 'image',
                        prompt, tags: [type]
                    });
                }

                // Notify Telegram
                if (options.telegramId) {
                    const isVideo = type.includes('video') || (result.imageUrl && result.imageUrl.match(/\.(mp4|webm)$/i));
                    const caption = `✨ Ваша генерация готова!\n\n🎨 ${type}\n📝 "${prompt?.slice(0, 50)}..."`;

                    await sendTelegramMessage(options.telegramId, caption, {
                        reply_markup: { inline_keyboard: [[{ text: '👁 Посмотреть', web_app: { url: `${process.env.WEB_APP_URL}/gallery` } }]] }
                    });
                }

                return { success: true, imageUrl: result.imageUrl };
            } catch (error) {
                console.error(`❌ Job ${jobId} failed:`, error.message);
                // Refund
                if (options.telegramId && cost > 0) {
                    await supabase.rpc('add_user_credits', {
                        p_telegram_id: options.telegramId, p_amount: cost,
                        p_reason: `Refund: Job ${jobId} Failed`, p_source: 'system'
                    });
                    await sendTelegramMessage(options.telegramId, `⚠️ <b>Ошибка генерации</b>\n\nМы вернули ${cost} кредитов.`);
                }
                throw error;
            }
        });

        return boss;
    } catch (e) { console.error('Queue init failed', e); }
};

export const addJob = (data) => boss?.send('generate-image', data, { retryLimit: 0, expireInMinutes: 15 });
