import { apiClient } from "./client";
import type { ApiEnvelope, CreatePortfolioInput, Portfolio } from "@/types";

export const portfoliosApi = {
  /** Fetch all portfolios belonging to the authenticated user. */
  async list(): Promise<Portfolio[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ portfolios: Portfolio[] }>>("/portfolios");
      return res.data?.data?.portfolios ?? [];
    } catch (err: unknown) {
      // Graceful fallback for Phase 1 before backend endpoint is activated
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 501) {
        return [];
      }
      throw err;
    }
  },

  /** Fetch a single portfolio by ID. */
  async get(id: string): Promise<Portfolio> {
    const res = await apiClient.get<ApiEnvelope<{ portfolio: Portfolio }>>(`/portfolios/${id}`);
    return res.data.data.portfolio;
  },

  /** Fetch a published portfolio by public slug. */
  async getBySlug(slug: string): Promise<Portfolio> {
    const res = await apiClient.get<ApiEnvelope<{ portfolio: Portfolio }>>(`/portfolios/public/${slug}`);
    return res.data.data.portfolio;
  },

  /** Create a new portfolio (blank or seeded from a resume). */
  async create(payload: CreatePortfolioInput): Promise<Portfolio> {
    const res = await apiClient.post<ApiEnvelope<{ portfolio: Portfolio }>>("/portfolios", payload);
    return res.data.data.portfolio;
  },

  /** Update an existing portfolio. */
  async update(id: string, payload: Partial<Portfolio>): Promise<Portfolio> {
    const res = await apiClient.patch<ApiEnvelope<{ portfolio: Portfolio }>>(`/portfolios/${id}`, payload);
    return res.data.data.portfolio;
  },

  /** Delete a portfolio. */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/portfolios/${id}`);
  },
};
