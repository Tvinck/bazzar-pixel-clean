import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

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
