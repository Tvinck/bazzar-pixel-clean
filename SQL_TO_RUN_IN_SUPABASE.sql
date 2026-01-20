-- Execute this in Supabase Dashboard -> SQL Editor
-- This creates the missing table for async generation jobs

-- 1. Create Table (generation_jobs)
CREATE TABLE IF NOT EXISTS public.generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    job_type TEXT NOT NULL DEFAULT 'image',
    prompt TEXT,
    model_id TEXT,
    configuration JSONB DEFAULT '{}'::jsonb,
    source_files TEXT[],
    result_url TEXT,
    error_message TEXT,
    defapi_task_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON public.generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON public.generation_jobs(status);

-- 3. Permissions for generation_jobs
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.generation_jobs TO anon, authenticated, service_role;

-- Policy to allow everything
DROP POLICY IF EXISTS "Enable read/write for all" ON public.generation_jobs;
CREATE POLICY "Enable read/write for all" ON public.generation_jobs FOR ALL USING (true);


-- ==========================================
-- FIX FOR CREATIONS TABLE (Error 42501)
-- ==========================================

-- 1. Ensure RLS is enabled (so policies work)
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to roles
GRANT ALL ON public.creations TO anon, authenticated, service_role;

-- 3. Create permissive policies for Dev/App usage
-- Allow Insert
DROP POLICY IF EXISTS "Enable insert for all" ON public.creations;
CREATE POLICY "Enable insert for all" ON public.creations FOR INSERT WITH CHECK (true);

-- Allow Select (View)
DROP POLICY IF EXISTS "Enable select for all" ON public.creations;
CREATE POLICY "Enable select for all" ON public.creations FOR SELECT USING (true);

-- Allow Update (e.g. likes/views)
DROP POLICY IF EXISTS "Enable update for all" ON public.creations;
CREATE POLICY "Enable update for all" ON public.creations FOR UPDATE USING (true);
