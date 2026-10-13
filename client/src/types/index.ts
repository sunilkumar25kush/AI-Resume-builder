export interface UserCustomLink {
  label: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
  phone?: string;
  location?: string;
  targetJobTitle?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  contactOrder?: string[];
  customLinks?: UserCustomLink[];
  autoPopulateResume?: boolean;
  createdAt: string;
}

export interface UpdateProfileInput {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  targetJobTitle?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  contactOrder?: string[];
  customLinks?: UserCustomLink[];
  autoPopulateResume?: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export type { NotificationItem, NotificationsPage } from "./notifications";
export type { AiChange, AiChangeType, ContactInfo, EducationEntry, ExperienceEntry, ParsedResumeData, ProjectEntry, Resume, ResumeTemplate, ResumeCustomization } from "./resume";
export type { ResumeVersion } from "./resumeVersion";
export type { JobDescription } from "./jobDescription";
export type { Optimization, OptimizationResult } from "./optimization";
export type {
  Portfolio,
  PortfolioCertification,
  PortfolioDesignSettings,
  PortfolioEducation,
  PortfolioExperience,
  PortfolioProfile,
  PortfolioProject,
  PortfolioPublication,
  PortfolioSkill,
  PortfolioSocialLink,
  PortfolioStatus,
  CreatePortfolioInput,
} from "./portfolio";
