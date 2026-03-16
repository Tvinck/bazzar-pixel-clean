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

    // Handle Telegram Stars payment pre-checkout
    bot.on('pre_checkout_query', async (query) => {
        try {
            // we can parse payload if needed
            // const payload = JSON.parse(query.invoice_payload);
            await bot.answerPreCheckoutQuery(query.id, true);
        } catch (e) {
            console.error('PreCheckout Error:', e);
            bot.answerPreCheckoutQuery(query.id, false, { error_message: 'Ошибка при проверке деталей платежа.' });
        }
    });

    // Handle successful Telegram Stars payment
    bot.on('message', async (msg) => {
        if (msg.successful_payment) {
            try {
                const paymentInfo = msg.successful_payment;
                const payloadStr = paymentInfo.invoice_payload;

                if (!payloadStr) return;

                const payload = JSON.parse(payloadStr);
                const { telegramId, credits, promoCode, orderId } = payload;

                if (telegramId && credits) {
                    await supabase.rpc('add_user_credits', {
                        p_telegram_id: telegramId,
                        p_amount: credits,
                        p_reason: 'Telegram Stars Purchase',
                        p_source: 'stars_payment'
                    });

                    // Log successful transaction
                    const userUUID = await getUserUUID(telegramId);
                    if (userUUID) {
                        await supabase.from('transactions').insert({
                            user_id: userUUID,
                            amount: paymentInfo.total_amount, // XTR amount 
                            type: 'stars_purchase',
                            description: `Оплата Stars: ${paymentInfo.total_amount} XTR за ${credits} ⚡`,
                            metadata: {
                                ProviderPaymentChargeId: paymentInfo.provider_payment_charge_id,
                                TelegramPaymentChargeId: paymentInfo.telegram_payment_charge_id,
                                OrderId: orderId,
                                PromoCode: promoCode
                            },
                            created_at: new Date().toISOString()
                        });

                        // Increment used count for promo code
                        if (promoCode) {
                            await supabase.rpc('increment_promo_use', {
                                p_code: promoCode,
                                p_user_id: userUUID
                            });
                        }
                    }

                    bot.sendMessage(msg.chat.id, `🎉 *Оплата успешно завершена!*\n\nНа ваш баланс зачислено *${credits}* ⚡ зарядов. Приятного использования!`, { parse_mode: 'Markdown' });
                }
            } catch (e) {
                console.error('Successful Stars Payment Error:', e);
            }
        }
    });
}
