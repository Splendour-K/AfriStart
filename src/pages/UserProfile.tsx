import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase, Profile } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEndorsements, useEndorseSkill, useRemoveEndorsement } from "@/hooks/useEndorsements";
import { useGetOrCreateConversation } from "@/hooks/useMessaging";
import {
  GraduationCap,
  Mail,
  Linkedin,
  Twitter,
  Globe,
  UserPlus,
  MessageSquare,
  Loader2,
  ThumbsUp,
  Award,
  ArrowLeft,
} from "lucide-react";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const endorseSkill = useEndorseSkill();
  const removeEndorsement = useRemoveEndorsement();
  const getOrCreateConversation = useGetOrCreateConversation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!userId,
  });

  const { data: endorsements, isLoading: endorsementsLoading } = useEndorsements(userId);

  const isOwnProfile = user?.id === userId;

  const handleEndorse = async (skill: string, isEndorsed: boolean) => {
    if (!userId) return;

    try {
      if (isEndorsed) {
        await removeEndorsement.mutateAsync({ endorsedId: userId, skill });
        toast({ title: "Endorsement removed" });
      } else {
        await endorseSkill.mutateAsync({ endorsedId: userId, skill });
        toast({ title: "Skill endorsed!", description: `You endorsed ${profile?.full_name}'s ${skill} skill.` });
      }
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast({ title: "Already endorsed", description: "You've already endorsed this skill." });
      } else {
        toast({ title: "Error", description: "Failed to update endorsement.", variant: "destructive" });
      }
    }
  };

  const handleStartChat = async () => {
    if (!userId) return;
    try {
      await getOrCreateConversation.mutateAsync(userId);
      navigate("/messages");
    } catch (error) {
      toast({ title: "Error", description: "Failed to start conversation.", variant: "destructive" });
    }
  };

  if (profileLoading) {
    return (
      <DashboardLayout title="Profile" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="Profile" subtitle="User not found">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">This user doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={profile.full_name} subtitle={profile.university}>
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-start gap-6">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'User'}
                  className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-3xl">
                    {profile.full_name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">{profile.full_name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{profile.university}</span>
                </div>
                {profile.role && (
                  <Badge variant="secondary" className="mt-2">{profile.role}</Badge>
                )}

                {!isOwnProfile && (
                  <div className="flex items-center gap-2 mt-4">
                    <Button onClick={handleStartChat} disabled={getOrCreateConversation.isPending}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium text-foreground mb-2">About</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Social Links */}
            <div className="mt-6 pt-6 border-t border-border flex items-center gap-4">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile.twitter_url && (
                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Skills with Endorsements */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-terracotta" />
              <h2 className="font-display text-lg font-semibold text-foreground">Skills & Endorsements</h2>
            </div>

            {profile.skills && profile.skills.length > 0 ? (
              <div className="space-y-3">
                {profile.skills.map((skill) => {
                  const endorsementData = endorsements?.find((e) => e.skill === skill);
                  const count = endorsementData?.count || 0;
                  const isEndorsed = endorsementData?.endorsedByCurrentUser || false;

                  return (
                    <div
                      key={skill}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{skill}</span>
                        {count > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {count} endorsement{count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {!isOwnProfile && (
                        <Button
                          variant={isEndorsed ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleEndorse(skill, isEndorsed)}
                          disabled={endorseSkill.isPending || removeEndorsement.isPending}
                          className="gap-1"
                        >
                          <ThumbsUp className={`w-4 h-4 ${isEndorsed ? "fill-current" : ""}`} />
                          {isEndorsed ? "Endorsed" : "Endorse"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills listed yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Interests */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Interests</h2>
            {profile.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No interests listed.</p>
            )}
          </div>

          {/* Endorsement Summary */}
          {endorsements && endorsements.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Top Endorsed Skills</h2>
              <div className="space-y-3">
                {endorsements.slice(0, 5).map((item) => (
                  <div key={item.skill} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.skill}</span>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-terracotta" />
                      <span className="text-sm font-medium text-terracotta">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
