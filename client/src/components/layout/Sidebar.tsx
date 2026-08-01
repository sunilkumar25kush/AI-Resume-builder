import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Brand, NavLinks } from "@/components/navigation/NavLinks";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui";

/**
 * Desktop/tablet sidebar.
 * < lg  → icon rail (tablet: collapsible by default)
 * ≥ lg  → full width unless user collapses it
 */
export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const setCollapsed = useUiStore((state) => state.setSidebarCollapsed);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden w-16 flex-col border-r bg-background transition-[width] duration-200 lg:flex",
        collapsed ? "lg:w-16" : "lg:w-64",
      )}
    >
      <div className="flex h-16 items-center border-b px-3">
        <Brand compact={collapsed} />
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Main navigation">
        <NavLinks collapsed={collapsed} />
      </nav>
      <div className="flex h-12 items-center justify-center border-t">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
