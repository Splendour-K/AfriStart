import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, university: string) => Promise<{ error: AuthError | null; user: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin allowlist (comma-separated emails in env)
  const adminAllowlist = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = !!(user?.email && adminAllowlist.includes(user.email.toLowerCase()));

  // Fetch user profile from profiles table with a small timeout to avoid blocking UI
  const fetchProfile = async (userId: string) => {
    const fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          // Silently fail on profile fetch errors to prevent auth loops
          return null;
        }

        return data as Profile | null;
      } catch (error) {
        // Silently fail to prevent cascading auth failures
        return null;
      }
    })();

    // Time out after 5s (increased from 3s) to prevent long blocking fetch
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        // Silently timeout - don't spam console warnings that can trigger refetch storms
        resolve(null);
      }, 5000);
    });

    return Promise.race([fetchPromise, timeoutPromise]);
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Add a maximum loading timeout (5 seconds)
    const loadingTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('Auth loading timeout - forcing completion');
        setIsLoading(false);
      }
    }, 5000);
    
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          // IMPORTANT: don't forcibly sign out on getSession errors.
          // In some environments (blocked storage / transient network), this can cause an infinite logout loop.
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        // Mark loading complete immediately; profile will hydrate in background
        if (mounted) {
          setIsLoading(false);
        }

        if (session?.user) {
          fetchProfile(session.user.id).then((profileData) => {
            if (mounted) {
              setProfile(profileData);
            }
          });
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event);
      
      setSession(session);
      setUser(session?.user ?? null);

      // Loading should not block on profile fetch
      if (mounted) {
        setIsLoading(false);
      }

      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          if (mounted) {
            setProfile(profileData);
          }
        });
      } else {
        setProfile(null);
      }
    });

    // Best-effort: keep session fresh. If refresh fails, we log but we do NOT auto sign-out.
    // Supabase JS already handles refresh in most cases, but this reduces surprise logouts.
    const refreshInterval = window.setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          // Silently ignore refresh errors to prevent cascading failures
          return;
        }

        if (!mounted) return;
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (e) {
        // Silently catch refresh errors
      }
    }, 15 * 60 * 1000); // every 15 minutes (reduced frequency to avoid rate-limiting)

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
      window.clearInterval(refreshInterval);
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string, university: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          university: university,
        },
      },
    });

    if (!error && data.user) {
      // Try to create profile in profiles table, but don't fail if it errors
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          university: university,
          is_onboarded: false,
        });
      } catch (profileError) {
        console.error('Error creating profile (will be created by trigger):', profileError);
        // The trigger should handle this, so we don't treat it as a failure
      }
    }

    return { error, user: data.user };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    return { error };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }

    return { error: error ? new Error(error.message) : null };
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
