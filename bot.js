import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { aiService } from './src/ai-service.js';
import { generateBlurhash } from './src/utils/blurhash-server.js';
import { botAnalytics, supabase } from './bot-supabase.js';
import multer from 'multer';
// import fetch from 'node-fetch';
import crypto from 'crypto';
import sharp from 'sharp'; // For mask generation
import { setupRoutes } from './src/server/routes.js';
import { initQueue } from './src/server/queue.js';
import { MODEL_CATALOG } from './src/config/models.js';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import os from 'os';

// Config FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

dotenv.config();

// Helper to generate white mask
async function getWhiteMaskUrl(width, height) {
    try {
        // Ensure proper integers
        const w = parseInt(width) || 1024;
        const h = parseInt(height) || 1024;
        const filename = `masks/white_${w}x${h}.png`;

        // Generate pure white image
        const buffer = await sharp({
            create: {
                width: w,
                height: h,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        })
            .grayscale()
            .threshold(128) // Ensure strictly black/white
            .png({ bitdepth: 1 }) // 1-bit depth
            .toBuffer();

        const { error } = await supabase.storage.from('uploads').upload(filename, buffer, {
            contentType: 'image/png',
            upsert: true
        });

        if (error) console.warn('Mask Upload Warning:', error.message);

        const { data } = supabase.storage.from('uploads').getPublicUrl(filename);
        return data.publicUrl;
    } catch (e) {
        console.error('Mask Gen Error:', e);
        return `https://singlecolorimage.com/get/ffffff/${width}x${height}`; // Fallback
    }
}

// Helper to upscale video if needed (Kling requires >= 720p)
async function ensureVideoResolution(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(filePath).ffprobe((err, metadata) => {
            if (err) {
                console.warn('ffprobe error:', err);
                return resolve(filePath); // Fallback to original
            }

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            if (!videoStream) return resolve(filePath);

            const { width, height } = videoStream;

            // Always normalize and upscale to ensure MP4/H.264/720p compliance
            console.log(`Processing video ${path.basename(filePath)} (${width}x${height})...`);

            // Output to temp (Force .mp4)
            const tempOut = path.join(os.tmpdir(), `upscaled_${Date.now()}_${path.parse(filePath).name}.mp4`);

            // Scale logic: Shortest side = 720. 
            // Formula: scale=iw*max(720/iw\,720/ih):ih*max(720/iw\,720/ih)
            // But ffmpeg filter string needs escaping.
            // Simplified: 'scale=-2:720' sets height=720. If width becomes < 720, that's bad.
            // We want MIN(w,h) >= 720.

            ffmpeg(filePath)
                .outputOptions([
                    '-vf', 'scale=720:720:force_original_aspect_ratio=increase,pad=ceil(iw/2)*2:ceil(ih/2)*2', // Safe upscaling + even dims
                    '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', // Critical for web/AI compatibility
                    '-crf', '28',       // Higher compression (smaller size)
                    '-preset', 'veryfast',
                    '-movflags', '+faststart', // Web optimization
                    '-f', 'mp4' // Force container
                ])
                .save(tempOut)
                .on('end', () => {
                    console.log('✅ Upscale complete:', tempOut);
                    resolve(tempOut);
                })
                .on('error', (e) => {
                    console.error('Upscale failed:', e);
                    resolve(filePath); // Fallback
                });
        });
    });
}




// Fix __dirname for ES Modules


// Configure Multer
console.log('🚀 Server initializing routes...');
const PORT = 3000;
const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

