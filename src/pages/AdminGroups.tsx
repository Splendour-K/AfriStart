import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Users, MessageSquare, Activity } from "lucide-react";

interface GroupRow {
  id: string;
  name: string;
  university: string;
  owner_id: string;
  created_at: string;
  member_count: number;
  idea_count: number;
}

export default function AdminGroups() {
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: groupsData } = await supabase
        .from("groups")
        .select(
          "*, member_count:group_memberships!group_memberships_group_id_fkey(count), idea_count:group_ideas(count)"
        )
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: recentActivity } = await supabase
        .from("group_idea_comments")
        .select("*, idea:group_ideas(title, group_id), user:profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(30);

      setGroups(
        (groupsData || []).map((g: any) => ({
          ...g,
          member_count: g.member_count?.[0]?.count ?? 0,
          idea_count: g.idea_count?.[0]?.count ?? 0,
        }))
      );
      setActivity(recentActivity || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="Admin • Groups" subtitle="Visibility into all groups and collaboration activity">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>All groups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No groups yet.</p>
            ) : (
              groups.map((g) => (
                <div key={g.id} className="border border-border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.university}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary"><Users className="w-3 h-3 mr-1" /> {g.member_count}</Badge>
                    <Badge variant="outline"><MessageSquare className="w-3 h-3 mr-1" /> {g.idea_count} ideas</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="border border-border rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Activity className="w-3 h-3" /> {new Date(a.created_at).toLocaleString()}
                  </div>
                  <p><span className="font-semibold">{a.user?.full_name || "User"}</span> commented on <span className="font-semibold">{a.idea?.title}</span></p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
