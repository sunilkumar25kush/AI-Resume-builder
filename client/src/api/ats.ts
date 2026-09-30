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

export const atsEvaluationsApi = {
  /** Instant deterministic ATS check — no AI call. Optional JD adds match metrics. */
  async evaluate(input: AtsCheckInput): Promise<AtsReport> {
    const res = await apiClient.post<ApiEnvelope<AtsReport>>("/ats-evaluations", input);
    return res.data.data;
  },

  /** Alias matching legacy signature */
  async check(input: AtsCheckInput): Promise<AtsReport> {
    return this.evaluate(input);
  },
};

/** Backward-compatibility alias */
export const atsApi = atsEvaluationsApi;
