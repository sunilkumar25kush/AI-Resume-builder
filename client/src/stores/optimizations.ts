import { create } from "zustand";

import { optimizationsApi } from "@/api/optimizations";
import type { Optimization } from "@/types";

interface OptimizationsState {
  items: Optimization[];
  loading: boolean;
  fetch: () => Promise<void>;
  prepend: (optimization: Optimization) => void;
  remove: (id: string) => Promise<void>;
}

export const useOptimizationsStore = create<OptimizationsState>((set) => ({
  items: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const items = await optimizationsApi.list();
      set({ items });
    } finally {
      set({ loading: false });
    }
  },

  prepend: (optimization) =>
    set((state) => ({
      items: [optimization, ...state.items.filter((item) => item._id !== optimization._id)],
    })),

  remove: async (id) => {
    await optimizationsApi.remove(id);
    set((state) => ({ items: state.items.filter((item) => item._id !== id) }));
  },
}));
