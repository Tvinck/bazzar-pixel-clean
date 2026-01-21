import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function debugBalance() {
    console.log('\n=== Checking profile with telegram_id 50823401 ===');
    const { data: byTelegram, error: err1 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, balance, created_at')
        .eq('telegram_id', '50823401');

    console.log('Result:', byTelegram);
    if (err1) console.error('Error:', err1);

    console.log('\n=== Checking all profiles with balance = 50 ===');
    const { data: by50, error: err2 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, balance, created_at')
        .eq('balance', 50);

    console.log('Result:', by50);
    if (err2) console.error('Error:', err2);

    console.log('\n=== Checking profiles without telegram_id but with balance > 0 ===');
    const { data: noTelegram, error: err3 } = await supabase
        .from('profiles')
        .select('id, telegram_id, username, balance, created_at')
        .is('telegram_id', null)
        .gt('balance', 0)
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('Result:', noTelegram);
    if (err3) console.error('Error:', err3);
}

debugBalance();
