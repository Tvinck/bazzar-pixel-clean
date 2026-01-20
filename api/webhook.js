import TelegramBot from 'node-telegram-bot-api';

// Create bot without polling for serverless
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        console.log('❌ Not a POST request');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        console.log('📩 Webhook received:', JSON.stringify(update, null, 2));
        console.log('🔍 Update keys:', Object.keys(update));
        console.log('🔍 Has message?', !!update.message);

        // Handle message
        if (update.message) {
            console.log('✅ Message detected!');
            const chatId = update.message.chat.id;
            const text = update.message.text;
            console.log(`💬 Chat ID: ${chatId}, Text: "${text}"`);

            // Handle /start command
            if (text === '/start') {
                console.log('🚀 Processing /start command...');
                const keyboard = {
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Трендовые фото 🔥' }, { text: 'Сообщество 👥' }],
                            [{ text: 'Главное меню 🏠' }, { text: 'Баланс ⚡' }],
                            [{ text: 'Пригласи друга 🤝' }]
                        ],
                        resize_keyboard: true
                    }
                };

                console.log('📤 Sending welcome message...');
                await bot.sendMessage(chatId, welcomeMessage, {
                    parse_mode: 'Markdown',
                    ...keyboard
                });

                console.log(`✅ Sent welcome message to ${chatId}`);
            } else if (text === 'Трендовые фото 🔥') {
                console.log('🔥 Processing Trending Photos...');
                const webAppUrl = 'https://bazzar-pixel-clean-4zm4.vercel.app';
                const keyboard = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🔥 Трендовые фото', web_app: { url: webAppUrl } }]
                        ]
                    }
                };
                await bot.sendMessage(chatId, '🔥 *Тренды Pixel AI*\n\nСмотрите лучшие работы пользователей в нашем приложении! 👇', {
                    parse_mode: 'Markdown',
                    ...keyboard
                });
                console.log(`✅ Sent trending photos to ${chatId}`);
            } else if (text === 'Сообщество 👥') {
                console.log('👥 Processing Community...');
                await bot.sendMessage(chatId, '👥 *Сообщество*\n\nПрисоединяйся к нашему чату @pixel\\_communityy и делись своими работами!', {
                    parse_mode: 'Markdown'
                });
                console.log(`✅ Sent community to ${chatId}`);
            } else if (text === 'Главное меню 🏠') {
                console.log('🏠 Processing Main Menu...');
                // Same logic as /start
                const keyboard = {
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Трендовые фото 🔥' }, { text: 'Сообщество 👥' }],
                            [{ text: 'Главное меню 🏠' }, { text: 'Баланс ⚡' }],
                            [{ text: 'Пригласи друга 🤝' }]
                        ],
                        resize_keyboard: true
                    }
                };
                await bot.sendMessage(chatId, welcomeMessage, {
                    parse_mode: 'Markdown',
                    ...keyboard
                });
                console.log(`✅ Sent main menu to ${chatId}`);
            } else if (text === 'Баланс ⚡') {
                console.log('⚡ Processing Balance...');
                const webAppUrl = 'https://bazzar-pixel-clean-4zm4.vercel.app';
                const keyboard = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💰 Пополнить баланс', web_app: { url: webAppUrl } }]
                        ]
                    }
                };
                await bot.sendMessage(chatId, '⚡ *Баланс*\n\nТвой баланс: 0 токенов\n\nПополни баланс в приложении!', {
                    parse_mode: 'Markdown',
                    ...keyboard
                });
                console.log(`✅ Sent balance to ${chatId}`);
            } else if (text === 'Пригласи друга 🤝') {
                console.log('🤝 Processing Invite Friend...');
                const botUsername = 'NanoBananaBot'; // Replace with your actual bot username
                const referralLink = `https://t.me/${botUsername}?start=ref_${chatId}`;
                const message = `🤝 <b>Пригласи друга</b>\n\nТвоя реферальная ссылка:\n${referralLink}\n\nПолучай бонусы за каждого приглашенного друга!`;
                await bot.sendMessage(chatId, message, {
                    parse_mode: 'HTML'
                });
                console.log(`✅ Sent invite friend to ${chatId}`);
            } else if (text) {
                console.log('💬 Processing text message...');
                // Echo back for now
                await bot.sendMessage(chatId, `Получил: ${text}\n\nБот работает на Vercel! 🚀`);
                console.log(`✅ Sent echo to ${chatId}`);
            } else {
                console.log('⚠️ No text in message');
            }
        } else {
            console.log('⚠️ No message in update');
        }

        console.log('✅ Handler completed successfully');
        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
}
