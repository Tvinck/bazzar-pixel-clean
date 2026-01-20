-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- e.g. 'order_status_update', 'money_withdrawal'
    details JSONB, -- e.g. { "order_id": 123, "old_status": "pending", "new_status": "done" }
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Staff can INSERT logs
CREATE POLICY "Staff can insert logs" 
ON audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Policy: Only Admin can VIEW logs (Assuming 'is_admin' column exists or metadata check)
-- Ideally profiles table has role column
-- CREATE POLICY "Admins can view logs" ON audit_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Add role column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';
-- CHECK (role IN ('staff', 'manager', 'admin'));

-- 6. Helper function to check admin (for RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
