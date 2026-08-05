import { asyncHandler } from "../utils/asyncHandler.js";
import * as resumeService from "../services/resume.service.js";

export const uploadResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.createResume({ userId: req.user.id, file: req.file });
  res.status(201).json({ success: true, data: { resume } });
});

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.listResumes(req.user.id);
  res.json({ success: true, data: { resumes } });
});

/** Create a fresh blank resume (scratch builder) — name/email prefilled. */
export const createBlankResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.createBlankResume(req.user.id, req.validatedBody.template, req.user);
  res.status(201).json({ success: true, data: { resume } });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResume(req.user.id, req.params.id);
  res.json({ success: true, data: { resume } });
});

export const updateResume = asyncHandler(async (req, res) => {
  const update = {};
  if (req.validatedBody.parsedData) update.parsedData = req.validatedBody.parsedData;
  if (req.validatedBody.template) update.template = req.validatedBody.template;
  if (req.validatedBody.fileName !== undefined) update.fileName = req.validatedBody.fileName;
  const resume = await resumeService.updateResume(req.user.id, req.params.id, update);
  res.json({ success: true, data: { resume } });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const result = await resumeService.deleteResume(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});
