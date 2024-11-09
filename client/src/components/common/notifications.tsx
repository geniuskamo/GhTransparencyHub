import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { GHANA_COLORS } from "@/lib/constants";

export function NotificationsPopover() {
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-medium flex items-center justify-center text-white"
              style={{ backgroundColor: GHANA_COLORS.red }}
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <h3 className="font-semibold mb-2">Notifications</h3>
        <ScrollArea className="h-80">
          {notifications?.length ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg text-sm ${
                    notification.read ? "bg-muted" : "bg-primary/10"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="font-medium mb-1">{notification.title}</div>
                  <p className="text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">
              No notifications
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
