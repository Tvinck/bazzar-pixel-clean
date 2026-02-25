import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log('--- Checking Orders Table Schema ---');
    const { data, error } = await supabase.from('orders').select('*').limit(1);

    if (error) {
        console.error('Error fetching orders:', error.message);
    } else {
        console.log('Columns found in orders table:', Object.keys(data[0] || {}).join(', '));
        console.log('Sample row:', data[0]);
    }
}

checkSchema();
