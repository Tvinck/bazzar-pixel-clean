
import { bot } from '../bot.js';

// Track processed updates to prevent duplicates
const processedUpdates = new Set();
const MAX_CACHE_SIZE = 1000;

// Track active promises from bot handlers
let activePromises = [];

// Wrap bot.sendMessage to track promises
const originalSendMessage = bot.sendMessage.bind(bot);
bot.sendMessage = function (...args) {
    const promise = originalSendMessage(...args);
    activePromises.push(promise);
    promise.finally(() => {
        activePromises = activePromises.filter(p => p !== promise);
    });
    return promise;
};

// Same for answerCallbackQuery
const originalAnswerCallback = bot.answerCallbackQuery.bind(bot);
bot.answerCallbackQuery = function (...args) {
    const promise = originalAnswerCallback(...args);
    activePromises.push(promise);
    promise.finally(() => {
        activePromises = activePromises.filter(p => p !== promise);
    });
    return promise;
};

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

        // Clear previous promises
        activePromises = [];

        // Emit events
        if (update.message) {
            bot.emit('message', update.message);
        }

        if (update.callback_query) {
            bot.emit('callback_query', update.callback_query);
        }

        // Wait for all bot API calls to complete (with timeout)
        const timeout = new Promise(resolve => setTimeout(resolve, 8000)); // Max 8s safety
        await Promise.race([
            Promise.all(activePromises),
            timeout
        ]);

        console.log('✅ Update processed:', updateId, `(${activePromises.length} API calls)`);
        res.status(200).send('OK');
    } catch (e) {
        console.error('❌ Webhook Processing Error:', e);
        res.status(200).send('OK');
    }
}
