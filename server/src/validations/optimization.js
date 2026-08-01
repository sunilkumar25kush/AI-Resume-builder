import { z } from "zod";

/** POST /api/optimizations body. */
export const runOptimizationSchema = z.object({
  resumeId: z.string().min(1),
  jdId: z.string().min(1),
});

/**
 * Normalizes whatever the AI returned into the guaranteed result shape —
 * a degraded score is still a usable score.
 */
const optimizationResultSchema = z.object({
  atsScore: z.unknown().optional(),
  matchPercent: z.unknown().optional(),
  missingSkills: z.array(z.string().max(200)).max(50).catch([]),
  keywordSuggestions: z.array(z.string().max(200)).max(50).catch([]),
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
    missingSkills: unique(parsed.missingSkills).slice(0, 50),
    keywordSuggestions: unique(parsed.keywordSuggestions).slice(0, 50),
    summary: parsed.summary,
  };
}
