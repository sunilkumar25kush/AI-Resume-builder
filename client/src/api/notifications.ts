import { apiClient } from "./client";
import type { ApiEnvelope, NotificationsPage } from "@/types";

export const notificationsApi = {
  async list(page = 1): Promise<NotificationsPage> {
    const res = await apiClient.get<ApiEnvelope<NotificationsPage>>("/notifications", { params: { page } });
    return res.data.data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch<ApiEnvelope<null>>(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch<ApiEnvelope<null>>("/notifications/read-all");
  },
};
