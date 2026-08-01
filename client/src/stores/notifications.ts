import { create } from "zustand";

import { notificationsApi } from "@/api/notifications";
import type { NotificationItem } from "@/types";

interface NotificationsState {
  items: NotificationItem[];
  unread: number;
  loading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: [],
  unread: 0,
  loading: false,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await notificationsApi.list(1);
      set({ items: data.items, unread: data.items.filter((n) => !n.read).length });
    } catch {
      set({ items: [], unread: 0 });
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    await notificationsApi.markRead(id);
    set({
      items: get().items.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unread: Math.max(0, get().unread - 1),
    });
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead();
    set({ items: get().items.map((n) => ({ ...n, read: true })), unread: 0 });
  },

  reset: () => set({ items: [], unread: 0, loading: false }),
}));
