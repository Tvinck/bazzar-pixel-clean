-- =============================================
-- EXPERTS & PROFILES MIGRATION
-- =============================================

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    display_name TEXT,
    gender TEXT,
    age_range TEXT,
    location TEXT,
    occupation TEXT,
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    communication_style TEXT,
    language TEXT DEFAULT 'ru',
    
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access profiles" ON user_profiles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 2. EXPERT CONVERSATIONS
CREATE TABLE IF NOT EXISTS expert_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    expert_id TEXT NOT NULL, -- 'health', 'finance', 'chat_private', etc.
    chat_type TEXT, -- 'private', 'creator', 'knowledge' (for universal chat)
    
    message_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, expert_id)
);

-- RLS
ALTER TABLE expert_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON expert_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access conversations" ON expert_conversations FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. EXPERT MESSAGES
CREATE TABLE IF NOT EXISTS expert_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES expert_conversations(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 0, -- -1, 0, 1
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE expert_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON expert_messages 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM expert_conversations 
            WHERE expert_conversations.id = expert_messages.conversation_id 
            AND expert_conversations.user_id = auth.uid()
        )
    );
CREATE POLICY "Service role full access messages" ON expert_messages FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. EXPERT FREE TRIALS
CREATE TABLE IF NOT EXISTS expert_free_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    expert_id TEXT NOT NULL,
    messages_used INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, expert_id)
);

-- RLS
ALTER TABLE expert_free_trials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trials" ON expert_free_trials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access trials" ON expert_free_trials FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expert_conv_user ON expert_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_msgs_conv ON expert_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_expert_trials_user ON expert_free_trials(user_id);
