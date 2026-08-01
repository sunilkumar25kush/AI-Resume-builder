import { create } from "zustand";

import { resumesApi } from "@/api/resumes";
import type { Resume } from "@/types";

interface ResumesState {
  items: Resume[];
  loading: boolean;
  fetch: () => Promise<void>;
  prepend: (resume: Resume) => void;
  remove: (id: string) => Promise<void>;
}

export const useResumesStore = create<ResumesState>((set) => ({
  items: [],
  loading: false,

  async fetch() {
    set({ loading: true });
    try {
      const items = await resumesApi.list();
      set({ items });
    } finally {
      set({ loading: false });
    }
  },

  prepend: (resume) => set((state) => ({ items: [resume, ...state.items.filter((r) => r._id !== resume._id)] })),

  async remove(id) {
    await resumesApi.remove(id);
    set((state) => ({ items: state.items.filter((r) => r._id !== id) }));
  },
}));
