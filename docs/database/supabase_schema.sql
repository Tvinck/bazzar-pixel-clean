-- =============================================
-- BAZZAR PIXEL MINI APP - SUPABASE SCHEMA
-- Analytics & User Management
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    language_code TEXT DEFAULT 'en',
    is_premium BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    
    -- Profile data
    avatar_url TEXT,
    bio TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast telegram_id lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- =============================================
-- USER SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    language_code TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Session info
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Device info
    platform TEXT,
    version TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_telegram_id ON user_sessions(telegram_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON user_sessions(created_at DESC);

-- =============================================
-- GENERATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Generation details
    generation_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'nano_banana'
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    
    -- Settings
    aspect_ratio TEXT DEFAULT '1:1',
    model TEXT,
    style TEXT,
    
    -- Status
    status TEXT DEFAULT 'started', -- 'started', 'processing', 'completed', 'failed'
    result_url TEXT,
    error_message TEXT,
    
    -- Metadata
    processing_time_ms INTEGER,
    cost_credits INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- =============================================
-- EVENTS TABLE (for analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event details
    event_name TEXT NOT NULL, -- 'button_click', 'tab_switch', 'share', etc.
    event_data JSONB DEFAULT '{}'::jsonb,
    
    -- Context
    page TEXT,
    referrer TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_data ON events USING GIN(event_data);

-- =============================================
-- USER STATS TABLE (aggregated)
-- =============================================
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Generation stats
    total_generations INTEGER DEFAULT 0,
    successful_generations INTEGER DEFAULT 0,
    failed_generations INTEGER DEFAULT 0,
    
    -- Type breakdown
    image_generations INTEGER DEFAULT 0,
    video_generations INTEGER DEFAULT 0,
    audio_generations INTEGER DEFAULT 0,
    
    -- Engagement
    total_sessions INTEGER DEFAULT 0,
    total_session_time_seconds INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    
    -- Social
    total_shares INTEGER DEFAULT 0,
    total_likes_given INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    
    -- Economy
    total_credits_spent INTEGER DEFAULT 0,
    total_credits_earned INTEGER DEFAULT 0,
    current_balance INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATIONS TABLE (saved user creations)
-- =============================================
CREATE TABLE IF NOT EXISTS creations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    
    -- Creation details
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Metadata
    type TEXT NOT NULL, -- 'image', 'video', 'audio'
    prompt TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Stats
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id);
CREATE INDEX IF NOT EXISTS idx_creations_is_public ON creations(is_public);
CREATE INDEX IF NOT EXISTS idx_creations_created_at ON creations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creations_likes ON creations(likes DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creations_updated_at BEFORE UPDATE ON creations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user stats
CREATE OR REPLACE FUNCTION increment_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure user_stats row exists
    INSERT INTO user_stats (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update stats based on table
    IF TG_TABLE_NAME = 'generations' THEN
        UPDATE user_stats
        SET total_generations = total_generations + 1,
            successful_generations = CASE WHEN NEW.status = 'completed' THEN successful_generations + 1 ELSE successful_generations END,
            failed_generations = CASE WHEN NEW.status = 'failed' THEN failed_generations + 1 ELSE failed_generations END,
            image_generations = CASE WHEN NEW.generation_type = 'image' THEN image_generations + 1 ELSE image_generations END,
            video_generations = CASE WHEN NEW.generation_type = 'video' THEN video_generations + 1 ELSE video_generations END,
            audio_generations = CASE WHEN NEW.generation_type = 'audio' THEN audio_generations + 1 ELSE audio_generations END
        WHERE user_id = NEW.user_id;
    ELSIF TG_TABLE_NAME = 'user_sessions' THEN
        UPDATE user_stats
        SET total_sessions = total_sessions + 1
        WHERE user_id = NEW.user_id;
    ELSIF TG_TABLE_NAME = 'events' THEN
        UPDATE user_stats
        SET total_events = total_events + 1,
            total_shares = CASE WHEN NEW.event_name = 'share' THEN total_shares + 1 ELSE total_shares END
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating stats
CREATE TRIGGER update_stats_on_generation AFTER INSERT ON generations
    FOR EACH ROW EXECUTE FUNCTION increment_user_stats();

CREATE TRIGGER update_stats_on_session AFTER INSERT ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION increment_user_stats();

CREATE TRIGGER update_stats_on_event AFTER INSERT ON events
    FOR EACH ROW EXECUTE FUNCTION increment_user_stats();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE creations ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policies for creations (public creations visible to all)
CREATE POLICY "Public creations are viewable by everyone" ON creations
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own creations" ON creations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creations" ON creations
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for bot/analytics)
CREATE POLICY "Service role has full access to all tables" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Daily active users
CREATE OR REPLACE VIEW daily_active_users AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as dau
FROM user_sessions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Generation stats by type
CREATE OR REPLACE VIEW generation_stats AS
SELECT 
    generation_type,
    status,
    COUNT(*) as count,
    AVG(processing_time_ms) as avg_processing_time,
    DATE(created_at) as date
FROM generations
GROUP BY generation_type, status, DATE(created_at)
ORDER BY date DESC, generation_type;

-- Top creators
CREATE OR REPLACE VIEW top_creators AS
SELECT 
    u.telegram_id,
    u.username,
    u.first_name,
    us.total_generations,
    us.successful_generations,
    us.total_likes_received
FROM users u
JOIN user_stats us ON u.id = us.user_id
ORDER BY us.successful_generations DESC
LIMIT 100;

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert sample user (comment out in production)
-- INSERT INTO users (telegram_id, username, first_name, language_code)
-- VALUES (123456789, 'testuser', 'Test User', 'en')
-- ON CONFLICT (telegram_id) DO NOTHING;
