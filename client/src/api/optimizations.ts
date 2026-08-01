import { AI_REQUEST_TIMEOUT, apiClient } from "./client";
import type { ApiEnvelope, Optimization } from "@/types";

export const optimizationsApi = {
  async run(resumeId: string, jdId: string): Promise<Optimization> {
    const res = await apiClient.post<ApiEnvelope<{ optimization: Optimization }>>(
      "/optimizations",
      {
        resumeId,
        jdId,
      },
      { timeout: AI_REQUEST_TIMEOUT },
    );
    return res.data.data.optimization;
  },

  async list(): Promise<Optimization[]> {
    const res = await apiClient.get<ApiEnvelope<{ optimizations: Optimization[] }>>("/optimizations");
    return res.data.data.optimizations;
  },

  async get(id: string): Promise<Optimization> {
    const res = await apiClient.get<ApiEnvelope<{ optimization: Optimization }>>(`/optimizations/${id}`);
    return res.data.data.optimization;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/optimizations/${id}`);
  },
};
