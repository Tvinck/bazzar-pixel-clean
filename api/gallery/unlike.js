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
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('creation_id', creationId);

        if (error) throw error;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error unliking creation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
