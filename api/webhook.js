
// Track processed updates
const processedUpdates = new Set();
const MAX_CACHE_SIZE = 1000;

// Import bot token
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Text constants (from bot.js)
const welcomeMessage = `
🎉 *Добро пожаловать в NanoBanana Bot!*

Здесь ты можешь сгенерировать трендовый контент прямо в боте или в нашем приложении 🚀

📸 *Фото → Фото:* Отправь фото и напиши, что поменять или добавить.

🎬 *Фото → Видео:* Отправь фото и напиши, что должно происходить в видео — я оживлю фото и превращу его в видео.

🖊 *Текст → Фото:* Опиши, что хочешь — и я сгенерю с нуля.

💡 *AI Power:* Мы используем умную ротацию ключей Google Gemini для максимальной стабильности!

Примеры в канале @pixel\\_imagess и в чате @pixel\\_communityy.

🔥 *Попробуй:* загрузи фото и напиши «добавь рядом динозавра» 🦖 — и мы сделаем магию!

Пользуясь ботом, вы подтверждаете свое согласие с [пользовательским соглашением](https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-PUBLICHNAYA-OFERTA-01-13-4), [политикой конфиденциальности](https://telegra.ph/POLITIKA-KONFIDENCIALNOSTI-01-13-41) и [согласием на обработку персональных данных](https://telegra.ph/Soglasie-na-obrabotku-personalnyh-dannyh-01-13-22).
`;

const communityMessage = `🚀 *Присоединяйтесь к нашему комьюнити!*

• Обсуждайте генерации
• Делитесь промптами
• Получайте помощь

👉 [Чат сообщества](https://t.me/pixel_communityy)
👉 [Канал с новостями](https://t.me/pixel_imagess)`;

const trendingMessage = `🔥 *Тренды Pixel AI*

Смотрите лучшие работы пользователей в нашем приложении! 👇`;

const balanceMessage = `🌟 *Ваш баланс: 10 кредитов.*

Стоимость генерации:
- Фото: 5 кредитов
- Видео: от 15 кредитов (зависит от модели)

Выберите способ пополнения.`;

// Helper to send messages
async function sendMessage(chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: options.parse_mode || 'Markdown',
            disable_web_page_preview: options.disable_web_page_preview || false,
            ...options
        })
    });
    return response.json();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('OK');
    }

    const update = req.body;
    const updateId = update.update_id;

    // Check duplicates
    if (processedUpdates.has(updateId)) {
        console.log('⚠️ Duplicate:', updateId);
        return res.status(200).send('OK');
    }

    processedUpdates.add(updateId);
    if (processedUpdates.size > MAX_CACHE_SIZE) {
        processedUpdates.delete(processedUpdates.values().next().value);
    }

    try {
        console.log('📩 Processing:', updateId);

        // Handle message
        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = msg.text || msg.caption;

            console.log('💬 Message:', text);

            const webAppUrl = 'https://bazzar-pixel-clean-4zm4.vercel.app';

            if (text === '/start' || text === 'Главное меню 🏠') {
                await sendMessage(chatId, welcomeMessage, {
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Трендовые фото 🔥' }, { text: 'Сообщество 👥' }],
                            [{ text: 'Главное меню 🏠' }, { text: 'Баланс ⚡' }],
                            [{ text: 'Пригласи друга 🤝' }]
                        ],
                        inline_keyboard: [
                            [{ text: 'Сгенерировать 🎨', callback_data: 'generate_art' }],
                            [{ text: 'Трендовые фото 🔥', web_app: { url: webAppUrl } }]
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (text === 'Баланс ⚡') {
                // Fetch real balance using the SAME API as Mini App
                const telegramId = msg.from.id;
                let balance = 0;

                try {
                    const response = await fetch(`https://bazzar-pixel-clean-4zm4.vercel.app/api/user/stats?telegram_id=${telegramId}`);
                    if (response.ok) {
                        const stats = await response.json();
                        balance = stats.current_balance || 0;
                    }
                } catch (err) {
                    console.error('Balance fetch error:', err);
                }

                const dynamicBalanceMessage = `🌟 *Ваш баланс: ${balance} кредитов.*

Стоимость генерации:
- Фото: 5 кредитов
- Видео: от 15 кредитов (зависит от модели)

Выберите способ пополнения.`;

                await sendMessage(chatId, dynamicBalanceMessage, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Пополнить баланс 💰', callback_data: 'pay_sbp' }]
                        ]
                    }
                });
            } else if (text === 'Сообщество 👥') {
                await sendMessage(chatId, communityMessage);
            } else if (text === 'Трендовые фото 🔥') {
                await sendMessage(chatId, trendingMessage, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Открыть приложение 📱', web_app: { url: webAppUrl } }]
                        ]
                    }
                });
            } else if (text === 'Пригласи друга 🤝') {
                const userId = msg.from.id;
                const inviteMessage = `🤝 *Партнёрская программа*

Приглашайте друзей и получайте 10% от всех их платежей!

🔗 *Ваша реферальная ссылка:*
https://t.me/Pixel_ai_bot?start=r-${userId}

📈 Приглашено пользователей: 0
💰 Заработано кредитов: 0

Просто поделитесь ссылкой с друзьями. Когда они зарегистрируются и пополнят баланс, вы автоматически получите 10% от суммы их пополнения на свой счёт.`;
                await sendMessage(chatId, inviteMessage);
            } else {
                await sendMessage(chatId, `Получил: "${text}"\n\nИспользуйте меню или откройте приложение! 🚀`);
            }
        }

        // Handle callback query
        if (update.callback_query) {
            const query = update.callback_query;
            const chatId = query.message.chat.id;
            const data = query.data;

            // Answer callback immediately
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: query.id })
            });

            const webAppUrl = 'https://bazzar-pixel-clean-4zm4.vercel.app';

            if (data === 'generate_art') {
                await sendMessage(chatId, '🎨 *Режим генерации*\n\n1. Отправьте фото и напишите, что изменить\n2. Или просто напишите промпт (например "Кот-космонавт")\n\nЯ использую лучшие нейросети для создания магии! ✨');
            } else if (data === 'pay_sbp') {
                await sendMessage(chatId, '💳 *Пополнение баланса*\n\nДля пополнения баланса откройте наше приложение 📱', {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Открыть Bazzar Pixel', web_app: { url: webAppUrl } }]]
                    }
                });
            } else {
                await sendMessage(chatId, 'Кнопка нажата! Используйте приложение для полного функционала.');
            }
        }

        console.log('✅ Processed:', updateId);
        res.status(200).send('OK');
    } catch (e) {
        console.error('❌ Error:', e);
        res.status(200).send('OK');
    }
}
