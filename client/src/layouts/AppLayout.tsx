import { Suspense } from "react";
import { Outlet } from "react-router";

import { BottomNav } from "@/components/navigation/NavLinks";
import { PageLoader } from "@/components/common/PageLoader";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui";

/**
 * App shell: sidebar (desktop) / drawer + bottom nav (mobile), topbar, content.
 * Content clears the bottom nav on small screens via safe padding.
 */
export function AppLayout() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh bg-background">
        <Sidebar />
        <div
          className={cn(
            "flex min-h-dvh flex-col transition-[padding] duration-200",
            collapsed ? "lg:pl-16" : "lg:pl-64",
          )}
        >
          <Topbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-6 sm:px-6 lg:pb-6">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
        <BottomNav />
        <MobileDrawer />
      </div>
    </TooltipProvider>
  );
}
