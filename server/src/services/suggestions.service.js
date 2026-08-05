import { JobDescription } from "../models/JobDescription.js";
import { Resume } from "../models/Resume.js";
import { generateJson } from "./ai/index.js";
import { buildSuggestPrompt } from "./ai/prompts.js";
import { ApiError } from "../utils/ApiError.js";
import { normalizeSuggestions } from "../validations/suggestions.js";

/**
 * Editor-time "what else should I add?" — compares the resume against a job
 * description (saved JD or pasted text) and returns actionable additions.
 */
export async function suggestAdditions({ userId, resumeId, jdId, jdText }) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).select("-filePath -__v").lean();
  if (!resume) throw new ApiError(404, "Resume not found");

  let jd;
  if (jdId) {
    jd = await JobDescription.findOne({ _id: jdId, user: userId }).select("-__v").lean();
    if (!jd) throw new ApiError(404, "Job description not found");
  } else {
    jd = { title: "Pasted job description", text: jdText };
  }

  const prompt = buildSuggestPrompt({ resume: resume.parsedData ?? {}, jd });
  const raw = await generateJson(prompt, { timeoutMs: 150_000, temperature: 0.4 });
  return normalizeSuggestions(raw);
}
