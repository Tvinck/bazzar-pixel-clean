import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
// Hardcoded Fallback for robust operations
const SUPABASE_URL = 'https://ktookvpqtmzfccojarwm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(
    process.env.PROD_SUPABASE_URL || SUPABASE_URL,
    process.env.PROD_SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('OK');

    try {
        const body = req.body;
        console.log('💰 Payment Webhook Payload:', JSON.stringify(body));

        if (!body.Token) return res.send('OK');

        // 1. PASSWORD (DEMO) -> Must match payment-init.js
        const PASSWORD = 'DFgxaoJ38xAjUrsJ';

        // 2. Validate Token (Correct Algorithm V2: Password in params)
        const receivedToken = body.Token;
        const params = { ...body };
        delete params.Token;

        // Add password to params for sorting
        params.Password = PASSWORD;

        const keys = Object.keys(params).sort();
        let tokenStr = '';
        for (const key of keys) {
            tokenStr += params[key];
        }
        // Do NOT append password at the end here, it is already in the loop!

        const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

        if (calculatedToken !== receivedToken) {
            console.error('❌ Webhook Signature Mismatch');
            return res.send('OK');
        }

        // 3. Handle Confirmed Payment
        if (body.Status === 'CONFIRMED' && supabase) {
            console.log(`✅ Payment ${body.OrderId} CONFIRMED.`);

            let userId = null;
            if (body.DATA?.userId) userId = body.DATA.userId;

            if (!userId && body.OrderId) {
                const parts = body.OrderId.split('_');
                // ORDER_{TIMESTAMP}_{USERID}
                if (parts.length >= 3) {
                    userId = parts.slice(2).join('_');
                }
            }

            if (!userId) {
                console.error('❌ Could not extract UserID');
                return res.send('OK');
            }

            // Calculate Credits Logic
            const amount = body.Amount / 100;
            let credits = Math.floor(amount);

            if (amount >= 99 && amount < 290) credits = 100;
            else if (amount >= 290 && amount < 490) credits = 350;
            else if (amount >= 490 && amount < 900) credits = 600;
            else if (amount >= 900) credits = 1500;

            console.log(`Adding ${credits} credits to user ${userId} for ${amount} RUB`);

            // 1. Get current balance AND telegram_id
            // Determine if userId is UUID or Telegram ID
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

            let query = supabase.from('profiles').select('id, balance, telegram_id');

            if (isUUID) {
                query = query.eq('id', userId);
            } else {
                console.log(`ℹ️ userId '${userId}' is not UUID, assuming telegram_id`);
                query = query.eq('telegram_id', userId);
            }

            const { data: user, error: fetchError } = await query.maybeSingle();

            if (fetchError) {
                console.error('❌ User Fetch Error:', fetchError);
                return res.send('OK');
            }

            let targetId = user?.id;

            // Auto-create user if missing
            if (!user) {
                console.log(`⚠️ User ${userId} not found. Creating new user in users + user_stats...`);

                // Only create if userId is telegram_id (not UUID)
                if (!isUUID) {
                    try {
                        // 1. Create in 'users' table
                        const { data: newUser, error: createUserError } = await supabase
                            .from('users')
                            .insert({
                                telegram_id: userId,
                                username: 'user_' + userId
                            })
                            .select()
                            .single();

                        if (createUserError) {
                            console.error('❌ Failed to create user:', createUserError);
                            return res.send('OK');
                        }

                        console.log('✅ Created User in users table:', newUser.id);
                        targetId = newUser.id;

                        // 2. Create in 'user_stats' table
                        const { error: createStatsError } = await supabase
                            .from('user_stats')
                            .insert({
                                user_id: newUser.id,
                                current_balance: credits,
                                total_generations: 0
                            });

                        if (createStatsError) {
                            console.error('❌ Failed to create user_stats:', createStatsError);
                        } else {
                            console.log('✅ Created user_stats with balance:', credits);
                        }

                        // Log transaction
                        await supabase.from('transactions').insert({
                            user_id: targetId,
                            amount: credits,
                            type: 'deposit',
                            description: `Пополнение ${amount}₽ (New User)`,
                            metadata: body,
                            created_at: new Date().toISOString()
                        });

                        return res.send('OK');
                    } catch (err) {
                        console.error('❌ User creation error:', err);
                        return res.send('OK');
                    }
                } else {
                    console.error('❌ Cannot create user with UUID - user must exist');
                    return res.send('OK');
                }
            }

            // Ensure we use the UUID for updates if we found it
            targetId = user.id;

            // Get current balance from user_stats (not profiles)
            const { data: stats } = await supabase
                .from('user_stats')
                .select('current_balance')
                .eq('user_id', targetId)
                .maybeSingle();

            const currentBalance = stats?.current_balance || 0;
            const newBalance = currentBalance + credits;

            // 2. Update balance in user_stats
            const { error: updateError } = await supabase
                .from('user_stats')
                .update({ current_balance: newBalance })
                .eq('user_id', targetId);

            if (updateError) {
                console.error('❌ Failed to update balance:', updateError);
            } else {
                console.log(`🎉 Balance updated to ${newBalance}`);

                // 3. Log Transaction
                await supabase.from('transactions').insert({
                    user_id: targetId,
                    amount: credits,
                    type: 'deposit',
                    description: `Пополнение ${amount}₽`,
                    metadata: body,
                    created_at: new Date().toISOString()
                });

                // 4. Send Telegram Notification
                if (user.telegram_id && process.env.TELEGRAM_BOT_TOKEN) {
                    try {
                        const message = `✅ *Баланс пополнен!*\n\n💰 Сумма: *${amount}₽*\n⚡️ Начислено: *${credits}* кредитов\n💎 Баланс: *${newBalance}*\n\nСпасибо за поддержку! ❤️`;

                        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: user.telegram_id,
                                text: message,
                                parse_mode: 'Markdown'
                            })
                        });
                        console.log('📨 Notification sent to TG ID:', user.telegram_id);
                    } catch (notifyErr) {
                        console.error('⚠️ Failed to send Telegram notification:', notifyErr);
                    }
                } else {
                    console.log('⚠️ No Telegram Token or User ID for notification');
                }
            }
        }

        return res.send('OK');

    } catch (e) {
        console.error('Webhook Fatal Error:', e);
        return res.status(200).send('OK');
    }
}
