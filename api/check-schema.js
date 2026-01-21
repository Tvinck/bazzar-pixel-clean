import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    // Get one row from user_stats to see the schema
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .limit(1);

    if (error) {
        return res.json({ error });
    }

    if (data && data.length > 0) {
        return res.json({
            columns: Object.keys(data[0]),
            sample: data[0]
        });
    }

    return res.json({ message: 'No data in user_stats' });
}
