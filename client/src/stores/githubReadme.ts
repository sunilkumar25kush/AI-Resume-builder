import { create } from "zustand";
import { githubReadmeApi } from "@/api/githubReadme";
import type {
  CreateGithubReadmeInput,
  GenerateReadmeAiInput,
  GithubReadme,
  ImportReadmeInput,
  UpdateGithubReadmeInput,
} from "@/types";

interface GithubReadmeState {
  items: GithubReadme[];
  readmes: GithubReadme[];
  activeReadme: GithubReadme | null;
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  fetchReadmes: () => Promise<void>;
  getById: (id: string) => Promise<GithubReadme | null>;
  fetchReadmeById: (id: string) => Promise<GithubReadme | null>;
  create: (payload: CreateGithubReadmeInput) => Promise<GithubReadme>;
  createReadme: (payload: CreateGithubReadmeInput) => Promise<GithubReadme>;
  update: (id: string, payload: UpdateGithubReadmeInput) => Promise<GithubReadme>;
  updateReadme: (id: string, payload: UpdateGithubReadmeInput) => Promise<GithubReadme>;
  generateAi: (payload: GenerateReadmeAiInput) => Promise<GithubReadme>;
  importMarkdown: (payload: ImportReadmeInput) => Promise<GithubReadme>;
  remove: (id: string) => Promise<void>;
  removeReadme: (id: string) => Promise<void>;
  setActiveReadme: (readme: GithubReadme | null) => void;
}

export const useGithubReadmeStore = create<GithubReadmeState>((set, get) => ({
  items: [],
  get readmes() {
    return get().items;
  },
  activeReadme: null,
  loading: false,
  error: null,

  async fetch() {
    set({ loading: true, error: null });
    try {
      const items = await githubReadmeApi.list();
      set({ items, error: null, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load GitHub READMEs";
      set({ error: message, loading: false });
    }
  },

  async fetchReadmes() {
    return get().fetch();
  },

  async getById(id: string) {
    const cached = get().items.find((item) => item._id === id || item.id === id);
    if (cached) {
      set({ activeReadme: cached });
      return cached;
    }
    set({ loading: true, error: null });
    try {
      const readme = await githubReadmeApi.get(id);
      set({ activeReadme: readme, loading: false });
      return readme;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch GitHub README";
      set({ error: message, loading: false });
      return null;
    }
  },

  async fetchReadmeById(id: string) {
    return get().getById(id);
  },

  async create(payload: CreateGithubReadmeInput) {
    const readme = await githubReadmeApi.create(payload);
    set((state) => ({ items: [readme, ...state.items], activeReadme: readme }));
    return readme;
  },

  async createReadme(payload: CreateGithubReadmeInput) {
    return get().create(payload);
  },

  async update(id: string, payload: UpdateGithubReadmeInput) {
    const updated = await githubReadmeApi.update(id, payload);
    set((state) => ({
      items: state.items.map((it) => (it._id === id || it.id === id ? updated : it)),
      activeReadme: state.activeReadme?._id === id ? updated : state.activeReadme,
    }));
    return updated;
  },

  async updateReadme(id: string, payload: UpdateGithubReadmeInput) {
    return get().update(id, payload);
  },

  async generateAi(payload: GenerateReadmeAiInput) {
    const readme = await githubReadmeApi.generateAi(payload);
    set((state) => ({ items: [readme, ...state.items], activeReadme: readme }));
    return readme;
  },

  async importMarkdown(payload: ImportReadmeInput) {
    const readme = await githubReadmeApi.importMarkdown(payload);
    set((state) => ({ items: [readme, ...state.items], activeReadme: readme }));
    return readme;
  },

  async remove(id: string) {
    await githubReadmeApi.remove(id);
    set((state) => ({
      items: state.items.filter((it) => it._id !== id && it.id !== id),
      activeReadme: state.activeReadme?._id === id ? null : state.activeReadme,
    }));
  },

  async removeReadme(id: string) {
    return get().remove(id);
  },

  setActiveReadme(readme) {
    set({ activeReadme: readme });
  },
}));
