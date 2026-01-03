import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  Trash2,
  Eye,
  Edit2
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

const PRESET_CATEGORIES = [
  "EdTech",
  "FinTech",
  "HealthTech",
  "AgriTech",
  "E-Commerce",
  "Logistics",
  "Social Impact",
  "Entertainment"
];

interface IdeaProfile {
  full_name: string;
  university: string;
  email?: string;
  avatar_url?: string;
}

interface IdeaLikeRow {
  user_id: string;
}

interface IdeaCommentStub {
  id: string;
}

interface StartupIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  looking_for: string[];
  user_id: string;
  created_at: string;
  profiles: IdeaProfile | null;
  idea_likes: IdeaLikeRow[];
  idea_comments: IdeaCommentStub[];
}

const Ideas = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ideaPendingDelete, setIdeaPendingDelete] = useState<StartupIdea | null>(null);
  const [ideaBeingEdited, setIdeaBeingEdited] = useState<StartupIdea | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isEditingCustomCategory, setIsEditingCustomCategory] = useState(false);

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    category: "",
    looking_for: [] as string[],
  });

  const [editIdea, setEditIdea] = useState({
    title: "",
    description: "",
    category: "",
    looking_for: [] as string[],
  });

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
        .select("*, profiles(full_name, university, email, avatar_url), idea_likes(user_id), idea_comments(id)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as StartupIdea[]) || [];
    },
  });

  const customCategories = useMemo(() => {
    if (!ideas) return [] as string[];
    const existing = new Set<string>();
    ideas.forEach((idea) => {
      if (idea.category && !PRESET_CATEGORIES.includes(idea.category)) {
        existing.add(idea.category);
      }
    });
    return Array.from(existing).sort();
  }, [ideas]);

  const createIdea = useMutation({
    mutationFn: async (idea: typeof newIdea) => {
      const payload = {
        ...idea,
        category: idea.category.trim(),
      };
      if (!payload.category) {
        throw new Error("Category is required");
      }
      const { error } = await supabase.from("startup_ideas").insert({
        ...payload,
        user_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startup-ideas"] });
      setIsDialogOpen(false);
      setNewIdea({ title: "", description: "", category: "", looking_for: [] });
      setIsCustomCategory(false);
      toast({
        title: "Idea posted!",
        description: "Your startup idea is now visible to others.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post your idea.",
        variant: "destructive",
      });
    },
  });

  const updateIdea = useMutation({
    mutationFn: async ({ ideaId, updates }: { ideaId: string; updates: typeof editIdea }) => {
      const payload = {
        ...updates,
        category: updates.category.trim(),
      };
      if (!payload.category) {
        throw new Error("Category is required");
      }
      const { error } = await supabase
        .from("startup_ideas")
        .update(payload)
        .eq("id", ideaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startup-ideas"] });
      setIdeaBeingEdited(null);
      setEditIdea({ title: "", description: "", category: "", looking_for: [] });
      setIsEditingCustomCategory(false);
      toast({
        title: "Idea updated!",
        description: "Your startup idea has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update your idea.",
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

  const toggleLike = useMutation({
    mutationFn: async ({ ideaId, liked }: { ideaId: string; liked: boolean }) => {
      if (!user) throw new Error("You must be signed in to like an idea.");

      if (liked) {
        const { error } = await supabase
          .from("idea_likes")
          .delete()
          .eq("idea_id", ideaId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("idea_likes")
          .insert({ idea_id: ideaId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startup-ideas"] });
    },
    onError: (error) => {
      toast({
        title: "Unable to update like",
        description: error instanceof Error ? error.message : "Please try again.",
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

  const toggleEditRole = (role: string) => {
    setEditIdea((prev) => ({
      ...prev,
      looking_for: prev.looking_for.includes(role)
        ? prev.looking_for.filter((r) => r !== role)
        : [...prev.looking_for, role],
    }));
  };

  const handleCategorySelect = (category: string) => {
    setIsCustomCategory(false);
    setNewIdea((prev) => ({ ...prev, category }));
  };

  const handleEditCategorySelect = (category: string) => {
    setIsEditingCustomCategory(false);
    setEditIdea((prev) => ({ ...prev, category }));
  };

  const enableCustomCategory = () => {
    setIsCustomCategory(true);
    setNewIdea((prev) => ({ ...prev, category: PRESET_CATEGORIES.includes(prev.category) ? "" : prev.category }));
  };

  const enableEditingCustomCategory = () => {
    setIsEditingCustomCategory(true);
    setEditIdea((prev) => ({ ...prev, category: PRESET_CATEGORIES.includes(prev.category) ? "" : prev.category }));
  };

  const handleEditIdea = (idea: StartupIdea) => {
    setIdeaBeingEdited(idea);
    setEditIdea({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      looking_for: idea.looking_for || [],
    });
    setIsEditingCustomCategory(!PRESET_CATEGORIES.includes(idea.category));
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editIdea.title || !editIdea.description || !editIdea.category || !ideaBeingEdited) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    updateIdea.mutate({ ideaId: ideaBeingEdited.id, updates: editIdea });
  };

  const handleToggleLike = (idea: StartupIdea) => {
    const liked = idea.idea_likes?.some((like) => like.user_id === user?.id);
    toggleLike.mutate({ ideaId: idea.id, liked });
  };

  const filteredIdeas = ideas?.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const allFilterCategories = useMemo(() => {
    return [...PRESET_CATEGORIES, ...customCategories];
  }, [customCategories]);

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
                  {PRESET_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={!isCustomCategory && newIdea.category === cat ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                  <Badge
                    variant={isCustomCategory ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={enableCustomCategory}
                  >
                    Custom
                  </Badge>
                </div>
                {isCustomCategory && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="custom-category">Custom Category *</Label>
                    <Input
                      id="custom-category"
                      placeholder="e.g., Climate Tech"
                      value={newIdea.category}
                      onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pick a short, descriptive category to help others discover your idea.
                    </p>
                  </div>
                )}
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

        {/* Edit Idea Dialog */}
        <Dialog open={!!ideaBeingEdited} onOpenChange={(open) => !open && setIdeaBeingEdited(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Your Startup Idea</DialogTitle>
              <DialogDescription>
                Update your idea details and collaborator requirements.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Idea Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="e.g., Mobile Banking for Rural Communities"
                  value={editIdea.title}
                  onChange={(e) => setEditIdea({ ...editIdea, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe your idea, the problem it solves, and your vision..."
                  rows={4}
                  value={editIdea.description}
                  onChange={(e) => setEditIdea({ ...editIdea, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={!isEditingCustomCategory && editIdea.category === cat ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleEditCategorySelect(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                  <Badge
                    variant={isEditingCustomCategory ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={enableEditingCustomCategory}
                  >
                    Custom
                  </Badge>
                </div>
                {isEditingCustomCategory && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="edit-custom-category">Custom Category *</Label>
                    <Input
                      id="edit-custom-category"
                      placeholder="e.g., Climate Tech"
                      value={editIdea.category}
                      onChange={(e) => setEditIdea({ ...editIdea, category: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pick a short, descriptive category to help others discover your idea.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Looking For</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge
                      key={role}
                      variant={editIdea.looking_for.includes(role) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleEditRole(role)}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={updateIdea.isPending}>
                  {updateIdea.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update Idea"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIdeaBeingEdited(null)}
                  disabled={updateIdea.isPending}
                >
                  Cancel
                </Button>
              </div>
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
        {allFilterCategories.map((cat) => (
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
            <Link
              key={idea.id}
              to={`/ideas/${idea.id}`}
              className="block bg-card rounded-2xl border border-border p-6 hover:shadow-elevated transition-all duration-200 hover:border-terracotta/20"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <Badge variant="secondary">{idea.category}</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                    {idea.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-terracotta"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditIdea(idea);
                        }}
                        aria-label="Edit idea"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {(idea.user_id === user?.id || isAdmin) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIdeaPendingDelete(idea);
                        }}
                        aria-label="Delete idea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
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
                <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                  {(() => {
                    const likedByUser = idea.idea_likes?.some((like) => like.user_id === user?.id);
                    const likeCount = idea.idea_likes?.length ?? 0;
                    const commentCount = idea.idea_comments?.length ?? 0;
                    const isUpdatingLike = toggleLike.isPending && toggleLike.variables?.ideaId === idea.id;
                    return (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleLike(idea);
                          }}
                          disabled={isUpdatingLike}
                          className="gap-1"
                          aria-label="Toggle like"
                        >
                          {isUpdatingLike ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Heart className={`w-4 h-4 ${likedByUser ? "fill-terracotta text-terracotta" : ""}`} />
                          )}
                          <span className="text-xs font-medium">{likeCount}</span>
                        </Button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-medium">{commentCount}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Link>
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
