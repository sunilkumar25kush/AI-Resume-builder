import { apiClient } from "./client";
import type { ApiEnvelope, JobDescription } from "@/types";

export interface JdUpdateData {
  title?: string;
  company?: string;
  skills?: string[];
  preferredSkills?: string[];
  qualifications?: string[];
  responsibilities?: string[];
  atsKeywords?: string[];
  softSkills?: string[];
  industryKeywords?: string[];
  experienceRequired?: string;
}

export const jdsApi = {
  async list(): Promise<JobDescription[]> {
    const res = await apiClient.get<ApiEnvelope<{ jds: JobDescription[] }>>("/jds");
    return res.data.data.jds;
  },

  async get(id: string): Promise<JobDescription> {
    const res = await apiClient.get<ApiEnvelope<{ jd: JobDescription }>>(`/jds/${id}`);
    return res.data.data.jd;
  },

  async createFromText(text: string): Promise<JobDescription> {
    const res = await apiClient.post<ApiEnvelope<{ jd: JobDescription }>>("/jds", { text });
    return res.data.data.jd;
  },

  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<JobDescription> {
    const form = new FormData();
    form.append("jd", file);
    const res = await apiClient.post<ApiEnvelope<{ jd: JobDescription }>>("/jds", form, {
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });
    return res.data.data.jd;
  },

  async update(id: string, data: JdUpdateData): Promise<JobDescription> {
    const res = await apiClient.patch<ApiEnvelope<{ jd: JobDescription }>>(`/jds/${id}`, data);
    return res.data.data.jd;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/jds/${id}`);
  },
};
