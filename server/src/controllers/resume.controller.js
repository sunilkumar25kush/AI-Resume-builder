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

export const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResume(req.user.id, req.params.id);
  res.json({ success: true, data: { resume } });
});

export const updateResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.updateResume(req.user.id, req.params.id, { parsedData: req.body.parsedData });
  res.json({ success: true, data: { resume } });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const result = await resumeService.deleteResume(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});
