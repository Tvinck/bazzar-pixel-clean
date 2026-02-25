import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Используем ключ, который мы вставили в Vercel (из bot-supabase.js)
const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

console.log('Testing Supabase Service Key...');
console.log('URL:', supabaseUrl);
// console.log('Key:', supabaseServiceKey); 

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    try {
        // Попробуем получить 1 пользователя (требует прав service_role, если RLS закрыт)
        const { data, error } = await supabase.from('users').select('id').limit(1);

        if (error) {
            console.error('❌ Error:', error.message);
            console.error('Full error:', error);
        } else {
            console.log('✅ Success! Found data:', data);
        }
    } catch (err) {
        console.error('❌ Exception:', err.message);
    }
}

test();
