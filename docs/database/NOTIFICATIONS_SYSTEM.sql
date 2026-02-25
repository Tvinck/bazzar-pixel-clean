-- =============================================
-- 1. NOTIFICATIONS SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL, -- 'order', 'system', 'task', 'alert'
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT TO authenticated, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- =============================================
-- 2. TELEGRAM BOT MAPPING
-- =============================================

CREATE TABLE IF NOT EXISTS bot_users (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    telegram_chat_id BIGINT NOT NULL,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bot mapping" ON bot_users;
CREATE POLICY "Users can view own bot mapping" ON bot_users FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Allow service role to manage mappings
