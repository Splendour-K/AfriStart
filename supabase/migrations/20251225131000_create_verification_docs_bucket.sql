-- Ensure verification-docs storage bucket exists and is secured
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload verification docs'
  ) THEN
    CREATE POLICY "Users can upload verification docs" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'verification-docs' AND auth.uid() = owner);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can read own verification docs'
  ) THEN
    CREATE POLICY "Users can read own verification docs" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'verification-docs' AND (auth.uid() = owner));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can read verification docs'
  ) THEN
    CREATE POLICY "Admins can read verification docs" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'verification-docs'
        AND (
          auth.uid() = owner
          OR auth.email() IN (SELECT email FROM admin_emails)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update verification docs'
  ) THEN
    CREATE POLICY "Users can update verification docs" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'verification-docs' AND auth.uid() = owner)
      WITH CHECK (bucket_id = 'verification-docs' AND auth.uid() = owner);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete verification docs'
  ) THEN
    CREATE POLICY "Users can delete verification docs" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'verification-docs' AND auth.uid() = owner);
  END IF;
END
$$;
