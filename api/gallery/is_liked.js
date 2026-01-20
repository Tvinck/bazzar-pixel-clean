import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

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
