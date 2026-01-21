import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    const userId = 'd0860ae5-f181-4a36-8eda-8bdecac359b7';

    // 1. Check in 'users' table
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    // 2. Check in 'user_stats'
    const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    // 3. Keep existing debug for telegram_id
    const { data: byTelegram } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', '50823401')
        .maybeSingle();

    res.json({
        target_user: { user, stats },
        by_telegram_id: byTelegram
    });
}
