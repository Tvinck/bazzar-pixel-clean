import { createClient } from '@supabase/supabase-js';

// Hardcoded keys for reliability
const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser(username) {
    console.log(`🔍 Checking user: ${username}...`);

    // 1. Find User
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username);

    if (userError) {
        console.error('Error finding user:', userError);
        return;
    }

    if (!users || users.length === 0) {
        console.log('❌ User not found.');
        return;
    }

    const user = users[0];
    console.log(`✅ User Found: ${user.username} (ID: ${user.id})`);
    console.log(`   Telegram ID: ${user.telegram_id}`);
    console.log(`   Created At: ${user.created_at}`);

    // 2. Check User Stats (Balance)
    // Note: Table might be 'user_stats' or fields might be in 'users'/'profiles' depending on architecture. 
    // Checking 'users' first (some schemas keep balance there).
    if (user.balance !== undefined) {
        console.log(`💰 Balance in 'users' table: ${user.balance}`);
    }

    // Checking 'profiles' table if it exists
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        console.log(`Checking 'profiles' table...`);
        console.log(`💰 Balance in 'profiles': ${profile.balance}`);
    }

    // Checking 'user_stats' table
    const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (stats) {
        console.log(`📊 Stats found in 'user_stats':`);
        console.log(`   Balance: ${stats.current_balance}`);
        console.log(`   Total Generated: ${stats.total_generated}`);
    } else {
        console.log('⚠️ No record in `user_stats` table.');
    }
}

checkUser('artykosh');
