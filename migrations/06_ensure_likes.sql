-- 1. Create creation_likes table to track real user likes
CREATE TABLE IF NOT EXISTS public.creation_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    creation_id UUID REFERENCES public.creations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, creation_id)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_likes_creation ON public.creation_likes(creation_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.creation_likes(user_id);

-- 2. Ensure creations table has a likes_count column
ALTER TABLE public.creations ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 3. Trigger to automatically update the count on creation
CREATE OR REPLACE FUNCTION public.update_creation_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.creations SET likes_count = likes_count + 1 WHERE id = NEW.creation_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.creations SET likes_count = likes_count - 1 WHERE id = OLD.creation_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger (drop first to handle re-runs)
DROP TRIGGER IF EXISTS trigger_update_creation_likes_cnt ON public.creation_likes;
CREATE TRIGGER trigger_update_creation_likes_cnt
AFTER INSERT OR DELETE ON public.creation_likes
FOR EACH ROW EXECUTE FUNCTION public.update_creation_likes_count();

-- 4. Enable RLS but allow access for now (since auth is custom via Telegram ID)
ALTER TABLE public.creation_likes ENABLE ROW LEVEL SECURITY;

-- Allow reading likes (needed for checking state)
DROP POLICY IF EXISTS "Calculated likes are public" ON public.creation_likes;
CREATE POLICY "Calculated likes are public" ON public.creation_likes FOR SELECT USING (true);

-- Allow inserting likes (anyone with valid user_id can like for now)
DROP POLICY IF EXISTS "Anyone can like" ON public.creation_likes;
CREATE POLICY "Anyone can like" ON public.creation_likes FOR INSERT WITH CHECK (true);

-- Allow deleting likes (anyone can unlike)
DROP POLICY IF EXISTS "Anyone can unlike" ON public.creation_likes;
CREATE POLICY "Anyone can unlike" ON public.creation_likes FOR DELETE USING (true);

-- 5. Update/Create Views to include likes_count and proper sorting
DROP VIEW IF EXISTS public.public_gallery_trending CASCADE;
CREATE OR REPLACE VIEW public.public_gallery_trending AS
SELECT c.*, u.username, u.avatar_url, u.first_name
FROM public.creations c
JOIN public.users u ON c.user_id = u.id
WHERE c.is_public = true
ORDER BY c.likes_count DESC, c.created_at DESC;

DROP VIEW IF EXISTS public.public_gallery_latest CASCADE;
CREATE OR REPLACE VIEW public.public_gallery_latest AS
SELECT c.*, u.username, u.avatar_url, u.first_name
FROM public.creations c
JOIN public.users u ON c.user_id = u.id
WHERE c.is_public = true
ORDER BY c.created_at DESC;

DROP VIEW IF EXISTS public.public_gallery_top CASCADE;
CREATE OR REPLACE VIEW public.public_gallery_top AS
SELECT c.*, u.username, u.avatar_url, u.first_name
FROM public.creations c
JOIN public.users u ON c.user_id = u.id
WHERE c.is_public = true
ORDER BY c.likes_count DESC;
