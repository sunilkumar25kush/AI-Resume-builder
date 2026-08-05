import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export interface AtsCheckItem {
  label: string;
  ok: boolean;
  hint: string;
}

export interface AtsReport {
  atsScore: number;
  structureScore: number;
  matchPercent: number | null;
  keywordDensity: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  checklist: AtsCheckItem[];
  totalWords: number;
}

export interface AtsCheckInput {
  resumeId: string;
  jdId?: string;
  jdText?: string;
}

export const atsApi = {
  /** Instant deterministic ATS check — no AI call. Optional JD adds match metrics. */
  async check(input: AtsCheckInput): Promise<AtsReport> {
    const res = await apiClient.post<ApiEnvelope<AtsReport>>("/ats/check", input);
    return res.data.data;
  },
};
