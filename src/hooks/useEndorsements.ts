import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Endorsement {
  id: string;
  endorser_id: string;
  endorsed_id: string;
  skill: string;
  created_at: string;
  endorser?: {
    full_name: string;
    university: string;
  };
}

export interface SkillWithEndorsements {
  skill: string;
  count: number;
  endorsers: { id: string; full_name: string }[];
  endorsedByCurrentUser: boolean;
}

// Fetch endorsements for a user
export function useEndorsements(userId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["endorsements", userId],
    queryFn: async (): Promise<SkillWithEndorsements[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("endorsements")
        .select(`
          *,
          endorser:profiles!endorsements_endorser_id_fkey(id, full_name)
        `)
        .eq("endorsed_id", userId);

      if (error) {
        console.error("Error fetching endorsements:", error);
        return [];
      }

      // Group by skill
      const skillMap = new Map<string, SkillWithEndorsements>();

      (data || []).forEach((endorsement: any) => {
        const existing = skillMap.get(endorsement.skill);
        if (existing) {
          existing.count++;
          existing.endorsers.push({
            id: endorsement.endorser.id,
            full_name: endorsement.endorser.full_name,
          });
          if (endorsement.endorser_id === user?.id) {
            existing.endorsedByCurrentUser = true;
          }
        } else {
          skillMap.set(endorsement.skill, {
            skill: endorsement.skill,
            count: 1,
            endorsers: [{
              id: endorsement.endorser.id,
              full_name: endorsement.endorser.full_name,
            }],
            endorsedByCurrentUser: endorsement.endorser_id === user?.id,
          });
        }
      });

      return Array.from(skillMap.values()).sort((a, b) => b.count - a.count);
    },
    enabled: !!userId,
    retry: 2,
    retryDelay: 1000,
  });
}

// Endorse a skill
export function useEndorseSkill() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ endorsedId, skill }: { endorsedId: string; skill: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (user.id === endorsedId) throw new Error("Cannot endorse your own skills");

      const { data, error } = await supabase
        .from("endorsements")
        .insert({
          endorser_id: user.id,
          endorsed_id: endorsedId,
          skill,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["endorsements", variables.endorsedId] });
    },
  });
}

// Remove an endorsement
export function useRemoveEndorsement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ endorsedId, skill }: { endorsedId: string; skill: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("endorsements")
        .delete()
        .eq("endorser_id", user.id)
        .eq("endorsed_id", endorsedId)
        .eq("skill", skill);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["endorsements", variables.endorsedId] });
    },
  });
}

// Get my endorsement stats
export function useMyEndorsementStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-endorsements", user?.id],
    queryFn: async () => {
      if (!user) return { received: 0, given: 0 };

      const [receivedResult, givenResult] = await Promise.all([
        supabase
          .from("endorsements")
          .select("*", { count: "exact", head: true })
          .eq("endorsed_id", user.id),
        supabase
          .from("endorsements")
          .select("*", { count: "exact", head: true })
          .eq("endorser_id", user.id),
      ]);

      return {
        received: receivedResult.count || 0,
        given: givenResult.count || 0,
      };
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
  });
}
