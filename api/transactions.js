import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

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
