
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

    // Cleanup old entries
    if (processedUpdates.size > MAX_CACHE_SIZE) {
        const firstItem = processedUpdates.values().next().value;
        processedUpdates.delete(firstItem);
    }

    try {
        console.log('📩 Processing Update:', updateId);

        // CRITICAL FIX: Manually emit events and WAIT for handlers
        // processUpdate() doesn't wait for async handlers to complete

        if (update.message) {
            // Emit 'message' event and wait for all listeners
            await new Promise((resolve) => {
                bot.emit('message', update.message);
                // Give handlers time to execute (they're async)
                setTimeout(resolve, 1000);
            });
        }

        if (update.callback_query) {
            // Emit 'callback_query' event and wait
            await new Promise((resolve) => {
                bot.emit('callback_query', update.callback_query);
                setTimeout(resolve, 1000);
            });
        }

        console.log('✅ Update processed:', updateId);
        res.status(200).send('OK');
    } catch (e) {
        console.error('❌ Webhook Processing Error:', e);
        res.status(200).send('OK');
    }
}
