import { Menu } from "lucide-react";
import { useLocation } from "react-router";

import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { NAV_GROUPS } from "@/constants/nav";
import { useUiStore } from "@/stores/ui";

/** Current page title derived from nav config (falls back to empty). */
function usePageTitle(): string {
  const { pathname } = useLocation();
  for (const group of NAV_GROUPS) {
    const match = group.items.find((item) => item.href && item.href === pathname);
    if (match) return match.label;
  }
  return "";
}

export function Topbar() {
  const setDrawerOpen = useUiStore((state) => state.setDrawerOpen);
  const title = usePageTitle();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
          <span className="truncate text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationsBell />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
