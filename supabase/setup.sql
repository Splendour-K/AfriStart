-- AfriStart Database Setup (Run this in Supabase SQL Editor)
-- Step 1: Create the profiles table

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Step 4: Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, university)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'university', 'Not specified')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger that runs when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Done! Your signup should now work.


CREATE TABLE IF NOT EXISTS public.startup_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  looking_for TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.startup_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ideas are viewable by everyone" ON public.startup_ideas;
DROP POLICY IF EXISTS "Users can insert their own ideas" ON public.startup_ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON public.startup_ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON public.startup_ideas;

CREATE POLICY "Ideas are viewable by everyone" 
  ON public.startup_ideas FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own ideas" 
  ON public.startup_ideas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" 
  ON public.startup_ideas FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete ideas" 
  ON public.startup_ideas FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- Idea likes table and policies
CREATE TABLE IF NOT EXISTS public.idea_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

ALTER TABLE public.idea_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Idea likes are viewable by everyone" ON public.idea_likes;
DROP POLICY IF EXISTS "Users can like ideas" ON public.idea_likes;
DROP POLICY IF EXISTS "Users can unlike their ideas" ON public.idea_likes;

CREATE POLICY "Idea likes are viewable by everyone"
  ON public.idea_likes FOR SELECT USING (true);

CREATE POLICY "Users can like ideas"
  ON public.idea_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their ideas"
  ON public.idea_likes FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Idea comments table and policies
CREATE TABLE IF NOT EXISTS public.idea_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Idea comments are viewable" ON public.idea_comments;
DROP POLICY IF EXISTS "Users can comment on ideas" ON public.idea_comments;
DROP POLICY IF EXISTS "Users can update their idea comments" ON public.idea_comments;
DROP POLICY IF EXISTS "Users can delete their idea comments" ON public.idea_comments;

CREATE POLICY "Idea comments are viewable" 
  ON public.idea_comments FOR SELECT USING (true);

CREATE POLICY "Users can comment on ideas" 
  ON public.idea_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their idea comments" 
  ON public.idea_comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their idea comments" 
  ON public.idea_comments FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
-- ============================================
-- MESSAGES TABLE (Real-time Chat)
-- ============================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversation policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations" 
  ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Message policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.messages FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================
-- SKILL ENDORSEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endorsed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(endorser_id, endorsed_id, skill)
);

ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Endorsements are viewable by everyone" ON public.endorsements;
DROP POLICY IF EXISTS "Users can create endorsements" ON public.endorsements;
DROP POLICY IF EXISTS "Users can delete their own endorsements" ON public.endorsements;

CREATE POLICY "Endorsements are viewable by everyone" 
  ON public.endorsements FOR SELECT 
  USING (true);

CREATE POLICY "Users can create endorsements" 
  ON public.endorsements FOR INSERT 
  WITH CHECK (auth.uid() = endorser_id AND auth.uid() != endorsed_id);

CREATE POLICY "Users can delete their own endorsements" 
  ON public.endorsements FOR DELETE 
  USING (auth.uid() = endorser_id);

-- ============================================
-- ADMIN ALLOWLIST + HELPER
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admin emails" 
  ON public.admin_emails FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

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
