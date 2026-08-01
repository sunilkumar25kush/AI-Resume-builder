import { create } from "zustand";
import { persist } from "zustand/middleware";

type PrefKey = "resumeTips" | "optimizationAlerts" | "productUpdates";

interface PrefsState {
  resumeTips: boolean;
  optimizationAlerts: boolean;
  productUpdates: boolean;
  toggle: (key: PrefKey) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      resumeTips: true,
      optimizationAlerts: true,
      productUpdates: false,
      toggle: (key) => set((state) => ({ [key]: !state[key] })),
    }),
    { name: "ai-resume-prefs" },
  ),
);
