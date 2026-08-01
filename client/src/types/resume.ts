export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string;
  technologies: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  link: string;
  technologies: string;
  liveDemo: string;
}

export interface ParsedResumeData {
  name: string;
  summary: string;
  contact: ContactInfo;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  languages: string[];
  awards: string[];
}

export type ResumeTemplate = "classic" | "modern" | "minimal" | "compact";

export interface Resume {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  parsedData: ParsedResumeData;
  template: ResumeTemplate;
  createdAt: string;
  updatedAt: string;
}
