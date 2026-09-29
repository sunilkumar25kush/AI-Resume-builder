import { asyncHandler } from "../utils/asyncHandler.js";
import * as resumeService from "../services/resume.service.js";

export const uploadResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.createResume({ userId: req.user.id, file: req.file });
  res.status(201).json({ success: true, data: { resume } });
});

export const listResumes = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page ?? "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit ?? "20", 10) || 20;
  const result = await resumeService.listResumes(req.user.id, { page, limit });
  res.json({ success: true, data: result });
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

/** Puppeteer PDF export endpoint. */
export const exportResumePdf = asyncHandler(async (req, res) => {
  const { density } = req.query;
  let theme = {};
  if (req.query.theme) {
    try {
      theme = typeof req.query.theme === "string" ? JSON.parse(req.query.theme) : req.query.theme;
    } catch {
      theme = {};
    }
  }

  const { buffer, fileName } = await resumeService.exportPdf(req.user.id, req.params.id, { density, theme });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
});

/**
 * Print data endpoint for the Puppeteer renderer and direct print view.
 * Accepts either a short-lived token (?token=...) or standard session auth.
 */
export const getResumePrintData = asyncHandler(async (req, res) => {
  const resume = await resumeService.getPrintData(req);
  res.json({ success: true, data: { resume } });
});
