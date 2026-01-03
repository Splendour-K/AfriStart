import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AvatarPreview } from "@/components/AvatarPreview";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Loader2, ArrowLeft, Heart, MessageSquare, Trash2 } from "lucide-react";

interface IdeaProfile {
  full_name: string;
  university: string;
  email?: string;
  avatar_url?: string;
}

interface StartupIdeaRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  looking_for: string[];
  created_at: string;
  updated_at: string;
  profiles: IdeaProfile | null;
}

interface IdeaLikeRecord {
  id: string;
  idea_id: string;
  user_id: string;
  created_at: string;
  profiles: IdeaProfile | null;
}

interface IdeaCommentRecord {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: IdeaProfile | null;
}

interface IdeaDetailData extends StartupIdeaRecord {
  likes: IdeaLikeRecord[];
  comments: IdeaCommentRecord[];
}

const IdeaDetail = () => {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [commentValue, setCommentValue] = useState("");

  const {
    data: idea,
    isLoading,
    isError,
    refetch,
  } = useQuery<IdeaDetailData | null>({
    queryKey: ["idea-detail", ideaId],
    queryFn: async () => {
      if (!ideaId) return null;

      const { data: ideaRecord, error } = await supabase
        .from("startup_ideas")
        .select("*, profiles(full_name, university, email, avatar_url)")
        .eq("id", ideaId)
        .single();

      if (error || !ideaRecord) throw error || new Error("Idea not found");

      const typedIdea = ideaRecord as StartupIdeaRecord;

      const [{ data: likes, error: likesError }, { data: comments, error: commentsError }] = await Promise.all([
        supabase
          .from("idea_likes")
          .select("id, idea_id, user_id, created_at, profiles(full_name, university, email, avatar_url)")
          .eq("idea_id", ideaId)
          .order("created_at", { ascending: false }),
        supabase
          .from("idea_comments")
          .select("id, idea_id, user_id, content, created_at, updated_at, profiles(full_name, university, email, avatar_url)")
          .eq("idea_id", ideaId)
          .order("created_at", { ascending: true }),
      ]);

      if (likesError) throw likesError;
      if (commentsError) throw commentsError;

      return {
        ...typedIdea,
        likes: (likes ?? []) as IdeaLikeRecord[],
        comments: (comments ?? []) as IdeaCommentRecord[],
      };
    },
    enabled: !!ideaId,
    retry: 1,
  });

  const toggleLike = useMutation({
    mutationFn: async (liked: boolean) => {
      if (!user || !ideaId) throw new Error("You need to be signed in to like an idea.");

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
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Unable to update like",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user || !ideaId) throw new Error("You need to be signed in to comment.");
      const trimmed = commentValue.trim();
      if (!trimmed) throw new Error("Comment cannot be empty.");

      const { error } = await supabase
        .from("idea_comments")
        .insert({ idea_id: ideaId, user_id: user.id, content: trimmed });
      if (error) throw error;
    },
    onSuccess: () => {
      setCommentValue("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Unable to post comment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("idea_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Comment removed",
        description: "Your comment has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to delete comment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (event: React.FormEvent) => {
    event.preventDefault();
    addComment.mutate();
  };

  const likedByUser = idea?.likes.some((like) => like.user_id === user?.id) ?? false;
  const likeCount = idea?.likes.length ?? 0;
  const commentCount = idea?.comments.length ?? 0;

  return (
    <DashboardLayout
      title="Idea Details"
      subtitle="Dive deeper into this concept and start collaborating"
    >
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to ideas
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      ) : isError || !idea ? (
        <div className="text-center p-8 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">We couldn't load this idea. Please try again.</p>
          <Button className="mt-4" onClick={() => navigate("/ideas")}>Return to ideas</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">{idea.category}</Badge>
                  <h1 className="text-2xl font-display font-semibold text-foreground">{idea.title}</h1>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{new Date(idea.created_at).toLocaleDateString()}</p>
                  <p>Updated {new Date(idea.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.description}</p>

              {idea.looking_for && idea.looking_for.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Looking for collaborators</h3>
                  <div className="flex flex-wrap gap-2">
                    {idea.looking_for.map((role) => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                <Button
                  size="sm"
                  variant={likedByUser ? "secondary" : "outline"}
                  className="gap-2"
                  onClick={() => toggleLike.mutate(likedByUser)}
                  disabled={toggleLike.isPending}
                >
                  {toggleLike.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${likedByUser ? "fill-terracotta text-terracotta" : ""}`} />
                  )}
                  {likeCount} {likeCount === 1 ? "Like" : "Likes"}
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl border border-border/60">
                <AvatarPreview
                  src={idea.profiles?.avatar_url}
                  name={idea.profiles?.full_name}
                  size={48}
                  fallback={
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {idea.profiles?.full_name?.charAt(0) || "?"}
                      </span>
                    </div>
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{idea.profiles?.full_name}</p>
                    <VerifiedBadge email={idea.profiles?.email} compact />
                  </div>
                  <p className="text-sm text-muted-foreground">{idea.profiles?.university}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/user/${idea.user_id}`}>View profile</Link>
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <h2 className="font-display text-lg font-semibold mb-4">People who liked this</h2>
              {idea.likes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No likes yet. Be the first to appreciate this idea!</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {idea.likes.slice(0, 10).map((like) => (
                    <div key={like.id} className="flex items-center gap-2">
                      <AvatarPreview
                        size={36}
                        src={like.profiles?.avatar_url}
                        name={like.profiles?.full_name}
                        fallback={
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-semibold">
                              {like.profiles?.full_name?.charAt(0) || "?"}
                            </span>
                          </div>
                        }
                      />
                      <div>
                        <p className="text-sm font-medium leading-tight">{like.profiles?.full_name ?? "Member"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(like.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold mb-4">Comments</h2>
            <form onSubmit={handleAddComment} className="space-y-3 mb-6">
              <Textarea
                placeholder="Share constructive feedback or ask a question..."
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                rows={3}
              />
              <Button type="submit" className="w-full" disabled={addComment.isPending}>
                {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post comment"}
              </Button>
            </form>

            <div className="space-y-4">
              {idea.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet. Start the conversation!</p>
              ) : (
                idea.comments.map((comment) => {
                  const canDelete = comment.user_id === user?.id || isAdmin;
                  return (
                    <div key={comment.id} className="p-4 rounded-xl border border-border/70 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <AvatarPreview
                          size={36}
                          src={comment.profiles?.avatar_url}
                          name={comment.profiles?.full_name}
                          fallback={
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                              <span className="text-primary-foreground text-xs font-semibold">
                                {comment.profiles?.full_name?.charAt(0) || "?"}
                              </span>
                            </div>
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{comment.profiles?.full_name ?? "Member"}</p>
                            <VerifiedBadge email={comment.profiles?.email} compact />
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-line mt-1">{comment.content}</p>
                        </div>
                        {canDelete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteComment.mutate(comment.id)}
                            disabled={deleteComment.isPending && deleteComment.variables === comment.id}
                          >
                            {deleteComment.isPending && deleteComment.variables === comment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default IdeaDetail;
