import { createClient } from '@supabase/supabase-js';

// ANON KEY from .env (Client Side)
const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTM3NjUsImV4cCI6MjA4Mzg4OTc2NX0.54qQke_wvQFjRE1-bm0Wv4CXSi5GXwoHrHMyBlt896A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const targetUuid = '668d4825-3a45-470b-a6aa-ed7cb46886fe'; // ArtyKosh UUID

async function checkRLS() {
    console.log('Checking READ access with ANON KEY...');

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUuid);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Data returned:', data);
        if (data.length === 0) {
            console.log('RLS BLOCKED READ (Returned 0 rows despite row existing).');
        } else {
            console.log('RLS ALLOWED READ.');
        }
    }
    process.exit(0);
}

checkRLS();
