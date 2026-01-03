import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Lightbulb, 
  Plus,
  Heart,
  MessageSquare,
  Loader2,
  Users,
  Search,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AvatarPreview } from "@/components/AvatarPreview";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface StartupIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  looking_for: string[];
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    university: string;
    email?: string;
    avatar_url?: string;
  };
}

const Ideas = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ideaPendingDelete, setIdeaPendingDelete] = useState<StartupIdea | null>(null);

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    category: "",
    looking_for: [] as string[],
  });

  const categories = [
    "EdTech",
    "FinTech",
    "HealthTech",
    "AgriTech",
    "E-Commerce",
    "Logistics",
    "Social Impact",
    "Entertainment",
    "Other"
  ];

  const roles = [
    "Tech/Engineering",
    "Marketing/Sales",
    "Finance/Operations",
    "Design/Creative",
    "Business Development"
  ];

  const { data: ideas, isLoading } = useQuery({
    queryKey: ["startup-ideas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startup_ideas")
        .select("*, profiles(full_name, university, email, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StartupIdea[];
    },
  });

  const createIdea = useMutation({
    mutationFn: async (idea: typeof newIdea) => {
      const { error } = await supabase.from("startup_ideas").insert({
        ...idea,
        user_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startup-ideas"] });
      setIsDialogOpen(false);
      setNewIdea({ title: "", description: "", category: "", looking_for: [] });
      toast({
        title: "Idea posted!",
        description: "Your startup idea is now visible to others.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post your idea.",
        variant: "destructive",
      });
    },
  });

  const deleteIdea = useMutation({
    mutationFn: async (ideaId: string) => {
      const { error } = await supabase
        .from("startup_ideas")
        .delete()
        .eq("id", ideaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startup-ideas"] });
      toast({
        title: "Idea removed",
        description: "The startup idea has been deleted.",
      });
      setIdeaPendingDelete(null);
    },
    onError: () => {
      toast({
        title: "Unable to delete",
        description: "We couldn't delete this idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title || !newIdea.description || !newIdea.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createIdea.mutate(newIdea);
  };

  const toggleRole = (role: string) => {
    setNewIdea((prev) => ({
      ...prev,
      looking_for: prev.looking_for.includes(role)
        ? prev.looking_for.filter((r) => r !== role)
        : [...prev.looking_for, role],
    }));
  };

  const filteredIdeas = ideas?.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <DashboardLayout
      title="Startup Ideas"
      subtitle="Share your vision and find co-founders"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Share Your Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Share Your Startup Idea</DialogTitle>
              <DialogDescription>
                Describe your idea and what kind of co-founders you are looking for.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Idea Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Mobile Banking for Rural Communities"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your idea, the problem it solves, and your vision..."
                  rows={4}
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={newIdea.category === cat ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setNewIdea({ ...newIdea, category: cat })}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Looking For</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge
                      key={role}
                      variant={newIdea.looking_for.includes(role) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleRole(role)}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createIdea.isPending}>
                {createIdea.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Post Idea"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-card rounded-2xl border border-border p-8">
          <Lightbulb className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No ideas yet</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Be the first to share your startup idea!
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Share Your Idea
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <Badge variant="secondary">{idea.category}</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                  {(idea.user_id === user?.id || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setIdeaPendingDelete(idea)}
                      aria-label="Delete idea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {idea.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {idea.description}
              </p>

              {idea.looking_for && idea.looking_for.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Users className="w-3 h-3" />
                    Looking for
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {idea.looking_for.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <AvatarPreview
                    src={idea.profiles?.avatar_url}
                    name={idea.profiles?.full_name}
                    size={40}
                    className="flex-shrink-0"
                    fallback={
                      <div className="w-full h-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">
                          {idea.profiles?.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    }
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{idea.profiles?.full_name}</p>
                      <VerifiedBadge email={idea.profiles?.email} compact />
                    </div>
                    <p className="text-xs text-muted-foreground">{idea.profiles?.university}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!ideaPendingDelete} onOpenChange={(open) => !open && setIdeaPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The idea will be removed for everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteIdea.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => ideaPendingDelete && deleteIdea.mutate(ideaPendingDelete.id)}
              disabled={deleteIdea.isPending}
            >
              {deleteIdea.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Ideas;
