import { asyncHandler } from "../utils/asyncHandler.js";
import * as generationService from "../services/generation.service.js";

export const generateResume = asyncHandler(async (req, res) => {
  const { jdId } = req.validatedBody;
  const resume = await generationService.generateOptimizedResume(req.user.id, req.params.id, jdId);
  res.status(201).json({ success: true, data: { resume } });
});

export const generateResumeFromJd = asyncHandler(async (req, res) => {
  const { jdId, targetTitle, experienceLevel } = req.validatedBody;
  const resume = await generationService.generateFromJd(req.user.id, { jdId, targetTitle, experienceLevel });
  res.status(201).json({ success: true, data: { resume } });
});
