-- Migration 26: Collaboration Features (Public Profiles & Bio)

-- 1. Extend user_profiles with social fields
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 160),
ADD COLUMN IF NOT EXISTS website TEXT;

-- 2. Ensure username index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 3. Update RLS for public profile access
-- We want to allow reading user info (username, first_name) and profile (bio, etc) 
-- ONLY if the profile is marked as public.

DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are readable by everyone" 
ON public.user_profiles 
FOR SELECT 
USING (is_public_profile = true);

-- 4. Update creations RLS to ensure public access to designated works
-- Even if use is private, specific creations can be public.
-- (Existing policies might already allow this, but let's be explicit)
DROP POLICY IF EXISTS "Public creations are readable by everyone" ON public.creations;
CREATE POLICY "Public creations are readable by everyone" 
ON public.creations 
FOR SELECT 
USING (is_public = true);

-- 5. Helper function to get public user stats (for profile view)
CREATE OR REPLACE FUNCTION get_public_user_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'creations_count', (SELECT count(*) FROM public.creations WHERE user_id = p_user_id AND is_public = true),
        'followers_count', (SELECT count(*) FROM public.follows WHERE following_id = p_user_id),
        'following_count', (SELECT count(*) FROM public.follows WHERE follower_id = p_user_id),
        'total_likes', (SELECT COALESCE(sum(likes_count), 0) FROM public.creations WHERE user_id = p_user_id AND is_public = true)
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$;