app.get('/api/admin/balance', async (req, res) => {
    try {
        const response = await fetch('https://api.defapi.org/api/balance', {
            headers: { 'Authorization': `Bearer ${process.env.DEFAPI_KEY}` }
        });

        // If 404, maybe endpoint is wrong, return null balance
        if (!response.ok) {
            console.error('DefAPI Balance Error:', response.status);
            return res.json({ data: { balance: null } });
        }

        const data = await response.json();
        console.log('💰 DefAPI response:', data);
        res.json(data);
    } catch (error) {
        console.error('Balance Check Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Proxy User Stats (Bypass RLS)
app.get('/api/user/stats', async (req, res) => {
    try {
        const { telegram_id } = req.query;
        if (!telegram_id) return res.status(400).json({ error: 'Missing telegram_id' });

        // Get User UUID
        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegram_id).single();
        if (!user) return res.json(null);

        // Get Stats (Service Key)
        const stats = await botAnalytics.getUserStats(user.id);
        res.json(stats);
    } catch (e) {
        console.error('Stats Proxy Error:', e);
        res.status(500).json({ error: e.message });
    }
});


// --- Gallery Proxy (Bypass RLS) ---
app.post('/api/gallery/like', async (req, res) => {
    try {
        const { userId, creationId } = req.body;
        const { data, error } = await supabase.from('creation_likes').insert({ user_id: userId, creation_id: creationId }).select().single();
        if (error) throw error;
        res.json({ success: true, data });
    } catch (e) {
        if (e.code === '23505') return res.json({ success: false, error: 'Already liked' }); // Duplicate
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/gallery/unlike', async (req, res) => {
    try {
        const { userId, creationId } = req.body;
        const { error } = await supabase.from('creation_likes').delete().eq('user_id', userId).eq('creation_id', creationId);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/gallery/liked', async (req, res) => {
    try {
        const { userId } = req.query;
        const { data, error } = await supabase.from('creation_likes').select('creation_id').eq('user_id', userId);
        if (error) throw error;
        res.json(data ? data.map(d => d.creation_id) : []);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/gallery/is_liked', async (req, res) => {
    try {
        const { userId, creationId } = req.query;
        const { data } = await supabase.from('creation_likes').select('id').eq('user_id', userId).eq('creation_id', creationId).maybeSingle();
        res.json({ liked: !!data });
    } catch (e) {
        res.json({ liked: false });
    }
});
// ----------------------------------

// Serve Static Frontend
app.use(express.static(path.join(__dirname, 'dist')));

const communityMessage = `🚀 *Присоединяйтесь к нашему комьюнити!*\n\n• Обсуждайте генерации\n• Делитесь промптами\n• Получайте помощь\n\n👉 [Чат сообщества](https://t.me/pixel_communityy)\n👉 [Канал с новостями](https://t.me/pixel_imagess)`;

const trendingMessage = `🔥 *Тренды Pixel AI*\n\nСмотрите лучшие работы пользователей в нашем приложении! 👇`;

const isPolling = process.env.POLLING === 'true';
console.log('🤖 Bot Init. Polling:', isPolling);

// Ensure Storage Buckets are Public (Global Visibility Fix)
export async function ensureBucketsPublic() {
    try {
        const bucketsToFix = ['uploads', 'source-files'];
        for (const bucketId of bucketsToFix) {
            console.log(`📡 Checking bucket visibility: ${bucketId}...`);
            await supabase.storage.updateBucket(bucketId, { public: true });
        }
        console.log('✅ Storage buckets visibility verified.');
    } catch (err) {
        console.error('⚠️ Failed to verify bucket visibility:', err.message);
    }
}

// Global initialization
// --- SYSTEM STATE ---
let bot;
let queue;
const userDrafts = new Map();
const lastGenerations = new Map();

// --- HELPERS ---
async function getUserBalance(telegramId) {
    try {
        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
        if (!user) return 0;
        const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', user.id).single();
        return stats?.current_balance || 0;
    } catch (e) { return 0; }
}

async function getUserUUID(telegramId) {
    const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
    return user?.id || null;
}

async function uploadTelegramFileToSupabase(fileLink) {
    try {
        const response = await fetch(fileLink);
        const buffer = Buffer.from(await response.arrayBuffer());
        const filename = `user_upload_${Date.now()}.jpg`;
        const { error } = await supabase.storage.from('uploads').upload(filename, buffer, { contentType: 'image/jpeg' });
        if (error) throw error;
        const { data } = supabase.storage.from('uploads').getPublicUrl(filename);
        return data.publicUrl;
    } catch (e) {
        console.error('Upload Error:', e);
        return null;
    }
}

// --- SYSTEM INITIALIZATION ---
console.log('📡 Initializing System...');
try {
    await ensureBucketsPublic();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is missing in environment variables');
    }

    bot = new TelegramBot(botToken, { polling: isPolling });
    console.log('🤖 Telegram Bot instance created.');

    queue = await initQueue(bot);
    console.log('📦 Job Queue initialized.');

    setupRoutes(app, bot, queue);
    console.log('🛣️ Routes attached.');

    setupBotHandlers(bot);
    console.log('🎮 Bot Handlers registered.');

    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`🚀 Bot Server running on port ${PORT}`));
    }
} catch (err) {
    console.error('💥 SYSTEM INIT FAILED:', err);
}

// Handler functions below...

function setupBotHandlers(b) {
    if (!b) {
        console.error('❌ setupBotHandlers called with undefined bot!');
        return;
    }
    const webAppUrl = process.env.WEB_APP_URL || 'https://bazzar-pixel.vercel.app';

    // /start command
    b.onText(/\/start(?: (.+))?/, async (msg, match) => {
        try {
            await b.setChatMenuButton({
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
                            b.sendMessage(msg.chat.id, '✅ *Уведомления подключены!*\nТеперь вы будете получать информацию о новых заказах сюда.', { parse_mode: 'Markdown' });
                        }
                    } catch (e) {
                        console.error('Connect Exception:', e);
                    }
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
                                b.sendMessage(referrerTgId, `🎉 *Новый реферал!*\nБаланс пополнен на *${refResult.bonus}* кредитов!`, { parse_mode: 'Markdown' }).catch(() => { });
                            }
                        }
                    } catch (e) { console.error('Referral Error:', e); }
                }
            }
        }
        sendWelcome(msg.chat.id);
    });

    // /help command
    b.onText(/\/help/, async (msg) => {
        await botAnalytics.upsertUser(msg.from);
        b.sendMessage(msg.chat.id, helpMessage, {
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
    b.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;
        try {
            await b.answerCallbackQuery(query.id);
            if (data === 'generate_art') {
                b.sendMessage(chatId, '🎨 *Режим генерации*\nОтправьте фото или текст.', { parse_mode: 'Markdown' });
            } else if (data === 'back_to_menu') {
                sendWelcome(chatId);
            } else if (data === 'goto_gen') {
                const draft = userDrafts.get(chatId);
                if (!draft) return b.sendMessage(chatId, '⚠️ Сначала отправьте фото или текст.');
                b.sendMessage(chatId, '📂 *Выберите тип контента:*', {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🖼 Фото', callback_data: 'set_type_image' }, { text: '🎥 Видео', callback_data: 'set_type_video' }]
                        ]
                    }
                });
            } else if (data.startsWith('set_type_')) {
                const type = data.replace('set_type_', '');
                const draft = userDrafts.get(chatId) || { images: [], prompt: 'Art' };
                draft.type = type;
                userDrafts.set(chatId, draft);
                const models = Object.entries(MODEL_CATALOG).filter(([_, m]) => m.type === type).map(([id, m]) => ({ text: `${m.name} (${m.cost}Kr)`, callback_data: `set_model_${id}` }));
                const keyboard = [];
                for (let i = 0; i < models.length; i += 2) keyboard.push(models.slice(i, i + 2));
                keyboard.push([{ text: '🔙 Назад', callback_data: 'goto_gen' }]);
                b.editMessageText(`📂 *Выберите модель:*`, { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } });
            } else if (data.startsWith('set_model_')) {
                const modelId = data.replace('set_model_', '');
                const draft = userDrafts.get(chatId);
                if (!draft) return b.sendMessage(chatId, '⚠️ Сессия истекла.');
                b.sendMessage(chatId, `🎨 *Генерация...*`);
                const result = await aiService.generateImage(draft.prompt || 'Art', modelId, { telegramId: chatId, source_files: draft.images });
                if (result.success) {
                    if (result.imageUrl.match(/\.(mp4|mov|webm)$/i)) await b.sendVideo(chatId, result.imageUrl);
                    else await b.sendPhoto(chatId, result.imageUrl);
                } else {
                    b.sendMessage(chatId, `❌ Ошибка: ${result.error || 'Server Error'}`);
                }
            }
        } catch (e) { console.error('Callback Error:', e); }
    });

    // Message
    b.on('message', async (msg) => {
        const text = msg.text || msg.caption;
        if (!text || text.startsWith('/')) return;
        if (text === 'Баланс ⚡') {
            const balance = await getUserBalance(msg.from.id);
            b.sendMessage(msg.chat.id, `🌟 *Баланс: ${balance} кредитов.*`, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [[{ text: 'Пополнить ⚡', callback_data: 'pay_sbp' }]] }
            });
        } else if (text === 'Главное меню 🏠') {
            sendWelcome(msg.chat.id);
        } else if (text === 'Пригласи друга 🤝') {
            b.sendMessage(msg.chat.id, inviteMessage(msg.from.id), { parse_mode: 'Markdown' });
        } else {
            // Draft logic
            let draft = userDrafts.get(msg.chat.id) || { images: [], prompt: 'Art' };
            draft.prompt = text;
            userDrafts.set(msg.chat.id, draft);
            b.sendMessage(msg.chat.id, `Запомнил: "${text}"`, {
                reply_markup: { inline_keyboard: [[{ text: '🚀 Начать генерацию', callback_data: 'goto_gen' }]] }
            });
        }
    });

    // Photo
    b.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        try {
            const fileLink = await b.getFileLink(fileId);
            const supabaseUrl = await uploadTelegramFileToSupabase(fileLink);
            let draft = userDrafts.get(chatId) || { images: [], prompt: 'image based on attachment' };
            draft.images.push(supabaseUrl || fileLink);
            userDrafts.set(chatId, draft);
            b.sendMessage(chatId, '📸 Фото добавлено!', {
                reply_markup: { inline_keyboard: [[{ text: '🚀 Генерировать', callback_data: 'goto_gen' }]] }
            });
        } catch (e) { b.sendMessage(chatId, 'Ошибка при обработке фото.'); }
    });
}

