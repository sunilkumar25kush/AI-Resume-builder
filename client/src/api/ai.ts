import { AI_REQUEST_TIMEOUT, apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export type AssistSection = "summary" | "skills" | "experience" | "education" | "project";
export type AssistAction =
  | "improve"
  | "shorten"
  | "expand"
  | "rewrite"
  | "professional"
  | "technical"
  | "entry"
  | "senior"
  | "executive";

export const ASSIST_ACTION_LABELS: Record<AssistAction, string> = {
  improve: "Improve with AI",
  shorten: "Shorten",
  expand: "Expand",
  rewrite: "Rewrite",
  professional: "Professional tone",
  technical: "Technical tone",
  entry: "Entry level",
  senior: "Senior level",
  executive: "Executive tone",
};

export const aiApi = {
  /** Rewrite one section (summary text, skill list, or an entry object). */
  async assist(section: AssistSection, action: AssistAction, content: unknown): Promise<unknown> {
    const res = await apiClient.post<ApiEnvelope<{ result: unknown }>>(
      "/ai/assist",
      { section, action, content },
      { timeout: AI_REQUEST_TIMEOUT },
    );
    return res.data.data.result;
  },

  /** Editor-time JD-aware "what else should I add?" suggestions. */
  async suggestions(
    resumeId: string,
    input: { jdId?: string; jdText?: string },
  ): Promise<{ suggestions: AiSuggestion[] }> {
    const res = await apiClient.post<ApiEnvelope<{ suggestions: AiSuggestion[] }>>(
      "/ai/suggestions",
      {
        resumeId,
        jdId: input.jdId,
        jdText: input.jdText,
      },
      { timeout: AI_REQUEST_TIMEOUT },
    );
    return res.data.data;
  },
};

export type AiSuggestionType =
  | "add-skill"
  | "add-keyword"
  | "add-project"
  | "improve-summary"
  | "add-section";

export interface AiSuggestion {
  type: AiSuggestionType;
  section: string;
  field: string;
  value: string;
  detail: string;
  reason: string;
}
