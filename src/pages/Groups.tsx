import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCreateGroup, useGroups } from "@/hooks/useGroups";
import { Loader2, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Groups() {
  const { data: groups, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [form, setForm] = useState({ name: "", description: "", university: profile?.university || "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup.mutateAsync({
        name: form.name,
        description: form.description,
        university: form.university,
      });
      toast({ title: "Group created", description: "You're the owner and first member." });
      setForm({ name: "", description: "", university: profile?.university || "" });
    } catch (error: any) {
      toast({ title: "Could not create group", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Groups" subtitle="Create and join your university startup school">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading groups...
                </div>
              ) : groups && groups.length > 0 ? (
                <div className="grid gap-3">
                  {groups.map((group) => (
                    <Card key={group.id} className="border border-border">
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <Link to={`/groups/${group.id}`} className="text-lg font-semibold hover:underline">
                            {group.name}
                          </Link>
                          <Badge variant="outline">{group.university}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {group.member_count || 0} members
                          </span>
                          {group.owner?.full_name && <span>Owner: {group.owner.full_name}</span>}
                        </div>
                        <div>
                          <Link to={`/groups/${group.id}`}>
                            <Button variant="outline" size="sm">View group</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No groups yet. Create the first one for your university.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a group</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleCreate}>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Group name</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., University of Nairobi Startup School"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">University</label>
                  <Input
                    required
                    value={form.university}
                    onChange={(e) => setForm((p) => ({ ...p, university: e.target.value }))}
                    placeholder="University name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What is this group for?"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createGroup.isPending}>
                  {createGroup.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create group
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
