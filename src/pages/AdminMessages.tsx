import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ShieldCheck, RefreshCw } from "lucide-react";

interface AdminMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    email: string;
    university: string | null;
  } | null;
  conversation?: {
    participant_1: string;
    participant_2: string;
  } | null;
}

const timeFilters = [
  { label: "All time", value: "all" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

export default function AdminMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState<string>("7d");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select(
        `*, sender:profiles(id, full_name, email, university), conversation:conversations(participant_1, participant_2)`
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      setMessages(data as AdminMessage[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const message = payload.new as AdminMessage;

          const [{ data: sender }, { data: conversation }] = await Promise.all([
            supabase
              .from("profiles")
              .select("id, full_name, email, university")
              .eq("id", message.sender_id)
              .single(),
            supabase
              .from("conversations")
              .select("participant_1, participant_2")
              .eq("id", message.conversation_id)
              .single(),
          ]);

          setMessages((prev) => [{ ...message, sender, conversation }, ...prev].slice(0, 200));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const matchesTime = (createdAt: string) => {
      if (timeframe === "all") return true;
      const dateMs = new Date(createdAt).getTime();
      if (timeframe === "24h") return now - dateMs <= 24 * 60 * 60 * 1000;
      if (timeframe === "7d") return now - dateMs <= 7 * 24 * 60 * 60 * 1000;
      if (timeframe === "30d") return now - dateMs <= 30 * 24 * 60 * 60 * 1000;
      return true;
    };

    return messages.filter((msg) => {
      const matchesSearch = search.trim()
        ? [
            msg.content,
            msg.sender?.full_name || "",
            msg.sender?.email || "",
            msg.sender?.university || "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;

      const matchesUnread = showUnreadOnly ? !msg.is_read : true;

      return matchesSearch && matchesUnread && matchesTime(msg.created_at);
    });
  }, [messages, search, showUnreadOnly, timeframe]);

  return (
    <DashboardLayout title="Admin Messages" subtitle="Real-time monitoring of user conversations">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-terracotta/10 text-terracotta">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Monitoring Console</CardTitle>
                <p className="text-sm text-muted-foreground">200 most recent messages with live updates.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                Go back
              </Button>
              <Button variant="outline" size="sm" onClick={fetchMessages} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Input
                  placeholder="Search content, sender name, email, or university"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-3"
                />
              </div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant={showUnreadOnly ? "default" : "outline"}
                className="justify-center"
                onClick={() => setShowUnreadOnly((prev) => !prev)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showUnreadOnly ? "Showing unread" : "Unread only"}
              </Button>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="secondary">{filtered.length}</Badge>
              <span>messages match current filters</span>
              <span className="text-xs">({messages.length} total loaded)</span>
            </div>

            <ScrollArea className="h-[520px] border rounded-xl">
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-6 text-sm text-muted-foreground">Loading messages...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">No messages found for the selected filters.</div>
                ) : (
                  filtered.map((msg) => (
                    <div key={msg.id} className="p-4 flex flex-col gap-2 hover:bg-muted/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{msg.sender?.full_name || "Unknown"}</Badge>
                          <span className="text-muted-foreground">{msg.sender?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                          {!msg.is_read && <Badge variant="secondary">unread</Badge>}
                        </div>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Conversation: {msg.conversation_id}</span>
                        {msg.conversation && (
                          <span>
                            Participants: {msg.conversation.participant_1.slice(0, 8)}… / {msg.conversation.participant_2.slice(0, 8)}…
                          </span>
                        )}
                        {msg.sender?.university && <Badge variant="outline">{msg.sender.university}</Badge>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
