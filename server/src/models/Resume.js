import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
  },
  { _id: false },
);

const experienceEntrySchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    description: { type: String, default: "" },
    achievements: { type: String, default: "" },
    technologies: { type: String, default: "" },
  },
  { _id: false },
);

const educationEntrySchema = new mongoose.Schema(
  {
    degree: { type: String, default: "" },
    institution: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const projectEntrySchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    link: { type: String, default: "" },
    technologies: { type: String, default: "" },
    liveDemo: { type: String, default: "" },
  },
  { _id: false },
);

const parsedDataSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    summary: { type: String, default: "" },
    contact: { type: contactSchema, default: () => ({}) },
    skills: { type: [String], default: [] },
    experience: { type: [experienceEntrySchema], default: [] },
    education: { type: [educationEntrySchema], default: [] },
    projects: { type: [projectEntrySchema], default: [] },
    certifications: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    awards: { type: [String], default: [] },
  },
  { _id: false },
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true, trim: true, maxlength: 255 },
    fileType: { type: String, required: true, enum: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true },
    status: { type: String, enum: ["parsed", "error"], default: "parsed" },
    parseError: { type: String, default: "" },
    parsedData: { type: parsedDataSchema, default: () => ({}) },
    template: { type: String, enum: ["classic", "modern", "minimal", "compact"], default: "classic" },
  },
  { timestamps: true },
);

export const Resume = mongoose.model("Resume", resumeSchema);
