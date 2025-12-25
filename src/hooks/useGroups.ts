import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  university: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: { id: string; full_name: string | null };
  member_count?: number;
}

export type MembershipStatus = "pending" | "approved" | "rejected" | null;

export interface GroupIdea {
  id: string;
  group_id: string;
  author_id: string;
  title: string;
  description: string;
  stage: string;
  created_at: string;
  votes?: number;
  comments_count?: number;
  author?: { id: string; full_name: string | null };
  has_voted?: boolean;
  is_member?: boolean;
}

export interface GroupComment {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: { id: string; full_name: string | null };
}

// Groups list
export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async (): Promise<Group[]> => {
      const { data, error } = await supabase
        .from("groups")
        .select(
          `*, owner:profiles(id, full_name), member_count:group_memberships!group_memberships_group_id_fkey(count)`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching groups", error);
        return [];
      }

      return (data || []).map((g: any) => ({
        ...g,
        member_count: g.member_count?.[0]?.count ?? 0,
      }));
    },
  });
}

// Single group + membership status for current user
export function useGroup(groupId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["group", groupId, user?.id],
    queryFn: async () => {
      if (!groupId) return null;
      const [{ data: group }, { data: membership }] = await Promise.all([
        supabase
          .from("groups")
          .select("*, owner:profiles(id, full_name)")
          .eq("id", groupId)
          .single(),
        user
          ? supabase
              .from("group_memberships")
              .select("*")
              .eq("group_id", groupId)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return group
        ? {
            group,
            membership: membership ?? null,
          }
        : null;
    },
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("group_memberships")
        .select("*, user:profiles(id, full_name, university)")
        .eq("group_id", groupId);
      if (error) return [];
      return data || [];
    },
    enabled: !!groupId,
  });
}

export function useGroupIdeas(groupId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["group-ideas", groupId, user?.id],
    queryFn: async (): Promise<GroupIdea[]> => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("group_ideas")
        .select(
          `*, author:profiles(id, full_name), votes:group_idea_votes(user_id), comments:group_idea_comments(count), idea_members:group_idea_members(user_id)`
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching group ideas", error);
        return [];
      }

      return (data || []).map((idea: any) => ({
        ...idea,
        votes: idea.votes?.length ?? 0,
        comments_count: idea.comments?.[0]?.count ?? 0,
        has_voted: !!idea.votes?.find((v: any) => v.user_id === user?.id),
        is_member: !!idea.idea_members?.find((m: any) => m.user_id === user?.id),
      }));
    },
    enabled: !!groupId,
  });
}

export function useGroupIdeaComments(ideaId: string | null) {
  return useQuery({
    queryKey: ["group-idea-comments", ideaId],
    queryFn: async (): Promise<GroupComment[]> => {
      if (!ideaId) return [];
      const { data, error } = await supabase
        .from("group_idea_comments")
        .select("*, user:profiles(id, full_name)")
        .eq("idea_id", ideaId)
        .order("created_at", { ascending: true });
      if (error) return [];
      return data || [];
    },
    enabled: !!ideaId,
  });
}

// Mutations
export function useCreateGroup() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description, university }: { name: string; description?: string; university?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name,
          description: description || null,
          university: university || profile?.university,
          owner_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      // Owner gets approved membership
      await supabase.from("group_memberships").insert({
        group_id: data.id,
        user_id: user.id,
        status: "approved",
        role: "owner",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useRequestGroupMembership() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId }: { groupId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_memberships")
        .insert({ group_id: groupId, user_id: user.id, status: "pending", role: "member" });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group", vars.groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-members", vars.groupId] });
    },
  });
}

export function useApproveMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ membershipId, status }: { membershipId: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("group_memberships")
        .update({ status })
        .eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group", vars.membershipId] });
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
    },
  });
}

export function useCreateGroupIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, title, description, stage }: { groupId: string; title: string; description: string; stage: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("group_ideas")
        .insert({ group_id: groupId, author_id: user.id, title, description, stage })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group-ideas", vars.groupId] });
    },
  });
}

export function useVoteIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideaId }: { ideaId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_idea_votes")
        .upsert({ idea_id: ideaId, user_id: user.id }, { onConflict: "idea_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-ideas"] });
    },
  });
}

export function useUnvoteIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideaId }: { ideaId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_idea_votes")
        .delete()
        .eq("idea_id", ideaId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-ideas"] });
    },
  });
}

export function useJoinIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideaId }: { ideaId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_idea_members")
        .upsert({ idea_id: ideaId, user_id: user.id, role: "collaborator" }, { onConflict: "idea_id,user_id" });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group-ideas"] });
    },
  });
}

export function useLeaveIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideaId }: { ideaId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_idea_members")
        .delete()
        .eq("idea_id", ideaId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group-ideas"] });
    },
  });
}

export function useCommentOnIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideaId, content }: { ideaId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_idea_comments")
        .insert({ idea_id: ideaId, user_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group-idea-comments", vars.ideaId] });
      queryClient.invalidateQueries({ queryKey: ["group-ideas"] });
    },
  });
}

export function useDeleteComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, ideaId }: { commentId: string; ideaId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_idea_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group-idea-comments", vars.ideaId] });
      queryClient.invalidateQueries({ queryKey: ["group-ideas"] });
    },
  });
}

export function useDeleteIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideaId, groupId }: { ideaId: string; groupId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_ideas")
        .delete()
        .eq("id", ideaId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group-ideas", vars.groupId] });
    },
  });
}
