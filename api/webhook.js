
import { bot } from '../bot.js';

// Track processed updates to prevent duplicates
const processedUpdates = new Set();
const MAX_CACHE_SIZE = 1000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('OK');
    }

    const update = req.body;
    const updateId = update.update_id;

    // Check for duplicates FIRST
    if (processedUpdates.has(updateId)) {
        console.log('⚠️ Duplicate update ignored:', updateId);
        return res.status(200).send('OK');
    }

    // Mark as processed
    processedUpdates.add(updateId);

    // Cleanup old entries (prevent memory leak)
    if (processedUpdates.size > MAX_CACHE_SIZE) {
        const firstItem = processedUpdates.values().next().value;
        processedUpdates.delete(firstItem);
    }

    // Process synchronously and WAIT for completion
    try {
        console.log('📩 Processing Update:', updateId);

        // CRITICAL: await ensures Vercel doesn't kill the process
        await bot.processUpdate(update);

        console.log('✅ Update processed:', updateId);
        res.status(200).send('OK');
    } catch (e) {
        console.error('❌ Webhook Processing Error:', e);
        res.status(200).send('OK'); // Still respond OK to Telegram
    }
}
