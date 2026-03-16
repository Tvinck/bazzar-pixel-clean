import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { initData } = req.query;
        let telegramId = null;

        // 1. Try to get ID from initData
        if (initData) {
            try {
                const urlParams = new URLSearchParams(initData);
                const userStr = urlParams.get('user');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    telegramId = userObj.id;
                }
            } catch (e) {
                console.error('Error parsing initData:', e);
            }
        }

        // Fallback: Check body (if POST)
        if (!telegramId && req.body && req.body.telegramId) {
            telegramId = req.body.telegramId;
        }

        if (!telegramId) {
            return res.status(400).json({ error: 'Missing Telegram User ID' });
        }

        console.log(`fetching transactions for TG ID: ${telegramId}`);

        // 2. Find User in DB
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', telegramId)
            .maybeSingle();

        if (userError) {
            console.error('User lookup error:', userError);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            // User doesn't exist yet, so empty history
            return res.json({ success: true, transactions: [] });
        }

        // 3. Fetch Transactions
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .neq('type', 'pending_init') // Hide technical init rows
            .order('created_at', { ascending: false })
            .limit(50);

        if (txError) {
            console.error('Tx lookup error:', txError);
            return res.status(500).json({ error: txError.message });
        }

        return res.json({ success: true, transactions });

    } catch (e) {
        console.error('API Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
