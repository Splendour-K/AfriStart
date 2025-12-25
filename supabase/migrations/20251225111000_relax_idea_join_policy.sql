-- Redefine helper function (drop after policies are removed to avoid dependency errors)
DO $$
BEGIN
  -- Drop dependent policies first (pg_policies column is policyname)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Group members can manage idea membership') THEN
    DROP POLICY "Group members can manage idea membership" ON public.group_idea_members;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Group members can update idea membership') THEN
    DROP POLICY "Group members can update idea membership" ON public.group_idea_members;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can leave idea') THEN
    DROP POLICY "Users can leave idea" ON public.group_idea_members;
  END IF;

  -- Drop and recreate function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_manage_idea_members') THEN
    DROP FUNCTION public.can_manage_idea_members(uuid);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.can_manage_idea_members(p_idea_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      JOIN public.group_ideas gi ON gi.id = p_idea_id AND gm.group_id = gi.group_id
      WHERE gm.user_id = auth.uid() AND gm.status IN ('approved','pending')
    )
    OR auth.uid() = (SELECT author_id FROM public.group_ideas WHERE id = p_idea_id)
    OR auth.uid() = (
      SELECT g.owner_id FROM public.group_ideas gi
      JOIN public.groups g ON g.id = gi.group_id
      WHERE gi.id = p_idea_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh policies to use updated predicate
CREATE POLICY "Group members can manage idea membership" ON public.group_idea_members
  FOR INSERT
  WITH CHECK (public.can_manage_idea_members(idea_id));

CREATE POLICY "Group members can update idea membership" ON public.group_idea_members
  FOR UPDATE
  USING (public.can_manage_idea_members(idea_id))
  WITH CHECK (public.can_manage_idea_members(idea_id));

CREATE POLICY "Users can leave idea" ON public.group_idea_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR public.can_manage_idea_members(idea_id)
  );
