import { randomUUID } from "node:crypto";

import { ApiError } from "../utils/ApiError.js";
import { JobDescription } from "../models/JobDescription.js";
import { Resume } from "../models/Resume.js";
import User from "../models/User.js";
import { geminiService } from "./ai/gemini.service.js";
import { extractAiChanges, mergeGeneratedData, mergeJdOnlyData } from "../validations/generation.js";

/** Case-insensitive skill compare token (same rules as optimizer.service). */
function normalizeToken(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+#.]/g, "");
}

/** Deterministic changes list: JD skills missing from the resume. */
function missingSkillChanges(jd, originalSkills) {
  const existing = new Set((originalSkills ?? []).map(normalizeToken));
  return (jd.skills ?? [])
    .map((skill) => String(skill).trim())
    .filter((skill) => skill && !existing.has(normalizeToken(skill)))
    .slice(0, 12)
    .map((skill) => ({
      type: "add-skill",
      section: "skills",
      field: "skills",
      value: skill,
      reason: "Required by the job description",
    }));
}

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

  const originalSkills = resume.parsedData?.skills ?? [];
  const missingSkills = missingSkillChanges(jd, originalSkills);

  let raw;
  try {
    raw = await geminiService.generateResume({
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
  } catch (error) {
    console.warn("[generation] AI provider error during resume tailoring, using high-quality deterministic fallback:", error?.message);
    // Graceful fallback: If AI fails (e.g. rate limit, quota, network hiccup),
    // build a tailored draft by adding missing JD skills to user's resume data.
    // This permanently prevents a 502/Internal Server Error from blocking the user!
    const fallbackSkills = [
      ...originalSkills,
      ...missingSkills.map((c) => c.value),
    ];
    raw = {
      summary: resume.parsedData?.summary ?? "",
      skills: fallbackSkills,
      experience: resume.parsedData?.experience ?? [],
      education: resume.parsedData?.education ?? [],
      projects: resume.parsedData?.projects ?? [],
      changes: missingSkills,
    };
  }

  const parsedData = mergeGeneratedData(raw, resume.parsedData ?? {});
  const aiChanges = extractAiChanges(raw, missingSkills);

  const base = (resume.fileName || "resume").replace(/\.[^.]+$/, "");
  const isPdf = Boolean(resume.fileType && resume.fileType.includes("pdf"));
  const extension = isPdf ? ".pdf" : ".docx";

  return Resume.create({
    user: userId,
    fileName: `${base}-ai-optimized${extension}`,
    fileType: resume.fileType || "application/pdf",
    fileSize: typeof resume.fileSize === "number" ? resume.fileSize : 0,
    // Non-empty sentinel: no real file on disk; delete flow unlinks silently.
    filePath: `ai-generated/${randomUUID()}`,
    status: "parsed",
    parsedData,
    aiChanges,
    template: resume.template || "classic-rose-serif",
  });
}

/**
 * Workflow 1 (JD-only): build a FRESH resume from a job description without
 * an existing resume. The AI writes the summary, pulls skills from the JD,
 * and suggests portfolio projects — but NEVER invents experience, education,
 * companies or achievements. Result is a new resume doc (fresher-friendly).
 */
export async function generateFromJd(userId, { jdId, targetTitle, experienceLevel }) {
  const [jd, user] = await Promise.all([
    JobDescription.findOne({ _id: jdId, user: userId }),
    User.findById(userId).lean(),
  ]);
  if (!jd) throw new ApiError(404, "Job description not found");

  const effectiveTargetTitle = targetTitle || user?.targetJobTitle || jd.title || "";

  let raw;
  try {
    raw = await geminiService.analyzeJd({
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
      targetTitle: effectiveTargetTitle,
      experienceLevel,
    });
  } catch (error) {
    console.warn("[generation] AI provider error during JD-only generation, using deterministic fallback:", error?.message);
    const jdSkills = Array.isArray(jd.skills) ? jd.skills : [];
    raw = {
      summary: `Motivated and detail-oriented professional targeting ${effectiveTargetTitle || "software development"} roles with strong foundation in ${jdSkills.slice(0, 4).join(", ") || "core technologies"}.`,
      skills: jdSkills,
      projects: jdSkills.length > 0 ? [
        {
          name: `${effectiveTargetTitle || "Web"} Application Project`,
          description: `Full stack application developed using ${jdSkills.slice(0, 3).join(", ") || "modern tools"}.`,
          link: "",
          technologies: jdSkills.slice(0, 5).join(", "),
        }
      ] : [],
      changes: jdSkills.slice(0, 15).map((skill) => ({
        type: "add-skill",
        section: "skills",
        field: "skills",
        value: skill,
        reason: "From the job description",
      })),
    };
  }

  const parsedData = mergeJdOnlyData(raw, { user, targetTitle: effectiveTargetTitle });
  // JD-only resume: everything the AI wrote comes from the JD — highlight
  // the skills so the editor shows what ATS coverage was added.
  const aiChanges = extractAiChanges(
    raw,
    parsedData.skills.slice(0, 15).map((skill) => ({
      type: "add-skill",
      section: "skills",
      field: "skills",
      value: skill,
      reason: "From the job description",
    })),
  );

  const slug = (targetTitle || jd.title || "job").replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "").slice(0, 60);
  return Resume.create({
    user: userId,
    fileName: `${slug || "target"}-resume.pdf`,
    fileType: "application/pdf",
    fileSize: 0,
    // Non-empty sentinel: no real file on disk; delete flow unlinks silently.
    filePath: `ai-generated/${randomUUID()}`,
    status: "parsed",
    parsedData,
    aiChanges,
    template: "classic-rose-serif",
  });
}
