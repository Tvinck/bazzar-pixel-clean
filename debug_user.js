import { supabase } from './bot-supabase.js';

const targetUsername = 'artykosh';
const targetTgId = 1040481322;

async function debugUser() {
    console.log(`Debugging user @${targetUsername} (${targetTgId})...`);

    // 1. Fetch Users by Username
    const { data: usersByUsername, error: uError } = await supabase
        .from('users')
        .select('*')
        .ilike('username', targetUsername);

    console.log('--- Users by Username ---');
    if (uError) console.error(uError);
    else console.log(usersByUsername);

    // 2. Fetch Users by Telegram ID
    const { data: usersByTgId, error: tgError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', targetTgId);

    console.log('--- Users by Telegram ID ---');
    if (tgError) console.error(tgError);
    else console.log(usersByTgId);

    // Collect all unique User UUIDs
    const allUsers = [...(usersByUsername || []), ...(usersByTgId || [])];
    const userIds = [...new Set(allUsers.map(u => u.id))];

    console.log('--- Checking Stats for User UUIDs:', userIds);

    for (const uid of userIds) {
        const { data: stats, error: sError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', uid);

        console.log(`Stats for UUID ${uid}:`);
        if (sError) console.log('Error:', sError.message);
        else console.log(stats);
    }

    // 3. Check for ORPHANED stats? (user_id = '1040481322')
    // Try to query user_stats where user_id matches the INT (if castable)
    // Likely will error if UUID type. But good to Try.
    try {
        const { data: orphanStats, error: oError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', targetTgId.toString()); // Try string match

        console.log(`--- Orphaned Stats Check (user_id = '${targetTgId}') ---`);
        if (oError) console.log('Query Error (expected if UUID):', oError.message);
        else console.log(orphanStats);
    } catch (e) {
        console.log('Orphan check crashed (likely UUID type mismatch).');
    }

    process.exit(0);
}

debugUser();
