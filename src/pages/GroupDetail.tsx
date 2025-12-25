import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useApproveMembership,
  useCommentOnIdea,
  useCreateGroupIdea,
  useGroup,
  useGroupIdeaComments,
  useGroupIdeas,
  useGroupMembers,
  useJoinIdea,
  useRequestGroupMembership,
  useVoteIdea,
} from "@/hooks/useGroups";
import { Loader2, MessageCircle, ThumbsUp, Users, UserPlus, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: groupData, isLoading } = useGroup(groupId || null);
  const { data: members } = useGroupMembers(groupId || null);
  const { data: ideas } = useGroupIdeas(groupId || null);

  const requestMembership = useRequestGroupMembership();
  const approveMembership = useApproveMembership();
  const createIdea = useCreateGroupIdea();
  const voteIdea = useVoteIdea();
  const joinIdea = useJoinIdea();
  const commentIdea = useCommentOnIdea();

  const [ideaForm, setIdeaForm] = useState({ title: "", description: "", stage: "idea" });
  const [commentText, setCommentText] = useState<{ [ideaId: string]: string }>({});

  const membershipStatus = groupData?.membership?.status as
    | "pending"
    | "approved"
    | "rejected"
    | undefined;
  const isOwner = groupData?.group.owner_id === user?.id;
  const canPost = membershipStatus === "approved" || isOwner;

  const pendingMembers = useMemo(
    () => (members || []).filter((m: any) => m.status === "pending"),
    [members]
  );

  const handleJoinRequest = async () => {
    if (!groupId) return;
    try {
      await requestMembership.mutateAsync({ groupId });
      toast({ title: "Request sent", description: "Wait for the owner to approve." });
    } catch (error: any) {
      toast({ title: "Unable to request", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    try {
      await createIdea.mutateAsync({
        groupId,
        title: ideaForm.title,
        description: ideaForm.description,
        stage: ideaForm.stage,
      });
      setIdeaForm({ title: "", description: "", stage: "idea" });
      toast({ title: "Idea posted" });
    } catch (error: any) {
      toast({ title: "Unable to post idea", description: error.message, variant: "destructive" });
    }
  };

  const handleVote = async (ideaId: string) => {
    try {
      await voteIdea.mutateAsync({ ideaId });
      toast({ title: "Vote recorded" });
    } catch (error: any) {
      toast({ title: "Unable to vote", description: error.message, variant: "destructive" });
    }
  };

  const handleJoinIdea = async (ideaId: string) => {
    try {
      await joinIdea.mutateAsync({ ideaId });
      toast({ title: "Joined idea", description: "You can collaborate with the team." });
    } catch (error: any) {
      toast({ title: "Unable to join", description: error.message, variant: "destructive" });
    }
  };

  const handleComment = async (ideaId: string) => {
    const content = commentText[ideaId];
    if (!content?.trim()) return;
    try {
      await commentIdea.mutateAsync({ ideaId, content });
      setCommentText((prev) => ({ ...prev, [ideaId]: "" }));
    } catch (error: any) {
      toast({ title: "Unable to comment", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading || !groupData) {
    return (
      <DashboardLayout title="Group">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading group...
        </div>
      </DashboardLayout>
    );
  }

  const { group } = groupData;

  return (
    <DashboardLayout title={group.name} subtitle={group.description || ""}>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{group.university}</p>
                </div>
                {membershipStatus === "approved" && <Badge variant="secondary">Member</Badge>}
                {isOwner && <Badge>Owner</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Owner: {group.owner?.full_name || "N/A"}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" /> {members?.length || 0} members
              </div>
              {membershipStatus === "pending" && (
                <Badge variant="outline">Join request pending</Badge>
              )}
              {!membershipStatus && !isOwner && (
                <Button onClick={handleJoinRequest} disabled={requestMembership.isPending}>
                  {requestMembership.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Request to join
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ideas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canPost ? (
                <form className="space-y-3" onSubmit={handleCreateIdea}>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      required
                      value={ideaForm.title}
                      onChange={(e) => setIdeaForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Idea title"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      required
                      rows={3}
                      value={ideaForm.description}
                      onChange={(e) => setIdeaForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Brief pitch"
                    />
                  </div>
                  <Button type="submit" disabled={createIdea.isPending}>
                    {createIdea.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Post idea
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">Join to post ideas.</p>
              )}

              <div className="space-y-3">
                {ideas && ideas.length > 0 ? (
                  ideas.map((idea) => (
                    <Card key={idea.id} className="border border-border">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold">{idea.title}</p>
                            <p className="text-xs text-muted-foreground">By {idea.author?.full_name || "Unknown"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{idea.stage}</Badge>
                            <Badge variant="secondary">{idea.votes || 0} votes</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{idea.description}</p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleVote(idea.id)}>
                            <ThumbsUp className="w-4 h-4 mr-1" /> {idea.has_voted ? "Voted" : "Vote"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleJoinIdea(idea.id)}>
                            <UserPlus className="w-4 h-4 mr-1" /> {idea.is_member ? "In workspace" : "Join idea"}
                          </Button>
                          <Badge variant="outline">{idea.comments_count || 0} comments</Badge>
                        </div>

                        <CommentsSection ideaId={idea.id} commentText={commentText} setCommentText={setCommentText} onSubmit={handleComment} />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No ideas yet. Be the first to share.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {members && members.length > 0 ? (
                members.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-semibold">
                        {(m.user?.full_name || "").charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{m.user?.full_name || "Member"}</p>
                        <p className="text-xs text-muted-foreground">{m.user?.university}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{m.role || "member"}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No approved members yet.</p>
              )}
            </CardContent>
          </Card>

          {isOwner && pendingMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingMembers.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-ochre/10 flex items-center justify-center text-ochre font-semibold">
                        {(m.user?.full_name || "").charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{m.user?.full_name || "Member"}</p>
                        <p className="text-xs text-muted-foreground">{m.user?.university}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approveMembership.mutateAsync({ membershipId: m.id, status: "approved" })}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => approveMembership.mutateAsync({ membershipId: m.id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

interface CommentsSectionProps {
  ideaId: string;
  commentText: Record<string, string>;
  setCommentText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: (ideaId: string) => void;
}

function CommentsSection({ ideaId, commentText, setCommentText, onSubmit }: CommentsSectionProps) {
  const { data: comments, isLoading } = useGroupIdeaComments(ideaId);

  return (
    <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="w-4 h-4" /> Comments
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading comments...</p>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-semibold">{c.user?.full_name || "User"}</span>{" "}
              <span className="text-muted-foreground">{c.content}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No comments yet.</p>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment"
          value={commentText[ideaId] || ""}
          onChange={(e) => setCommentText((prev) => ({ ...prev, [ideaId]: e.target.value }))}
        />
        <Button size="sm" onClick={() => onSubmit(ideaId)}>Post</Button>
      </div>
    </div>
  );
}
