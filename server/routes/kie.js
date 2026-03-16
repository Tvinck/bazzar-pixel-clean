import express from 'express';
import fetch from 'node-fetch';
import { supabase } from '../shared/index.js';

const router = express.Router();

// Kie.ai Webhook Handler
router.post('/webhook/:creationId', async (req, res) => {
    const { creationId } = req.params;
    const { status, result, error, state } = req.body;
    const webhookSecret = req.headers['x-webhook-secret'] || req.query.secret;

    if (process.env.KIE_WEBHOOK_SECRET && webhookSecret !== process.env.KIE_WEBHOOK_SECRET) {
        console.warn(`[Kie Webhook] Unauthorized access attempt for ${creationId}`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Normalize status (Kie uses both 'status' and 'state')
    const finalStatus = state || status;

    console.log(`[Kie Webhook] Incoming: jobId=${creationId}, status=${finalStatus}, error=${error ? JSON.stringify(error) : 'none'}`);

    try {
        // Fetch creation details for routing info (TG ID, cost)
        const { data: creation, error: fetchErr } = await supabase
            .from('creations')
            .select('*, user:users(telegram_id)')
            .eq('id', creationId)
            .single();

        if (fetchErr || !creation) throw new Error(`Creation ${creationId} not found`);

        const telegramId = creation.metadata?.telegramId || creation.user?.telegram_id;
        const cost = creation.metadata?.cost || 0;
        const modelId = creation.model_id;

        if (finalStatus === 'success' || finalStatus === 'completed') {
            // Result can be in resultJson or result
            let resultData = result;
            if (typeof resultData === 'string') {
                try { resultData = JSON.parse(resultData); } catch (e) { }
            }

            const url = resultData?.resultUrls?.[0] || resultData?.url || resultData?.imageUrl || (Array.isArray(resultData) && resultData[0]);

            if (url) {
                // 1. Download from Kie.ai -> Upload to Supabase Permanent Storage
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to download from Kie: ${response.statusText}`);

                const buffer = await response.arrayBuffer();
                const contentType = response.headers.get('content-type') || 'image/png';

                // Determine extension
                let ext = contentType.split('/')[1]?.split(';')[0] || 'png';
                if (ext === 'jpeg') ext = 'jpg';

                const fileName = `${creationId}_${Date.now()}.${ext}`;
                const path = `outputs/${fileName}`;

                await supabase.storage
                    .from('creations')
                    .upload(path, buffer, { contentType, upsert: true });

                const { data: { publicUrl } } = supabase.storage
                    .from('creations')
                    .getPublicUrl(path);

                // 2. Update Database
                await supabase.from('creations').update({
                    status: 'completed',
                    image_url: publicUrl,
                    updated_at: new Date().toISOString()
                }).eq('id', creationId);

                console.log(`[Kie Webhook] Successfully processed ${creationId} -> ${publicUrl}`);

                // 3. Notify Telegram
                if (telegramId) {
                    const { sendTelegramMessage } = await import('../shared/index.js');
                    const isVideo = contentType.includes('video') || ext === 'mp4';
                    const caption = `✨ <b>Генерация готова!</b>\n\n🤖 Модель: <code>${modelId}</code>\n📝 Промпт: <i>"${creation.prompt?.slice(0, 60)}..."</i>`;

                    await sendTelegramMessage(telegramId, caption, {
                        reply_markup: { inline_keyboard: [[{ text: '👁 Посмотреть', web_app: { url: `${process.env.WEB_APP_URL}/gallery` } }]] }
                    });
                }
            } else {
                console.error(`[Kie Webhook] Success but no URL found for ${creationId}`, resultData);
                await supabase.from('creations').update({
                    status: 'failed',
                    error: 'Completed but result URL missing'
                }).eq('id', creationId);

                if (telegramId) {
                    const { sendTelegramMessage } = await import('../shared/index.js');
                    await sendTelegramMessage(telegramId, `⚠️ <b>Ошибка AI</b>\n\nМодель завершила работу, но не предоставила результат. Пожалуйста, попробуйте еще раз.`);
                }
            }
        } else if (finalStatus === 'failed' || finalStatus === 'error' || error) {
            console.error(`[Kie Webhook] Generation failed for ${creationId}:`, error);
            // Update status
            await supabase.from('creations').update({
                status: 'failed',
                error: typeof error === 'object' ? JSON.stringify(error) : (error || 'Kie processing failed')
            }).eq('id', creationId);

            // Refund Credits
            if (telegramId && cost > 0) {
                await supabase.rpc('add_user_credits', {
                    p_telegram_id: telegramId.toString(),
                    p_amount: cost,
                    p_reason: `Refund: Task ${creationId} Failed at Kie`,
                    p_source: 'system'
                });
                const { sendTelegramMessage } = await import('../shared/index.js');
                await sendTelegramMessage(telegramId, `⚠️ <b>Ошибка AI</b>\n\nМодель не смогла выполнить запрос. Мы вернули ${cost} кредитов.`);
            } else if (telegramId) {
                const { sendTelegramMessage } = await import('../shared/index.js');
                await sendTelegramMessage(telegramId, `⚠️ <b>Ошибка AI</b>\n\nМодель не смогла выполнить запрос. Пожалуйста, попробуйте еще раз.`);
            }
        }

        res.json({ ok: true });
    } catch (err) {
        console.error(`[Kie Webhook Error] ${creationId}:`, err);
        // We still return 200 to Kie so they don't keep retrying if it's our processing error
        // But we mark it failed in DB
        try {
            await supabase.from('creations').update({
                status: 'failed',
                error: `Webhook processing error: ${err.message}`
            }).eq('id', creationId);
        } catch (dbErr) {
            console.error(`[Kie Webhook Error] Failed to update DB for ${creationId} after webhook processing error:`, dbErr);
        }

        res.json({ ok: false, error: err.message });
    }
});

export default router;
