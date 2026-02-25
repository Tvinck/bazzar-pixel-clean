-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creation_id UUID REFERENCES creations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, creation_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_creation_id ON likes(creation_id);

-- Function to update likes count in creations table
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE creations
        SET likes = likes + 1
        WHERE id = NEW.creation_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE creations
        SET likes = likes - 1
        WHERE id = OLD.creation_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_likes_count_trigger ON likes;
CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();

-- RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can see their own likes" ON likes;
CREATE POLICY "Users can see their own likes" ON likes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
CREATE POLICY "Users can insert their own likes" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
CREATE POLICY "Users can delete their own likes" ON likes
    FOR DELETE USING (auth.uid() = user_id);

-- Service Role Policy (Critically important for API)
DROP POLICY IF EXISTS "Service role key accesses all likes" ON likes;
CREATE POLICY "Service role key accesses all likes" ON likes
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
