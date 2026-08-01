import type { ParsedResumeData, ResumeTemplate } from "./resume";

export interface ResumeVersion {
  _id: string;
  resume: string;
  version: number;
  template: ResumeTemplate;
  parsedData: ParsedResumeData;
  createdAt: string;
}
