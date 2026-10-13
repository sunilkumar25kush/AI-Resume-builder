import { AI_REQUEST_TIMEOUT, apiClient } from "./client";
import type { ApiEnvelope, CreatePortfolioInput, Portfolio } from "@/types";

export const portfoliosApi = {
  /** Fetch all portfolios belonging to the authenticated user. */
  async list(): Promise<Portfolio[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ portfolios: Portfolio[] }>>("/portfolios");
      return res.data?.data?.portfolios ?? [];
    } catch (err: unknown) {
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

  /** Create a new portfolio (blank draft or seeded). */
  async create(payload: CreatePortfolioInput): Promise<Portfolio> {
    const res = await apiClient.post<ApiEnvelope<{ portfolio: Portfolio }>>("/portfolios", payload);
    return res.data.data.portfolio;
  },

  /** Upload a PDF/DOCX resume file and generate a portfolio draft with AI */
  async uploadAndGenerate(
    file: File,
    options?: { template?: string; title?: string },
    onProgress?: (percent: number) => void,
  ): Promise<Portfolio> {
    const form = new FormData();
    form.append("resume", file);
    if (options?.template) form.append("template", options.template);
    if (options?.title) form.append("title", options.title);

    const res = await apiClient.post<ApiEnvelope<{ portfolio: Portfolio }>>(
      "/portfolios/generate/upload",
      form,
      {
        timeout: AI_REQUEST_TIMEOUT,
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      },
    );
    return res.data.data.portfolio;
  },

  /** Generate a portfolio draft from an existing resume in the account */
  async generateFromResume(
    resumeId: string,
    options?: { template?: string; title?: string },
  ): Promise<Portfolio> {
    const res = await apiClient.post<ApiEnvelope<{ portfolio: Portfolio }>>(
      "/portfolios/generate/from-resume",
      { resumeId, ...options },
      { timeout: AI_REQUEST_TIMEOUT },
    );
    return res.data.data.portfolio;
  },

  /** Publish a portfolio */
  async publish(
    id: string,
    options?: { slug?: string; customDomain?: string; seoTitle?: string; seoDescription?: string },
  ): Promise<Portfolio> {
    const res = await apiClient.post<ApiEnvelope<{ portfolio: Portfolio }>>(
      `/portfolios/${id}/publish`,
      options,
    );
    return res.data.data.portfolio;
  },

  /** Unpublish a portfolio */
  async unpublish(id: string): Promise<Portfolio> {
    const res = await apiClient.post<ApiEnvelope<{ portfolio: Portfolio }>>(
      `/portfolios/${id}/unpublish`,
    );
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

  /** Download portfolio as React Source ZIP or Static Website ZIP */
  async downloadExport(
    id: string,
    format: "source" | "static",
    filenameFallback?: string,
  ): Promise<void> {
    const res = await apiClient.get(`/portfolios/${id}/export?format=${format}`, {
      responseType: "blob",
    });

    let filename = filenameFallback || `portfolio-${format === "static" ? "static-website" : "react-source"}.zip`;
    const disposition = res.headers?.["content-disposition"] as string | undefined;
    if (disposition) {
      const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }

    const blob = new Blob([res.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

