import { create } from "zustand";

import { authApi } from "@/api/auth";
import { setUnauthorizedHandler } from "@/api/client";
import type { LoginInput, RegisterInput, User } from "@/types";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "loading",

  setUser: (user) => set({ user, status: user ? "authenticated" : "guest" }),

  fetchMe: async () => {
    try {
      const user = await authApi.me();
      set({ user, status: "authenticated" });
    } catch {
      set({ user: null, status: "guest" });
    }
  },

  login: async (data) => {
    const user = await authApi.login(data);
    set({ user, status: "authenticated" });
  },

  register: async (data) => {
    const user = await authApi.register(data);
    set({ user, status: "authenticated" });
  },

  googleLogin: async (credential) => {
    const user = await authApi.googleLogin(credential);
    set({ user, status: "authenticated" });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: "guest" });
    }
  },
}));

// Expired/invalid session anywhere → drop user state (routes redirect to /login).
setUnauthorizedHandler(() => useAuthStore.getState().setUser(null));
