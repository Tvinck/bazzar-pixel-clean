-- Add level and xp columns to user_stats table
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- Create function to calculate xp/level trigger? 
-- For MVP, we might calculate it on read or update it via application logic.
-- Let's stick to application logic for updates to keep it simple for now, 
-- but let's create a view for Leaderboard.

CREATE OR REPLACE VIEW public_leaderboard AS
SELECT 
    u.telegram_id, -- use telegram_id for uniqueness in UI if needed, or internal uuid
    u.username, 
    u.first_name, 
    -- u.avatar_url, -- assuming this exists in users table, otherwise omit
    s.total_generations, 
    s.total_likes_received, 
    s.level,
    s.xp,
    (s.total_generations * 50 + s.total_likes_received * 10) as computed_score
FROM users u
JOIN user_stats s ON u.id = s.user_id -- user_stats.user_id links to users.id (UUID)
ORDER BY computed_score DESC
LIMIT 100;

-- Fixed join condition: users.id (UUID) = user_stats.user_id (UUID)
