-- Align startup_ideas schema with application requirements
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'startup_ideas' AND column_name = 'industry'
  ) THEN
    ALTER TABLE public.startup_ideas RENAME COLUMN industry TO category;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'startup_ideas' AND column_name = 'stage'
  ) THEN
    ALTER TABLE public.startup_ideas DROP COLUMN stage;
  END IF;
END $$;

ALTER TABLE public.startup_ideas
  ALTER COLUMN category SET NOT NULL;

-- Ensure updated_at helper exists for triggers referenced below
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Idea likes ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.idea_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(idea_id, user_id)
);

ALTER TABLE public.idea_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Idea likes are viewable by everyone" ON public.idea_likes;
DROP POLICY IF EXISTS "Users can like ideas" ON public.idea_likes;
DROP POLICY IF EXISTS "Users can unlike their ideas" ON public.idea_likes;

CREATE POLICY "Idea likes are viewable by everyone" ON public.idea_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like ideas" ON public.idea_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their ideas" ON public.idea_likes
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_idea_likes_idea ON public.idea_likes(idea_id);

-- Idea comments ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.idea_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Idea comments are viewable" ON public.idea_comments;
DROP POLICY IF EXISTS "Users can comment on ideas" ON public.idea_comments;
DROP POLICY IF EXISTS "Users can update their idea comments" ON public.idea_comments;
DROP POLICY IF EXISTS "Users can delete their idea comments" ON public.idea_comments;

CREATE POLICY "Idea comments are viewable" ON public.idea_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can comment on ideas" ON public.idea_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their idea comments" ON public.idea_comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete idea comments" ON public.idea_comments
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_idea_comments_idea ON public.idea_comments(idea_id);

-- Trigger to maintain updated_at on comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_table = 'idea_comments'
      AND trigger_name = 'update_idea_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_idea_comments_updated_at
      BEFORE UPDATE ON public.idea_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
