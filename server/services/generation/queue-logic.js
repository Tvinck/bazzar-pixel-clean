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
                // Call the new unified task helper
                const result = await aiService.generateTask(userId, type, prompt, options);

                if (!result.success) throw new Error(result.error || 'Initial transition to Kie failed');

                // Note: The 'creations' record is now created inside generateTask.
                // The actual result will be handled by the Kie webhook.
                return { success: true, creationId: result.creationId };
            } catch (error) {
                console.error(`❌ Job ${jobId} failed:`, error.message);
                // Refund
                if (options.telegramId && cost > 0) {
                    await supabase.rpc('add_user_credits', {
                        p_telegram_id: options.telegramId.toString(),
                        p_amount: cost,
                        p_reason: `Refund: Job ${jobId} Creation Failed`,
                        p_source: 'system'
                    });
                    await sendTelegramMessage(options.telegramId, `⚠️ <b>Ошибка генерации</b>\n\nНе удалось запустить задачу. Мы вернули ${cost} кредитов.`);
                }
                throw error;
            }
        });

        return boss;
    } catch (e) { console.error('Queue init failed', e); }
};

export const addJob = (data) => boss?.send('generate-image', data, { retryLimit: 0, expireInMinutes: 15 });
