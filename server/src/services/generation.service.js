import { randomUUID } from "node:crypto";

import { ApiError } from "../utils/ApiError.js";
import { JobDescription } from "../models/JobDescription.js";
import { Resume } from "../models/Resume.js";
import { generateJson } from "./ai/index.js";
import { buildGenerationPrompt } from "./ai/prompts.js";
import { mergeGeneratedData } from "../validations/generation.js";

/** Compact display snapshot of a resume's parsed data for the prompt. */
function resumeSnapshot(resume) {
  const { parsedData } = resume;
  return {
    summary: parsedData?.summary ?? "",
    contact: parsedData?.contact ?? {},
    skills: parsedData?.skills ?? [],
    experience: parsedData?.experience ?? [],
    education: parsedData?.education ?? [],
    projects: parsedData?.projects ?? [],
  };
}

/**
 * AI resume generation: load resume + JD (ownership-checked), rewrite the
 * resume against the JD, merge (never drop user data), and persist the
 * result as a NEW resume document — the original stays untouched.
 */
export async function generateOptimizedResume(userId, resumeId, jdId) {
  const [resume, jd] = await Promise.all([
    Resume.findOne({ _id: resumeId, user: userId }),
    JobDescription.findOne({ _id: jdId, user: userId }),
  ]);
  if (!resume) throw new ApiError(404, "Resume not found");
  if (!jd) throw new ApiError(404, "Job description not found");

  const prompt = buildGenerationPrompt({
    resume: resumeSnapshot(resume),
    jd: {
      title: jd.title,
      company: jd.company,
      skills: jd.skills,
      qualifications: jd.qualifications,
      responsibilities: jd.responsibilities,
    },
  });

  const raw = await generateJson(prompt, { timeoutMs: 150_000, temperature: 0.3 });
  const parsedData = mergeGeneratedData(raw, resume.parsedData ?? {});

  const base = resume.fileName.replace(/\.[^.]+$/, "");
  return Resume.create({
    user: userId,
    fileName: `${base}-ai-optimized${resume.fileType.includes("pdf") ? ".pdf" : ".docx"}`,
    fileType: resume.fileType,
    fileSize: resume.fileSize,
    // Non-empty sentinel: no real file on disk; delete flow unlinks silently.
    filePath: `ai-generated/${randomUUID()}`,
    status: "parsed",
    parsedData,
    template: resume.template,
  });
}
