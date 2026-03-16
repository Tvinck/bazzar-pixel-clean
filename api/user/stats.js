import { createClient } from '@supabase/supabase-js';

// Credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    const { telegram_id } = req.query;

    if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id is required' });
    }

    try {
        // 1. Get User ID from Telegram ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .eq('telegram_id', telegram_id)
            .single();

        if (userError || !user) {
            // User not found
            if (userError && userError.code !== 'PGRST116') {
                console.error('Error fetching user:', userError);
                return res.status(500).json({ error: 'Database error fetching user' });
            }
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Get User Stats
        const { data: stats, error: statsError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (statsError) {
            if (statsError.code === 'PGRST116') {
                // Stats not found -> Return defaults (or create?)
                // Let's return a default object so frontend doesn't crash
                return res.status(200).json({
                    user_id: user.id,
                    current_balance: 0,
                    total_generated: 0
                });
            }
            throw statsError;
        }

        // Success
        res.status(200).json({ ...stats, username: user.username });
    } catch (error) {
        console.error('Error in user/stats:', error);
        res.status(500).json({ error: error.message });
    }
}
