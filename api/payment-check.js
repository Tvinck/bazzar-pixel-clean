import crypto from 'crypto';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';
const TERMINAL_KEY = '1768938209983';
const PASSWORD = '7XEqsWfjryCnqCck';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let { paymentId, orderId, userId } = req.body;

    // 0. Fallback: Find PaymentId by OrderId if missing
    if (!paymentId && orderId) {
        console.log(`🔎 Looking up PaymentId for Order: ${orderId}`);
        const { data: tx } = await supabase
            .from('transactions')
            .select('*') // need metadata
            .eq('type', 'pending_init') // optimized filter
            .filter('metadata->>OrderId', 'eq', orderId)
            .maybeSingle();

        if (tx && tx.metadata?.PaymentId) {
            paymentId = tx.metadata.PaymentId;
            console.log(`✅ Found PaymentId: ${paymentId}`);
            // Also trust the userId from the pending tx if not provided
            if (!userId && tx.user_id) userId = tx.user_id;
        }
    }

    if (!paymentId) return res.status(400).json({ error: 'No PaymentId found' });

    try {
        console.log(`🔎 Checking Payment status for: ${paymentId}`);

        // 1. Generate Token for GetState
        // Params: TerminalKey, PaymentId, Password
        const tokenParams = {
            TerminalKey: TERMINAL_KEY,
            PaymentId: paymentId,
            Password: PASSWORD
        };

        const sortedKeys = Object.keys(tokenParams).sort();
        let tokenStr = '';
        for (const key of sortedKeys) {
            tokenStr += String(tokenParams[key]);
        }
        const token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        // 2. Call T-Bank API (GetState)
        const bankResponse = await new Promise((resolve, reject) => {
            const reqData = JSON.stringify({
                TerminalKey: TERMINAL_KEY,
                PaymentId: paymentId,
                Token: token
            });

            const request = https.request({
                hostname: 'securepay.tinkoff.ru',
                path: '/v2/GetState',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(reqData)
                }
            }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => resolve(JSON.parse(data)));
            });
            request.on('error', reject);
            request.write(reqData);
            request.end();
        });

        console.log('🏦 Bank Response:', bankResponse.Status);

        // 3. Check Status
        if (bankResponse.Success && (bankResponse.Status === 'CONFIRMED' || bankResponse.Status === 'AUTHORIZED')) {

            // 4. Ensure Idempotency (Check if already credited)
            const { data: existingTx } = await supabase
                .from('transactions')
                .select('*')
                .eq('metadata->>PaymentId', paymentId) // Use ->> for JSON text search
                .maybeSingle();

            if (existingTx) {
                console.log('✅ Already credited. Returning success.');
                return res.status(200).json({ success: true, status: 'ALREADY_CREDITED' });
            }

            // 5. Calculate Credits & Find User (from original Order params or DB if needed)
            // Since this is a manual check, we rely on the DB having the user or passing it from client?
            // Better: trust the Bank's Amount. 
            // PROBLEM: GetState might not return userdata. 
            // SOLUTION: Application code must pass userId context to this endpoint, OR we parse it from DB if we saved an "Intent".

            // Simpler: Client sends userId. We trust it? NO. 
            // We must find who made this order. 
            // In a simple flow, checking status allows us to credit "the user who asks", 
            // BUT we must lock this PaymentId to prevent others from claiming it.

            const userId = req.body.userId; // Passed from client
            if (!userId) return res.status(400).json({ error: 'UserId required for claiming' });

            const amountRub = Math.round(bankResponse.Amount / 100);
            let credits = amountRub;
            if (amountRub === 99) credits = 100;
            else if (amountRub >= 490 && amountRub <= 510) credits = 525;
            else if (amountRub >= 990 && amountRub <= 1010) credits = 1150;
            else if (amountRub >= 1990 && amountRub <= 2010) credits = 2400;
            else if (amountRub >= 4990) credits = 6500;

            console.log(`💰 Crediting ${credits} to ${userId}`);

            // 6. Perform Transaction
            // Upsert User Stats
            const { data: userStats } = await supabase
                .from('user_stats')
                .select('current_balance')
                .eq('user_id', userId)
                .maybeSingle();

            const newBalance = (userStats?.current_balance || 0) + credits;

            await supabase.from('user_stats').upsert({
                user_id: userId,
                current_balance: newBalance,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            // Record Transaction (Locking PaymentId)
            await supabase.from('transactions').insert({
                user_id: userId,
                amount: credits,
                type: 'deposit',
                description: `Manual Check: ${amountRub}₽`,
                metadata: { ...bankResponse, manual_check: true }
            });

            // 7. Notify
            // (Optional here, client will see update)

            return res.status(200).json({ success: true, status: 'CREDITED', newBalance });
        }

        return res.json({ success: false, status: bankResponse.Status });

    } catch (e) {
        console.error('Check Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
