import { z } from "zod";

import type { ParsedResumeData, ResumeTemplate } from "@/types";

export const entrySchema = z.object({
  title: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  location: z.string().max(200).default(""),
  startDate: z.string().max(100).default(""),
  endDate: z.string().max(100).default(""),
  description: z.string().max(5000).default(""),
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
});

export const editSchema = z.object({
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
});

export type EditFormValues = z.output<typeof editSchema>;

export const EMPTY_EXPERIENCE = { title: "", company: "", location: "", startDate: "", endDate: "", description: "" };
export const EMPTY_EDUCATION = { degree: "", institution: "", startDate: "", endDate: "", description: "" };
export const EMPTY_PROJECT = { name: "", description: "", link: "" };

export function toFormValues(resume: { parsedData: ParsedResumeData }): EditFormValues {
  return {
    summary: resume.parsedData.summary,
    contact: resume.parsedData.contact,
    skillsText: resume.parsedData.skills.join("\n"),
    experience: resume.parsedData.experience,
    education: resume.parsedData.education,
    projects: resume.parsedData.projects,
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
    summary: values.summary,
    contact: values.contact,
    skills: splitSkills(values.skillsText),
    experience: values.experience,
    education: values.education,
    projects: values.projects,
  };
}

export function toApiPayload(values: EditFormValues, template: ResumeTemplate) {
  return {
    parsedData: {
      summary: values.summary,
      contact: values.contact,
      skills: splitSkills(values.skillsText),
      experience: values.experience,
      education: values.education,
      projects: values.projects,
    },
    template,
  };
}
