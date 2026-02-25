import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import { supabase, botAnalytics } from '../lib/supabase.js';

/**
 * Get user's current credit balance by telegram ID.
 */
export async function getUserBalance(telegramId) {
    try {
        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
        if (!user) return 0;
        const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', user.id).single();
        return stats?.current_balance || 0;
    } catch (e) { return 0; }
}

/**
 * Resolve telegram ID to Supabase UUID. Optionally creates user if tgUser object is provided.
 */
export async function getUserUUID(telegramId, tgUser = null) {
    const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
    if (user) return user.id;

    if (tgUser) {
        const { userId, data } = await botAnalytics.upsertUser(tgUser);
        if (data?.id) return data.id;
    }

    return null;
}

/**
 * Upload a Telegram file (by URL) to Supabase storage.
 */
export async function uploadTelegramFileToSupabase(fileLink) {
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

/**
 * Generate a pure white mask image and upload to Supabase storage.
 */
export async function getWhiteMaskUrl(width, height) {
    try {
        const w = parseInt(width) || 1024;
        const h = parseInt(height) || 1024;
        const filename = `masks/white_${w}x${h}.png`;

        const buffer = await sharp({
            create: {
                width: w,
                height: h,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        })
            .grayscale()
            .threshold(128)
            .png({ bitdepth: 1 })
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
        return `https://singlecolorimage.com/get/ffffff/${width}x${height}`;
    }
}

/**
 * Ensure video resolution is at least 720p for Kling compatibility.
 * Returns original path if already adequate, or path to upscaled temp file.
 */
export async function ensureVideoResolution(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(filePath).ffprobe((err, metadata) => {
            if (err) {
                console.warn('ffprobe error:', err);
                return resolve(filePath);
            }

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            if (!videoStream) return resolve(filePath);

            const { width, height } = videoStream;

            const isMp4 = filePath.toLowerCase().endsWith('.mp4');
            if (width && height && Math.min(width, height) >= 720 && isMp4) {
                console.log(`✅ Video ${path.basename(filePath)} is already ${width}x${height} (>=720p). Skipping upscale.`);
                return resolve(filePath);
            }

            console.log(`Processing video ${path.basename(filePath)} (${width}x${height}) -> Upscaling/Normalizing...`);
            const tempOut = path.join(os.tmpdir(), `upscaled_${Date.now()}_${path.parse(filePath).name}.mp4`);

            ffmpeg(filePath)
                .outputOptions([
                    '-vf', 'scale=720:720:force_original_aspect_ratio=increase,pad=ceil(iw/2)*2:ceil(ih/2)*2',
                    '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p',
                    '-crf', '28',
                    '-preset', 'veryfast',
                    '-movflags', '+faststart',
                    '-f', 'mp4'
                ])
                .save(tempOut)
                .on('end', () => {
                    console.log('✅ Upscale complete:', tempOut);
                    resolve(tempOut);
                })
                .on('error', (e) => {
                    console.error('Upscale failed:', e);
                    if (fs.existsSync(tempOut)) {
                        try { fs.unlinkSync(tempOut); } catch (delErr) { }
                    }
                    resolve(filePath);
                });
        });
    });
}

/**
 * Deduct credits from user using atomic RPC.
 */
export async function deductCredits(telegramId, amount, description, type = 'expert_chat') {
    const userUUID = await getUserUUID(telegramId);
    if (!userUUID) return { success: false, error: 'User not found' };

    try {
        const { data: payData, error } = await supabase.rpc('process_generation_payment', {
            p_user_id: userUUID,
            p_cost: amount,
            p_xp_reward: 1,
            p_service_type: type
        });

        if (error || !payData || !payData.success) {
            return {
                success: false,
                error: payData?.error || error?.message || 'Payment failed',
                balance: payData?.new_balance
            };
        }

        return { success: true, newBalance: payData.new_balance };
    } catch (e) {
        console.error('Deduct Credits Error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Send welcome message with inline keyboard and main keyboard.
 */
export function sendWelcome(bot, chatId) {
    const webAppUrl = process.env.WEB_APP_URL || 'https://bazzar-pixel.vercel.app';
    const welcomeMessage = `
🎉 *Добро пожаловать в NanoBanana Bot!*

Здесь ты можешь сгенерировать трендовый контент прямо в боте или в нашем приложении 🚀

📸 *Фото → Фото:* Отправь фото и напиши, что поменять или добавить.

🎬 *Фото → Видео:* Отправь фото и напиши, что должно происходить в видео — я оживлю фото и превращу его в видео.

🖊 *Текст → Фото:* Опиши, что хочешь — и я сгенерю с нуля.

💡 *AI Power:* Мы используем умную ротацию ключей Google Gemini для максимальной стабильности!

Примеры в канале @pixel\\_imagess и в чате @pixel\\_communityy.

🔥 *Попробуй:* загрузи фото и напиши «добавь рядом динозавра» 🦖 — и мы сделаем магию!
`;

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
}

/**
 * Ensure storage buckets are public.
 */
export async function ensureBucketsPublic() {
    try {
        const bucketsToFix = ['uploads', 'source-files'];
        for (const bucketId of bucketsToFix) {
            await supabase.storage.updateBucket(bucketId, { public: true });
        }
    } catch (err) {
        console.error('⚠️ Failed to verify bucket visibility:', err.message);
    }
}
