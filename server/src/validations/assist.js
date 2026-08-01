import { z } from "zod";

export const assistActionSchema = z.enum([
  "improve",
  "shorten",
  "expand",
  "rewrite",
  "professional",
  "technical",
  "entry",
  "senior",
  "executive",
]);

const entryFields = {
  title: z.string().trim().max(200).optional(),
  company: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  startDate: z.string().trim().max(100).optional(),
  endDate: z.string().trim().max(100).optional(),
  degree: z.string().trim().max(200).optional(),
  institution: z.string().trim().max(200).optional(),
  name: z.string().trim().max(200).optional(),
  link: z.string().trim().max(500).optional(),
  description: z.string().trim().max(5000).default(""),
};

/** POST /api/ai/assist — section-specific request shapes. */
export const assistSchema = z.discriminatedUnion("section", [
  z.object({
    section: z.literal("summary"),
    action: assistActionSchema,
    content: z.string().max(10000),
  }),
  z.object({
    section: z.literal("skills"),
    action: assistActionSchema,
    content: z.array(z.string().trim().max(100)).max(500),
  }),
  z.object({
    section: z.literal("experience"),
    action: assistActionSchema,
    content: z.object(entryFields),
  }),
  z.object({
    section: z.literal("education"),
    action: assistActionSchema,
    content: z.object(entryFields),
  }),
  z.object({
    section: z.literal("project"),
    action: assistActionSchema,
    content: z.object(entryFields),
  }),
]);
