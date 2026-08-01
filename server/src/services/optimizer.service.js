import { ApiError } from "../utils/ApiError.js";
import { JobDescription } from "../models/JobDescription.js";
import { Optimization } from "../models/Optimization.js";
import { Resume } from "../models/Resume.js";
import { generateJson } from "./ai/index.js";
import { buildOptimizePrompt } from "./ai/prompts.js";
import { normalizeResult } from "../validations/optimization.js";

/** Compact display snapshot of a resume's parsed data for the prompt. */
function resumeSnapshot(resume) {
  const { parsedData } = resume;
  return {
    name: parsedData?.name ?? "",
    summary: parsedData?.summary ?? "",
    contact: parsedData?.contact ?? {},
    skills: parsedData?.skills ?? [],
    experience: parsedData?.experience ?? [],
    education: parsedData?.education ?? [],
    projects: parsedData?.projects ?? [],
    certifications: parsedData?.certifications ?? [],
    languages: parsedData?.languages ?? [],
    awards: parsedData?.awards ?? [],
  };
}

/**
 * Run an AI optimization: load resume + JD (ownership-checked), build the
 * prompt, generate structured JSON, normalize it, and persist the run.
 */
export async function runOptimization(userId, resumeId, jdId) {
  const [resume, jd] = await Promise.all([
    Resume.findOne({ _id: resumeId, user: userId }),
    JobDescription.findOne({ _id: jdId, user: userId }),
  ]);
  if (!resume) throw new ApiError(404, "Resume not found");
  if (!jd) throw new ApiError(404, "Job description not found");

  const prompt = buildOptimizePrompt({
    resume: resumeSnapshot(resume),
    jd: {
      title: jd.title,
      company: jd.company,
      skills: jd.skills,
      preferredSkills: jd.preferredSkills,
      qualifications: jd.qualifications,
      responsibilities: jd.responsibilities,
      atsKeywords: jd.atsKeywords,
      softSkills: jd.softSkills,
      industryKeywords: jd.industryKeywords,
      experienceRequired: jd.experienceRequired,
    },
  });

  const raw = await generateJson(prompt, { timeoutMs: 120_000, temperature: 0.2 });
  const result = normalizeResult(raw);

  return Optimization.create({
    user: userId,
    resumeId,
    jdId,
    resumeTitle: resume.fileName,
    jdTitle: jd.title || jd.fileName,
    jdCompany: jd.company,
    result,
  });
}

export function listOptimizations(userId) {
  return Optimization.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export async function getOptimization(userId, id) {
  const optimization = await Optimization.findOne({ _id: id, user: userId }).lean();
  if (!optimization) throw new ApiError(404, "Optimization not found");
  return optimization;
}

export async function deleteOptimization(userId, id) {
  const deleted = await Optimization.findOneAndDelete({ _id: id, user: userId });
  if (!deleted) throw new ApiError(404, "Optimization not found");
  return { deleted: true };
}
