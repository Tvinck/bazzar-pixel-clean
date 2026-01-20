import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, creationId } = req.body;

    if (!userId || !creationId) {
        return res.status(400).json({ error: 'userId and creationId are required' });
    }

    try {
        // Check if already liked
        const { data: existing } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('creation_id', creationId)
            .single();

        if (existing) {
            return res.status(200).json({ success: false, error: 'Already liked' });
        }

        // Insert like
        const { data, error } = await supabase
            .from('likes')
            .insert({ user_id: userId, creation_id: creationId })
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error liking creation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
