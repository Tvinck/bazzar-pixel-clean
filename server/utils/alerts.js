import { bot } from '../index.js';

/**
 * Sends a structured alert message to the configured Admin Telegram account.
 * 
 * @param {string} message - The error or notification message
 * @param {'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'} level - Severity level
 */
export const sendAdminAlert = async (message, level = 'INFO') => {
    try {
        const adminId = process.env.ADMIN_CHAT_ID || process.env.DEV_USER_ID;
        if (!adminId || !bot) return;

        let icon = 'ℹ️';
        if (level === 'WARNING') icon = '⚠️';
        if (level === 'ERROR') icon = '🚨';
        if (level === 'SUCCESS') icon = '✅';

        const text = `${icon} <b>[Pixel System Alert]</b>\nLevel: ${level}\n\n<pre>${message}</pre>`;

        await bot.sendMessage(adminId, text, { parse_mode: 'HTML' }).catch(err => {
            console.error('Telegram API rejected admin alert:', err.message);
        });
    } catch (e) {
        console.error('Failed to send admin alert:', e);
    }
};
