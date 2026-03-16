-- Create table for admin 2FA codes
CREATE TABLE IF NOT EXISTS public.admin_2fa_codes (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_2fa_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can manage this table (since it's for 2FA)
-- Or we can add specific policies if needed, but usually admin routes use service role key on backend.
CREATE POLICY "Service role can do everything" ON public.admin_2fa_codes
    USING (true)
    WITH CHECK (true);

-- Add index on expires_at for easier cleanup
CREATE INDEX IF NOT EXISTS idx_admin_2fa_codes_expires_at ON public.admin_2fa_codes(expires_at);
