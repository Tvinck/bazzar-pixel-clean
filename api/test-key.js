import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1)
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Key is working!',
            debug_key_prefix: supabaseServiceKey.substring(0, 10)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: error
        });
    }
}
