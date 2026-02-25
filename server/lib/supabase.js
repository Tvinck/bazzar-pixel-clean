// Supabase client for bot (server-side only!)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bot analytics helpers
export const botAnalytics = {
    // Track bot message
    async trackBotMessage(userId, messageType, messageData = {}) {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert({
                    user_id: userId,
                    event_name: 'bot_message',
                    event_data: {
                        type: messageType,
                        ...messageData
                    },
                    created_at: new Date().toISOString()
                });

            if (error) console.error('Bot message tracking error:', error);
            return data;
        } catch (err) {
            console.error('Bot analytics error:', err);
        }
    },

    // Track event (generic)
    async trackEvent(telegramId, eventName, eventData = {}) {
        try {
            // Resolve UUID from telegram_id
            const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', telegramId)
                .single();

            const userId = userData?.id || null;

            // If userId is missing, abort to prevent DB errors in triggers
            if (!userId) {
                console.error(`❌ Analytics Error: User UUID not found for telegram_id ${telegramId}. Skipping event ${eventName}.`);
                return null;
            }

            const { data, error } = await supabase
                .from('events')
                .insert({
                    user_id: userId,
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
            console.error('Bot analytics error:', err);
        }
    },

    // Upsert user from Telegram
    async upsertUser(telegramUser) {
        try {
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    telegram_id: telegramUser.id,
                    username: telegramUser.username,
                    first_name: telegramUser.first_name,
                    last_name: telegramUser.last_name,
                    language_code: telegramUser.language_code,
                    is_premium: telegramUser.is_premium || false,
                    is_bot: telegramUser.is_bot || false,
                    last_active_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'telegram_id'
                })
                .select()
                .single();

            if (error) console.error('User upsert error:', error);
            return { userId: data?.id || telegramUser.id, data };
        } catch (err) {
            console.error('Bot analytics error:', err);
            return { userId: telegramUser.id, data: null };
        }
    },

    // Track bot command
    async trackCommand(telegramId, command, args = []) {
        try {
            const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', telegramId)
                .single();
            const userId = userData?.id || null;

            if (!userId) {
                console.error(`❌ Analytics Error: User UUID not found for telegram_id ${telegramId}. Skipping command ${command}.`);
                return null;
            }

            const { data, error } = await supabase
                .from('events')
                .insert({
                    user_id: userId,
                    event_name: 'bot_command',
                    event_data: {
                        telegram_id: telegramId,
                        command,
                        args
                    },
                    created_at: new Date().toISOString()
                });

            if (error) console.error('Command tracking error:', error);
            return data;
        } catch (err) {
            console.error('Bot analytics error:', err);
        }
    },

    // Get user stats
    async getUserStats(userId) {
        try {
            const { data, error } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Stats fetch error:', error);
            }
            return data;
        } catch (err) {
            console.error('Bot analytics error:', err);
            return null;
        }
    },

    // Get all users count
    async getTotalUsers() {
        try {
            const { count, error } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (error) console.error('Count error:', error);
            return count || 0;
        } catch (err) {
            console.error('Bot analytics error:', err);
            return 0;
        }
    },

    // Get active users today
    async getActiveUsersToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            const { count, error } = await supabase
                .from('user_sessions')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            if (error) console.error('Active users error:', error);
            return count || 0;
        } catch (err) {
            console.error('Bot analytics error:', err);
            return 0;
        }
    }
};
