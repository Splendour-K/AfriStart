-- Adjust group_idea_members insert policy to permit group owner/idea author and allow leaving
DROP POLICY IF EXISTS "Group members can join idea" ON public.group_idea_members;
DROP POLICY IF EXISTS "Group members can manage idea membership" ON public.group_idea_members;

CREATE POLICY "Group members can manage idea membership" ON public.group_idea_members
  FOR INSERT WITH CHECK (
    -- Approved group member
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      JOIN public.group_ideas gi ON gi.id = idea_id
      WHERE gm.group_id = gi.group_id AND gm.user_id = auth.uid() AND gm.status = 'approved'
    )
    OR
    -- Idea author
    auth.uid() = (SELECT author_id FROM public.group_ideas gi WHERE gi.id = idea_id)
    OR
    -- Group owner
    auth.uid() = (
      SELECT g.owner_id FROM public.group_ideas gi
      JOIN public.groups g ON g.id = gi.group_id
      WHERE gi.id = idea_id
    )
  );

DROP POLICY IF EXISTS "Users can leave idea" ON public.group_idea_members;
CREATE POLICY "Users can leave idea" ON public.group_idea_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() = (SELECT author_id FROM public.group_ideas gi WHERE gi.id = idea_id)
    OR auth.uid() = (
      SELECT g.owner_id FROM public.group_ideas gi
      JOIN public.groups g ON g.id = gi.group_id
      WHERE gi.id = idea_id
    )
  );

-- Allow unvoting
DROP POLICY IF EXISTS "Group members can unvote" ON public.group_idea_votes;
CREATE POLICY "Group members can unvote" ON public.group_idea_votes
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Allow deleting own comments
DROP POLICY IF EXISTS "Users can delete own group comments" ON public.group_idea_comments;
CREATE POLICY "Users can delete own group comments" ON public.group_idea_comments
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete their group ideas" ON public.group_ideas;
CREATE POLICY "Authors can delete their group ideas" ON public.group_ideas
  FOR DELETE USING (
    auth.uid() = author_id
    OR auth.uid() = (
      SELECT g.owner_id FROM public.groups g WHERE g.id = group_id
    )
  );

-- Allow group owners to delete their groups
DROP POLICY IF EXISTS "Owners can delete their groups" ON public.groups;
CREATE POLICY "Owners can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = owner_id);

-- Messages: allow senders to delete their messages
DROP POLICY IF EXISTS "Senders can delete messages" ON public.messages;
CREATE POLICY "Senders can delete messages" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Resources: allow creator to delete (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'resources'
  ) THEN
    DROP POLICY IF EXISTS "Creators can delete resources" ON public.resources;
    CREATE POLICY "Creators can delete resources" ON public.resources
      FOR DELETE USING (auth.uid() = created_by);
  END IF;
END $$;

-- Startup ideas: ensure delete by owner (already present in some migrations; add idempotent)
DROP POLICY IF EXISTS "Users can delete their own startup ideas" ON public.startup_ideas;
CREATE POLICY "Users can delete their own startup ideas" ON public.startup_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Group idea comments/ votes covered; group idea members delete policy already added
