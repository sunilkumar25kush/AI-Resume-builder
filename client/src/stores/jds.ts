import { create } from "zustand";

import { jdsApi } from "@/api/jds";
import type { JobDescription } from "@/types";

interface JdsState {
  items: JobDescription[];
  loading: boolean;
  fetch: () => Promise<void>;
  prepend: (jd: JobDescription) => void;
  remove: (id: string) => Promise<void>;
}

export const useJdsStore = create<JdsState>((set) => ({
  items: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const items = await jdsApi.list();
      set({ items });
    } finally {
      set({ loading: false });
    }
  },

  prepend: (jd) => set((state) => ({ items: [jd, ...state.items.filter((item) => item._id !== jd._id)] })),

  remove: async (id) => {
    await jdsApi.remove(id);
    set((state) => ({ items: state.items.filter((item) => item._id !== id) }));
  },
}));
