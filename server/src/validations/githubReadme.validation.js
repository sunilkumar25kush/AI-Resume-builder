import { z } from "zod";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const profileSchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  headline: z.string().trim().max(300).optional().default(""),
  bio: z.string().trim().max(5000).optional().default(""),
  githubUsername: z.string().trim().max(100).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  portfolioUrl: z.string().trim().max(500).optional().default(""),
  currentRole: z.string().trim().max(200).optional().default(""),
  currentWork: z.string().trim().max(500).optional().default(""),
  learning: z.string().trim().max(500).optional().default(""),
  askMeAbout: z.string().trim().max(500).optional().default(""),
  funFact: z.string().trim().max(500).optional().default(""),
  email: z.string().trim().max(254).optional().default(""),
});

const statsConfigSchema = z.object({
  showGithubStats: z.boolean().optional().default(true),
  showStreakStats: z.boolean().optional().default(true),
  showTopLangs: z.boolean().optional().default(true),
  showTrophies: z.boolean().optional().default(false),
  showActivityGraph: z.boolean().optional().default(false),
  statsTheme: z.string().trim().max(50).optional().default("tokyonight"),
});

const skillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().max(100).optional().default("Languages & Tools"),
  badgeColor: z.string().trim().max(50).optional().default(""),
  icon: z.string().trim().max(50).optional().default(""),
});

const socialLinkSchema = z.object({
  platform: z.string().trim().max(50).optional().default(""),
  username: z.string().trim().max(100).optional().default(""),
  url: z.string().trim().max(1000).optional().default(""),
});

const projectSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  link: z.string().trim().max(1000).optional().default(""),
  stars: z.string().trim().max(50).optional().default(""),
  tech: z.string().trim().max(200).optional().default(""),
});

const settingsSchema = z.object({
  headerStyle: z.enum(["wave", "typing", "capsule", "minimal", "ascii", "badges", "slice"]).optional().default("wave"),
  layout: z.enum(["standard", "compact", "centered", "two-column"]).optional().default("standard"),
  badgesStyle: z.enum(["flat", "flat-square", "for-the-badge", "plastic"]).optional().default("for-the-badge"),
});

const sectionItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional().default(""),
  enabled: z.boolean().optional().default(true),
  customMarkdown: z.string().optional().default(""),
  data: z.record(z.any()).optional().default({}),
});

const experienceSchema = z.object({
  role: z.string().optional().default(""),
  company: z.string().optional().default(""),
  period: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

const educationSchema = z.object({
  degree: z.string().optional().default(""),
  institution: z.string().optional().default(""),
  year: z.string().optional().default(""),
});

const competitiveSchema = z.object({
  leetcodeUsername: z.string().optional().default(""),
  codeforcesUsername: z.string().optional().default(""),
  hackerrankUsername: z.string().optional().default(""),
});

export const README_TEMPLATES = [
  "hugo-starry-cyber",
  "sahil-dev-stack",
  "anime-tokyo-ghoul",
  "midnight-shady",
  "joshua-lofi-city",
  "minimal",
  "developer",
  "cyberpunk",
  "creative",
  "academic",
  "modern",
  "developer-tech-stack",
  "modern-dashboard",
  "anime-gaming",
  "minimal-aesthetic",
  "professional",
  "fullstack",
  "frontend",
  "backend",
  "ai-ml",
  "open-source",
  "student",
  "cybersecurity",
  "custom",
];

export const createGithubReadmeSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200).default("My GitHub Profile README"),
  template: z.enum(README_TEMPLATES).optional().default("developer"),
  sourceOption: z.enum(["template", "ai", "scratch", "import"]).optional().default("template"),
  content: z.string().max(500000).optional().default(""),
  profile: profileSchema.optional().default({}),
  statsConfig: statsConfigSchema.optional().default({}),
  skills: z.array(skillSchema).max(100).optional().default([]),
  socialLinks: z.array(socialLinkSchema).max(50).optional().default([]),
  projects: z.array(projectSchema).max(50).optional().default([]),
  sections: z.array(sectionItemSchema).optional().default([]),
  experience: z.array(experienceSchema).optional().default([]),
  education: z.array(educationSchema).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  competitive: competitiveSchema.optional().default({}),
  bannerUrl: z.string().optional().default(""),
  gifUrl: z.string().optional().default(""),
  settings: settingsSchema.optional().default({}),
});

export const updateGithubReadmeSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  template: z.enum(README_TEMPLATES).optional(),
  content: z.string().max(500000).optional(),
  status: z.enum(["draft", "published"]).optional(),
  profile: profileSchema.partial().optional(),
  statsConfig: statsConfigSchema.partial().optional(),
  skills: z.array(skillSchema).max(100).optional(),
  socialLinks: z.array(socialLinkSchema).max(50).optional(),
  projects: z.array(projectSchema).max(50).optional(),
  sections: z.array(sectionItemSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  competitive: competitiveSchema.optional(),
  bannerUrl: z.string().optional(),
  gifUrl: z.string().optional(),
  settings: settingsSchema.partial().optional(),
});

export const generateReadmeAiSchema = z.object({
  prompt: z.string().trim().max(2000).optional().default(""),
  resumeId: z.string().regex(OBJECT_ID_REGEX, "Invalid resume ID").optional(),
  githubUsername: z.string().trim().max(100).optional(),
  template: z.enum(README_TEMPLATES).optional().default("developer"),
  tone: z.enum(["professional", "creative", "minimal", "hacker"]).optional().default("professional"),
});

export const importReadmeSchema = z.object({
  markdown: z.string().min(1, "Markdown content cannot be empty").max(500000),
  title: z.string().trim().max(200).optional().default("Imported GitHub README"),
});
