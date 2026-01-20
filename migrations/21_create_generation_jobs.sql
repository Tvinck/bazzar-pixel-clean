-- Migration: Create Generation Jobs Queue System
-- Purpose: Enable async processing of AI generations to prevent timeouts

-- Drop existing table if exists (for clean re-run)
DROP TABLE IF EXISTS public.generation_jobs CASCADE;

-- Create generation_jobs table
CREATE TABLE public.generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Job Metadata
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    job_type TEXT NOT NULL DEFAULT 'image' CHECK (job_type IN ('image', 'video', 'audio', 'template')),
    
    -- Generation Parameters
    prompt TEXT,
    model_id TEXT,
    configuration JSONB DEFAULT '{}'::jsonb,
    source_files TEXT[], -- Array of URLs
    
    -- Results
    result_url TEXT,
    error_message TEXT,
    
    -- DefAPI Task ID (for polling)
    defapi_task_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_generation_jobs_user_id ON public.generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_status ON public.generation_jobs(status);
CREATE INDEX idx_generation_jobs_created_at ON public.generation_jobs(created_at DESC);
CREATE INDEX idx_generation_jobs_defapi_task_id ON public.generation_jobs(defapi_task_id) WHERE defapi_task_id IS NOT NULL;

-- RLS Policies
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
    ON public.generation_jobs
    FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE telegram_id = current_setting('request.jwt.claim.sub', true)::bigint));

-- Users can insert their own jobs
CREATE POLICY "Users can create jobs"
    ON public.generation_jobs
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE telegram_id = current_setting('request.jwt.claim.sub', true)::bigint));

-- Service role can update any job (for backend processing)
CREATE POLICY "Service can update jobs"
    ON public.generation_jobs
    FOR UPDATE
    USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.generation_jobs TO anon, authenticated;
GRANT ALL ON public.generation_jobs TO service_role;

-- Function to clean up old completed jobs (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.generation_jobs
    WHERE status IN ('completed', 'failed')
    AND completed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.generation_jobs IS 'Queue system for async AI generation processing';
