import { supabase, Profile } from './supabase';

// ============================================
// PROFILES API
// ============================================

export const profilesApi = {
  // Get all profiles (for discovery)
  async getAll(excludeUserId?: string) {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_onboarded', true);
    
    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data as Profile[] | null, error };
  },

  // Get profile by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as Profile | null, error };
  },

  // Search profiles by skills or interests
  async search(query: string, filters?: { skills?: string[]; interests?: string[]; university?: string }) {
    let dbQuery = supabase
      .from('profiles')
      .select('*')
      .eq('is_onboarded', true);

    if (query) {
      dbQuery = dbQuery.or(`full_name.ilike.%${query}%,university.ilike.%${query}%,bio.ilike.%${query}%`);
    }

    if (filters?.university) {
      dbQuery = dbQuery.ilike('university', `%${filters.university}%`);
    }

    if (filters?.skills && filters.skills.length > 0) {
      dbQuery = dbQuery.overlaps('skills', filters.skills);
    }

    if (filters?.interests && filters.interests.length > 0) {
      dbQuery = dbQuery.overlaps('interests', filters.interests);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });
    return { data: data as Profile[] | null, error };
  },

  // Calculate match score between two profiles
  calculateMatchScore(userProfile: Profile, otherProfile: Profile): number {
    let score = 0;
    const maxScore = 100;

    // Skills complement (different skills = good for co-founder)
    const userSkills = userProfile.skills || [];
    const otherSkills = otherProfile.skills || [];
    const differentSkills = otherSkills.filter(s => !userSkills.includes(s));
    score += Math.min(differentSkills.length * 10, 30);

    // Shared interests (similar interests = good alignment)
    const userInterests = userProfile.interests || [];
    const otherInterests = otherProfile.interests || [];
    const sharedInterests = userInterests.filter(i => otherInterests.includes(i));
    score += Math.min(sharedInterests.length * 15, 45);

    // Same university bonus
    if (userProfile.university === otherProfile.university) {
      score += 15;
    }

    // Profile completeness bonus
    if (otherProfile.bio && otherProfile.bio.length > 50) score += 5;
    if (otherProfile.linkedin_url) score += 5;

    return Math.min(score, maxScore);
  }
};

// ============================================
// CONNECTIONS API
// ============================================

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  requester?: Profile;
  receiver?: Profile;
}

export const connectionsApi = {
  // Get all connections for a user
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*),
        receiver:profiles!connections_receiver_id_fkey(*)
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    return { data: data as Connection[] | null, error };
  },

  // Get pending requests (received)
  async getPendingRequests(userId: string) {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    return { data: data as Connection[] | null, error };
  },

  // Get accepted connections
  async getAccepted(userId: string) {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*),
        receiver:profiles!connections_receiver_id_fkey(*)
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted')
      .order('updated_at', { ascending: false });
    
    return { data: data as Connection[] | null, error };
  },

  // Send connection request
  async sendRequest(requesterId: string, receiverId: string, message?: string) {
    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        message,
        status: 'pending'
      })
      .select()
      .single();
    
    return { data: data as Connection | null, error };
  },

  // Accept connection request
  async accept(connectionId: string) {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)
      .select()
      .single();
    
    return { data: data as Connection | null, error };
  },

  // Reject connection request
  async reject(connectionId: string) {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId)
      .select()
      .single();
    
    return { data: data as Connection | null, error };
  },

  // Check if connection exists between two users
  async checkConnection(userId1: string, userId2: string) {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`and(requester_id.eq.${userId1},receiver_id.eq.${userId2}),and(requester_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .single();
    
    return { data: data as Connection | null, error };
  },

  // Delete connection
  async delete(connectionId: string) {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);
    
    return { error };
  }
};

// ============================================
// MESSAGES API
// ============================================

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export const messagesApi = {
  // Get conversation between two users
  async getConversation(userId1: string, userId2: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });
    
    return { data: data as Message[] | null, error };
  },

  // Get all conversations for a user (grouped by other user)
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    return { data: data as Message[] | null, error };
  },

  // Send a message
  async send(senderId: string, receiverId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content
      })
      .select()
      .single();
    
    return { data: data as Message | null, error };
  },

  // Mark messages as read
  async markAsRead(messageIds: string[]) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds);
    
    return { error };
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
    
    return { count, error };
  }
};

// ============================================
// GOALS API
// ============================================

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export const goalsApi = {
  // Get all goals for a user
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true, nullsFirst: false });
    
    return { data: data as Goal[] | null, error };
  },

  // Get goals by status
  async getByStatus(userId: string, status: Goal['status']) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('due_date', { ascending: true });
    
    return { data: data as Goal[] | null, error };
  },

  // Create a goal
  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();
    
    return { data: data as Goal | null, error };
  },

  // Update a goal
  async update(id: string, updates: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data: data as Goal | null, error };
  },

  // Delete a goal
  async delete(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    return { error };
  }
};

// ============================================
// STARTUP IDEAS API
// ============================================

export interface StartupIdea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  industry: string;
  stage: 'idea' | 'validation' | 'mvp' | 'growth';
  looking_for: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export const startupIdeasApi = {
  // Get all public startup ideas
  async getAll() {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    return { data: data as StartupIdea[] | null, error };
  },

  // Get user's startup ideas
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data: data as StartupIdea[] | null, error };
  },

  // Create a startup idea
  async create(idea: Omit<StartupIdea, 'id' | 'created_at' | 'updated_at' | 'user'>) {
    const { data, error } = await supabase
      .from('startup_ideas')
      .insert(idea)
      .select()
      .single();
    
    return { data: data as StartupIdea | null, error };
  },

  // Update a startup idea
  async update(id: string, updates: Partial<StartupIdea>) {
    const { data, error } = await supabase
      .from('startup_ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data: data as StartupIdea | null, error };
  },

  // Delete a startup idea
  async delete(id: string) {
    const { error } = await supabase
      .from('startup_ideas')
      .delete()
      .eq('id', id);
    
    return { error };
  }
};
