import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authApi } from "@/api/auth";
import { setUnauthorizedHandler } from "@/api/client";
import type { LoginInput, RegisterInput, UpdateProfileInput, User } from "@/types";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "loading",

  setUser: (user) => set({ user, status: user ? "authenticated" : "guest" }),

  fetchMe: async () => {
    try {
      const user = await authApi.me();
      if (user) {
        set({ user, status: "authenticated" });
      } else {
        set({ user: null, status: "guest" });
      }
    } catch (err: unknown) {
      // If server is waking up (503 / network hiccup during Render cold start), retry once
      const status = (err as { response?: { status?: number } })?.response?.status;
      const code = (err as { code?: string })?.code;
      if (status === 503 || code === "ERR_NETWORK") {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const retryUser = await authApi.me();
          if (retryUser) {
            set({ user: retryUser, status: "authenticated" });
            return;
          }
        } catch {
          // Fall through to guest
        }
      }
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

  updateProfile: async (data) => {
    const user = await authApi.updateProfile(data);
    set({ user });
  },

  uploadAvatar: async (file) => {
    const user = await authApi.uploadAvatar(file);
    set({ user });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: "guest" });
    }
  },
}),
    {
      name: "arb-auth",
      // Never persist status as authenticated in localStorage — always verify via fetchMe on startup
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

// Expired/invalid session anywhere → drop user state (routes redirect to /login).
setUnauthorizedHandler(() => useAuthStore.getState().setUser(null));
