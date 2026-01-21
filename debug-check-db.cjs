const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ORDER_ID = 'BZR_20009178';

async function check() {
    console.log(`🔎 Checking order: ${ORDER_ID}...`);

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('metadata->>OrderId', ORDER_ID);

    if (error) {
        console.error('❌ DB Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('✅ Found Transaction(s):');
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log('⚠️ Transaction NOT found. This explains why Active Check fails.');
        console.log('Possible reason: payment-init.js did not save the pending tx.');
    }
}

check();
