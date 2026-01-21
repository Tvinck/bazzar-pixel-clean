
// Track processed updates
const processedUpdates = new Set();
const MAX_CACHE_SIZE = 1000;

// Import bot token
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

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

            if (text === '/start' || text === 'Главное меню 🏠') {
                const webAppUrl = 'https://bazzar-pixel-clean-4zm4.vercel.app';
                await sendMessage(chatId,
                    '🎉 *Добро пожаловать в Bazzar Pixel!*\n\nГенерируйте крутой контент прямо здесь или в нашем приложении 🚀',
                    {
                        reply_markup: {
                            keyboard: [
                                [{ text: 'Трендовые фото 🔥' }, { text: 'Сообщество 👥' }],
                                [{ text: 'Главное меню 🏠' }, { text: 'Баланс ⚡' }]
                            ],
                            inline_keyboard: [
                                [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }]
                            ],
                            resize_keyboard: true
                        }
                    }
                );
            } else if (text === 'Баланс ⚡') {
                await sendMessage(chatId, '⚡ *Баланс*\n\nОткройте приложение для пополнения!');
            } else if (text === 'Сообщество 👥') {
                await sendMessage(chatId, '👥 *Сообщество*\n\nПрисоединяйтесь: @pixel_communityy');
            } else if (text === 'Трендовые фото 🔥') {
                await sendMessage(chatId, '🔥 *Тренды*\n\nСмотрите в приложении!');
            } else {
                await sendMessage(chatId, `Получил: "${text}"\n\nИспользуйте меню или откройте приложение! 🚀`);
            }
        }

        // Handle callback query
        if (update.callback_query) {
            const query = update.callback_query;
            const chatId = query.message.chat.id;

            // Answer callback immediately
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: query.id })
            });

            await sendMessage(chatId, 'Кнопка нажата! Используйте приложение для полного функционала.');
        }

        console.log('✅ Processed:', updateId);
        res.status(200).send('OK');
    } catch (e) {
        console.error('❌ Error:', e);
        res.status(200).send('OK');
    }
}
