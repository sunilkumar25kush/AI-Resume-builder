/** Portfolio publication lifecycle state */
export type PortfolioStatus = "draft" | "published" | "archived";

/** Core biographical and contact metadata for a candidate portfolio */
export interface PortfolioProfile {
  /** Candidate's full professional name */
  fullName: string;
  /** Primary headline or job title (e.g. Frontend Engineer & UI Specialist) */
  headline?: string;
  /** Engaging professional summary or career mission statement */
  bio?: string;
  /** Direct contact email address */
  email?: string;
  /** Primary contact telephone number */
  phone?: string;
  /** Geographical location or remote availability (e.g. San Francisco, CA • Remote) */
  location?: string;
  /** Hosted image or avatar URL for the candidate */
  avatarUrl?: string;
}

/** External social profile, coding platform, or portfolio link */
export interface PortfolioSocialLink {
  /** Identifier for platform brand icon resolution (e.g. github, linkedin, twitter) */
  platform: string;
  /** Human-readable display label */
  label: string;
  /** Validated target URL */
  url: string;
}

/** Individual technical, design, or professional skill with categorization */
export interface PortfolioSkill {
  /** Skill name (e.g. TypeScript, React, Docker) */
  name: string;
  /** Optional grouping category (e.g. Frontend, Backend, Tooling & Infra) */
  category?: string;
  /** Self-assessed proficiency tier */
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

/** Professional career role or freelance engagement */
export interface PortfolioExperience {
  /** Role title (e.g. Senior Software Engineer) */
  title: string;
  /** Organization or company name */
  company: string;
  /** Location or remote flag */
  location?: string;
  /** Start period date string (e.g. 2022 or Jan 2022) */
  startDate?: string;
  /** End period date string or Present */
  endDate?: string;
  /** Whether the candidate currently works in this role */
  current?: boolean;
  /** Narrative description of responsibilities */
  description?: string;
  /** Distinct bullet points or achievement highlights */
  highlights?: string[];
}

/** Academic qualification or university degree */
export interface PortfolioEducation {
  /** Educational institution or university */
  institution: string;
  /** Degree title (e.g. Bachelor of Science in Computer Science) */
  degree: string;
  /** Field or major */
  fieldOfStudy?: string;
  /** Start year */
  startDate?: string;
  /** Graduation year */
  endDate?: string;
  /** GPA or academic honors */
  grade?: string;
}

/** Featured portfolio project or open-source repository */
export interface PortfolioProject {
  /** Project display title */
  title: string;
  /** Concise project narrative or description of impact */
  description: string;
  /** Technology stack badges (e.g. React, Three.js, Node.js) */
  tags?: string[];
  /** Production live deployment link */
  liveUrl?: string;
  /** Source code repository link */
  repoUrl?: string;
  /** Showcase screenshot or thumbnail image URL */
  imageUrl?: string;
  /** Whether this project is pinned in featured spotlight sections */
  featured?: boolean;
}

/** Professional certification or credential */
export interface PortfolioCertification {
  /** Certification name */
  name: string;
  /** Issuing authority (e.g. AWS, Google Cloud, Meta) */
  issuer: string;
  /** Issue date */
  issueDate?: string;
  /** Verification link */
  url?: string;
}

export type PortfolioTemplateId =
  | "spotlight"
  | "poster"
  | "devport"
  | "creative"
  | "developer"
  | "minimal"
  | "modern"
  | "executive";

export interface PortfolioDesignSettings {
  template: PortfolioTemplateId;
  theme: "light" | "dark" | "system";
  primaryColor?: string;
  fontFamily?: string;
  customCss?: string;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
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
