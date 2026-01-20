CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    user_email TEXT,
    user_id UUID,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert by anyone (including anon for login failures)
CREATE POLICY "Allow public insert to security_logs" ON security_logs 
    FOR INSERT 
    WITH CHECK (true);

-- Allow admins/staff to view
CREATE POLICY "Allow viewing security_logs" ON security_logs 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
