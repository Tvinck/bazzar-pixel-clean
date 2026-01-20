-- =============================================
-- 1. TEAM CHAT
-- =============================================

CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE, -- e.g. 'general', 'orders'
    name TEXT NOT NULL,
    type TEXT DEFAULT 'public', -- 'public', 'private'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed defaults
INSERT INTO chat_channels (slug, name) VALUES 
('general', 'General'),
('orders', 'Orders'),
('memes', 'Memes'),
('announcements', 'Announcements')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT,
    attachment_url TEXT,
    type TEXT DEFAULT 'text', -- 'text', 'image', 'system'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already created
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE;

-- RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view messages" ON chat_messages;
CREATE POLICY "Staff can view messages" ON chat_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff can send messages" ON chat_messages;
CREATE POLICY "Staff can send messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 2. GAMIFICATION (XP & LEADERBOARD)
-- =============================================

CREATE TABLE IF NOT EXISTS staff_xp_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    amount INTEGER NOT NULL,
    reason TEXT, -- 'order_completed', 'daily_bonus'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure profiles has email (sync with auth)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Real-time Leaderboard View
CREATE OR REPLACE VIEW view_leaderboard AS
SELECT 
    p.id as user_id,
    p.email,
    -- We assume profiles table exists and has avatar_url or we use email
    COALESCE(SUM(x.amount), 0) as total_xp,
    RANK() OVER (ORDER BY COALESCE(SUM(x.amount), 0) DESC) as rank
FROM profiles p
LEFT JOIN staff_xp_logs x ON p.id = x.user_id
GROUP BY p.id, p.email;

-- =============================================
-- 3. WIKI & KNOWLEDGE BASE
-- =============================================

CREATE TABLE IF NOT EXISTS wiki_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'basics', 'troubleshoot', 'products'
    content TEXT, -- Markdown
    read_time TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS wiki_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- [{text, options[], correct_idx}]
    pass_score INTEGER DEFAULT 80, -- Percent
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_test_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    test_id UUID REFERENCES wiki_tests(id),
    score INTEGER NOT NULL, -- Percent
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
