import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Profile, Connection } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// Calculate match score between two profiles
export function calculateMatchScore(currentUser: Profile, otherUser: Profile): number {
  let score = 0;
  let maxScore = 0;

  // Skill complementarity (25 points max)
  // Users with DIFFERENT skills are better matches (complementary)
  maxScore += 25;
  if (currentUser.skills && otherUser.skills) {
    const currentSkills = new Set(currentUser.skills);
    const otherSkills = new Set(otherUser.skills);
    const differentSkills = otherUser.skills.filter(s => !currentSkills.has(s));
    const complementaryRatio = differentSkills.length / Math.max(otherUser.skills.length, 1);
    score += Math.round(complementaryRatio * 25);
  }

  // Shared interests (30 points max)
  // Users with SAME interests are better matches (aligned vision)
  maxScore += 30;
  if (currentUser.interests && otherUser.interests) {
    const currentInterests = new Set(currentUser.interests);
    const sharedInterests = otherUser.interests.filter(i => currentInterests.has(i));
    const overlapRatio = sharedInterests.length / Math.max(currentUser.interests.length, 1);
    score += Math.round(overlapRatio * 30);
  }

  // Same university bonus (15 points)
  maxScore += 15;
  if (currentUser.university && otherUser.university) {
    if (currentUser.university.toLowerCase() === otherUser.university.toLowerCase()) {
      score += 15;
    } else {
      // Partial match for same country universities
      score += 5;
    }
  }

  // Role compatibility (20 points max)
  maxScore += 20;
  if (currentUser.role && otherUser.role) {
    const lookingForCofounder = ['Looking for a co-founder', 'Looking for team members'];
    const readyToJoin = ['Ready to join as co-founder'];
    
    // Perfect match: one looking, one ready to join
    if (
      (lookingForCofounder.includes(currentUser.role) && readyToJoin.includes(otherUser.role)) ||
      (readyToJoin.includes(currentUser.role) && lookingForCofounder.includes(otherUser.role))
    ) {
      score += 20;
    } else if (lookingForCofounder.includes(currentUser.role) && lookingForCofounder.includes(otherUser.role)) {
      // Both looking - decent match
      score += 12;
    }
  }

  // Profile completeness bonus (10 points)
  maxScore += 10;
  const otherCompleteness = calculateProfileCompleteness(otherUser);
  score += Math.round(otherCompleteness * 0.1);

  // Calculate percentage
  return Math.round((score / maxScore) * 100);
}

// Calculate profile completeness percentage
export function calculateProfileCompleteness(profile: Profile): number {
  let completed = 0;
  let total = 8;

  if (profile.full_name) completed++;
  if (profile.university) completed++;
  if (profile.bio && profile.bio.length > 20) completed++;
  if (profile.skills && profile.skills.length > 0) completed++;
  if (profile.interests && profile.interests.length > 0) completed++;
  if (profile.role) completed++;
  if (profile.linkedin_url || profile.twitter_url || profile.website_url) completed++;
  if (profile.avatar_url) completed++;

  return Math.round((completed / total) * 100);
}

// Match result with score
export interface MatchedProfile extends Profile {
  matchScore: number;
  sharedInterests: string[];
  complementarySkills: string[];
}

// Hook to fetch potential co-founder matches
export function useCofounderMatches(limit: number = 10) {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['cofounder-matches', user?.id, limit],
    queryFn: async (): Promise<MatchedProfile[]> => {
      if (!user || !profile) return [];

      // Fetch all profiles except current user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_onboarded', true);

      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }

      if (!profiles || profiles.length === 0) return [];

      // Calculate match scores and enrich data
      const matchedProfiles: MatchedProfile[] = profiles.map((p: Profile) => {
        const matchScore = calculateMatchScore(profile, p);
        
        // Find shared interests
        const currentInterests = new Set(profile.interests || []);
        const sharedInterests = (p.interests || []).filter(i => currentInterests.has(i));
        
        // Find complementary skills
        const currentSkills = new Set(profile.skills || []);
        const complementarySkills = (p.skills || []).filter(s => !currentSkills.has(s));

        return {
          ...p,
          matchScore,
          sharedInterests,
          complementarySkills,
        };
      });

      // Sort by match score descending
      matchedProfiles.sort((a, b) => b.matchScore - a.matchScore);

      return matchedProfiles.slice(0, limit);
    },
    enabled: !!user && !!profile,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Hook to fetch user's connections
export function useConnections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user) return { pending: [], accepted: [], sent: [] };

      // Fetch connections where user is requester or receiver
      const { data: connections, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(*),
          receiver:profiles!connections_receiver_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching connections:', error);
        return { pending: [], accepted: [], sent: [] };
      }

      // Categorize connections
      const pending = connections?.filter(
        (c: any) => c.status === 'pending' && c.receiver_id === user.id
      ) || [];
      
      const sent = connections?.filter(
        (c: any) => c.status === 'pending' && c.requester_id === user.id
      ) || [];
      
      const accepted = connections?.filter(
        (c: any) => c.status === 'accepted'
      ) || [];

      return { pending, accepted, sent };
    },
    enabled: !!user,
  });
}

// Hook to send connection request
export function useSendConnectionRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          receiver_id: receiverId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['cofounder-matches'] });
    },
  });
}

// Hook to respond to connection request
export function useRespondToConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: 'accepted' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

// Hook to fetch user's goals
export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching goals:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });
}

// Hook to create a goal
export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: { title: string; description?: string; due_date?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// Hook to update a goal
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; description?: string; due_date?: string; status?: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// Hook to delete a goal
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// Hook to fetch startup ideas
export function useStartupIdeas(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['startup-ideas', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('startup_ideas')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching startup ideas:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!targetUserId,
  });
}

// Hook to create a startup idea
export function useCreateStartupIdea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idea: { 
      title: string; 
      description: string; 
      industry: string; 
      stage?: string;
      looking_for?: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('startup_ideas')
        .insert({
          ...idea,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startup-ideas'] });
    },
  });
}

// Hook to get dashboard stats
export function useDashboardStats() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get potential matches count
      const { count: matchesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('id', user.id)
        .eq('is_onboarded', true);

      // Get active goals count
      const { count: goalsCount } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'completed');

      // Get connections count
      const { count: connectionsCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      // Calculate profile completeness
      const profileCompleteness = profile ? calculateProfileCompleteness(profile) : 0;

      return {
        potentialMatches: matchesCount || 0,
        activeGoals: goalsCount || 0,
        connections: connectionsCount || 0,
        profileCompleteness,
      };
    },
    enabled: !!user,
  });
}
