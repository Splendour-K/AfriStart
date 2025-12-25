-- Add verification metadata to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending','approved','rejected')) DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('email_domain','document','manual')) DEFAULT 'email_domain',
  ADD COLUMN IF NOT EXISTS verification_document_url TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by_email TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Admin allowlist table
CREATE TABLE IF NOT EXISTS admin_emails (
  email TEXT PRIMARY KEY
);

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage admin emails" ON admin_emails
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  note TEXT,
  reviewer_email TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING ((auth.jwt() ->> 'email') IN (SELECT email FROM admin_emails));

CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING ((auth.jwt() ->> 'email') IN (SELECT email FROM admin_emails))
  WITH CHECK ((auth.jwt() ->> 'email') IN (SELECT email FROM admin_emails));

-- Allow admins to update verification fields on profiles
CREATE POLICY "Admins can update verification fields" ON profiles
  FOR UPDATE USING ((auth.jwt() ->> 'email') IN (SELECT email FROM admin_emails))
  WITH CHECK ((auth.jwt() ->> 'email') IN (SELECT email FROM admin_emails));
