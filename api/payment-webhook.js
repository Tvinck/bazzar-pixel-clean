import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.PROD_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.PROD_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export default async function handler(req, res) {
    // T-Bank sends POST
    if (req.method !== 'POST') return res.status(200).send('OK');

    try {
        const body = req.body;
        console.log('💰 Payment Webhook Payload:', JSON.stringify(body));

        if (!body.Token) return res.send('OK'); // Ignore noise

        // 1. PASSWORD
        const PASSWORD = 'DFgxaoJ38xAjUrsJ'; // Hardcoded for Demo

        // 2. Validate Token
        const receivedToken = body.Token;
        const params = { ...body };
        delete params.Token;

        const keys = Object.keys(params).sort();
        let tokenStr = '';
        for (const key of keys) {
            tokenStr += params[key];
        }
        tokenStr += PASSWORD;

        const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

        if (calculatedToken !== receivedToken) {
            console.error('❌ Webhook Signature Mismatch');
            // return res.status(400).send('Invalid Signature'); 
            return res.send('OK'); // Return OK to satisfy T-Bank retries if we can't process
        }

        // 3. Handle Confirmed Payment
        if (body.Status === 'CONFIRMED' && supabase) {
            console.log(`✅ Payment ${body.OrderId} CONFIRMED. Processing...`);

            // Extract User ID
            let userId = null;
            // Check DATA first
            if (body.DATA?.userId) userId = body.DATA.userId;

            // Fallback to OrderId parsing
            if (!userId && body.OrderId) {
                const parts = body.OrderId.split('_');
                // Format: ORDER_{TIMESTAMP}_{USERID}
                if (parts.length >= 3) {
                    userId = parts.slice(2).join('_');
                }
            }

            if (!userId) {
                console.error('❌ Could not extract UserID from payment');
                return res.send('OK');
            }

            // Calculate Credits
            const amount = body.Amount / 100;
            let credits = Math.floor(amount);

            // Logic must match UI
            if (amount >= 99 && amount < 290) credits = 100;
            else if (amount >= 290 && amount < 490) credits = 350;
            else if (amount >= 490 && amount < 900) credits = 600;
            else if (amount >= 900) credits = 1500;

            console.log(`Adding ${credits} credits to user ${userId}...`);

            // Direct DB Update (Admin)
            // 1. Get current balance
            const { data: user, error: fetchError } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', userId)
                .single();

            if (fetchError || !user) {
                console.error('❌ User not found in DB:', userId, fetchError);
                return res.send('OK');
            }

            const newBalance = (user.balance || 0) + credits;

            // 2. Update balance
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Failed to update balance:', updateError);
            } else {
                console.log(`🎉 Success! Balance updated to ${newBalance}`);

                // 3. Log Transaction
                await supabase.from('transactions').insert({
                    user_id: userId,
                    amount: credits,
                    type: 'deposit',
                    description: `Пополнение ${amount}₽`,
                    metadata: body,
                    created_at: new Date().toISOString()
                });
            }
        }

        return res.send('OK');

    } catch (e) {
        console.error('Webhook Fatal Error:', e);
        return res.status(200).send('OK');
    }
}
