-- Ensure permissive policies for joining idea workspaces (insert/update) and keeping delete allowances

-- Predicate reused for insert/update
CREATE OR REPLACE FUNCTION public.can_manage_idea_members(p_idea_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      JOIN public.group_ideas gi ON gi.id = p_idea_id AND gm.group_id = gi.group_id
      WHERE gm.user_id = auth.uid() AND gm.status = 'approved'
    )
    OR auth.uid() = (SELECT author_id FROM public.group_ideas WHERE id = p_idea_id)
    OR auth.uid() = (
      SELECT g.owner_id FROM public.group_ideas gi
      JOIN public.groups g ON g.id = gi.group_id
      WHERE gi.id = p_idea_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert policy
DROP POLICY IF EXISTS "Group members can manage idea membership" ON public.group_idea_members;
CREATE POLICY "Group members can manage idea membership" ON public.group_idea_members
  FOR INSERT
  WITH CHECK (public.can_manage_idea_members(idea_id));

-- Update policy (covers upsert on conflict)
DROP POLICY IF EXISTS "Group members can update idea membership" ON public.group_idea_members;
CREATE POLICY "Group members can update idea membership" ON public.group_idea_members
  FOR UPDATE
  USING (public.can_manage_idea_members(idea_id))
  WITH CHECK (public.can_manage_idea_members(idea_id));

-- Leave policy (delete)
DROP POLICY IF EXISTS "Users can leave idea" ON public.group_idea_members;
CREATE POLICY "Users can leave idea" ON public.group_idea_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR public.can_manage_idea_members(idea_id)
  );

-- Unvote (delete)
DROP POLICY IF EXISTS "Group members can unvote" ON public.group_idea_votes;
CREATE POLICY "Group members can unvote" ON public.group_idea_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Delete own comments
DROP POLICY IF EXISTS "Users can delete own group comments" ON public.group_idea_comments;
CREATE POLICY "Users can delete own group comments" ON public.group_idea_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Delete group ideas
DROP POLICY IF EXISTS "Authors can delete their group ideas" ON public.group_ideas;
CREATE POLICY "Authors can delete their group ideas" ON public.group_ideas
  FOR DELETE USING (
    auth.uid() = author_id
    OR auth.uid() = (SELECT owner_id FROM public.groups WHERE id = group_id)
  );

-- Delete groups
DROP POLICY IF EXISTS "Owners can delete their groups" ON public.groups;
CREATE POLICY "Owners can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = owner_id);

-- Delete messages
DROP POLICY IF EXISTS "Senders can delete messages" ON public.messages;
CREATE POLICY "Senders can delete messages" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Delete startup ideas (idempotent)
DROP POLICY IF EXISTS "Users can delete their own startup ideas" ON public.startup_ideas;
CREATE POLICY "Users can delete their own startup ideas" ON public.startup_ideas
  FOR DELETE USING (auth.uid() = user_id);
