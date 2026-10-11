import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
  phone: z.string().trim().max(40).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  targetJobTitle: z.string().trim().max(120).optional().default(""),
  linkedin: z.string().trim().max(500).optional().default(""),
  github: z.string().trim().max(500).optional().default(""),
  website: z.string().trim().max(500).optional().default(""),
  linkedinUrl: z.string().trim().max(500).optional().default(""),
  githubUrl: z.string().trim().max(500).optional().default(""),
  websiteUrl: z.string().trim().max(500).optional().default(""),
  contactOrder: z.array(z.string().trim()).optional().default([]),
  customLinks: z
    .array(
      z.object({
        label: z.string().trim().max(80).default(""),
        url: z.string().trim().max(500).default(""),
      })
    )
    .optional()
    .default([]),
  autoPopulateResume: z.boolean().optional().default(true),
});
