import { Bell } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/stores/notifications";

/** Bell with unread badge + recent notifications dropdown. */
export function NotificationsBell() {
  const { items, unread, markAllRead, markRead } = useNotificationsStore();
  const navigate = useNavigate();

  const openItem = (id: string, link: string) => {
    void markRead(id);
    if (link) navigate(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell className="h-5 w-5" aria-hidden />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between pr-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          items.slice(0, 5).map((item) => (
            <DropdownMenuItem
              key={item._id}
              className={cn("flex flex-col items-start gap-0.5 py-2", !item.read && "bg-accent/60 font-medium")}
              onClick={() => openItem(item._id, item.link)}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="truncate text-sm">{item.title}</span>
                {!item.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
              </span>
              {item.body ? <span className="line-clamp-2 w-full text-xs font-normal text-muted-foreground">{item.body}</span> : null}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/notifications")} className="justify-center font-medium">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
