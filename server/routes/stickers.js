import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();

/**
 * POST /api/chat/create-sticker-pack
 * Creates a Telegram sticker pack from provided image/video URLs.
 */
router.post('/create-sticker-pack', async (req, res) => {
    try {
        const { telegramId, stickers, packTitle, addBranding = true } = req.body;
        if (!telegramId || !stickers || !stickers.length) {
            return res.status(400).json({ error: 'Missing telegramId or stickers' });
        }

        // Note: bot instance should be passed or accessed somehow if needed for notifications
        // In the modular setup, we might need a way to pass the bot instance.
        // For now, we'll try to use the bot if it's attached to the app or req.
        const bot = req.app.get('bot');

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return res.status(503).json({ error: 'Bot token not configured' });
        }

        // Get bot username for sticker pack name
        const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const meData = await meRes.json();
        const botUsername = meData.result?.username;
        if (!botUsername) {
            return res.status(500).json({ error: 'Could not determine bot username' });
        }

        const timestamp = Date.now().toString(36);
        const packName = `pixel_${telegramId}_${timestamp}_by_${botUsername}`;
        const title = packTitle || `Pixel AI Стикеры`;

        console.log(`🎨 Creating sticker pack: ${packName} (${stickers.length} stickers)`);

        // Helper: call Telegram Bot API with JSON body
        const tgApi = async (method, body) => {
            const r = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await r.json();
            if (!data.ok) {
                console.error(`❌ ${method}:`, data);
                throw new Error(data.description || `${method} failed`);
            }
            return data;
        };

        // Helper: upload a sticker PNG buffer to Telegram → file_id
        const uploadStickerBuffer = async (pngBuffer) => {
            console.log(`📤 Uploading sticker to Telegram (${pngBuffer.length} bytes)...`);
            const form = new globalThis.FormData();
            form.append('user_id', String(telegramId));
            form.append('sticker', new Blob([pngBuffer], { type: 'image/png' }), 'sticker.png');
            form.append('sticker_format', 'static');

            const upRes = await fetch(`https://api.telegram.org/bot${botToken}/uploadStickerFile`, {
                method: 'POST',
                body: form
            });
            const resText = await upRes.text();
            const upData = JSON.parse(resText);
            if (!upData.ok) throw new Error(upData.description || 'uploadStickerFile failed');
            return upData.result.file_id;
        };

        const processedStickers = [];
        for (let i = 0; i < stickers.length; i++) {
            const sticker = stickers[i];
            try {
                const imgRes = await fetch(sticker.url, {
                    headers: { 'User-Agent': 'PixelBot/1.0' },
                    redirect: 'follow'
                });
                if (!imgRes.ok) continue;
                const rawBuf = Buffer.from(await imgRes.arrayBuffer());

                if (sticker.url.match(/\.(webm|mp4)$/i)) {
                    // Video conversion logic (omitted for brevity in this extraction, 
                    // should be copied if vital, but following the monolith's flow)
                    // [Copying video conversion logic from routes.js]
                    console.log('🎥 Processing Video Sticker...');
                    let finalBuffer = rawBuf;
                    let mimeType = 'video/webm';

                    if (sticker.url.includes('.mp4') || rawBuf.subarray(0, 4).toString('hex') === '00000018') {
                        const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.mp4`);
                        const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.webm`);
                        fs.writeFileSync(tempInput, rawBuf);
                        await new Promise((resolve, reject) => {
                            ffmpeg(tempInput)
                                .outputOptions([
                                    '-c:v libvpx-vp9', '-b:v 200k', '-crf 30', '-fs 256000',
                                    '-vf size=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=transparent',
                                    '-an', '-fps_mode passthrough'
                                ])
                                .save(tempOutput)
                                .on('end', resolve)
                                .on('error', reject);
                        });
                        finalBuffer = fs.readFileSync(tempOutput);
                        fs.unlinkSync(tempInput);
                        fs.unlinkSync(tempOutput);
                    }

                    const form = new globalThis.FormData();
                    form.append('user_id', String(telegramId));
                    form.append('sticker', new Blob([finalBuffer], { type: mimeType }), 'sticker.webm');
                    form.append('sticker_format', 'video');
                    const upRes = await fetch(`https://api.telegram.org/bot${botToken}/uploadStickerFile`, { method: 'POST', body: form });
                    const upData = await upRes.json();
                    if (upData.ok) processedStickers.push({ emoji: sticker.emoji, file_id: upData.result.file_id });
                    continue;
                }

                // Image processing
                let pipeline = sharp(rawBuf, { failOn: 'none' })
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

                if (addBranding) {
                    const svgText = `<svg width="512" height="512"><style>.title { fill: rgba(255, 255, 255, 0.6); font-size: 20px; font-weight: bold; font-family: sans-serif; }</style><text x="500" y="500" text-anchor="end" class="title">@Pixel_ai_bot</text></svg>`;
                    pipeline = pipeline.composite([{ input: Buffer.from(svgText), gravity: 'southeast' }]);
                }

                const pngBuf = await pipeline.png().toBuffer();
                const fileId = await uploadStickerBuffer(pngBuf);
                processedStickers.push({ emoji: sticker.emoji, file_id: fileId });
            } catch (e) {
                console.warn(`⚠️ Error processing sticker ${i + 1}:`, e.message);
            }
        }

        if (processedStickers.length === 0) return res.status(500).json({ error: 'No stickers processed' });

        const isVideoSet = stickers.some(s => s.url.match(/\.(webm|mp4)$/i));
        const stickerFormat = isVideoSet ? 'video' : 'static';

        await tgApi('createNewStickerSet', {
            user_id: parseInt(telegramId),
            name: packName,
            title: title,
            stickers: processedStickers.map(s => ({ sticker: s.file_id, emoji_list: [s.emoji], format: stickerFormat })),
            sticker_format: stickerFormat
        });

        const link = `https://t.me/addstickers/${packName}`;
        if (bot) {
            bot.sendMessage(telegramId, `🎨 *Ваш стикерпак готов!*\n\n📦 ${title}\n🔗 [Добавить в Telegram](${link})`, { parse_mode: 'Markdown' }).catch(() => { });
        }

        res.json({ success: true, link, packName });
    } catch (error) {
        console.error('Sticker Pack Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
