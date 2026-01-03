-- AfriStart Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  university TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  role TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  is_onboarded BOOLEAN DEFAULT FALSE,
  verification_status TEXT CHECK (verification_status IN ('pending','approved','rejected')) DEFAULT 'approved',
  verification_method TEXT CHECK (verification_method IN ('email_domain','document','manual')) DEFAULT 'email_domain',
  verification_document_url TEXT,
  reviewed_by_email TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create startup_ideas table
CREATE TABLE IF NOT EXISTS startup_ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('idea', 'validation', 'mvp', 'growth')) DEFAULT 'idea',
  looking_for TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(requester_id, receiver_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create goals table for accountability
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Startup ideas policies
CREATE POLICY "Startup ideas are viewable by everyone" ON startup_ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own startup ideas" ON startup_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own startup ideas" ON startup_ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete startup ideas" ON startup_ideas
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Connections policies
CREATE POLICY "Users can view their own connections" ON connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert connection requests" ON connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connections they're part of" ON connections
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received (mark as read)" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Goals policies
CREATE POLICY "Users can view their own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Resources are viewable by everyone" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add resources" ON resources
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_user ON startup_ideas(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Admin allowlist table for elevated RLS checks
CREATE TABLE IF NOT EXISTS admin_emails (
  email TEXT PRIMARY KEY
);

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admin emails" ON admin_emails
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Helper function so RLS policies can check for admin privileges
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

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  note TEXT,
  reviewer_email TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
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

-- Storage bucket for verification documents
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

CREATE TRIGGER update_startup_ideas_updated_at
  BEFORE UPDATE ON startup_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Groups feature tables
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  university TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  role TEXT CHECK (role IN ('owner','member','moderator')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('idea','validation','mvp','growth')) DEFAULT 'idea',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS group_idea_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES group_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(idea_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_idea_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES group_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS group_idea_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES group_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('collaborator','lead','owner')) DEFAULT 'collaborator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(idea_id, user_id)
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_idea_members ENABLE ROW LEVEL SECURITY;

-- Groups policies (visibility open; write restricted)
CREATE POLICY "Groups are viewable by everyone" ON groups
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their groups" ON groups
  FOR UPDATE USING (auth.uid() = owner_id);

-- Membership policies
CREATE POLICY "Memberships viewable to group members and owner" ON group_memberships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = (SELECT owner_id FROM groups WHERE groups.id = group_memberships.group_id));

CREATE POLICY "Users can request membership" ON group_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update membership" ON group_memberships
  FOR UPDATE USING (auth.uid() = (SELECT owner_id FROM groups WHERE groups.id = group_memberships.group_id));

-- Group ideas policies
CREATE POLICY "Ideas viewable by everyone" ON group_ideas
  FOR SELECT USING (true);

CREATE POLICY "Group members can insert ideas" ON group_ideas
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
  );

CREATE POLICY "Authors can update their ideas" ON group_ideas
  FOR UPDATE USING (auth.uid() = author_id);

-- Votes
CREATE POLICY "Votes readable by group members" ON group_idea_votes
  FOR SELECT USING (true);

CREATE POLICY "Group members can vote" ON group_idea_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_memberships gm
      JOIN group_ideas gi ON gi.id = idea_id
      WHERE gm.group_id = gi.group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
  );

-- Comments
CREATE POLICY "Comments readable" ON group_idea_comments
  FOR SELECT USING (true);

CREATE POLICY "Group members can comment" ON group_idea_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_memberships gm
      JOIN group_ideas gi ON gi.id = idea_id
      WHERE gm.group_id = gi.group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
  );

-- Idea collaborators
CREATE OR REPLACE FUNCTION can_manage_idea_members(p_idea_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN
    EXISTS (
      SELECT 1 FROM group_memberships gm
      JOIN group_ideas gi ON gi.id = p_idea_id AND gm.group_id = gi.group_id
      WHERE gm.user_id = auth.uid() AND gm.status IN ('approved','pending')
    )
    OR auth.uid() = (SELECT author_id FROM group_ideas WHERE id = p_idea_id)
    OR auth.uid() = (
      SELECT g.owner_id FROM group_ideas gi
      JOIN groups g ON g.id = gi.group_id
      WHERE gi.id = p_idea_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Idea collaborators readable" ON group_idea_members
  FOR SELECT USING (true);

CREATE POLICY "Group members can manage idea membership" ON group_idea_members
  FOR INSERT WITH CHECK (can_manage_idea_members(idea_id));

CREATE POLICY "Group members can update idea membership" ON group_idea_members
  FOR UPDATE USING (can_manage_idea_members(idea_id))
  WITH CHECK (can_manage_idea_members(idea_id));

CREATE POLICY "Users can leave idea" ON group_idea_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR can_manage_idea_members(idea_id)
  );

-- Unvote and delete permissions
CREATE POLICY "Group members can unvote" ON group_idea_votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own group comments" ON group_idea_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete their group ideas" ON group_ideas
  FOR DELETE USING (
    auth.uid() = author_id
    OR auth.uid() = (SELECT owner_id FROM groups WHERE id = group_id)
  );

CREATE POLICY "Owners can delete their groups" ON groups
  FOR DELETE USING (auth.uid() = owner_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('message','group','idea','system','admin')) DEFAULT 'system',
  href TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email BOOLEAN DEFAULT TRUE,
  push BOOLEAN DEFAULT TRUE,
  messages BOOLEAN DEFAULT TRUE,
  mentions BOOLEAN DEFAULT TRUE,
  groups BOOLEAN DEFAULT TRUE,
  product BOOLEAN DEFAULT FALSE,
  digest BOOLEAN DEFAULT TRUE,
  priority BOOLEAN DEFAULT TRUE,
  quiet BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notification prefs" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their notification prefs" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notification prefs" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications(user_id, created_at DESC);

-- Function to handle new user creation (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, university)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'university', 'Not specified')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
