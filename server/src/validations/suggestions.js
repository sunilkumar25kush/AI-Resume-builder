import { z } from "zod";

/** POST /api/ai/suggestions body — jdId OR jdText is required. */
export const suggestionsSchema = z
  .object({
    resumeId: z.string().min(1),
    jdId: z.string().min(1).optional(),
    jdText: z.string().min(20).max(20000).optional(),
  })
  .refine((body) => body.jdId || body.jdText, {
    message: "Provide either jdId or jdText",
  });

const suggestionItemSchema = z.object({
  type: z
    .enum(["add-skill", "add-keyword", "add-project", "improve-summary", "add-section"])
    .catch("add-skill"),
  section: z.string().trim().max(40).default("skills"),
  field: z.string().trim().max(40).default("skillsText"),
  value: z.string().trim().max(2000),
  // AI occasionally returns detail as an array — flatten it defensively.
  detail: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value.join(", ") : value))
    .pipe(z.string().trim().max(4000))
    .default(""),
  reason: z.string().trim().max(500).default(""),
});

/** Normalize the AI's raw suggestions response into a safe shape. */
export function normalizeSuggestions(raw) {
  const list = Array.isArray(raw?.suggestions) ? raw.suggestions : [];
  const parsed = list
    .filter((item) => item && typeof item.value === "string" && item.value.trim().length > 0)
    .map((item) => suggestionItemSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .slice(0, 10);
  return { suggestions: parsed };
}
