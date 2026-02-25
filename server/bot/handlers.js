import { botAnalytics, supabase } from '../lib/supabase.js';
import { getUserUUID, sendWelcome } from '../helpers/utils.js';

export function setupBotHandlers(bot) {
    if (!bot) {
        console.error('❌ setupBotHandlers called with undefined bot!');
        return;
    }
    const webAppUrl = process.env.WEB_APP_URL || 'https://bazzar-pixel.vercel.app';

    // /start command
    bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
        try {
            await bot.setChatMenuButton({
                chat_id: msg.chat.id,
                menu_button: {
                    type: 'web_app',
                    text: 'Open Pixel',
                    web_app: { url: webAppUrl }
                }
            });
        } catch (e) { console.error('Menu Button Error:', e.message); }

        await botAnalytics.upsertUser(msg.from);
        await botAnalytics.trackCommand(msg.from.id, 'start');

        const startParam = match[1];
        if (startParam) {
            if (startParam.startsWith('connect')) {
                const connectedUserId = startParam.replace('connect_', '');
                if (connectedUserId && connectedUserId !== 'connect') {
                    try {
                        const { error } = await supabase.from('bot_users').upsert({
                            user_id: connectedUserId,
                            telegram_chat_id: msg.chat.id,
                            username: msg.from.username
                        });
                        if (!error) {
                            bot.sendMessage(msg.chat.id, '✅ *Уведомления подключены!*\nТеперь вы будете получать информацию о новых заказах сюда.', { parse_mode: 'Markdown' });
                        }
                    } catch (e) { console.error('Connect Exception:', e); }
                }
            } else if (startParam.startsWith('r-')) {
                const referrerTgId = parseInt(startParam.replace('r-', ''), 10);
                if (referrerTgId && !isNaN(referrerTgId) && referrerTgId !== msg.from.id) {
                    try {
                        const userUUID = await getUserUUID(msg.from.id);
                        if (userUUID) {
                            const { data: refResult } = await supabase.rpc('register_referral', {
                                p_new_user_id: userUUID,
                                p_referrer_telegram_id: referrerTgId
                            });
                            if (refResult?.success) {
                                bot.sendMessage(referrerTgId, `🎉 *Новый реферал!*\nБаланс пополнен на *${refResult.bonus}* зарядов!`, { parse_mode: 'Markdown' }).catch(() => { });
                            }
                        }
                    } catch (e) { console.error('Referral Error:', e); }
                }
            }
        }
        sendWelcome(bot, msg.chat.id);
    });

    // /help command
    bot.onText(/\/help/, async (msg) => {
        await botAnalytics.upsertUser(msg.from);
        bot.sendMessage(msg.chat.id, `❓ *Помощь*`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎨 Как генерировать', callback_data: 'faq_generate' }, { text: '💰 Цены', callback_data: 'faq_pricing' }],
                    [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
                ]
            }
        });
    });

    // Callback Query
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;
        try {
            await bot.answerCallbackQuery(query.id);
            if (data === 'generate_art') {
                bot.sendMessage(chatId, '🎨 *Режим генерации*\nОтправьте фото или текст.', { parse_mode: 'Markdown' });
            } else if (data === 'faq_generate') {
                bot.sendMessage(chatId, '🎨 *Как генерировать?*\n\n1. Нажмите "Сгенерировать" или отправьте /start.\n2. Выберите тип: Фото или Видео.\n3. Следуйте инструкциям бота!', { parse_mode: 'Markdown' });
            } else if (data === 'faq_pricing') {
                bot.sendMessage(chatId, '💰 *Цены*\n\n1 звезда = 1 ⚡ заряд.\n\nФото: 5 ⚡\nВидео: от 15 ⚡\n\nПополнить баланс можно в главном меню.', { parse_mode: 'Markdown' });
            } else if (data === 'back_to_menu') {
                sendWelcome(bot, chatId);
            }
        } catch (e) { console.error('Callback Error:', e); }
    });
}
