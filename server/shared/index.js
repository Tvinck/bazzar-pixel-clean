import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIG ---
export const PORTS = {
    GATEWAY: 3000,
    PAYMENTS: 3001,
    USERS: 3002,
    GENERATION: 3003
};

// --- SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- ANALYTICS ---
export const botAnalytics = {
    async trackEvent(telegramId, eventName, eventData = {}) {
        try {
            const { data: userData } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
            const userId = userData?.id;
            if (!userId) return null;

            return await supabase.from('events').insert({
                user_id: userId,
                event_name: eventName,
                event_data: { telegram_id: telegramId, ...eventData },
                created_at: new Date().toISOString()
            });
        } catch (err) { console.error('Analytics Error:', err); }
    },

    async upsertUser(telegramUser) {
        try {
            const { data, error } = await supabase.from('users').upsert({
                telegram_id: telegramUser.id,
                username: telegramUser.username,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                language_code: telegramUser.language_code,
                is_premium: telegramUser.is_premium || false,
                last_active_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'telegram_id' }).select().single();
            return { userId: data?.id || telegramUser.id, data };
        } catch (err) { return { userId: telegramUser.id, data: null }; }
    }
};

// --- UTILS ---
export function verifyTelegramWebAppData(telegramInitData) {
    if (!telegramInitData) return null;
    try {
        const urlParams = new URLSearchParams(telegramInitData);
        const hash = urlParams.get('hash');
        if (!hash) return null;
        urlParams.delete('hash');
        const params = Array.from(urlParams.entries()).map(([k, v]) => `${k}=${v}`).sort().join('\n');
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(params).digest('hex');
        if (calculatedHash === hash) return JSON.parse(urlParams.get('user'));
    } catch (e) { console.error('Validation Error:', e); }
    return null;
}

export async function getUserUUID(telegramId, tgUser = null) {
    const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
    if (user) return user.id;
    if (tgUser) {
        const { data } = await botAnalytics.upsertUser(tgUser);
        return data?.id;
    }
    return null;
}

export async function getUserBalance(telegramId) {
    try {
        const { data: user } = await supabase.from('users').select('id').eq('telegram_id', telegramId).single();
        if (!user) return 0;
        const { data: stats } = await supabase.from('user_stats').select('current_balance').eq('user_id', user.id).single();
        return stats?.current_balance || 0;
    } catch (e) { return 0; }
}

// --- MIDDLEWARE ---
export const authTG = async (req, res, next) => {
    try {
        const initData = req.headers['x-tg-data'] || (req.body && req.body.initData);
        if (!initData && process.env.NODE_ENV !== 'production') {
            const devId = req.headers['x-dev-auth-id'];
            req.tgUser = { id: devId ? parseInt(devId) : 603207436, username: 'dev_user' };
            return next();
        }
        if (!initData) return res.status(401).json({ error: 'Auth required' });
        const tgUser = verifyTelegramWebAppData(initData);
        if (!tgUser) return res.status(401).json({ error: 'Security verification failed' });
        req.tgUser = tgUser;
        next();
    } catch (e) { res.status(500).json({ error: 'Internal Auth Error' }); }
};

export const authAPIKey = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'API Key required (Bearer token)' });
        }

        const apiKey = authHeader.split(' ')[1];
        if (!apiKey.startsWith('bp_')) {
            return res.status(401).json({ error: 'Invalid API Key format' });
        }

        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // Lookup key in DB
        const { data: keyData, error } = await supabase
            .from('api_keys')
            .select('*, user:users(*)')
            .eq('key_hash', keyHash)
            .eq('is_active', true)
            .single();

        if (error || !keyData) {
            return res.status(401).json({ error: 'Invalid or inactive API Key' });
        }

        // Attach user and key info
        req.user = keyData.user;
        req.apiKeyId = keyData.id;

        // Update last used (fire & forget)
        supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyData.id).then();

        next();
    } catch (e) {
        console.error('API Key Auth Error:', e);
        res.status(500).json({ error: 'Internal API Auth Error' });
    }
};

// --- TELEGRAM ---
export async function sendTelegramMessage(chatId, text, options = {}) {
    if (!process.env.TELEGRAM_BOT_TOKEN) return;
    try {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: options.parse_mode || 'HTML',
                reply_markup: options.reply_markup
            })
        });
    } catch (e) {
        console.error('Telegram Send Error:', e);
    }
}
