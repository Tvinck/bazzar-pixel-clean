import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { userId } = req.query; // Or body

    // GET: Get Status
    if (req.method === 'GET') {
        if (!userId) return res.status(400).json({ error: 'Missing UserId' });

        const { data: sub, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ subscription: sub });
    }

    // POST: Cancel Subscription
    if (req.method === 'POST') {
        const { action, userId: bodyUserId } = req.body;
        if (action === 'cancel' && bodyUserId) {
            // In real world: Call T-Bank Cancel API if needed, or just stop local rebill schedule
            const { error } = await supabase
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('user_id', bodyUserId)
                .eq('status', 'active');

            if (error) return res.status(500).json({ error: error.message });
            return res.json({ success: true });
        }
    }

    return res.status(404).json({ error: 'Not found' });
}
