import { AI_REQUEST_TIMEOUT, apiClient } from "./client";
import type {
  ApiEnvelope,
  CreateGithubReadmeInput,
  GenerateReadmeAiInput,
  GithubReadme,
  ImportReadmeInput,
  UpdateGithubReadmeInput,
} from "@/types";

export const githubReadmeApi = {
  /** Fetch all GitHub README projects belonging to authenticated user */
  async list(): Promise<GithubReadme[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ readmes: GithubReadme[] }>>("/github-readme");
      return res.data?.data?.readmes ?? [];
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 501) return [];
      throw err;
    }
  },

  /** Fetch single README by ID */
  async get(id: string): Promise<GithubReadme> {
    const res = await apiClient.get<ApiEnvelope<{ readme: GithubReadme }>>(`/github-readme/${id}`);
    return res.data.data.readme;
  },

  /** Create a new README project */
  async create(payload: CreateGithubReadmeInput): Promise<GithubReadme> {
    const res = await apiClient.post<ApiEnvelope<{ readme: GithubReadme }>>("/github-readme", payload);
    return res.data.data.readme;
  },

  /** Update an existing README project */
  async update(id: string, payload: UpdateGithubReadmeInput): Promise<GithubReadme> {
    const res = await apiClient.patch<ApiEnvelope<{ readme: GithubReadme }>>(`/github-readme/${id}`, payload);
    return res.data.data.readme;
  },

  /** Delete a README project */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/github-readme/${id}`);
  },

  /** Generate README with Gemini AI */
  async generateAi(payload: GenerateReadmeAiInput): Promise<GithubReadme> {
    const res = await apiClient.post<ApiEnvelope<{ readme: GithubReadme }>>(
      "/github-readme/generate/ai",
      payload,
      { timeout: AI_REQUEST_TIMEOUT },
    );
    return res.data.data.readme;
  },

  /** Import raw Markdown */
  async importMarkdown(payload: ImportReadmeInput): Promise<GithubReadme> {
    const res = await apiClient.post<ApiEnvelope<{ readme: GithubReadme }>>("/github-readme/import", payload);
    return res.data.data.readme;
  },
};
export default githubReadmeApi;
