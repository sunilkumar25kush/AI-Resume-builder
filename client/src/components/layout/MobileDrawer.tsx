import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { Brand, NavLinks } from "@/components/navigation/NavLinks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Full-screen navigation drawer for mobile (< lg). */
export function MobileDrawer() {
  const open = useUiStore((state) => state.drawerOpen);
  const setOpen = useUiStore((state) => state.setDrawerOpen);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="flex w-[85vw] max-w-sm flex-col gap-0 p-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex h-16 items-center border-b px-4">
          <Brand />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation drawer">
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-9 w-9">
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <AvatarFallback>{getInitials(user?.name ?? "?")}</AvatarFallback>}
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={() => {
              setOpen(false);
              void logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
