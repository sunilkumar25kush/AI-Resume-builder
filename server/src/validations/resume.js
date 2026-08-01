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
});

export const parsedDataSchema = z.object({
  summary: z.string().trim().max(10000).optional().default(""),
  contact: contactSchema.optional().default({}),
  skills: z.array(z.string().trim().max(100)).max(500).optional().default([]),
  experience: z.array(experienceEntrySchema).max(100).optional().default([]),
  education: z.array(educationEntrySchema).max(100).optional().default([]),
  projects: z.array(projectEntrySchema).max(100).optional().default([]),
});

export const updateResumeSchema = z.object({
  parsedData: parsedDataSchema.partial(),
});
