import { apiClient } from "./client";
import type { ApiEnvelope, Resume, ResumeVersion } from "@/types";

export const versionsApi = {
  async list(resumeId: string): Promise<ResumeVersion[]> {
    const res = await apiClient.get<ApiEnvelope<{ versions: ResumeVersion[] }>>(`/resumes/${resumeId}/versions`);
    return res.data.data.versions;
  },

  async get(resumeId: string, versionId: string): Promise<ResumeVersion> {
    const res = await apiClient.get<ApiEnvelope<{ version: ResumeVersion }>>(
      `/resumes/${resumeId}/versions/${versionId}`,
    );
    return res.data.data.version;
  },

  async restore(resumeId: string, versionId: string): Promise<Resume> {
    const res = await apiClient.post<ApiEnvelope<{ resume: Resume }>>(`/resumes/${resumeId}/versions/${versionId}/restore`);
    return res.data.data.resume;
  },

  async duplicate(resumeId: string, versionId: string): Promise<ResumeVersion> {
    const res = await apiClient.post<ApiEnvelope<{ version: ResumeVersion }>>(`/resumes/${resumeId}/versions/${versionId}/duplicate`);
    return res.data.data.version;
  },
};
