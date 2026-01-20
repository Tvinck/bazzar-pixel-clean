import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function addCreditsToAllUsers(amount = 1000) {
    console.log(`💰 Adding ${amount} credits to all users...`);

    // Get all users
    const { data: users, error } = await supabase
        .from('users')
        .select('id, telegram_id');

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log(`Found ${users.length} users`);

    // Add credits to each user
    for (const user of users) {
        const { data, error: updateError } = await supabase
            .rpc('add_credits', {
                p_user_id: user.id,
                p_amount: amount
            });

        if (updateError) {
            console.error(`Error adding credits to user ${user.telegram_id}:`, updateError);
        } else {
            console.log(`✅ Added ${amount} credits to user ${user.telegram_id} (ID: ${user.id})`);
        }
    }

    console.log('✅ Done!');
    process.exit(0);
}

addCreditsToAllUsers(1000);
