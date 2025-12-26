import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  useCofounderMatches, 
  useGoals, 
  useDashboardStats,
  useCreateGoal,
  useUpdateGoal,
  useSendConnectionRequest,
  useConnections
} from "@/hooks/useMatching";
import { 
  Users, 
  ChevronRight,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Loader2,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: matches, isLoading: matchesLoading } = useCofounderMatches(5);
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: connectionsData } = useConnections();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const sendConnection = useSendConnectionRequest();
  const { toast } = useToast();
  
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
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
      const otherId = c.requester_id === profile?.id ? c.receiver_id : c.requester_id;
      if (otherId) set.add(otherId);
    });
    return set;
  }, [connectionsData, profile?.id]);

  const getConnectionStatus = (targetUserId: string) => {
    if (acceptedIds.has(targetUserId)) return "accepted" as const;
    if (pendingSentIds.has(targetUserId) || pendingIncomingIds.has(targetUserId) || optimisticPending.has(targetUserId)) {
      return "pending" as const;
    }
    return "none" as const;
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;
    
    try {
      await createGoal.mutateAsync({ title: newGoalTitle });
      setNewGoalTitle("");
      setShowAddGoal(false);
      toast({
        title: "Goal added!",
        description: "Your new goal has been created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal.",
        variant: "destructive",
      });
    }
  };

  const handleToggleGoalStatus = async (goalId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await updateGoal.mutateAsync({ id: goalId, status: newStatus });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (matchId: string) => {
    const status = getConnectionStatus(matchId);
    if (status === "accepted") {
      toast({ title: "Already connected", description: "You’re already connected with this user." });
      return;
    }
    if (status === "pending") {
      toast({ title: "Request already pending", description: "Await their response or accept their request." });
      return;
    }

    try {
      await sendConnection.mutateAsync(matchId);
      setOptimisticPending((prev) => new Set(prev).add(matchId));
      toast({
        title: "Connection request sent",
        description: "Request set to pending. Share one concise proposal (max 50 words) while you wait.",
      });
    } catch (error: any) {
      toast({
        title: "Could not send request",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeGoals = goals?.filter((g: any) => g.status !== 'completed').slice(0, 5) || [];
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout 
      title={`Welcome back, ${firstName}! 👋`}
      subtitle="Ready to find your perfect co-founder today?"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-terracotta" />
            </div>
            {!statsLoading && stats && stats.potentialMatches > 0 && (
              <span className="text-xs font-medium text-forest bg-forest/10 px-2 py-1 rounded-full">
                New matches
              </span>
            )}
          </div>
          {statsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <p className="text-2xl font-display font-bold text-foreground mb-1">
                {stats?.potentialMatches || 0}
              </p>
              <p className="text-sm text-muted-foreground">Potential Matches</p>
            </>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-ochre/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-ochre" />
            </div>
          </div>
          {statsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <p className="text-2xl font-display font-bold text-foreground mb-1">
                {stats?.activeGoals || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Goals</p>
            </>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-forest" />
            </div>
          </div>
          {statsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <p className="text-2xl font-display font-bold text-foreground mb-1">
                {stats?.profileCompleteness || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Profile Completion</p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-soft">
          <div className="p-6 border-b border-border flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-terracotta" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Top Co-Founder Matches
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl md:max-w-xl">
              Connection requests stay pending until accepted or rejected. You can send one proposal (up to 50 words) per request and up to 20 proposals each week—make each outreach intentional and focused on your startup idea.
            </p>
            <Link to="/discover" className="text-sm text-primary hover:underline flex items-center gap-1 md:self-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {matchesLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
            </div>
          ) : matches && matches.length > 0 ? (
            <div className="divide-y divide-border">
              {matches.map((match) => (
                <div key={match.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                  {match.avatar_url ? (
                    <img 
                      src={match.avatar_url} 
                      alt={match.full_name || 'User'}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold">
                        {match.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{match.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {match.university}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-forest/10 text-forest">
                      {match.matchScore}% match
                    </span>
                    {(() => {
                      const status = getConnectionStatus(match.id);
                      const isPending = status === "pending";
                      const isAccepted = status === "accepted";
                      return (
                        <Button 
                          size="sm" 
                          variant={isAccepted ? "secondary" : "outline"} 
                          className="text-xs"
                          onClick={() => handleConnect(match.id)}
                          disabled={isPending || isAccepted || sendConnection.isPending}
                        >
                          {isAccepted ? (
                            <>Connected</>
                          ) : isPending ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          ) : sendConnection.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Sending
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 mr-1" />
                              Connect
                            </>
                          )}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No matches yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your profile to get matched with potential co-founders.
              </p>
              <Button asChild>
                <Link to="/profile">Complete Profile</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ochre" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Your Goals
              </h2>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowAddGoal(!showAddGoal)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-4 space-y-3">
            {showAddGoal && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-2">
                <Input
                  placeholder="Enter your goal..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddGoal} disabled={createGoal.isPending}>
                    {createGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddGoal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {goalsLoading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-ochre" />
              </div>
            ) : activeGoals.length > 0 ? (
              activeGoals.map((goal: any) => (
                <div 
                  key={goal.id} 
                  className="p-4 rounded-xl bg-muted/50 border border-border/50 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => handleToggleGoalStatus(goal.id, goal.status)}
                        className="mt-0.5 w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center hover:border-forest hover:bg-forest/10 transition-colors"
                      >
                        {goal.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-forest" />
                        )}
                      </button>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {goal.title}
                        </p>
                        {goal.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(goal.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {goal.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <Target className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No goals yet. Add one to stay accountable!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/discover" 
          className="p-4 bg-gradient-to-br from-terracotta/10 to-ochre/10 rounded-xl border border-terracotta/20 hover:border-terracotta/40 transition-colors group"
        >
          <Users className="w-8 h-8 text-terracotta mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-foreground">Find Co-Founders</h3>
          <p className="text-sm text-muted-foreground">Discover your perfect match</p>
        </Link>
        
        <Link 
          to="/ideas" 
          className="p-4 bg-gradient-to-br from-ochre/10 to-forest/10 rounded-xl border border-ochre/20 hover:border-ochre/40 transition-colors group"
        >
          <Target className="w-8 h-8 text-ochre mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-foreground">Share Your Idea</h3>
          <p className="text-sm text-muted-foreground">Post your startup concept</p>
        </Link>
        
        <Link 
          to="/connections" 
          className="p-4 bg-gradient-to-br from-forest/10 to-terracotta/10 rounded-xl border border-forest/20 hover:border-forest/40 transition-colors group"
        >
          <UserPlus className="w-8 h-8 text-forest mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-foreground">My Connections</h3>
          <p className="text-sm text-muted-foreground">Manage your network</p>
        </Link>
        
        <Link 
          to="/profile" 
          className="p-4 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border hover:border-foreground/20 transition-colors group"
        >
          <TrendingUp className="w-8 h-8 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-foreground">Improve Profile</h3>
          <p className="text-sm text-muted-foreground">Boost your visibility</p>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
