import { apiClient } from "./client";
import type { ApiEnvelope, ParsedResumeData, Resume, ResumeTemplate } from "@/types";

export const resumesApi = {
  async list(): Promise<Resume[]> {
    const res = await apiClient.get<ApiEnvelope<{ resumes: Resume[] }>>("/resumes");
    return res.data.data.resumes;
  },

  async upload(file: File, onProgress?: (percent: number) => void): Promise<Resume> {
    const form = new FormData();
    form.append("resume", file);
    const res = await apiClient.post<ApiEnvelope<{ resume: Resume }>>("/resumes", form, {
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return res.data.data.resume;
  },

  async get(id: string): Promise<Resume> {
    const res = await apiClient.get<ApiEnvelope<{ resume: Resume }>>(`/resumes/${id}`);
    return res.data.data.resume;
  },

  async update(id: string, update: { parsedData?: Partial<ParsedResumeData>; template?: ResumeTemplate }): Promise<Resume> {
    const res = await apiClient.patch<ApiEnvelope<{ resume: Resume }>>(`/resumes/${id}`, update);
    return res.data.data.resume;
  },

  /** AI-generate an optimized resume against a job description (saved as a new resume). */
  async generate(id: string, jdId: string): Promise<Resume> {
    const res = await apiClient.post<ApiEnvelope<{ resume: Resume }>>(`/resumes/${id}/generate`, { jdId });
    return res.data.data.resume;
  },

  /** Wizard Workflow 1: generate a fresh resume from a job description only. */
  async generateFromJd(input: { jdId: string; targetTitle: string; experienceLevel: "fresher" | "junior" | "senior" }): Promise<Resume> {
    const res = await apiClient.post<ApiEnvelope<{ resume: Resume }>>("/resumes/generate-from-jd", input);
    return res.data.data.resume;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  },
};
