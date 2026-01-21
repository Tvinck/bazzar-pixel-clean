import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    const results = {};

    // Check profile with telegram_id
    const { data: byTelegram, error: err1 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, balance, created_at')
        .eq('telegram_id', '50823401');

    results.byTelegramId = { data: byTelegram, error: err1 };

    // Check all profiles with balance = 50
    const { data: by50, error: err2 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, balance, created_at')
        .eq('balance', 50);

    results.withBalance50 = { data: by50, error: err2 };

    // Check profiles without telegram_id but with balance > 0
    const { data: noTelegram, error: err3 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, balance, created_at')
        .is('telegram_id', null)
        .gt('balance', 0)
        .order('created_at', { ascending: false })
        .limit(5);

    results.noTelegramIdWithBalance = { data: noTelegram, error: err3 };

    res.json(results);
}
