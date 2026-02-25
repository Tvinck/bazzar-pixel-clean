
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('Starting DB Debug...');

    const tgId = 603207436;

    // 1. Get User UUID
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, telegram_id')
        .eq('telegram_id', tgId)
        .single();

    if (userError) {
        console.error('UserId Error:', userError);
        return;
    }
    console.log('User found:', user);

    // 2. Read Trials
    const { data: trials, error: trialsError } = await supabase
        .from('expert_free_trials')
        .select('*')
        .eq('user_id', user.id);

    if (trialsError) console.error('Trials Error:', trialsError);
    console.log('Current Trials:', trials);

    const expertId = 'debug_test';

    // 3. Upsert Trial
    console.log('Attempting Upsert...');
    const { error: upsertError } = await supabase
        .from('expert_free_trials')
        .upsert({
            user_id: user.id,
            expert_id: expertId,
            messages_used: 99
        }, { onConflict: 'user_id,expert_id' }); // user_id + expert_id is unique

    if (upsertError) console.error('Upsert Error:', upsertError);
    else console.log('Upsert Success!');

    // 4. Verify
    const { data: verify } = await supabase
        .from('expert_free_trials')
        .select('*')
        .eq('user_id', user.id)
        .eq('expert_id', expertId)
        .single();

    console.log('Verify Result:', verify);
}

run();
