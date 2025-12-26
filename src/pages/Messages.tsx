import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useRealtimeMessages,
  Conversation,
} from "@/hooks/useMessaging";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedConversation?.id || null);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const proposalWordCount = messageInput.trim()
    ? messageInput.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // Real-time subscription
  useRealtimeMessages(selectedConversation?.id || null);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation?.id && selectedConversation.unread_count && selectedConversation.unread_count > 0) {
      markAsRead.mutate(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversation.id,
        content: messageInput.trim(),
      });
      setMessageInput("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations?.filter((conv) =>
    conv.other_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <DashboardLayout title="Messages" subtitle="Chat with your connections">
      <div className="bg-card rounded-2xl border border-border overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div
            className={cn(
              "w-full md:w-80 border-r border-border flex flex-col",
              selectedConversation ? "hidden md:flex" : "flex"
            )}
          >
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50",
                      selectedConversation?.id === conv.id && "bg-muted"
                    )}
                  >
                    {conv.other_user?.avatar_url ? (
                      <img 
                        src={conv.other_user.avatar_url} 
                        alt={conv.other_user.full_name || 'User'}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground font-bold">
                          {conv.other_user?.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground truncate">
                          {conv.other_user?.full_name}
                        </p>
                        {conv.last_message && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTime(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.other_user?.university}
                      </p>
                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.last_message.sender_id === user?.id && "You: "}
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>
                    {conv.unread_count && conv.unread_count > 0 && (
                      <span className="bg-terracotta text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">No conversations yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with co-founders to start chatting!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              "flex-1 flex flex-col",
              !selectedConversation ? "hidden md:flex" : "flex"
            )}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  {selectedConversation.other_user?.avatar_url ? (
                    <img 
                      src={selectedConversation.other_user.avatar_url} 
                      alt={selectedConversation.other_user.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">
                        {selectedConversation.other_user?.full_name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedConversation.other_user?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.other_user?.university}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            isOwnMessage ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              isOwnMessage
                                ? "bg-terracotta text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={cn(
                                "flex items-center gap-1 mt-1",
                                isOwnMessage ? "justify-end" : "justify-start"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-xs",
                                  isOwnMessage
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatTime(message.created_at)}
                              </span>
                              {isOwnMessage && (
                                message.is_read ? (
                                  <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                                ) : (
                                  <Check className="w-3 h-3 text-primary-foreground/70" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No messages yet. Say hello! 👋
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!messageInput.trim() || sendMessage.isPending}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>
                      Proposal rule: while a connection request is pending you can send one proposal up to 50 words. If they reject it, you can’t message again unless they accept. You can send proposals to up to 20 students per week, so keep it focused on your startup idea.
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        proposalWordCount > 50 ? "text-destructive" : "text-foreground"
                      )}
                    >
                      {proposalWordCount}/50 words
                    </span>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Choose a conversation from the list or connect with a co-founder to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