// --- API ENDPOINTS ---

// Config Endpoint (Single Source of Truth)
app.get('/api/config', (req, res) => {
    res.json({
        models: MODEL_CATALOG,
        pricing: Object.fromEntries(
            Object.entries(MODEL_CATALOG).map(([k, v]) => [k, v.cost])
        )
    });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    res.json({
        status: 'ok',
        env: isProduction ? 'production' : 'development',
        hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
        timestamp: new Date().toISOString()
    });
});

// Set Webhook (for Vercel deployment)
app.get('/api/set-webhook', async (req, res) => {
    try {
        const webhookUrl = `https://${req.headers.host}/api/webhook`;
        const result = await bot.setWebHook(webhookUrl);
        res.json({
            success: true,
            webhookUrl,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get Webhook Info
app.get('/api/webhook-info', async (req, res) => {
    try {
        const info = await bot.getWebHookInfo();
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook Handler (for production)
app.post('/api/webhook', async (req, res) => {
    try {
        console.log('📩 Webhook received:', JSON.stringify(req.body, null, 2));
        await bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(500);
    }
});

// Helper: Verify Telegram Web App Data
app.post('/api/admin/notify', async (req, res) => {
    try {
        const { userId, message, action } = req.body;
        if (!userId || !message) return res.status(400).json({ error: 'Missing defined fields' });

        await bot.sendMessage(userId, message, { parse_mode: 'Markdown' });

        console.log(`[Admin Notify] Sent message to ${userId}`);
        res.json({ success: true });
    } catch (err) {
        console.error('[Admin Notify Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint for result sending (existing)
app.post('/api/jobs/create', async (req, res) => {
    try {
        const { userId, prompt, modelId, configuration, sourceFiles, jobType = 'image' } = req.body;

        if (!userId || !prompt) {
            return res.status(400).json({ error: 'userId and prompt are required' });
        }

        // (Balance check moved to after file processing to avoid charging on upload failure)

        // Process source files: Upload Base64 to Storage to avoid huge DB payloads
        const processedFiles = [];
        if (sourceFiles && Array.isArray(sourceFiles)) {
            for (const fileItem of sourceFiles) {
                if (typeof fileItem === 'string' && fileItem.startsWith('data:')) {
                    try {
                        // Extract base64
                        const matches = fileItem.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (!matches || matches.length !== 3) {
                            processedFiles.push(fileItem);
                            continue;
                        }

                        const type = matches[1];
                        const buffer = Buffer.from(matches[2], 'base64');

                        let processedBuffer = buffer;
                        let processedMime = type;
                        let ext = type.split('/')[1] || 'png';

                        // Actual bits conversion for Kie.ai compatibility
                        if (type.startsWith('image/')) {
                            try {
                                console.log(`✨ Converting ${type} to JPEG bits for Kie...`);
                                // Ensure sharp is used to normalize to safe JPEG
                                processedBuffer = await sharp(buffer)
                                    .jpeg({ quality: 90, mozjpeg: true })
                                    .toBuffer();
                                processedMime = 'image/jpeg';
                                ext = 'jpg';
                            } catch (sharpErr) {
                                console.error('Sharp conversion failed, using original:', sharpErr);
                            }
                        }

                        const filename = `uploads/gen_src_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

                        const { error: uploadError } = await supabase.storage
                            .from('uploads')
                            .upload(filename, processedBuffer, { contentType: processedMime, upsert: false });

                        if (uploadError) {
                            console.error('Upload Error:', uploadError);
                            // Do NOT fallback to Base64, it crashes DB insert. Fail hard.
                            throw new Error(`Upload to storage failed: ${uploadError.message}`);
                        } else {
                            const { data: publicData } = supabase.storage
                                .from('uploads')
                                .getPublicUrl(filename);

                            console.log(`✅ Uploaded source file: ${publicData.publicUrl}`);
                            processedFiles.push(publicData.publicUrl);
                        }
                    } catch (err) {
                        console.error('File Processing Error (Upload skipped):', err);
                        // Do NOT push the original fileItem if it was a data URI,
                        // as Kie.ai will fail on the base64 string.
                    }
                } else {
                    processedFiles.push(fileItem);
                }
            }
        }

        // Process configuration.video_files (Local paths -> Supabase URL)
        // Fix for KIE 'Does not match format uri' error
        if (configuration && configuration.video_files && Array.isArray(configuration.video_files)) {
            const newVideoFiles = [];
            for (const vid of configuration.video_files) {
                if (typeof vid === 'string' && vid.startsWith('/')) {
                    // Upload local file to Supabase
                    try {
                        const localPath = path.join(__dirname, 'public', vid); // Assumes 'public' dir
                        if (fs.existsSync(localPath)) {
                            // 1. Ensure Resolution
                            let fileToUpload = localPath;
                            try {
                                fileToUpload = await ensureVideoResolution(localPath);
                            } catch (vidErr) {
                                console.error('Resolution check failed:', vidErr);
                            }

                            const buffer = fs.readFileSync(fileToUpload);
                            // Force filename to .mp4 and MIME to video/mp4
                            const filename = `uploads/tpl_vid_${Date.now()}_${path.parse(vid).name}.mp4`;
                            const mime = 'video/mp4';

                            const { error: upErr } = await supabase.storage
                                .from('uploads')
                                .upload(filename, buffer, { contentType: mime, upsert: false });

                            if (!upErr) {
                                const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(filename);
                                newVideoFiles.push(pubData.publicUrl);
                                console.log(`✅ Uploaded template video: ${pubData.publicUrl}`);
                            } else {
                                console.error('Template Video Upload Error:', upErr);
                                newVideoFiles.push(vid);
                            }
                        } else {
                            // File not found locally
                            console.warn('Template video not found locally:', localPath);
                        }
                    } catch (e) {
                        console.error('Video process error:', e);
                        newVideoFiles.push(vid);
                    }
                } else {
                    newVideoFiles.push(vid);
                }
            }
            // CRITICAL: Update configuration with the new Supabase URLs
            if (newVideoFiles.length > 0) {
                configuration.video_files = newVideoFiles;
            }
        }

        // 0. Calculate Cost & Check Balance (Server-side Enforcement) BEFORE Insert
        const modelInfo = MODEL_CATALOG[modelId];
        const cost = modelInfo ? modelInfo.cost : 5; // Default cost

        // Fetch User Balance
        let { data: userStats, error: statsError } = await supabase
            .from('user_stats')
            .select('current_balance')
            .eq('user_id', userId)
            .single();

        // 0.5 Auto-create user_stats if missing
        if (!userStats || statsError) {
            console.log(`⚠️ User ${userId} stats missing. Auto-creating in user_stats...`);
            const { data: newStats, error: createError } = await supabase
                .from('user_stats')
                .insert({
                    user_id: userId,
                    current_balance: 10 // Free credits
                })
                .select('current_balance')
                .single();

            if (!createError && newStats) {
                userStats = newStats;
            } else {
                console.error(`❌ User Stats Creation Failed: User ID ${userId} must exist in 'users' table first.`);
                return res.status(401).json({
                    error: 'Account setup incomplete. Please restart the app from Telegram.',
                    details: createError?.message
                });
            }
        }

        // If user stats exists, check balance
        if (userStats) {
            const currentBalance = userStats.current_balance || 0;
            if (currentBalance < cost) {
                return res.status(402).json({ error: 'Недостаточно кредитов. Пожалуйста, пополните баланс.' });
            }

            // Deduct Credits (Reservation)
            const { error: deductError } = await supabase
                .from('user_stats')
                .update({ current_balance: currentBalance - cost })
                .eq('user_id', userId);

            if (deductError) {
                console.error('Payment Error:', deductError);
                return res.status(500).json({ error: 'Payment processing failed' });
            }
        } else {
            console.warn(`⚠️ User ${userId} still no profile. Skipping payment check (Free Run).`);
        }

        // Create job record with Fallback for Dev Users
        let jobData;

        try {
            const { data, error } = await supabase
                .from('generation_jobs')
                .insert({
                    user_id: userId,
                    status: 'pending',
                    job_type: jobType,
                    prompt: prompt,
                    model_id: modelId,
                    configuration: configuration || {},
                    source_files: processedFiles.length > 0 ? processedFiles : [] // Never fallback to Base64
                })
                .select()
                .single();

            if (error) throw error;
            jobData = data;

        } catch (insertError) {
            // Handle Non-Existent User (FK Violation) - common in Dev Mode
            if (insertError.message && insertError.message.includes('foreign key constraint')) {
                console.warn(`⚠️ User ${userId} not found in DB. Trying fallback...`);

                // Find ANY valid user to attach the job to (so it processes)
                const { data: fallbackUser } = await supabase
                    .from('users')
                    .select('id')
                    .limit(1)
                    .maybeSingle();

                if (fallbackUser) {
                    console.log(`🔄 Using fallback user: ${fallbackUser.id}`);
                    const { data: retryData, error: retryError } = await supabase
                        .from('generation_jobs')
                        .insert({
                            user_id: fallbackUser.id, // Use valid ID
                            status: 'pending',
                            job_type: jobType,
                            prompt: prompt,
                            model_id: modelId,
                            configuration: configuration || {},
                            source_files: processedFiles.length > 0 ? processedFiles : []
                        })
                        .select()
                        .single();

                    if (retryError) throw retryError;
                    jobData = retryData;
                } else {
                    throw new Error('No valid users found in DB to attach job.');
                }
            } else {
                throw insertError;
            }
        }

        const job = jobData; // Assign for downstream use

        console.log(`📋 Created job ${job.id} for user ${job.user_id}`);

        // Immediately start processing (non-blocking)
        processJobAsync(job.id).catch(err => {
            console.error(`❌ Job ${job.id} processing failed:`, err);
        });

        res.json({
            success: true,
            jobId: job.id,
            status: 'pending'
        });

    } catch (error) {
        console.error('Job Creation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get job status
app.get('/api/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        const { data: job, error } = await supabase
            .from('generation_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error || !job) {
            console.warn(`⚠️ Job ${jobId} lookup failed:`, error);
            // Return detailed error for debugging
            return res.status(404).json({ error: 'Job not found', details: error ? error.message : 'No data returned', code: error?.code });
        }

        res.json({
            success: true,
            job: {
                id: job.id,
                status: job.status,
                result_url: job.result_url,
                error_message: job.error_message,
                created_at: job.created_at,
                completed_at: job.completed_at
            }
        });

    } catch (error) {
        console.error('Job Status Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Async job processor (non-blocking)
async function processJobAsync(jobId) {
    try {
        console.log(`⚙️ Processing job ${jobId}...`);

        // Update status to processing
        await supabase
            .from('generation_jobs')
            .update({
                status: 'processing',
                started_at: new Date().toISOString()
            })
            .eq('id', jobId);

        // Fetch job details
        const { data: job } = await supabase
            .from('generation_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (!job) throw new Error('Job not found');

        // Call AI Service
        const result = await aiService.generateImage(
            job.prompt,
            job.model_id,
            {
                ...job.configuration,
                source_files: job.source_files
            }
        );

        if (result.success) {
            // 1. Update job with result
            await supabase
                .from('generation_jobs')
                .update({
                    status: 'completed',
                    result_url: result.imageUrl,
                    completed_at: new Date().toISOString()
                })
                .eq('id', jobId);

            console.log(`✅ Job ${jobId} completed: ${result.imageUrl}`);

            // 2. Save to Creations History (Server-side persistence)
            try {
                // Ensure generation_id is a UUID (or null if job.id isn't one, to avoid crasing)
                const generationId = (job.id && job.id.length > 20) ? job.id : null;

                const { error: creationError } = await supabase.from('creations').insert({
                    user_id: job.user_id,
                    image_url: result.imageUrl,
                    prompt: job.prompt,
                    title: job.prompt ? job.prompt.substring(0, 30) : 'Bot Gen',
                    description: job.prompt || 'Generated content',
                    type: (job.job_type && job.job_type.includes('video')) ? 'video' : 'image',
                    tags: [job.model_id],
                    generation_id: generationId,
                    is_public: false
                });

                if (creationError) {
                    console.warn('⚠️ Shared History Save Warning:', creationError.message);
                    // If FK error, try saving without generation_id
                    if (creationError.code === '23503') {
                        await supabase.from('creations').insert({
                            user_id: job.user_id,
                            image_url: result.imageUrl,
                            prompt: job.prompt,
                            title: job.prompt ? job.prompt.substring(0, 30) : 'Bot Gen',
                            description: job.prompt || 'Generated content',
                            type: (job.job_type && job.job_type.includes('video')) ? 'video' : 'image',
                            tags: [job.model_id],
                            is_public: false
                        });
                    }
                } else {
                    console.log('📚 Saved to User History');
                }
            } catch (err) {
                console.error('History Save Error:', err);
            }

            // 3. Notify User via Telegram
            try {
                // Find telegram chat ID from public users/profiles table
                const { data: userProfile } = await supabase
                    .from('users') // Assuming 'users' table holds telegram_id mapping
                    .select('telegram_id')
                    .eq('id', job.user_id)
                    .single();

                if (userProfile?.telegram_id) {
                    const isVideo = (result.imageUrl && result.imageUrl.match(/\.(mp4|mov|webm)$/i)) ||
                        (job.model_id && (job.model_id.includes('video') || job.model_id.includes('kling')));

                    const msgOpts = {
                        caption: `✨ *Generation Complete!*\n\n🎨 *Model:* \`${job.model_id}\`\n💬 *Prompt:* ${job.prompt ? job.prompt.substring(0, 100) : 'No prompt'}...`,
                        parse_mode: 'Markdown'
                    };

                    if (isVideo) {
                        await bot.sendVideo(userProfile.telegram_id, result.imageUrl, msgOpts);
                    } else {
                        await bot.sendPhoto(userProfile.telegram_id, result.imageUrl, msgOpts);
                    }
                    console.log(`📩 Sent notification to ${userProfile.telegram_id}`);
                } else {
                    console.log(`🔕 No telegram_id found for user ${job.user_id}`);
                }
            } catch (notifyError) {
                console.error('Notification Error:', notifyError.message);
            }

        } else {
            throw new Error(result.error || 'Generation failed');
        }

    } catch (error) {
        console.error(`❌ Job ${jobId} failed:`, error.message);

        // Update job with error
        await supabase
            .from('generation_jobs')
            .update({
                status: 'failed',
                error_message: error.message,
                completed_at: new Date().toISOString()
            })
            .eq('id', jobId);

        // REFUND LOGIC: If job failed, refund credits
        try {
            const { data: job } = await supabase.from('generation_jobs').select('user_id, model_id').eq('id', jobId).single();
            if (job) {
                const { data: userProfile } = await supabase.from('profiles').select('credits').eq('id', job.user_id).single();
                if (userProfile) {
                    const modelInfo = MODEL_CATALOG[job.model_id];
                    const cost = modelInfo ? modelInfo.cost : 5;

                    // Refund
                    await supabase.from('profiles').update({ credits: userProfile.credits + cost }).eq('id', job.user_id);
                    console.log(`💰 Refunded ${cost} credits to User ${job.user_id} due to failure.`);
                }
            }
        } catch (refundErr) {
            console.error('Refund Error:', refundErr);
        }
    }
}



// Staff: Approve Application
app.post('/api/staff/approve-application', async (req, res) => {
    try {
        const { applicationId } = req.body;
        console.log(`📝 Approving application ${applicationId}...`);

        // 1. Fetch application
        const { data: appData, error: appError } = await supabase
            .from('job_applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (appError || !appData) throw new Error('Application not found');

        // 2. Generate Password
        const password = Math.random().toString(36).slice(-8) + 'Aa1!';

        // 3. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: appData.email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: `${appData.first_name} ${appData.last_name}`,
                telegram: appData.telegram
            }
        });

        if (authError) throw authError;

        // 4. Update Application Status
        await supabase
            .from('job_applications')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString()
            })
            .eq('id', applicationId);

        // 5. Update Profile
        const userId = authData.user.id;
        await new Promise(r => setTimeout(r, 1000));

        await supabase
            .from('profiles')
            .update({
                role: 'staff',
                first_name: appData.first_name,
                last_name: appData.last_name,
                full_name: `${appData.first_name} ${appData.last_name}`,
                telegram_id: appData.telegram,
                position: 'Stagiaire',
                department_id: null
            })
            .eq('id', userId);

        res.json({
            success: true,
            credentials: {
                email: appData.email,
                password: password
            }
        });

    } catch (error) {
        console.error('Approval Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- AI PROXY ENDPOINTS (To bypass Vercel Timeout) ---

const KIE_API_URL = 'https://api.kie.ai/api/v1';
const DEFAPI_URL = 'https://api.defapi.org/api';

// Create Task Proxy
app.post('/api/proxy/create-task', async (req, res) => {
    try {
        console.log('Proxy Create Request Body:', req.body);
        const { provider, model, input, endpoint } = req.body || {};
        const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';
        const apiKey = provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: `${provider.toUpperCase()} API Key not configured on server` });
        }

        // KIE
        if (provider === 'kie') {
            const response = await fetch(`${KIE_API_URL}/jobs/createTask`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model, input })
            });

            if (!response.ok) {
                const txt = await response.text();
                return res.status(response.status).json({ error: txt });
            }
            const data = await response.json();
            return res.json(data);
        }

        // DEFAPI
        if (provider === 'defapi') {
            const response = await fetch(`${DEFAPI_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(input) // DefAPI expects flat input often, or matched structure
            });
            if (!response.ok) {
                const txt = await response.text();
                return res.status(response.status).json({ error: txt });
            }
            const data = await response.json();
            return res.json(data);
        }

        res.status(400).json({ error: 'Unknown provider' });

    } catch (e) {
        console.error('Proxy Create Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// Check Status Proxy
app.get('/api/proxy/check-task', async (req, res) => {
    try {
        const { provider, taskId } = req.query || {};
        const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';
        const apiKey = provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: `${provider.toUpperCase()} API Key not configured on server` });
        }

        if (provider === 'kie') {
            const response = await fetch(`${KIE_API_URL}/jobs/recordInfo?taskId=${taskId}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const data = await response.json();
            return res.json(data);
        }

        if (provider === 'defapi') {
            const response = await fetch(`${DEFAPI_URL}/task/query?task_id=${taskId}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const data = await response.json();
            return res.json(data);
        }

        res.status(400).json({ error: 'Unknown provider' });

    } catch (e) {
        console.error('Proxy Status Error:', e);
        res.status(500).json({ error: e.message });
    }
});


// Catch-all handler for SPA (Must be last)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- SYSTEM START ---
// Handled in init() above

// --- TEXT CONSTANTS ---
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

const balanceMessage = `
🌟 *Ваш баланс: 10 кредитов.*

Стоимость генерации:
- Фото: 5 кредитов
- Видео: от 15 кредитов (зависит от модели)

Выберите способ пополнения.
`;

const inviteMessage = (userId) => `
🤝 *Партнёрская программа*

Приглашайте друзей и получайте 10% от всех их платежей!

🔗 *Ваша реферальная ссылка:*
https://t.me/Pixel_ai_bot?start=r-${userId}

📈 Приглашено пользователей: 0
💰 Заработано кредитов: 0

Просто поделитесь ссылкой с друзьями. Когда они зарегистрируются и пополнят баланс, вы автоматически получите 10% от суммы их пополнения на свой счёт.
`;



const webAppUrl = 'https://bazzar-pixel.vercel.app'; // Fallback if unknown

// --- KEYBOARDS ---
const mainKeyboard = {
    reply_markup: {
        keyboard: [
            [{ text: 'Трендовые фото 🔥' }, { text: 'Сообщество 👥' }],
            [{ text: 'Главное меню 🏠' }, { text: 'Баланс ⚡' }],
            [{ text: 'Пригласи друга 🤝' }]
        ],
        resize_keyboard: true
    }
};

const sendWelcome = (chatId) => {
    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Сгенерировать 🎨', callback_data: 'generate_art' }],
                [{ text: 'Трендовые фото 🔥', web_app: { url: webAppUrl } }]
            ]
        }
    });
    bot.sendMessage(chatId, 'Выберите действие в меню ниже 👇', mainKeyboard);
};

// --- END OF CORE LOGIC ---

// Export app for Vercel serverless functions
export default app;
