import { asyncHandler } from "../utils/asyncHandler.js";
import * as jdService from "../services/jd.service.js";

export const uploadJd = asyncHandler(async (req, res) => {
  const jd = req.file ? await jdService.createFromFile(req.user.id, req.file) : await jdService.createFromText(req.user.id, req.body.text);
  res.status(201).json({ success: true, data: { jd } });
});

export const listJds = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page ?? "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit ?? "20", 10) || 20;
  const result = await jdService.listJds(req.user.id, { page, limit });
  res.json({ success: true, data: result });
});

export const getJd = asyncHandler(async (req, res) => {
  const jd = await jdService.getJd(req.user.id, req.params.id);
  res.json({ success: true, data: { jd } });
});

export const updateJd = asyncHandler(async (req, res) => {
  const jd = await jdService.updateJd(req.user.id, req.params.id, req.validatedBody);
  res.json({ success: true, data: { jd } });
});

export const deleteJd = asyncHandler(async (req, res) => {
  await jdService.deleteJd(req.user.id, req.params.id);
  res.json({ success: true, data: null });
});
