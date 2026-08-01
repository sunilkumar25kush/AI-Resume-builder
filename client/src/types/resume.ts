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
}

export interface ParsedResumeData {
  summary: string;
  contact: ContactInfo;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
}

export interface Resume {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  parsedData: ParsedResumeData;
  createdAt: string;
  updatedAt: string;
}
