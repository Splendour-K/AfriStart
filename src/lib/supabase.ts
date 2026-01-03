import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types for profiles
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  university: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  role?: string;
  avatar_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

// Database types for startup ideas
export interface StartupIdea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  looking_for: string[];
  created_at: string;
  updated_at: string;
}

export interface IdeaLike {
  id: string;
  idea_id: string;
  user_id: string;
  created_at: string;
}

export interface IdeaComment {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Database types for connections
export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}
