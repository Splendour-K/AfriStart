import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCofounderMatches, useSendConnectionRequest, useConnections } from "@/hooks/useMatching";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  Briefcase,
  MessageSquare,
  UserPlus,
  Loader2,
  Sparkles,
  Heart,
  Eye,
  Clock,
  CheckCircle2
} from "lucide-react";

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: matches, isLoading, error } = useCofounderMatches();
  const sendConnectionRequest = useSendConnectionRequest();
  const { data: connectionsData } = useConnections();

  const [optimisticPending, setOptimisticPending] = useState<Set<string>>(new Set());

  const pendingSentIds = useMemo(
    () => new Set((connectionsData?.sent || []).map((c: any) => c.receiver_id)),
    [connectionsData]
  );

  const pendingIncomingIds = useMemo(
    () => new Set((connectionsData?.pending || []).map((c: any) => c.requester_id)),
    [connectionsData]
  );

  const acceptedIds = useMemo(() => {
    const set = new Set<string>();
    (connectionsData?.accepted || []).forEach((c: any) => {
      if (!user?.id) return;
      const otherId = c.requester_id === user.id ? c.receiver_id : c.requester_id;
      if (otherId) set.add(otherId);
    });
    return set;
  }, [connectionsData, user?.id]);

  const getConnectionStatus = (targetUserId: string) => {
    if (acceptedIds.has(targetUserId)) return "accepted" as const;
    if (pendingSentIds.has(targetUserId) || pendingIncomingIds.has(targetUserId) || optimisticPending.has(targetUserId)) {
      return "pending" as const;
    }
    return "none" as const;
  };

  const roles = [
    "Tech/Engineering",
    "Marketing/Sales",
    "Finance/Operations", 
    "Design/Creative",
    "Business Development"
  ];

  const filteredMatches = matches?.filter((match) => {
    const matchesSearch = 
      match.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !selectedRole || match.role === selectedRole;
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleConnect = async (targetUserId: string) => {
    const status = getConnectionStatus(targetUserId);
    if (status === "accepted") {
      toast({ title: "Already connected", description: "You’re already connected with this user." });
      return;
    }
    if (status === "pending") {
      toast({ title: "Request already pending", description: "Await their response or accept their request." });
      return;
    }

    try {
      await sendConnectionRequest.mutateAsync(targetUserId);
      setOptimisticPending((prev) => new Set(prev).add(targetUserId));
      toast({
        title: "Connection request sent!",
        description: "Request set to pending. Share one focused proposal (max 50 words) while you wait.",
      });
    } catch (err: any) {
      toast({
        title: "Could not send request",
        description: err?.message || "Failed to send connection request.",
        variant: "destructive",
      });
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-forest/10 text-forest border-forest/20";
    if (score >= 60) return "bg-ochre/10 text-ochre border-ochre/20";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout 
      title="Discover Co-Founders"
      subtitle="Find your perfect match based on skills and interests"
    >
      <div className="mb-4 p-4 rounded-xl border border-border bg-muted/50 text-sm text-muted-foreground">
        Connection requests stay pending until they accept or reject. You can send one proposal per request (max 50 words) and up to 20 proposals each week—make every outreach intentional and centered on a clear startup idea.
      </div>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, university, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={selectedRole === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole(null)}
              className="whitespace-nowrap"
            >
              All Roles
            </Button>
            {roles.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(role === selectedRole ? null : role)}
                className="whitespace-nowrap"
              >
                {role.split("/")[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Finding matches..." : `${filteredMatches.length} potential co-founders found`}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span>Sorted by match score</span>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-terracotta mx-auto mb-4" />
            <p className="text-muted-foreground">Finding your perfect matches...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Error loading matches</h3>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No matches found</h3>
          <p className="text-muted-foreground max-w-md">
            Try adjusting your search or filters to find potential co-founders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-elevated transition-all hover:-translate-y-1"
            >
              {/* Match Score Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <Link 
                    to={`/user/${match.id}`}
                    className="w-14 h-14 rounded-full flex-shrink-0 hover:scale-105 transition-transform"
                  >
                    {match.avatar_url ? (
                      <img 
                        src={match.avatar_url} 
                        alt={match.full_name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xl">
                          {match.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/user/${match.id}`} className="hover:underline">
                      <h3 className="font-display font-bold text-foreground">{match.full_name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span className="truncate">{match.university}</span>
                    </div>
                    {match.role && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {match.role}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getMatchColor(match.matchScore)}`}>
                  {match.matchScore}%
                </div>
              </div>

              {match.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {match.bio}
                </p>
              )}

              {/* Shared Interests */}
              {match.sharedInterests.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Heart className="w-3 h-3 text-terracotta" />
                    Shared Interests
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.sharedInterests.slice(0, 3).map((interest) => (
                      <Badge
                        key={interest}
                        className="text-xs sm:text-[13px] px-2.5 py-1 bg-terracotta/10 text-terracotta border-terracotta/20"
                      >
                        {interest}
                      </Badge>
                    ))}
                    {match.sharedInterests.length > 3 && (
                      <Badge variant="outline" className="text-xs sm:text-[13px] px-2.5 py-1">
                        +{match.sharedInterests.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Complementary Skills */}
              {match.complementarySkills.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Briefcase className="w-3 h-3" />
                    Skills They Bring
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.complementarySkills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-xs sm:text-[13px] px-2.5 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {match.complementarySkills.length > 3 && (
                      <Badge variant="outline" className="text-xs sm:text-[13px] px-2.5 py-1">
                        +{match.complementarySkills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                {(() => {
                  const status = getConnectionStatus(match.id);
                  const isPending = status === "pending";
                  const isAccepted = status === "accepted";
                  return (
                    <Button
                      variant={isAccepted ? "secondary" : "hero"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleConnect(match.id)}
                      disabled={isPending || isAccepted || sendConnectionRequest.isPending}
                    >
                      {isAccepted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Connected
                        </>
                      ) : isPending ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Pending
                        </>
                      ) : sendConnectionRequest.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  );
                })()}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/user/${match.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Discover;
