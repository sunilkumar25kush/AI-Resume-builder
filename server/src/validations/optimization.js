import { z } from "zod";

/** POST /api/optimizations body. */
export const runOptimizationSchema = z.object({
  resumeId: z.string().min(1),
  jdId: z.string().min(1),
});

/** One concrete addition the AI recommends (or made) to raise the ATS score. */
const aiChangeSchema = z.object({
  type: z
    .enum(["add-skill", "add-keyword", "add-section", "improve-description", "add-technologies", "add-project"])
    .catch("add-skill"),
  section: z.string().max(100).default("skills"),
  field: z.string().max(100).default("skills"),
  value: z.string().max(2000).default(""),
  reason: z.string().max(500).default(""),
});

/**
 * Normalizes whatever the AI returned into the guaranteed result shape —
 * a degraded score is still a usable score.
 */
const optimizationResultSchema = z.object({
  atsScore: z.unknown().optional(),
  matchPercent: z.unknown().optional(),
  keywordDensity: z.unknown().optional(),
  missingSkills: z.array(z.string().max(200)).max(50).catch([]),
  matchedSkills: z.array(z.string().max(200)).max(50).catch([]),
  weakBullets: z.array(z.string().max(500)).max(30).catch([]),
  grammarIssues: z.array(z.string().max(500)).max(30).catch([]),
  formattingSuggestions: z.array(z.string().max(500)).max(30).catch([]),
  keywordSuggestions: z.array(z.string().max(200)).max(50).catch([]),
  changes: z.array(aiChangeSchema).max(50).catch([]),
  summary: z.string().max(2000).catch(""),
});

/** Coerce any AI value to an integer clamped to 0-100 (invalid → fallback). */
function clampScore(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Pick valid result keys only — ignores stray AI fields. */
export function normalizeResult(raw) {
  const parsed = optimizationResultSchema.parse(raw ?? {});
  const unique = (list) => [...new Set(list.map((item) => item.trim()).filter(Boolean))];
  return {
    atsScore: clampScore(parsed.atsScore),
    matchPercent: clampScore(parsed.matchPercent),
    keywordDensity: clampScore(parsed.keywordDensity),
    missingSkills: unique(parsed.missingSkills).slice(0, 50),
    matchedSkills: unique(parsed.matchedSkills).slice(0, 50),
    weakBullets: unique(parsed.weakBullets).slice(0, 30),
    grammarIssues: unique(parsed.grammarIssues).slice(0, 30),
    formattingSuggestions: unique(parsed.formattingSuggestions).slice(0, 30),
    keywordSuggestions: unique(parsed.keywordSuggestions).slice(0, 50),
    changes: parsed.changes
      .filter((change) => typeof change.value === "string" && change.value.trim().length > 0)
      .slice(0, 50),
    summary: parsed.summary,
  };
}
