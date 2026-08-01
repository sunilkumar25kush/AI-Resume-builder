import { Sparkles, type LucideIcon } from "lucide-react";
import { Link, NavLink } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ACCOUNT_NAV, GENERATORS_NAV, MAIN_NAV, type NavGroup } from "@/constants/nav";
import { useAuthStore } from "@/stores/auth";

interface NavLinksProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const GROUPS: NavGroup[] = [MAIN_NAV, GENERATORS_NAV, ACCOUNT_NAV];

/** Shared nav renderer used by the desktop sidebar and the mobile drawer. */
export function NavLinks({ collapsed = false, onNavigate }: NavLinksProps) {
  const role = useAuthStore((state) => state.user?.role);

  return (
    <div className="flex flex-col gap-4">
      {GROUPS.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || role === "admin");
        if (items.length === 0) return null;
        return (
          <div key={group.id} className="flex flex-col gap-1">
            <p
              className={cn(
                "px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                collapsed && "hidden",
              )}
            >
              {group.label}
            </p>
            {items.map((item) =>
              item.soon || !item.href ? (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "flex h-9 cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground/60",
                        collapsed && "justify-center px-0",
                      )}
                      aria-disabled="true"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                      <span className={cn("flex-1 truncate", collapsed && "hidden")}>{item.label}</span>
                      <Badge variant="secondary" className={cn("px-1.5 text-[10px]", collapsed && "hidden")}>
                        Soon
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label} — coming soon</TooltipContent>
                </Tooltip>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.href}
                  end={item.href === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary",
                      collapsed && "justify-center px-0",
                    )
                  }
                  aria-current="page"
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")}
                        aria-hidden
                      />
                      <span className={cn("flex-1 truncate", collapsed && "hidden")}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Bottom navigation (mobile only) — keep to essential destinations. */
const BOTTOM_NAV: BottomNavItem[] = [
  { label: "Home", href: "/", icon: MAIN_NAV.items[0].icon },
  { label: "Profile", href: "/profile", icon: ACCOUNT_NAV.items[0].icon },
  { label: "Settings", href: "/settings", icon: ACCOUNT_NAV.items[1].icon },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-3 pb-[env(safe-area-inset-bottom)]">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground",
                isActive && "text-primary",
              )
            }
          >
            <item.icon className="h-5 w-5" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/** Brand lockup used in sidebar + drawer. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 px-3", compact && "justify-center px-0")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="h-5 w-5" aria-hidden />
      </span>
      {!compact ? (
        <span className="truncate text-base font-semibold tracking-tight">AI Resume Builder</span>
      ) : null}
    </Link>
  );
}
