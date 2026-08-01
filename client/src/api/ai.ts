import { apiClient } from "./client";
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
    const res = await apiClient.post<ApiEnvelope<{ result: unknown }>>("/ai/assist", { section, action, content });
    return res.data.data.result;
  },
};
