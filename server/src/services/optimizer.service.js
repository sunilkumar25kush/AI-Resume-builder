import { ApiError } from "../utils/ApiError.js";
import { JobDescription } from "../models/JobDescription.js";
import { Optimization } from "../models/Optimization.js";
import { Resume } from "../models/Resume.js";
import { generateJson } from "./ai/index.js";
import { buildOptimizePrompt } from "./ai/prompts.js";
import { normalizeResult } from "../validations/optimization.js";

/**
 * Normalize a skill/keyword for comparison: lowercase, trim, strip anything
 * that is not a word character (keeps C++, C#, Node.js intact).
 */
function normalizeToken(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+#.]/g, "");
}

/**
 * Deterministic match metrics computed from the ACTUAL resume + JD data —
 * never from the AI. The LLM is unreliable at arithmetic/intersections
 * (it once reported 60% match + matched keywords for a totally unrelated
 * resume), so scores and skill lists are calculated here in code.
 * The AI still supplies the qualitative feedback (weak bullets, grammar,
 * formatting, suggestions, summary).
 */
export function computeMatchMetrics({ resume, jd }) {
  const jdSkills = (jd.skills ?? []).map((skill) => String(skill).trim()).filter(Boolean);
  const resumeSkillSet = new Set((resume.skills ?? []).map(normalizeToken).filter(Boolean));

  // Strict intersection: a JD skill is matched only if the resume lists it.
  const matchedSkills = jdSkills.filter((skill) => resumeSkillSet.has(normalizeToken(skill)));
  const missingSkills = jdSkills.filter((skill) => !resumeSkillSet.has(normalizeToken(skill)));

  // Keyword density: exact-token match against the full resume text
  // (single words match exact tokens only — "Git" never matches "GitHub",
  // "Java" never matches "JavaScript"; multi-word keywords substring-match).
  const atsKeywords = (jd.atsKeywords ?? []).map((keyword) => String(keyword).trim()).filter(Boolean);
  const rawText = normalizeToken(
    [
      resume.summary ?? "",
      ...(resume.skills ?? []),
      ...(resume.experience ?? []).flatMap((exp) => Object.values(exp)),
      ...(resume.projects ?? []).flatMap((proj) => Object.values(proj)),
    ].join(" "),
  );
  const resumeTokens = new Set(rawText.split(" ").filter(Boolean));
  const matchedKeywordCount = atsKeywords.filter((keyword) => {
    const normalized = normalizeToken(keyword);
    if (!normalized) return false;
    if (/\s/.test(String(keyword))) return rawText.includes(normalized);
    return resumeTokens.has(normalized);
  }).length;

  const matchPercent = jdSkills.length ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 0;
  const keywordDensity = atsKeywords.length ? Math.round((matchedKeywordCount / atsKeywords.length) * 100) : 0;
  // Composite ATS score: keyword coverage 60% + required-skill coverage 40%;
  // pure skill match when the JD has no ATS keywords parsed.
  const atsScore = atsKeywords.length ? Math.round(0.6 * keywordDensity + 0.4 * matchPercent) : matchPercent;

  return { atsScore, matchPercent, keywordDensity, matchedSkills, missingSkills };
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
  const aiResult = normalizeResult(raw);

  // Override every verifiable metric with the deterministic computation so a
  // hallucinating LLM can never inflate scores or invent matches.
  const metrics = computeMatchMetrics({ resume: resumeSnapshot(resume), jd });
  // Changes: prefer the AI's concrete additions; fall back to the
  // deterministic missing-skills list so the report always has actions.
  const changes =
    Array.isArray(aiResult.changes) && aiResult.changes.length > 0
      ? aiResult.changes
      : metrics.missingSkills.map((skill) => ({
          type: "add-skill",
          section: "skills",
          field: "skills",
          value: skill,
          reason: "Missing skill from the job description",
        }));
  const result = {
    ...aiResult,
    changes,
    atsScore: metrics.atsScore,
    matchPercent: metrics.matchPercent,
    keywordDensity: metrics.keywordDensity,
    matchedSkills: metrics.matchedSkills,
    missingSkills: metrics.missingSkills,
  };

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
