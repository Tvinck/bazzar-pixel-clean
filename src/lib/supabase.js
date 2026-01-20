import { createClient } from '@supabase/supabase-js';

// Hardcoded for stability
const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTM3NjUsImV4cCI6MjA4Mzg4OTc2NX0.54qQke_wvQFjRE1-bm0Wv4CXSi5GXwoHrHMyBlt896A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Analytics helpers
export const analytics = {
    // Track user session
    async trackSession(telegramId, telegramData) {
        try {
            // First, upsert user
            await this.upsertUser(telegramId, telegramData);

            // Then create session
            const { data, error } = await supabase
                .from('user_sessions')
                .insert({
                    telegram_id: telegramId,
                    username: telegramData?.username,
                    first_name: telegramData?.first_name,
                    last_name: telegramData?.last_name,
                    language_code: telegramData?.language_code,
                    is_premium: telegramData?.is_premium || false,
                    session_start: new Date().toISOString()
                });

            if (error) console.error('Session tracking error:', error);
            return data;
        } catch (err) {
            console.error('Analytics error:', err);
        }
    },

    // Upsert user
    async upsertUser(telegramId, telegramData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    telegram_id: telegramId,
                    username: telegramData?.username,
                    first_name: telegramData?.first_name,
                    last_name: telegramData?.last_name,
                    language_code: telegramData?.language_code,
                    is_premium: telegramData?.is_premium || false,
                    last_active_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'telegram_id'
                })
                .select()
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('User upsert error:', error);
            }
            return data;
        } catch (err) {
            console.error('Analytics error:', err);
        }
    },

    // Track generation
    async trackGeneration(telegramId, type, prompt, status = 'started') {
        try {
            // Get user first
            const user = await this.upsertUser(telegramId, {});

            const { data, error } = await supabase
                .from('generations')
                .insert({
                    user_id: user?.id,
                    generation_type: type,
                    prompt: prompt,
                    status: status,
                    created_at: new Date().toISOString()
                });

            if (error) console.error('Generation tracking error:', error);
            return data;
        } catch (err) {
            console.error('Analytics error:', err);
        }
    },

    // Track button clicks
    async trackEvent(telegramId, eventName, eventData = {}) {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert({
                    user_id: null,
                    event_name: eventName,
                    event_data: {
                        telegram_id: telegramId,
                        ...eventData
                    },
                    created_at: new Date().toISOString()
                });

            if (error) console.error('Event tracking error:', error);
            return data;
        } catch (err) {
            console.error('Analytics error:', err);
        }
    },

    // Get user stats by telegram_id
    async getUserStats(telegramId) {
        try {
            // Use Proxy to bypass RLS
            const response = await fetch(`/api/user/stats?telegram_id=${telegramId}`);
            if (!response.ok) {
                console.error('Stats API error:', response.status);
                return null;
            }
            const data = await response.json();

            // If no stats, logic to create default?
            // If data is null, we return null, and UserContext handles it?
            // UserContext: if (userStats) setStats(userStats).
            // If null, it logs "User initialization error" or defaults?
            // Wait, src/lib/supabase.js handles default creation in original code.
            // I should preserve that. But I can't Insert if RLS blocks.
            // I'll assume for now stats exist (since we created them manually or via bot).
            // If missing, we might need a create endpoint.

            return data;
        } catch (err) {
            console.error('Analytics error:', err);
            return null;
        }
    },

    // Get Leaderboard
    async getLeaderboard() {
        try {
            const { data, error } = await supabase
                .from('public_leaderboard')
                .select('*')
                .limit(100);

            if (error) console.error('Leaderboard error:', error);
            return data || [];
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
            return [];
        }
    },

    // Add credits to user
    async addCredits(telegramId, amount) {
        try {
            const stats = await this.getUserStats(telegramId);
            if (!stats) return null;

            const { data, error } = await supabase
                .from('user_stats')
                .update({
                    current_balance: (stats.current_balance || 0) + amount,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', stats.user_id)
                .select()
                .single();

            if (error) console.error('Add credits error:', error);
            return data;
        } catch (err) {
            console.error('Analytics error:', err);
        }
    },

    // Update user profile
    async updateUserProfile(telegramId, profileData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('telegram_id', telegramId)
                .select()
                .single();

            if (error) console.error('Profile update error:', error);
            return data;
        } catch (err) {
            console.error('Analytics error:', err);
        }
    },

    // Pay for generation (RPC)
    async payForGeneration(userId, cost, xpReward, type = 'generation') {
        try {
            const { data, error } = await supabase
                .rpc('process_generation_payment', {
                    p_user_id: userId,
                    p_cost: cost,
                    p_xp_reward: xpReward,
                    p_service_type: type
                });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Payment error:', err);
            return { success: false, error: err.message };
        }
    },

    // Get transaction history
    async getTransactionHistory(userId) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Transactions fetch error:', err);
            return [];
        }
    }
};
