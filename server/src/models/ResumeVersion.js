import mongoose from "mongoose";

const resumeVersionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true, index: true },
    version: { type: Number, required: true },
    parsedData: { type: mongoose.Schema.Types.Mixed, default: {} },
    template: { type: String, default: "classic" },
  },
  { timestamps: true },
);

resumeVersionSchema.index({ resume: 1, version: -1 });

export const ResumeVersion = mongoose.model("ResumeVersion", resumeVersionSchema);
