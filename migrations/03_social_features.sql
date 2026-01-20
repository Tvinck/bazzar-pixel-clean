-- Social Features: Following and Comments

-- 1. Follows Table
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);


-- 2. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creation_id UUID REFERENCES creations(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(text) > 0 AND char_length(text) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for creation comments
CREATE INDEX IF NOT EXISTS idx_comments_creation ON comments(creation_id);

-- 3. Add comment_count to creations (denormalization for performance)
ALTER TABLE creations ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Trigger to update comment_count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE creations SET comment_count = comment_count + 1 WHERE id = NEW.creation_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE creations SET comment_count = comment_count - 1 WHERE id = OLD.creation_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- 4. Social Feed View (Creations from followed users)
CREATE OR REPLACE VIEW social_feed AS
SELECT 
    c.*,
    u.username,
    u.avatar_url,
    u.first_name
FROM creations c
JOIN users u ON c.user_id = u.id
JOIN follows f ON c.user_id = f.following_id
WHERE f.follower_id = auth.uid() -- This requires RLS or usage in RPC with passed ID.
ORDER BY c.created_at DESC;

-- Note: 'auth.uid()' works if RLS is enabled and queries are made via Supabase client.
-- If we use the service role or our current setup (which seems to bridge via Telegram ID -> UUID), 
-- we might need a stored procedure instead of a simple view if we can't contextually set auth.uid().
-- For now, let's just use a simple query in the frontend: 
-- "SELECT * FROM creations WHERE user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)"

-- 5. Enable RLS (Recommended, though we might have it disabled globally for now, good to be safe)
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies (Open for now based on current app pattern, or specific)
CREATE POLICY "Public reads follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Public reads comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
