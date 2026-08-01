export interface JobDescription {
  _id: string;
  source: "paste" | "file";
  fileName: string;
  fileSize: number;
  text: string;
  title: string;
  company: string;
  skills: string[];
  qualifications: string[];
  responsibilities: string[];
  createdAt: string;
  updatedAt: string;
}
