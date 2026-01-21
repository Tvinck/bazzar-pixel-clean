import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(
    process.env.PROD_SUPABASE_URL || supabaseUrl,
    process.env.PROD_SUPABASE_SERVICE_KEY || supabaseServiceKey
);

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { category } = req.query;

        let query = supabase
            .from('templates')
            .select('*');

        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return res.status(200).json(data || []);
    } catch (error) {
        console.error('Templates Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
