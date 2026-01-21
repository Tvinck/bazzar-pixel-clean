
import { bot } from '../bot.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('OK');
    }

    try {
        const update = req.body;
        console.log('📩 Webhook Update:', update.update_id);

        // Pass update to the main bot logic
        bot.processUpdate(update);

        res.status(200).send('OK');
    } catch (e) {
        console.error('Webhook Error:', e);
        res.status(500).send('Error');
    }
}
