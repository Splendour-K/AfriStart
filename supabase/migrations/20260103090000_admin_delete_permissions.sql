-- Ensure admin allowlist infrastructure exists for elevated RLS checks
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage admin emails" ON public.admin_emails;
CREATE POLICY "Service role can manage admin emails" ON public.admin_emails
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE email = auth.email()
  );
$$;

-- Allow admins to delete any startup idea
DROP POLICY IF EXISTS "Users can delete their own startup ideas" ON public.startup_ideas;
DROP POLICY IF EXISTS "Users or admins can delete startup ideas" ON public.startup_ideas;

CREATE POLICY "Users or admins can delete startup ideas" ON public.startup_ideas
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
