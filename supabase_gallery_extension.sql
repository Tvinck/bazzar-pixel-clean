-- =============================================
-- PUBLIC GALLERY EXTENSION
-- Добавляет функциональность лайков и комментариев
-- =============================================

-- =============================================
-- LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS creation_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creation_id UUID REFERENCES creations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: user can like creation only once
    UNIQUE(creation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_creation_id ON creation_likes(creation_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON creation_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON creation_likes(created_at DESC);

-- =============================================
-- COMMENTS TABLE (optional, for future)
-- =============================================
CREATE TABLE IF NOT EXISTS creation_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creation_id UUID REFERENCES creations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    comment_text TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_creation_id ON creation_comments(creation_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON creation_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON creation_comments(created_at DESC);

-- =============================================
-- FUNCTIONS FOR LIKES
-- =============================================

-- Function to update likes count on creations
CREATE OR REPLACE FUNCTION update_creation_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment likes
        UPDATE creations
        SET likes = likes + 1
        WHERE id = NEW.creation_id;
        
        -- Update user stats (likes received)
        UPDATE user_stats
        SET total_likes_received = total_likes_received + 1
        WHERE user_id = (SELECT user_id FROM creations WHERE id = NEW.creation_id);
        
        -- Update user stats (likes given)
        UPDATE user_stats
        SET total_likes_given = total_likes_given + 1
        WHERE user_id = NEW.user_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement likes
        UPDATE creations
        SET likes = GREATEST(likes - 1, 0)
        WHERE id = OLD.creation_id;
        
        -- Update user stats (likes received)
        UPDATE user_stats
        SET total_likes_received = GREATEST(total_likes_received - 1, 0)
        WHERE user_id = (SELECT user_id FROM creations WHERE id = OLD.creation_id);
        
        -- Update user stats (likes given)
        UPDATE user_stats
        SET total_likes_given = GREATEST(total_likes_given - 1, 0)
        WHERE user_id = OLD.user_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes
CREATE TRIGGER update_likes_count AFTER INSERT OR DELETE ON creation_likes
    FOR EACH ROW EXECUTE FUNCTION update_creation_likes_count();

-- =============================================
-- VIEWS FOR GALLERY
-- =============================================

-- Public gallery feed (trending)
CREATE OR REPLACE VIEW public_gallery_trending AS
SELECT 
    c.id,
    c.user_id,
    c.title,
    c.description,
    c.image_url,
    c.thumbnail_url,
    c.type,
    c.prompt,
    c.tags,
    c.views,
    c.likes,
    c.shares,
    c.created_at,
    u.username,
    u.first_name,
    u.avatar_url,
    -- Calculate trending score (likes + views in last 7 days)
    (c.likes * 2 + c.views) as trending_score
FROM creations c
JOIN users u ON c.user_id = u.id
WHERE c.is_public = true
  AND c.created_at > NOW() - INTERVAL '7 days'
ORDER BY trending_score DESC, c.created_at DESC
LIMIT 100;

-- Public gallery feed (recent)
CREATE OR REPLACE VIEW public_gallery_recent AS
SELECT 
    c.id,
    c.user_id,
    c.title,
    c.description,
    c.image_url,
    c.thumbnail_url,
    c.type,
    c.prompt,
    c.tags,
    c.views,
    c.likes,
    c.shares,
    c.created_at,
    u.username,
    u.first_name,
    u.avatar_url
FROM creations c
JOIN users u ON c.user_id = u.id
WHERE c.is_public = true
ORDER BY c.created_at DESC
LIMIT 100;

-- Public gallery feed (popular all time)
CREATE OR REPLACE VIEW public_gallery_popular AS
SELECT 
    c.id,
    c.user_id,
    c.title,
    c.description,
    c.image_url,
    c.thumbnail_url,
    c.type,
    c.prompt,
    c.tags,
    c.views,
    c.likes,
    c.shares,
    c.created_at,
    u.username,
    u.first_name,
    u.avatar_url
FROM creations c
JOIN users u ON c.user_id = u.id
WHERE c.is_public = true
ORDER BY c.likes DESC, c.views DESC
LIMIT 100;

-- =============================================
-- RLS POLICIES FOR LIKES
-- =============================================

ALTER TABLE creation_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE creation_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Likes are viewable by everyone" ON creation_likes
    FOR SELECT USING (true);

-- Users can like creations
CREATE POLICY "Users can insert their own likes" ON creation_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unlike creations
CREATE POLICY "Users can delete their own likes" ON creation_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies (for future)
CREATE POLICY "Comments are viewable by everyone" ON creation_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON creation_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON creation_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON creation_comments
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user liked a creation
CREATE OR REPLACE FUNCTION user_liked_creation(p_user_id UUID, p_creation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM creation_likes
        WHERE user_id = p_user_id AND creation_id = p_creation_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_creation_views(p_creation_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE creations
    SET views = views + 1
    WHERE id = p_creation_id;
END;
$$ LANGUAGE plpgsql;
