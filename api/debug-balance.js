import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    const results = {};

    // Check profile with telegram_id (using 'balance' column)
    const { data: byTelegramBalance, error: err1 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, balance')
        .eq('telegram_id', '50823401');

    results.byTelegramId_balance = { data: byTelegramBalance, error: err1 };

    // Check profile with telegram_id (using 'credits' column if exists)
    const { data: byTelegramCredits, error: err2 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, credits')
        .eq('telegram_id', '50823401');

    results.byTelegramId_credits = { data: byTelegramCredits, error: err2 };

    // Check all profiles with credits = 50
    const { data: by50credits, error: err3 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, credits')
        .eq('credits', 50);

    results.withCredits50 = { data: by50credits, error: err3 };

    // Check profiles without telegram_id but with credits > 0
    const { data: noTelegramCredits, error: err4 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, credits')
        .is('telegram_id', null)
        .gt('credits', 0)
        .limit(5);

    results.noTelegramIdWithCredits = { data: noTelegramCredits, error: err4 };

    res.json(results);
}
