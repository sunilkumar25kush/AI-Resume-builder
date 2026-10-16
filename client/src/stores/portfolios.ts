import { create } from "zustand";

import { portfoliosApi } from "@/api/portfolios";
import type { Portfolio } from "@/types";

interface PortfoliosState {
  items: Portfolio[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  prepend: (portfolio: Portfolio) => void;
  remove: (id: string) => Promise<void>;
}

export const usePortfoliosStore = create<PortfoliosState>((set) => ({
  items: [],
  loading: false,
  error: null,

  async fetch() {
    set({ loading: true, error: null });
    try {
      const items = await portfoliosApi.list();
      set({ items, error: null, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load portfolios";
      set({ error: message, loading: false });
    }
  },

  prepend: (portfolio) =>
    set((state) => ({ items: [portfolio, ...state.items.filter((p) => p._id !== portfolio._id)] })),

  async remove(id) {
    await portfoliosApi.remove(id);
    set((state) => ({ items: state.items.filter((p) => p._id !== id) }));
  },
}));
