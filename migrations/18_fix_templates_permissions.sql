-- Fix permissions for templates table
-- Ensure RLS is enabled
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Grant table-level permissions to standard Supabase roles
GRANT SELECT ON TABLE public.templates TO anon, authenticated, service_role;

-- Re-define the public read policy to ensure it catches all roles
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON public.templates;

CREATE POLICY "Templates are viewable by everyone" 
ON public.templates 
FOR SELECT 
TO public 
USING (true);
