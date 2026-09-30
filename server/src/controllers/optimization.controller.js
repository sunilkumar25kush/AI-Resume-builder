import { asyncHandler } from "../utils/asyncHandler.js";
import * as optimizerService from "../services/optimizer.service.js";

export const runResumeOptimization = asyncHandler(async (req, res) => {
  const { resumeId, jdId } = req.validatedBody;
  const optimization = await optimizerService.runOptimization(req.user.id, resumeId, jdId);
  res.status(201).json({ success: true, data: { optimization } });
});

export const getUserOptimizations = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page ?? "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit ?? "20", 10) || 20;
  const result = await optimizerService.listOptimizations(req.user.id, { page, limit });
  res.json({ success: true, data: result });
});

export const getOptimizationById = asyncHandler(async (req, res) => {
  const optimization = await optimizerService.getOptimization(req.user.id, req.params.id);
  res.json({ success: true, data: { optimization } });
});

export const deleteOptimizationById = asyncHandler(async (req, res) => {
  const result = await optimizerService.deleteOptimization(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

// Backward-compatible aliases
export const runOptimization = runResumeOptimization;
export const listOptimizations = getUserOptimizations;
export const getOptimization = getOptimizationById;
export const deleteOptimization = deleteOptimizationById;

