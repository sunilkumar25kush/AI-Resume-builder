import { z } from "zod";

/** POST /api/resumes/:id/generate body. */
export const generateResumeSchema = z.object({
  jdId: z.string().min(1),
});

/** POST /api/resumes/generate-from-jd body (Workflow 1: JD-only wizard). */
export const generateFromJdSchema = z.object({
  jdId: z.string().min(1),
  targetTitle: z.string().trim().max(200).optional().default(""),
  experienceLevel: z.enum(["fresher", "junior", "senior"]).optional().default("fresher"),
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
        technologies: z.string().trim().max(1000).optional(),
      }),
    )
    .max(100)
    .optional(),
  changes: z
    .array(
      z.object({
        type: z
          .enum(["add-skill", "add-keyword", "add-section", "improve-description", "add-technologies", "add-project"])
          .catch("add-skill"),
        section: z.string().max(100).default("skills"),
        field: z.string().max(100).default("skills"),
        value: z.string().max(2000).default(""),
        reason: z.string().max(500).default(""),
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

/**
 * Skills merge: keeps the original order, then appends JD-derived skills
 * the AI added (up to `addedLimit`). The AI may also reorder the original
 * skills so the JD's most-valued ones come first. Added skills are tracked
 * by `extractAiChanges` so the editor can highlight them.
 */
function mergeSkills(originalSkills, aiSkills, addedLimit = 8) {
  const original = Array.isArray(originalSkills) ? originalSkills : [];
  if (!Array.isArray(aiSkills) || aiSkills.length === 0) return original;
  const norm = (skill) => String(skill).toLowerCase().trim();
  const originalLower = new Set(original.map(norm));
  const ordered = aiSkills.filter((skill) => originalLower.has(norm(skill)));
  const added = aiSkills.filter((skill) => !originalLower.has(norm(skill))).slice(0, addedLimit);
  if (ordered.length === 0 && added.length === 0) return original;
  const tail = original.filter((skill) => !ordered.some((o) => norm(o) === norm(skill)));
  return [...ordered, ...tail, ...added];
}

/**
 * Project merge: descriptions may be rewritten, and the AI may fill a
 * missing "technologies" field (from the resume text or the JD stack).
 */
function mergeProjects(originalProjects, aiProjects) {
  const original = Array.isArray(originalProjects) ? originalProjects : [];
  if (!Array.isArray(aiProjects) || aiProjects.length === 0) return original;
  return original.map((project, i) => {
    const entry = { ...(project ?? {}) };
    const ai = aiProjects[i];
    const rewritten = ai?.description?.trim();
    if (rewritten) entry.description = rewritten;
    const technologies = ai?.technologies?.trim();
    if (technologies && !String(entry.technologies ?? "").trim()) entry.technologies = technologies;
    return entry;
  });
}

/**
 * Merge the AI output over the original parsed data with truth
 * enforcement: the AI may rewrite summaries and descriptions, and add
 * JD-derived skills + project technologies, but factual data (contact,
 * companies, titles, dates, institutions) always comes from the original.
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
    projects: mergeProjects(orig.projects, parsed.projects),
    certifications: orig.certifications ?? [],
    languages: orig.languages ?? [],
    awards: orig.awards ?? [],
    customSections: orig.customSections ?? [],
    hiddenSections: orig.hiddenSections ?? [],
  };
}

/**
 * JD-only merge (Workflow 1): builds a FRESH resume from the AI output.
 * Unlike the resume rewrite, skills and projects DO come from the AI here
 * because they are derived from the job description (facts from the JD),
 * never from a made-up work history. Experience, education, certifications,
 * languages and awards are left EMPTY — the AI must never invent them, and
 * the user fills them in the editor (fresher-friendly flow).
 */
export function mergeJdOnlyData(raw) {
  const parsed = generatedDataSchema.parse(raw ?? {});
  return {
    name: "",
    summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
    contact: { email: "", phone: "", location: "", linkedin: "", github: "" },
    skills: Array.isArray(parsed.skills) ? parsed.skills.filter((s) => typeof s === "string" && s.trim().length > 0).map((s) => s.trim()) : [],
    experience: [],
    education: [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects
          .filter((p) => p && typeof p.name === "string" && p.name.trim().length > 0)
          .map((p) => ({
            name: p.name.trim(),
            description: typeof p.description === "string" ? p.description.trim() : "",
            link: typeof p.link === "string" ? p.link.trim() : "",
            technologies: typeof p.technologies === "string" ? p.technologies.trim() : "",
          }))
      : [],
    certifications: [],
    languages: [],
    awards: [],
    customSections: [],
    hiddenSections: [],
  };
}

/**
 * Pull the "changes" the AI reported out of a generation response. Empty or
 * malformed AI output falls back to the deterministic `fallback` list
 * (usually missing JD skills), so the editor always has something to
 * highlight.
 */
export function extractAiChanges(raw, fallback = []) {
  const parsed = generatedDataSchema.parse(raw ?? {});
  const changes = (parsed.changes ?? [])
    .filter((change) => typeof change.value === "string" && change.value.trim().length > 0)
    .slice(0, 100);
  if (changes.length > 0) return changes;
  return Array.isArray(fallback) ? fallback.slice(0, 50) : [];
}
