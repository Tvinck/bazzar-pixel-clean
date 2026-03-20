import express from 'express';
import { supabase, botAnalytics } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';
import { getUserUUID, getUserBalance } from '../helpers/utils.js';

const router = express.Router();

// --- In-memory retention state ---
const activeRetentions = new Map();

/**
 * Marketing track endpoint. Fire-and-forget design.
 * Handles session_start (tourist retention) and generation (upsell) events.
 */
export function setupMarketingRoutes(bot) {
    router.post('/track', authTG, async (req, res) => {
        try {
            const { event } = req.body;
            const telegramId = req.tgUser.id;

            // Always return success immediately (Fire & Forget)
            res.json({ ok: true });

            if (!telegramId) return;
        const uid = telegramId.toString();

        // 1. Session Start (Tourist Logic)
        if (event === 'session_start') {
            if (activeRetentions.has(uid)) clearTimeout(activeRetentions.get(uid));

            const timeout = setTimeout(async () => {
                activeRetentions.delete(uid);
                try {
                    const userUUID = await getUserUUID(telegramId);
                    if (!userUUID) return;

                    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
                    const { count } = await supabase
                        .from('creations')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', userUUID)
                        .gte('created_at', tenMinsAgo);

                    if (count === 0) {
                        console.log(`🎁 Sending Retention Gift to ${telegramId}`);
                        const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', userUUID).single();
                        const newBalance = (stats?.current_balance || 0) + 10;
                        await supabase.from('user_stats').update({ current_balance: newBalance }).eq('user_id', userUUID);

                        if (bot) {
                            await bot.sendMessage(telegramId, `🎁 *Подарок ждет вас!*\n\nМы заметили, что вы зашли, но так ничего и не создали. Держите *10 бесплатных зарядов* за наш счет!\n\n👇 Нажмите кнопку ниже, чтобы попробовать.`, {
                                parse_mode: 'Markdown',
                                reply_markup: { inline_keyboard: [[{ text: '🎨 Создать (Бесплатно)', web_app: { url: process.env.WEB_APP_URL || 'https://bazzar-pixel.vercel.app' } }]] }
                            });
                        }
                    }
                } catch (e) {
                    console.error('Retention check failed:', e);
                }
            }, 2 * 60 * 1000);

            activeRetentions.set(uid, timeout);
        }

        // 2. Active User (Upsell Logic)
        if (event === 'generation') {
            if (activeRetentions.has(uid)) {
                clearTimeout(activeRetentions.get(uid));
                activeRetentions.delete(uid);
            }

            const upsellKey = `upsell_${uid}`;
            if (!activeRetentions.has(upsellKey)) {
                const timeout = setTimeout(async () => {
                    activeRetentions.delete(upsellKey);
                    try {
                        const balance = await getUserBalance(telegramId);
                        if (balance < 100) {
                            if (bot) {
                                const userUUID = await getUserUUID(telegramId);
                                let personalizedMsg = `⚡ *Скидка сгорает!* ⏳\n\nВы активно творили, но заряды кончаются.\nТолько сейчас: тариф *Start* со скидкой 50%!\n\n👇 Жмите, пока работает`;

                                if (userUUID) {
                                    const { count } = await supabase.from('creations').select('*', { count: 'exact', head: true }).eq('user_id', userUUID);
                                    if (count && count > 3) {
                                        personalizedMsg = `🎨 *Вы создали уже ${count} работ!* 🔥\n\nВаш талант заслуживает большего! Пополните баланс со скидкой *50%* и продолжайте творить без ограничений.\n\n💰 Тариф *Start* ждёт вас!`;
                                    }
                                }

                                await bot.sendMessage(telegramId, personalizedMsg, {
                                    parse_mode: 'Markdown',
                                    reply_markup: { inline_keyboard: [[{ text: '💎 Забрать скидку', web_app: { url: process.env.WEB_APP_URL || 'https://bazzar-pixel.vercel.app' } }]] }
                                });
                            }
                        }
                    } catch (e) { }
                }, 5 * 60 * 1000);
                activeRetentions.set(upsellKey, timeout);
            }
            }
        } catch (error) {
            console.error('Track error:', error);
            if (!res.headersSent) {
                res.status(200).json({ ok: true });
            }
        }
    });

    return router;
}

export default router;
