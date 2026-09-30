import { apiClient } from "./client";
import type { ApiEnvelope, Resume, ResumeVersion } from "@/types";

export const versionsApi = {
  async list(resumeId: string): Promise<ResumeVersion[]> {
    const res = await apiClient.get<ApiEnvelope<{ versions: ResumeVersion[] }>>(`/resumes/${resumeId}/versions`);
    return res.data.data.versions;
  },

  async revert(resumeId: string, versionId: string): Promise<Resume> {
    const res = await apiClient.post<ApiEnvelope<{ resume: Resume }>>(`/resumes/${resumeId}/versions/${versionId}/revert`);
    return res.data.data.resume;
  },

  /** Alias matching legacy naming */
  async restore(resumeId: string, versionId: string): Promise<Resume> {
    return this.revert(resumeId, versionId);
  },

  async clone(resumeId: string, versionId: string): Promise<ResumeVersion> {
    const res = await apiClient.post<ApiEnvelope<{ version: ResumeVersion }>>(`/resumes/${resumeId}/versions/${versionId}/clone`);
    return res.data.data.version;
  },

  /** Alias matching legacy naming */
  async duplicate(resumeId: string, versionId: string): Promise<ResumeVersion> {
    return this.clone(resumeId, versionId);
  },
};
