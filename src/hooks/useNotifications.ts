import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type NotificationCategory = "message" | "group" | "idea" | "system" | "admin";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string | null;
  category: NotificationCategory;
  created_at: string;
  read_at?: string | null;
  href?: string | null;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  messages: boolean;
  mentions: boolean;
  groups: boolean;
  product: boolean;
  digest: boolean;
  priority: boolean;
  quiet: boolean;
}

const mapNotificationRow = (row: any): NotificationItem => ({
  id: row.id,
  title: row.title ?? row.heading ?? "Notification",
  description: row.description ?? row.body ?? row.content ?? null,
  category: (row.category ?? "system") as NotificationCategory,
  created_at: row.created_at ?? new Date().toISOString(),
  read_at: row.read_at ?? null,
  href: row.href ?? row.link ?? null,
});

export const placeholderNotifications: NotificationItem[] = [
  {
    id: "placeholder-1",
    title: "You have 3 new collaboration requests",
    description: "Review join requests for Fintech Builders",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    category: "group",
    read_at: null,
  },
  {
    id: "placeholder-2",
    title: "Ada left a comment on your idea",
    description: '"Can we expand to SMEs in Lagos first?"',
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    category: "idea",
    read_at: null,
  },
  {
    id: "placeholder-3",
    title: "New message from Tunde",
    description: "Let's align on the pitch deck this weekend.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    category: "message",
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
  },
  {
    id: "placeholder-4",
    title: "Platform update",
    description: "Voting is live in your groups. Cast your votes to prioritize ideas.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    category: "system",
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

const defaultPreferences: NotificationPreferences = {
  email: true,
  push: true,
  messages: true,
  mentions: true,
  groups: true,
  product: false,
  digest: true,
  priority: true,
  quiet: false,
};

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async (): Promise<NotificationItem[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, description, body, content, category, created_at, read_at, href, link")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Notifications fallback due to error:", error.message);
        // Fallback gracefully to placeholders so UI still works without table present
        return placeholderNotifications;
      }

      if (!data) return placeholderNotifications;

      return data.map(mapNotificationRow);
    },
    enabled: !!user,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

export function useNotificationPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async (): Promise<NotificationPreferences> => {
      if (!user) return defaultPreferences;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("email, push, messages, mentions, groups, product, digest, priority, quiet")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && !error.message.includes("does not exist")) {
        console.warn("Notification prefs fallback:", error.message);
      }

      return data || defaultPreferences;
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });
}

export function useSaveNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        ...prefs,
        updated_at: new Date().toISOString(),
      });

      if (error && !error.message.includes("relation \"notification_preferences\" does not exist")) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}

export function useMarkNotificationRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      // If table does not exist, avoid throwing to keep UI usable
      if (error && !error.message.includes("relation \"notifications\" does not exist")) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (error && !error.message.includes("relation \"notifications\" does not exist")) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:user:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
