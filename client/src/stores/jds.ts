import { create } from "zustand";

import { jdsApi, type JdUpdateData } from "@/api/jds";
import type { JobDescription } from "@/types";

interface JdsState {
  items: JobDescription[];
  loading: boolean;
  fetch: () => Promise<void>;
  prepend: (jd: JobDescription) => void;
  update: (id: string, data: JdUpdateData) => Promise<JobDescription>;
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

  update: async (id, data) => {
    const updated = await jdsApi.update(id, data);
    set((state) => ({ items: state.items.map((item) => (item._id === id ? updated : item)) }));
    return updated;
  },

  remove: async (id) => {
    await jdsApi.remove(id);
    set((state) => ({ items: state.items.filter((item) => item._id !== id) }));
  },
}));
