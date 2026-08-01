import { z } from "zod";

/** POST /api/resumes/:id/generate body. */
export const generateResumeSchema = z.object({
  jdId: z.string().min(1),
});

/**
 * Whatever the AI returns for a generation run. Every key is optional —
 * garbage sections fall back to the ORIGINAL resume data.
 */
const generatedDataSchema = z.object({
  summary: z.string().max(10000).optional(),
  contact: z
    .object({
      email: z.string().max(254).optional(),
      phone: z.string().max(40).optional(),
      location: z.string().max(200).optional(),
      linkedin: z.string().max(500).optional(),
      github: z.string().max(500).optional(),
    })
    .optional(),
  skills: z.array(z.string().trim().max(100)).max(500).optional(),
  experience: z
    .array(
      z.object({
        title: z.string().trim().max(200).optional(),
        company: z.string().trim().max(200).optional(),
        location: z.string().trim().max(200).optional(),
        startDate: z.string().trim().max(100).optional(),
        endDate: z.string().trim().max(100).optional(),
        description: z.string().trim().max(5000).optional(),
      }),
    )
    .max(100)
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().trim().max(200).optional(),
        institution: z.string().trim().max(200).optional(),
        startDate: z.string().trim().max(100).optional(),
        endDate: z.string().trim().max(100).optional(),
        description: z.string().trim().max(3000).optional(),
      }),
    )
    .max(100)
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().trim().max(200).optional(),
        description: z.string().trim().max(3000).optional(),
        link: z.string().trim().max(500).optional(),
      }),
    )
    .max(100)
    .optional(),
});

/**
 * Entry-level merge: FACT fields always come from the original (AI must
 * never change companies, titles, dates, institutions...). Only the
 * description (the writing) may come from the AI rewrite.
 */
function mergeEntry(original, ai, descKey) {
  const entry = { ...(original ?? {}) };
  const rewritten = ai?.[descKey]?.trim();
  if (rewritten) entry[descKey] = rewritten;
  return entry;
}

/**
 * Positional merge of entry lists: never drops an original entry, never
 * adds an AI-invented entry, facts stay original, only descriptions are
 * replaced.
 */
function mergeEntries(originalList, aiList, descKey) {
  const original = Array.isArray(originalList) ? originalList : [];
  if (!Array.isArray(aiList) || aiList.length === 0) return original;
  return Array.from({ length: original.length }, (_, i) => mergeEntry(original[i], aiList[i], descKey));
}

/** Skills: allow AI to REORDER the original skills, never to invent new ones. */
function mergeSkills(originalSkills, aiSkills) {
  const original = Array.isArray(originalSkills) ? originalSkills : [];
  if (!Array.isArray(aiSkills) || aiSkills.length === 0) return original;
  const lower = new Set(original.map((skill) => skill.toLowerCase()));
  const ordered = aiSkills.filter((skill) => lower.has(skill.toLowerCase()));
  if (ordered.length === 0) return original;
  const tail = original.filter((skill) => !ordered.some((o) => o.toLowerCase() === skill.toLowerCase()));
  return [...ordered, ...tail];
}

/**
 * Merge the AI output over the original parsed data with truth
 * enforcement: the AI may rewrite summaries and descriptions, but factual
 * data (contact, companies, titles, dates, institutions, projects,
 * skills) always comes from the original resume.
 */
export function mergeGeneratedData(raw, original) {
  const parsed = generatedDataSchema.parse(raw ?? {});
  const orig = original ?? {};
  return {
    name: orig.name ?? "",
    summary: typeof parsed.summary === "string" && parsed.summary.trim().length > 0 ? parsed.summary.trim() : orig.summary ?? "",
    contact: { ...(orig.contact ?? {}) },
    skills: mergeSkills(orig.skills, parsed.skills),
    experience: mergeEntries(orig.experience, parsed.experience, "description"),
    education: mergeEntries(orig.education, parsed.education, "description"),
    projects: mergeEntries(orig.projects, parsed.projects, "description"),
    certifications: orig.certifications ?? [],
    languages: orig.languages ?? [],
    awards: orig.awards ?? [],
    customSections: orig.customSections ?? [],
    hiddenSections: orig.hiddenSections ?? [],
  };
}
