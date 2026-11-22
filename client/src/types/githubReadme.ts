export type GithubReadmeTemplateId =
  | "developer-tech-stack"
  | "modern-dashboard"
  | "anime-gaming"
  | "minimal-aesthetic"
  | "professional"
  | "fullstack"
  | "frontend"
  | "backend"
  | "ai-ml"
  | "open-source"
  | "student"
  | "cybersecurity"
  | "developer"
  | "minimal"
  | "cyberpunk"
  | "creative"
  | "academic"
  | "modern"
  | "custom";

export interface GithubReadmeProfile {
  name: string;
  headline: string;
  bio: string;
  githubUsername: string;
  location?: string;
  portfolioUrl?: string;
  currentRole?: string;
  currentWork?: string;
  learning?: string;
  askMeAbout?: string;
  funFact?: string;
  email?: string;
}

export interface GithubReadmeStatsConfig {
  showGithubStats: boolean;
  showStreakStats: boolean;
  showTopLangs: boolean;
  showTrophies: boolean;
  showActivityGraph: boolean;
  statsTheme: string;
}

export interface GithubReadmeSkill {
  name: string;
  category?: string;
  badgeColor?: string;
  icon?: string;
}

export interface GithubReadmeSocial {
  platform: string;
  username?: string;
  url: string;
}

export interface GithubReadmeProject {
  title: string;
  description?: string;
  link?: string;
  stars?: string;
  tech?: string;
}

export interface GithubReadmeSettings {
  headerStyle: "wave" | "typing" | "capsule" | "minimal" | "ascii" | "badges";
  layout: "standard" | "compact" | "centered" | "two-column";
  badgesStyle: "flat" | "flat-square" | "for-the-badge" | "plastic";
}

export interface GithubReadme {
  _id: string;
  id?: string;
  userId: string;
  title: string;
  status: "draft" | "published";
  template: GithubReadmeTemplateId;
  sourceOption: "template" | "ai" | "scratch" | "import";
  content: string;
  profile: GithubReadmeProfile;
  statsConfig: GithubReadmeStatsConfig;
  skills: GithubReadmeSkill[];
  socialLinks: GithubReadmeSocial[];
  projects: GithubReadmeProject[];
  settings: GithubReadmeSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGithubReadmeInput {
  title: string;
  template?: GithubReadmeTemplateId;
  sourceOption?: "template" | "ai" | "scratch" | "import";
  content?: string;
  profile?: Partial<GithubReadmeProfile>;
  statsConfig?: Partial<GithubReadmeStatsConfig>;
  skills?: GithubReadmeSkill[];
  socialLinks?: GithubReadmeSocial[];
  projects?: GithubReadmeProject[];
  settings?: Partial<GithubReadmeSettings>;
}

export interface UpdateGithubReadmeInput {
  title?: string;
  template?: GithubReadmeTemplateId;
  status?: "draft" | "published";
  content?: string;
  profile?: Partial<GithubReadmeProfile>;
  statsConfig?: Partial<GithubReadmeStatsConfig>;
  skills?: GithubReadmeSkill[];
  socialLinks?: GithubReadmeSocial[];
  projects?: GithubReadmeProject[];
  settings?: Partial<GithubReadmeSettings>;
}

export interface GenerateReadmeAiInput {
  prompt?: string;
  resumeId?: string;
  githubUsername?: string;
  template?: GithubReadmeTemplateId;
  tone?: "professional" | "creative" | "minimal" | "hacker";
}

export interface ImportReadmeInput {
  markdown: string;
  title?: string;
}

export interface ReadmeTemplateMeta {
  id: GithubReadmeTemplateId;
  name: string;
  category: "all" | "developer" | "minimal" | "gaming" | "dashboard" | "specialized" | "creative" | "academic" | "cyberpunk";
  description: string;
  badge: string;
  previewUrl?: string;
  headerStyle: GithubReadmeSettings["headerStyle"];
  statsTheme: string;
  badgesStyle: GithubReadmeSettings["badgesStyle"];
  tags?: string[];
  accentColor?: string;
  features?: string[];
}
