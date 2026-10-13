import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const profileSchema = z.object({
  fullName: z.string().trim().max(200).optional().default(""),
  headline: z.string().trim().max(300).optional().default(""),
  bio: z.string().trim().max(5000).optional().default(""),
  email: z.string().trim().email().max(254).optional().or(z.literal("")).default(""),
  phone: z.string().trim().max(50).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  avatarUrl: z.string().trim().max(1000).optional().default(""),
});

const socialLinkSchema = z.object({
  platform: z.string().trim().max(50).optional().default(""),
  label: z.string().trim().max(100).optional().default(""),
  url: z.string().trim().max(1000).optional().default(""),
});

const skillSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required").max(100),
  category: z.string().trim().max(100).optional().default("General"),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional().default("intermediate"),
});

const experienceSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  company: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  startDate: z.string().trim().max(100).optional().default(""),
  endDate: z.string().trim().max(100).optional().default(""),
  current: z.boolean().optional().default(false),
  description: z.string().trim().max(5000).optional().default(""),
  highlights: z.array(z.string().trim().max(1000)).max(50).optional().default([]),
});

const educationSchema = z.object({
  institution: z.string().trim().max(200).optional().default(""),
  degree: z.string().trim().max(200).optional().default(""),
  fieldOfStudy: z.string().trim().max(200).optional().default(""),
  startDate: z.string().trim().max(100).optional().default(""),
  endDate: z.string().trim().max(100).optional().default(""),
  grade: z.string().trim().max(50).optional().default(""),
});

const projectSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  tags: z.array(z.string().trim().max(100)).max(50).optional().default([]),
  liveUrl: z.string().trim().max(1000).optional().default(""),
  repoUrl: z.string().trim().max(1000).optional().default(""),
  imageUrl: z.string().trim().max(1000).optional().default(""),
  featured: z.boolean().optional().default(false),
});

const certificationSchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  issuer: z.string().trim().max(200).optional().default(""),
  issueDate: z.string().trim().max(100).optional().default(""),
  url: z.string().trim().max(1000).optional().default(""),
});

const designSettingsSchema = z.object({
  template: z.enum(["modern", "minimal", "developer", "executive", "creative"]).optional().default("modern"),
  theme: z.enum(["light", "dark", "system"]).optional().default("system"),
  primaryColor: z.string().trim().max(50).optional().default("#2563eb"),
  fontFamily: z.string().trim().max(100).optional().default("Inter"),
  customCss: z.string().trim().max(10000).optional().default(""),
  sectionOrder: z.array(z.string().trim().max(50)).max(20).optional().default([
    "about",
    "skills",
    "projects",
    "experience",
    "education",
    "certifications",
    "contact",
  ]),
  sectionVisibility: z.record(z.string(), z.boolean()).optional().default({}),
});

const publicationSchema = z.object({
  isPublic: z.boolean().optional().default(false),
  publishedAt: z.coerce.date().nullable().optional().default(null),
  customDomain: z.string().trim().toLowerCase().max(255).optional().default(""),
  seoTitle: z.string().trim().max(200).optional().default(""),
  seoDescription: z.string().trim().max(500).optional().default(""),
});

/** Schema for creating a new portfolio draft */
export const createPortfolioSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z.string().trim().toLowerCase().min(1).max(100).regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens").optional(),
  resumeId: z.string().regex(OBJECT_ID_REGEX, "Invalid resumeId").nullable().optional(),
  profile: profileSchema.optional().default({}),
  socialLinks: z.array(socialLinkSchema).max(50).optional().default([]),
  skills: z.array(skillSchema).max(200).optional().default([]),
  experience: z.array(experienceSchema).max(100).optional().default([]),
  education: z.array(educationSchema).max(50).optional().default([]),
  projects: z.array(projectSchema).max(100).optional().default([]),
  certifications: z.array(certificationSchema).max(50).optional().default([]),
  design: designSettingsSchema.optional().default({}),
  publication: publicationSchema.optional().default({}),
});

/** Partial schemas for PATCH updates without default overrides */
const profileUpdateSchema = z.object({
  fullName: z.string().trim().max(200).optional(),
  headline: z.string().trim().max(300).optional(),
  bio: z.string().trim().max(5000).optional(),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional(),
  location: z.string().trim().max(200).optional(),
  avatarUrl: z.string().trim().max(1000).optional(),
});

const designUpdateSchema = z.object({
  template: z.enum(["modern", "minimal", "developer", "executive", "creative"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  primaryColor: z.string().trim().max(50).optional(),
  fontFamily: z.string().trim().max(100).optional(),
  customCss: z.string().trim().max(10000).optional(),
  sectionOrder: z.array(z.string().trim().max(50)).max(20).optional(),
  sectionVisibility: z.record(z.string(), z.boolean()).optional(),
});

const publicationUpdateSchema = z.object({
  isPublic: z.boolean().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  customDomain: z.string().trim().toLowerCase().max(255).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(500).optional(),
});

export const updatePortfolioSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().toLowerCase().min(1).max(100).regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens").optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  profile: profileUpdateSchema.optional(),
  socialLinks: z.array(socialLinkSchema).max(50).optional(),
  skills: z.array(skillSchema).max(200).optional(),
  experience: z.array(experienceSchema).max(100).optional(),
  education: z.array(educationSchema).max(50).optional(),
  projects: z.array(projectSchema).max(100).optional(),
  certifications: z.array(certificationSchema).max(50).optional(),
  design: designUpdateSchema.optional(),
  publication: publicationUpdateSchema.optional(),
});

export const publishPortfolioSchema = z.object({
  customDomain: z.string().trim().toLowerCase().max(255).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(500).optional(),
});

export const portfolioQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const generateFromResumeSchema = z.object({
  resumeId: z.string().regex(OBJECT_ID_REGEX, "Invalid resumeId"),
  template: z.enum(["modern", "minimal", "developer", "executive", "creative"]).optional(),
  title: z.string().trim().max(200).optional(),
});

export const generateFromUploadSchema = z.object({
  template: z.enum(["modern", "minimal", "developer", "executive", "creative"]).optional(),
  title: z.string().trim().max(200).optional(),
});
