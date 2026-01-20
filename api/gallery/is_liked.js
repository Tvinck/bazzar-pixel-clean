import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, creationId } = req.query;

    if (!userId || !creationId) {
        return res.status(400).json({ error: 'userId and creationId are required' });
    }

    try {
        const { data, error } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('creation_id', creationId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

        res.status(200).json({ liked: !!data });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ error: error.message });
    }
}
