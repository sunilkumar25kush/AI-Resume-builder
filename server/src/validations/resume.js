import { z } from "zod";

const contactSchema = z.object({
  email: z.string().trim().max(254).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  linkedin: z.string().trim().max(500).optional().default(""),
  github: z.string().trim().max(500).optional().default(""),
});

const experienceEntrySchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  company: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  startDate: z.string().trim().max(100).optional().default(""),
  endDate: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  achievements: z.string().trim().max(5000).optional().default(""),
  technologies: z.string().trim().max(1000).optional().default(""),
});

const educationEntrySchema = z.object({
  degree: z.string().trim().max(200).optional().default(""),
  institution: z.string().trim().max(200).optional().default(""),
  startDate: z.string().trim().max(100).optional().default(""),
  endDate: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(3000).optional().default(""),
});

const projectEntrySchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(3000).optional().default(""),
  link: z.string().trim().max(500).optional().default(""),
  technologies: z.string().trim().max(1000).optional().default(""),
  liveDemo: z.string().trim().max(500).optional().default(""),
});

const customSectionSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  content: z.string().trim().max(10000).optional().default(""),
});

export const parsedDataSchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  summary: z.string().trim().max(10000).optional().default(""),
  contact: contactSchema.optional().default({}),
  skills: z.array(z.string().trim().max(100)).max(500).optional().default([]),
  experience: z.array(experienceEntrySchema).max(100).optional().default([]),
  education: z.array(educationEntrySchema).max(100).optional().default([]),
  projects: z.array(projectEntrySchema).max(100).optional().default([]),
  certifications: z.array(z.string().trim().max(200)).max(100).optional().default([]),
  languages: z.array(z.string().trim().max(100)).max(50).optional().default([]),
  awards: z.array(z.string().trim().max(200)).max(100).optional().default([]),
  customSections: z.array(customSectionSchema).max(20).optional().default([]),
  hiddenSections: z.array(z.string().trim().max(100)).max(50).optional().default([]),
});

/**
 * PATCH shape — top-level fields are optional WITHOUT defaults so that
 * only the keys the client actually sent end up in the $set (defaults
 * would silently overwrite sibling sections with empty values).
 */
const parsedDataUpdateSchema = z.object({
  name: z.string().trim().max(200).optional(),
  summary: z.string().trim().max(10000).optional(),
  contact: contactSchema.optional(),
  skills: z.array(z.string().trim().max(100)).max(500).optional(),
  experience: z.array(experienceEntrySchema).max(100).optional(),
  education: z.array(educationEntrySchema).max(100).optional(),
  projects: z.array(projectEntrySchema).max(100).optional(),
  certifications: z.array(z.string().trim().max(200)).max(100).optional(),
  languages: z.array(z.string().trim().max(100)).max(50).optional(),
  awards: z.array(z.string().trim().max(200)).max(100).optional(),
  customSections: z.array(customSectionSchema).max(20).optional(),
  hiddenSections: z.array(z.string().trim().max(100)).max(50).optional(),
});

export const updateResumeSchema = z.object({
  parsedData: parsedDataUpdateSchema.optional(),
  template: z
    .enum(["classic", "modern", "minimal", "compact", "executive", "creative", "startup", "google", "microsoft", "harvard", "elegant"])
    .optional(),
});
