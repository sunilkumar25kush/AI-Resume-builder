import mongoose from "mongoose";

const jdEntrySchema = new mongoose.Schema(
  {
    title: { type: String, default: "", maxlength: 200 },
    company: { type: String, default: "", maxlength: 200 },
  },
  { _id: false },
);

const jobDescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: { type: String, enum: ["paste", "file"], default: "paste" },
    fileName: { type: String, default: "", maxlength: 300 },
    fileSize: { type: Number, default: 0 },
    text: { type: String, default: "", maxlength: 50000 },
    title: { type: String, default: "", maxlength: 200 },
    company: { type: String, default: "", maxlength: 200 },
    skills: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const JobDescription = mongoose.model("JobDescription", jobDescriptionSchema);
