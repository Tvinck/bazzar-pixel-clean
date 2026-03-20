import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTM3NjUsImV4cCI6MjA4Mzg4OTc2NX0.54qQke_wvQFjRE1-bm0Wv4CXSi5GXwoHrHMyBlt896A';

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
            const res = await fetch('/api/user/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || ''
                },
                body: JSON.stringify({ telegramId, ...telegramData })
            });
            if (res.ok) {
                const data = await res.json();
                return data.user;
            }
            return null;
        } catch (err) {
            console.error('Analytics error:', err);
            return null;
        }
    },

    // Track generation
    async trackGeneration(telegramId, type, prompt, status = 'started') {
        try {
            let userUUID = telegramId;
            const isUUID = typeof telegramId === 'string' && telegramId.length === 36 && telegramId.includes('-');

            if (!isUUID) {
                // Get user first
                const user = await this.upsertUser(telegramId, {});
                if (!user) return null;
                userUUID = user.id;
            }

            const { data, error } = await supabase
                .from('generations')
                .insert({
                    user_id: userUUID,
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
            const isUUID = typeof telegramId === 'string' && telegramId.length === 36 && telegramId.includes('-');

            const { data, error } = await supabase
                .from('events')
                .insert({
                    user_id: isUUID ? telegramId : null,
                    event_name: eventName,
                    event_data: {
                        telegram_id: isUUID ? null : telegramId,
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
            return data;
        } catch (err) {
            console.error('Analytics error:', err);
            return null;
        }
    },

    // Get user profile
    async getUserProfile(telegramId) {
        try {
            const res = await fetch('/api/user/profile', {
                headers: { 'X-TG-Data': window.Telegram?.WebApp?.initData || '' }
            });
            if (res.ok) {
                const data = await res.json();
                return data.profile;
            }
            return null;
        } catch (err) {
            console.error('Analytics profile error:', err);
            return null;
        }
    },

    // Get Leaderboard
    async getLeaderboard() {
        try {
            const res = await fetch('/api/user/leaderboard');
            if (res.ok) {
                return await res.json();
            }
            return [];
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
            return [];
        }
    },

    // Add credits to user
    async addCredits(telegramId, amount) {
        try {
            const res = await fetch('/api/user/credits/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || ''
                },
                body: JSON.stringify({ amount })
            });
            if (res.ok) {
                const json = await res.json();
                return json.data;
            }
            return null;
        } catch (err) {
            console.error('Analytics error:', err);
            return null;
        }
    },

    // Update user profile
    async updateUserProfile(telegramId, profileData) {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || ''
                },
                body: JSON.stringify(profileData)
            });
            if (res.ok) {
                const json = await res.json();
                return json.profile;
            }
            return null;
        } catch (err) {
            console.error('Analytics error:', err);
            return null;
        }
    },

    // Pay for generation (RPC via Proxy)
    async payForGeneration(userId, cost, xpReward, type = 'generation') {
        try {
            const res = await fetch('/api/user/credits/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || ''
                },
                body: JSON.stringify({ cost, xpReward, type })
            });
            if (res.ok) {
                const data = await res.json();
                return data;
            }
            return { success: false, error: 'Payment failed' };
        } catch (err) {
            console.error('Payment error:', err);
            return { success: false, error: err.message };
        }
    },

    // Get transaction history
    async getTransactionHistory(userId) {
        try {
            const res = await fetch('/api/payments/transactions', {
                headers: { 'X-TG-Data': window.Telegram?.WebApp?.initData || '' }
            });
            if (res.ok) {
                const json = await res.json();
                return json.transactions || [];
            }
            return [];
        } catch (err) {
            console.error('Transactions fetch error:', err);
            return [];
        }
    }
};
