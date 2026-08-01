import { asyncHandler } from "../utils/asyncHandler.js";
import * as optimizerService from "../services/optimizer.service.js";

export const runOptimization = asyncHandler(async (req, res) => {
  const { resumeId, jdId } = req.validatedBody;
  const optimization = await optimizerService.runOptimization(req.user.id, resumeId, jdId);
  res.status(201).json({ success: true, data: { optimization } });
});

export const listOptimizations = asyncHandler(async (req, res) => {
  const optimizations = await optimizerService.listOptimizations(req.user.id);
  res.json({ success: true, data: { optimizations } });
});

export const getOptimization = asyncHandler(async (req, res) => {
  const optimization = await optimizerService.getOptimization(req.user.id, req.params.id);
  res.json({ success: true, data: { optimization } });
});

export const deleteOptimization = asyncHandler(async (req, res) => {
  const result = await optimizerService.deleteOptimization(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});
