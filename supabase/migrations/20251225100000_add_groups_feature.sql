-- Groups feature tables and policies

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tables
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  university TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  role TEXT CHECK (role IN ('owner','member','moderator')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('idea','validation','mvp','growth')) DEFAULT 'idea',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.group_idea_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.group_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(idea_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_idea_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.group_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.group_idea_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.group_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('collaborator','lead','owner')) DEFAULT 'collaborator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(idea_id, user_id)
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_idea_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Groups are viewable by everyone" ON public.groups
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = owner_id);

-- Membership policies
CREATE POLICY "Memberships viewable to group members and owner" ON public.group_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = (SELECT owner_id FROM public.groups WHERE groups.id = group_memberships.group_id)
  );

CREATE POLICY "Users can request membership" ON public.group_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update membership" ON public.group_memberships
  FOR UPDATE USING (
    auth.uid() = (SELECT owner_id FROM public.groups WHERE groups.id = group_memberships.group_id)
  );

-- Group ideas policies
CREATE POLICY "Ideas viewable by everyone" ON public.group_ideas
  FOR SELECT USING (true);

CREATE POLICY "Group members can insert ideas" ON public.group_ideas
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
  );

CREATE POLICY "Authors can update their ideas" ON public.group_ideas
  FOR UPDATE USING (auth.uid() = author_id);

-- Votes
CREATE POLICY "Votes readable by group members" ON public.group_idea_votes
  FOR SELECT USING (true);

CREATE POLICY "Group members can vote" ON public.group_idea_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      JOIN public.group_ideas gi ON gi.id = idea_id
      WHERE gm.group_id = gi.group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
  );

-- Comments
CREATE POLICY "Comments readable" ON public.group_idea_comments
  FOR SELECT USING (true);

CREATE POLICY "Group members can comment" ON public.group_idea_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      JOIN public.group_ideas gi ON gi.id = idea_id
      WHERE gm.group_id = gi.group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
  );

-- Idea collaborators
CREATE POLICY "Idea collaborators readable" ON public.group_idea_members
  FOR SELECT USING (true);

CREATE POLICY "Group members can join idea" ON public.group_idea_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      JOIN public.group_ideas gi ON gi.id = idea_id
      WHERE gm.group_id = gi.group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
  );
