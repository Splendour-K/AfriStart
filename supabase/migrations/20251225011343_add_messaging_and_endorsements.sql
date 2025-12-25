-- ============================================
-- STARTUP IDEAS TABLE
-- ============================================

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
  ON public.startup_ideas FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ideas" 
  ON public.startup_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" 
  ON public.startup_ideas FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" 
  ON public.startup_ideas FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations" 
  ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ============================================
-- FIX MESSAGES TABLE - Drop and recreate if needed
-- ============================================

-- Drop the old messages table if it exists (it had wrong schema)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create messages table with correct schema
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their conversations" 
  ON public.messages FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- ============================================
-- ENDORSEMENTS TABLE
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
  ON public.endorsements FOR SELECT USING (true);

CREATE POLICY "Users can create endorsements" 
  ON public.endorsements FOR INSERT 
  WITH CHECK (auth.uid() = endorser_id AND auth.uid() != endorsed_id);

CREATE POLICY "Users can delete their own endorsements" 
  ON public.endorsements FOR DELETE USING (auth.uid() = endorser_id);
