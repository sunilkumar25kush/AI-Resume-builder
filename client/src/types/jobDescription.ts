export interface JobDescription {
  _id: string;
  source: "paste" | "file";
  fileName: string;
  fileSize: number;
  text: string;
  title: string;
  company: string;
  skills: string[];
  preferredSkills: string[];
  qualifications: string[];
  responsibilities: string[];
  atsKeywords: string[];
  softSkills: string[];
  industryKeywords: string[];
  experienceRequired: string;
  createdAt: string;
  updatedAt: string;
}
