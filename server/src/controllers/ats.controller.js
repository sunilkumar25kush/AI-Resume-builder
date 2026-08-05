import { JobDescription } from "../models/JobDescription.js";
import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeAtsReport } from "../services/ats.service.js";
import { normalizeResumeText } from "../services/resumeParser.js";

/**
 * Deterministic ATS check for any resume the user owns — instant, no AI call.
 * Optional JD (saved or pasted text) adds match metrics to the report.
 */
export const checkAts = asyncHandler(async (req, res) => {
  const { resumeId, jdId, jdText } = req.validatedBody;

  const resume = await Resume.findOne({ _id: resumeId, user: req.user.id }).select("-filePath -__v").lean();
  if (!resume) throw new ApiError(404, "Resume not found");

  let jd = null;
  if (jdId) {
    jd = await JobDescription.findOne({ _id: jdId, user: req.user.id }).lean();
    if (!jd) throw new ApiError(404, "Job description not found");
  } else if (jdText) {
    // Reuse the same parser the JD Parser page uses: pulls skills + keywords
    // out of raw pasted text without an AI call.
    const parsed = normalizeResumeText(jdText);
    jd = { skills: parsed.skills ?? [], atsKeywords: [] };
  }

  const report = computeAtsReport({ parsedData: resume.parsedData ?? {}, jd });
  res.json({ success: true, data: report });
});
