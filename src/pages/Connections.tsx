import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useConnections } from "@/hooks/useMatching";
import { useGetOrCreateConversation } from "@/hooks/useMessaging";
import { AvatarPreview } from "@/components/AvatarPreview";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  UserCheck,
  UserX,
  MessageSquare,
  Loader2,
  Clock,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Connections = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: connectionsData, isLoading } = useConnections();
  const getOrCreateConversation = useGetOrCreateConversation();

  const accepted = connectionsData?.accepted || [];
  // Combine incoming pending and sent requests, marking incoming ones
  const incomingPending = (connectionsData?.pending || []).map((c: any) => ({ ...c, isIncoming: true }));
  const sentPending = (connectionsData?.sent || []).map((c: any) => ({ ...c, isIncoming: false }));
  const pending = [...incomingPending, ...sentPending];

  // Helper to get the "other person" from a connection
  const getOtherPerson = (connection: any, forIncoming: boolean) => {
    if (forIncoming) {
      return connection.requester; // They sent to us
    }
    return connection.receiver; // We sent to them
  };

  const handleAccept = async (connectionId: string) => {
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connection accepted!",
        description: "You are now connected.",
      });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    }
  };

  const handleReject = async (connectionId: string) => {
    const { error } = await supabase
      .from("connections")
      .update({ status: "rejected" })
      .eq("id", connectionId);

    if (error) {
      toast({
        title: "Error", 
        description: "Failed to reject request.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Request declined" });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    }
  };

  const handleStartChat = async (otherUserId: string) => {
    try {
      await getOrCreateConversation.mutateAsync(otherUserId);
      navigate("/messages");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout
      title="My Connections"
      subtitle="Manage your co-founder network"
    >
      <Tabs defaultValue="accepted" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="accepted" className="gap-2">
            <UserCheck className="w-4 h-4" />
            Connected ({accepted.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pending.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accepted">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
            </div>
          ) : accepted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-card rounded-2xl border border-border p-8">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No connections yet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Start connecting with potential co-founders to build your network.
              </p>
              <Button asChild>
                <a href="/discover">Discover Co-Founders</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accepted.map((connection: any) => {
                // For accepted, get the other person (could be requester or receiver)
                const person = connection.requester || connection.receiver;
                return (
                  <div
                    key={connection.id}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <AvatarPreview
                        src={person?.avatar_url}
                        name={person?.full_name}
                        size={48}
                        className="flex-shrink-0"
                        fallback={
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">
                              {person?.full_name?.charAt(0) || "?"}
                            </span>
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground">{person?.full_name}</h3>
                          <VerifiedBadge email={person?.email} compact />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          <span className="truncate">{person?.university}</span>
                        </div>
                        {person?.role && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {person.role}
                          </Badge>
                        )}
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => person?.id && handleStartChat(person.id)}
                        disabled={getOrCreateConversation.isPending}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
            </div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-card rounded-2xl border border-border p-8">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No pending requests</h3>
              <p className="text-muted-foreground max-w-md">
                When someone wants to connect with you, you will see their request here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pending.map((connection: any) => {
                // For pending: if incoming, show requester; if sent, show receiver
                const person = connection.isIncoming ? connection.requester : connection.receiver;
                const isIncoming = connection.isIncoming;
                return (
                  <div key={connection.id} className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <AvatarPreview
                        src={person?.avatar_url}
                        name={person?.full_name}
                        size={48}
                        className="flex-shrink-0"
                        fallback={
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-ochre to-forest flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">
                              {person?.full_name?.charAt(0) || "?"}
                            </span>
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground">{person?.full_name}</h3>
                          <VerifiedBadge email={person?.email} compact />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          <span className="truncate">{person?.university}</span>
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {isIncoming ? "Wants to connect" : "Request sent"}
                        </Badge>
                      </div>
                    </div>
                    {isIncoming ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleAccept(connection.id)}
                        >
                          <UserCheck className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(connection.id)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        Waiting for response...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Connections;
