export type PortfolioStatus = "draft" | "published" | "archived";

export interface PortfolioProfile {
  fullName: string;
  headline?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
}

export interface PortfolioSocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface PortfolioSkill {
  name: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface PortfolioExperience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export interface PortfolioEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
}

export interface PortfolioProject {
  title: string;
  description: string;
  tags?: string[];
  liveUrl?: string;
  repoUrl?: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface PortfolioCertification {
  name: string;
  issuer: string;
  issueDate?: string;
  url?: string;
}

export interface PortfolioDesignSettings {
  template: "modern" | "minimal" | "developer" | "executive" | "creative";
  theme: "light" | "dark" | "system";
  primaryColor?: string;
  fontFamily?: string;
  customCss?: string;
}

export interface PortfolioPublication {
  isPublic: boolean;
  publishedAt?: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Portfolio {
  _id: string;
  userId: string;
  resumeId?: string;
  title: string;
  slug: string;
  status: PortfolioStatus;
  profile: PortfolioProfile;
  socialLinks: PortfolioSocialLink[];
  skills: PortfolioSkill[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
  projects: PortfolioProject[];
  certifications?: PortfolioCertification[];
  design: PortfolioDesignSettings;
  publication: PortfolioPublication;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioInput {
  title: string;
  slug?: string;
  resumeId?: string;
  template?: PortfolioDesignSettings["template"];
  design?: Partial<PortfolioDesignSettings>;
  profile?: Partial<PortfolioProfile>;
  socialLinks?: PortfolioSocialLink[];
  skills?: PortfolioSkill[];
  experience?: PortfolioExperience[];
  education?: PortfolioEducation[];
  projects?: PortfolioProject[];
  certifications?: PortfolioCertification[];
}
