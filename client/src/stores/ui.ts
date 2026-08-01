import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  /** Desktop sidebar collapsed to icon rail. */
  sidebarCollapsed: boolean;
  /** Mobile nav drawer open. */
  drawerOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      drawerOpen: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
    }),
    { name: "ai-resume-ui" },
  ),
);
