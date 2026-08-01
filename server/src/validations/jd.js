import { z } from "zod";

export const jdUpdateSchema = z
  .object({
    title: z.string().max(200),
    company: z.string().max(200),
    skills: z.array(z.string().max(100)).max(500),
    preferredSkills: z.array(z.string().max(100)).max(500),
    qualifications: z.array(z.string().max(5000)).max(100),
    responsibilities: z.array(z.string().max(5000)).max(100),
    atsKeywords: z.array(z.string().max(100)).max(500),
    softSkills: z.array(z.string().max(100)).max(200),
    industryKeywords: z.array(z.string().max(100)).max(200),
    experienceRequired: z.string().max(100),
  })
  .partial();
