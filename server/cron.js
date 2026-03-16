import { getQueue } from './queue.js';
import { supabase } from './lib/supabase.js';

export const initCronJobs = async (bot) => {
    const boss = getQueue();
    if (!boss) return console.warn('⚠️ Queue not initialized, skipping cron jobs');

    try {
        // Daily top 5 gallery auto-post at 18:00 server time
        await boss.schedule('auto-publish-gallery', '0 18 * * *');

        await boss.work('auto-publish-gallery', async () => {
            console.log('🌅 [Cron] Running daily gallery auto-publish...');
            try {
                const GALLERY_CHANNEL_ID = process.env.GALLERY_CHANNEL_ID || '@bazzar_pixel_gallery'; // Example fallback

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                // Fetch top 5
                const { data: top, error } = await supabase
                    .from('creations')
                    .select('image_url, prompt, users(username)')
                    .eq('is_public', true)
                    .gte('created_at', yesterday.toISOString())
                    .order('likes_count', { ascending: false })
                    .limit(5);

                if (error) throw error;
                if (!top || top.length === 0) {
                    return console.log('🌅 [Cron] No public creations found in the last 24h.');
                }

                if (bot) {
                    const mediaGroup = top.map(c => ({
                        type: 'photo',
                        media: c.image_url,
                        caption: `✨ Создатель: @${c.users?.username || 'PixelUser'}\n📝 "${c.prompt?.slice(0, 80)}..."`
                    }));

                    await bot.sendMediaGroup(GALLERY_CHANNEL_ID, mediaGroup);
                    console.log(`✅ [Cron] Published top ${top.length} creations to ${GALLERY_CHANNEL_ID}`);
                }
            } catch (err) {
                console.error('❌ [Cron] Gallery publish failed:', err.message);
            }
        });

        console.log('⏱️ Cron jobs registered.');
    } catch (e) {
        console.error('❌ Failed to register cron jobs:', e.message);
    }
};
