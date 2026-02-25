-- Make the 'uploads' bucket public so KIE.AI can download files
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Update bucket configuration
UPDATE storage.buckets
SET public = true
WHERE id = 'uploads';

-- 2. Create Policy for Public Read Access
-- (If policy already exists, this might error, but the UPDATE above is the critical part)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Public Access Uploads'
    ) THEN
        CREATE POLICY "Public Access Uploads"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'uploads' );
    END IF;
END
$$;

-- 3. Ensure INSERT permission for anon/service_role (for uploads)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Upload Access'
    ) THEN
        CREATE POLICY "Upload Access"
        ON storage.objects FOR INSERT
        WITH CHECK ( bucket_id = 'uploads' );
    END IF;
END
$$;
