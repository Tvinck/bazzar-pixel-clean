import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        const { data, error } = await supabase
            .from('likes')
            .select('creation_id')
            .eq('user_id', userId);

        if (error) throw error;

        const ids = (data || []).map(like => like.creation_id);
        res.status(200).json(ids);
    } catch (error) {
        console.error('Error fetching liked IDs:', error);
        res.status(500).json({ error: error.message });
    }
}
