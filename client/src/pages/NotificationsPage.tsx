import { useEffect } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/stores/notifications";

export default function NotificationsPage() {
  const { items, loading, fetch, markAllRead, markRead } = useNotificationsStore();
  const navigate = useNavigate();

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const openItem = (id: string, link: string) => {
    void markRead(id);
    if (link) navigate(link);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Updates about your resumes and optimizations</p>
        </div>
        {items.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
            <CheckCheck className="mr-2 h-4 w-4" aria-hidden />
            Mark all read
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications yet"
          description="You'll see updates here when you create resumes, run optimizations or receive new features."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item._id}>
              <Card
                className={cn("cursor-pointer p-4 transition-colors hover:bg-accent/50", !item.read && "border-primary/40 bg-primary/[0.03]")}
                onClick={() => openItem(item._id, item.link)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") openItem(item._id, item.link);
                }}
                aria-label={item.title}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      item.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Bell className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {!item.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
                    </div>
                    {item.body ? <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
