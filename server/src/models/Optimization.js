import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    atsScore: { type: Number, default: 0, min: 0, max: 100 },
    matchPercent: { type: Number, default: 0, min: 0, max: 100 },
    keywordDensity: { type: Number, default: 0, min: 0, max: 100 },
    missingSkills: { type: [String], default: [] },
    matchedSkills: { type: [String], default: [] },
    weakBullets: { type: [String], default: [] },
    grammarIssues: { type: [String], default: [] },
    formattingSuggestions: { type: [String], default: [] },
    keywordSuggestions: { type: [String], default: [] },
    summary: { type: String, default: "" },
  },
  { _id: false },
);

const optimizationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    jdId: { type: mongoose.Schema.Types.ObjectId, ref: "JobDescription", required: true },
    // Input snapshots so history stays readable even if the resume/JD changes.
    resumeTitle: { type: String, default: "" },
    jdTitle: { type: String, default: "" },
    jdCompany: { type: String, default: "" },
    result: { type: resultSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const Optimization = mongoose.model("Optimization", optimizationSchema);
