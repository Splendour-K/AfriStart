import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  NotificationCategory,
  NotificationItem,
  placeholderNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useRealtimeNotifications,
} from "@/hooks/useNotifications";

interface NotificationsDropdownProps {
  buttonVariant?: "ghost" | "outline" | "secondary";
  buttonSize?: "default" | "icon" | "sm";
  className?: string;
}

const categoryMeta: Record<NotificationCategory, { label: string; icon: typeof Bell; color: string }> = {
  message: { label: "Message", icon: MessageSquare, color: "bg-blue-100 text-blue-700" },
  group: { label: "Group", icon: Users, color: "bg-emerald-100 text-emerald-700" },
  idea: { label: "Idea", icon: Lightbulb, color: "bg-amber-100 text-amber-700" },
  system: { label: "Update", icon: Sparkles, color: "bg-purple-100 text-purple-700" },
};

const NotificationsDropdown = ({
  buttonVariant = "ghost",
  buttonSize = "icon",
  className,
}: NotificationsDropdownProps) => {
  const { data: notifications = placeholderNotifications, isLoading } = useNotifications();
  useRealtimeNotifications();
  const { mutate: markNotificationRead } = useMarkNotificationRead();
  const { mutate: markAllNotificationsRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  const markAsRead = (id: string) => {
    markNotificationRead(id);
  };

  const markAllAsRead = () => {
    if (unreadCount === 0) return;
    markAllNotificationsRead();
  };

  const renderIcon = (category: NotificationCategory) => {
    const meta = categoryMeta[category];
    const Icon = meta.icon;
    return (
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          meta.color,
          category === "idea" && "bg-amber-100 text-amber-700",
          category === "group" && "bg-emerald-100 text-emerald-700"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={cn("relative", className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={isMarkingAll}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isMarkingAll ? "Marking..." : "Mark all read"}
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-96">
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="flex flex-col gap-2 px-4 py-6">
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className="flex gap-3 animate-pulse">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 rounded bg-muted" />
                      <div className="h-3 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/3 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-sm text-muted-foreground">We'll keep you posted on new activity.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const meta = categoryMeta[item.category];
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors",
                      !item.read_at ? "bg-terracotta/5 hover:bg-terracotta/10" : "hover:bg-muted"
                    )}
                    onClick={() => markAsRead(item.id)}
                  >
                    {renderIcon(item.category)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</p>
                        <Badge variant="outline" className="shrink-0 border-dashed text-[11px]">
                          {meta.label}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
        <Separator />
        <div className="flex items-center justify-between px-4 py-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/messages">Open inbox</Link>
          </Button>
          <Button asChild variant="link" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link to="/settings/notifications">Notification settings</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
