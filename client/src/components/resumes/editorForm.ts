import { z } from "zod";

import type { AiSuggestion } from "@/api/ai";
import type { AiChange, ParsedResumeData, ResumeTemplate } from "@/types";

export const entrySchema = z.object({
  title: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  location: z.string().max(200).default(""),
  startDate: z.string().max(100).default(""),
  endDate: z.string().max(100).default(""),
  description: z.string().max(5000).default(""),
  achievements: z.string().max(5000).default(""),
  technologies: z.string().max(1000).default(""),
});

export const eduSchema = z.object({
  degree: z.string().max(200).default(""),
  institution: z.string().max(200).default(""),
  startDate: z.string().max(100).default(""),
  endDate: z.string().max(100).default(""),
  description: z.string().max(3000).default(""),
});

export const projectSchema = z.object({
  name: z.string().max(200).default(""),
  description: z.string().max(3000).default(""),
  link: z.string().max(500).default(""),
  technologies: z.string().max(1000).default(""),
  liveDemo: z.string().max(500).default(""),
});

export const customSectionSchema = z.object({
  title: z.string().max(200).default(""),
  content: z.string().max(10000).default(""),
});

export const editSchema = z.object({
  name: z.string().max(200).default(""),
  summary: z.string().max(10000).default(""),
  contact: z.object({
    email: z.string().max(254).default(""),
    phone: z.string().max(40).default(""),
    location: z.string().max(200).default(""),
    linkedin: z.string().max(500).default(""),
    github: z.string().max(500).default(""),
  }),
  skillsText: z.string().max(3000).default(""),
  experience: z.array(entrySchema).max(100).default([]),
  education: z.array(eduSchema).max(100).default([]),
  projects: z.array(projectSchema).max(100).default([]),
  certificationsText: z.string().max(5000).default(""),
  languagesText: z.string().max(2000).default(""),
  awardsText: z.string().max(5000).default(""),
  customSections: z.array(customSectionSchema).max(20).default([]),
  hiddenSections: z.array(z.string().max(100)).default([]),
});

export type EditFormValues = z.output<typeof editSchema>;

export const EMPTY_EXPERIENCE = { title: "", company: "", location: "", startDate: "", endDate: "", description: "", achievements: "", technologies: "" };
export const EMPTY_EDUCATION = { degree: "", institution: "", startDate: "", endDate: "", description: "" };
export const EMPTY_PROJECT = { name: "", description: "", link: "", technologies: "", liveDemo: "" };

export const EMPTY_CUSTOM_SECTION = { title: "", content: "" };

export function toFormValues(resume: { parsedData: ParsedResumeData }): EditFormValues {
  return {
    name: resume.parsedData.name,
    summary: resume.parsedData.summary,
    contact: resume.parsedData.contact,
    skillsText: resume.parsedData.skills.join("\n"),
    experience: resume.parsedData.experience,
    education: resume.parsedData.education,
    projects: resume.parsedData.projects,
    certificationsText: resume.parsedData.certifications.join("\n"),
    languagesText: resume.parsedData.languages.join("\n"),
    awardsText: resume.parsedData.awards.join("\n"),
    customSections: resume.parsedData.customSections,
    hiddenSections: resume.parsedData.hiddenSections,
  };
}

export function splitSkills(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function toParsedData(values: EditFormValues): ParsedResumeData {
  return {
    name: values.name,
    summary: values.summary,
    contact: values.contact,
    skills: splitSkills(values.skillsText ?? ""),
    experience: values.experience ?? [],
    education: values.education ?? [],
    projects: values.projects ?? [],
    certifications: splitLines(values.certificationsText ?? ""),
    languages: splitLines(values.languagesText ?? ""),
    awards: splitLines(values.awardsText ?? ""),
    customSections: values.customSections ?? [],
    hiddenSections: values.hiddenSections ?? [],
  };
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 100);
}

/** Convert a suggestion into the shared AiChange shape so applied ones light up green. */
export function suggestionToChange(suggestion: AiSuggestion): AiChange {
  const typeMap: Record<AiSuggestion["type"], AiChange["type"]> = {
    "add-skill": "add-skill",
    "add-keyword": "add-keyword",
    "add-project": "add-project",
    "improve-summary": "improve-description",
    "add-section": "add-section",
  };
  return {
    type: typeMap[suggestion.type],
    section: suggestion.section,
    field: suggestion.field,
    value: suggestion.value,
    reason: suggestion.reason,
  };
}

export function toApiPayload(values: EditFormValues, template: ResumeTemplate) {
  return {
    parsedData: toParsedData(values),
    template,
  };
}

/** Case-insensitive compare token (same rules as the server optimizer). */
export function normalizeToken(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+#.]/g, "");
}

/** AI changes that target a given section (skills / summary / experience…). */
export function aiChangesForSection(changes: AiChange[], section: string): AiChange[] {
  return changes.filter((change) => change.section === section);
}

/**
 * True when the form's current skills text already contains every value a
 * change added (e.g. an AI-added skill). Editing the text away drops the
 * highlight automatically — the highlight follows the data, not a flag.
 */
export function skillChangesApplied(changes: AiChange[], skillsText: string | undefined): boolean {
  const present = new Set(splitSkills(skillsText ?? "").map(normalizeToken));
  const skillChanges = changes.filter((change) => change.type === "add-skill");
  return skillChanges.length > 0 && skillChanges.every((change) => present.has(normalizeToken(change.value)));
}

/**
 * True when any of the form's entry descriptions (experience/projects) or
 * the summary text contains an AI-added value. Used to light up the
 * section cards green until the user edits the text away.
 */
export function textChangesApplied(changes: AiChange[], texts: string[]): boolean {
  const haystack = texts
    .filter((text) => typeof text === "string" && text.length > 0)
    .map((text) => normalizeToken(text));
  return changes.some((change) => {
    const value = normalizeToken(change.value);
    if (!value) return false;
    return haystack.some((text) => text.includes(value));
  });
}

/**
 * All AI-added skills that are NOT yet in the skills text — used to render
 * "AI suggests adding" chips the user can one-click apply.
 */
export function pendingSkillChanges(changes: AiChange[], skillsText: string | undefined): AiChange[] {
  const present = new Set(splitSkills(skillsText ?? "").map(normalizeToken));
  return changes.filter((change) => change.type === "add-skill" && !present.has(normalizeToken(change.value)));
}
