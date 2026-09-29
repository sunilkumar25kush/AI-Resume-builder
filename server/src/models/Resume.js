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

const customSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", maxlength: 200 },
    content: { type: String, default: "", maxlength: 10000 },
  },
  { _id: false },
);

const parsedDataSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    summary: { type: String, default: "" },
    contact: { type: contactSchema, default: () => ({}) },
    skills: { type: mongoose.Schema.Types.Mixed, default: [] },
    experience: { type: [experienceEntrySchema], default: [] },
    education: { type: [educationEntrySchema], default: [] },
    projects: { type: [projectEntrySchema], default: [] },
    certifications: { type: mongoose.Schema.Types.Mixed, default: [] },
    languages: { type: mongoose.Schema.Types.Mixed, default: [] },
    awards: { type: mongoose.Schema.Types.Mixed, default: [] },
    coursework: { type: mongoose.Schema.Types.Mixed, default: [] },
    customSections: { type: [customSectionSchema], default: [] },
    hiddenSections: { type: [String], default: [] },
  },
  { _id: false },
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true, trim: true, maxlength: 255 },
    fileType: { type: String, required: true, enum: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
    fileSize: { type: Number, required: true },
    filePath: { type: String, default: "" },
    status: { type: String, enum: ["parsed", "error"], default: "parsed" },
    parseError: { type: String, default: "" },
    parsedData: { type: parsedDataSchema, default: () => ({}) },
    // AI-reported additions from the last generation/optimization — the
    // editor highlights these so the user sees exactly what was added.
    // Free-form objects (type/section/field/value/reason) — never edited
    // through the update API, only set at creation by the AI services.
    aiChanges: {
      type: [
        {
          type: { type: String, default: "add-skill" },
          section: { type: String, default: "skills" },
          field: { type: String, default: "skills" },
          value: { type: String, default: "" },
          reason: { type: String, default: "" },
        },
      ],
      default: [],
    },
    template: {
      type: String,
      default: "classic-rose-serif",
    },
  },
  { timestamps: true },
);

export const Resume = mongoose.model("Resume", resumeSchema);
