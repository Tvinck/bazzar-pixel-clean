
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

    // Respond to Telegram IMMEDIATELY (critical for preventing retries)
    res.status(200).send('OK');

    // Check for duplicates
    if (processedUpdates.has(updateId)) {
        console.log('⚠️ Duplicate update ignored:', updateId);
        return;
    }

    // Mark as processed
    processedUpdates.add(updateId);

    // Cleanup old entries (prevent memory leak)
    if (processedUpdates.size > MAX_CACHE_SIZE) {
        const firstItem = processedUpdates.values().next().value;
        processedUpdates.delete(firstItem);
    }

    // Process asynchronously (don't await)
    try {
        console.log('📩 Processing Update:', updateId);
        bot.processUpdate(update);
    } catch (e) {
        console.error('❌ Webhook Processing Error:', e);
    }
}
