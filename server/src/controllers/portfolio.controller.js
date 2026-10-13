import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { RESUME_MIME, validateMemoryMagicBytes } from "../middlewares/upload.js";
import * as portfolioService from "../services/portfolio.service.js";
import * as portfolioExportService from "../services/portfolioExport.service.js";

/** Create a new portfolio draft */
export const createPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.createPortfolio(req.user.id, req.validatedBody);
  res.status(201).json({ success: true, data: { portfolio } });
});

/** List the current user's portfolios with pagination */
export const getUserPortfolios = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page ?? "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit ?? "20", 10) || 20;
  const status = req.query.status;
  const result = await portfolioService.listPortfolios(req.user.id, { page, limit, status });
  res.json({ success: true, data: result });
});

/** Fetch a specific portfolio by ID */
export const getPortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getPortfolioById(req.user.id, req.params.id);
  res.json({ success: true, data: { portfolio } });
});

/** Update permitted content/design fields */
export const updatePortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.updatePortfolio(req.user.id, req.params.id, req.validatedBody);
  res.json({ success: true, data: { portfolio } });
});

/** Transition portfolio state to published */
export const publishPortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.publishPortfolio(
    req.user.id,
    req.params.id,
    req.validatedBody || {},
  );
  res.json({ success: true, data: { portfolio } });
});

/** Revert portfolio state to draft */
export const unpublishPortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.unpublishPortfolio(req.user.id, req.params.id);
  res.json({ success: true, data: { portfolio } });
});

/** Delete a portfolio */
export const deletePortfolioById = asyncHandler(async (req, res) => {
  const result = await portfolioService.deletePortfolio(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

/** Public endpoint to fetch a published portfolio by slug */
export const getPublicPortfolioBySlug = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getPublicPortfolio(req.params.slug);
  res.json({ success: true, data: { portfolio } });
});

/** Generate a portfolio draft directly from an uploaded PDF or DOCX file */
export const generatePortfolioFromUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("No resume file uploaded");
  }

  // 1. Verify binary magic bytes in-memory (reject spoofed Content-Type)
  await validateMemoryMagicBytes(req.file, RESUME_MIME, "Only PDF or DOCX files are allowed");

  // 2. Extract raw text server-side
  const resumeText = await portfolioService.extractResumeDocumentText(
    req.file.buffer,
    req.file.mimetype,
  );

  // 3. Run Gemini extraction pipeline and persist draft
  const portfolio = await portfolioService.generatePortfolioFromResumeText(
    req.user.id,
    resumeText,
    {
      preferredTemplate: req.validatedBody?.template || req.body?.template,
      customTitle: req.validatedBody?.title || req.body?.title,
    },
  );

  res.status(201).json({ success: true, data: { portfolio } });
});

/** Generate a portfolio draft from an existing saved resume in the user's account */
export const generatePortfolioFromResume = asyncHandler(async (req, res) => {
  const { resumeId, template, title } = req.validatedBody;
  const portfolio = await portfolioService.generatePortfolioFromExistingResume(
    req.user.id,
    resumeId,
    {
      preferredTemplate: template,
      customTitle: title,
    },
  );

  res.status(201).json({ success: true, data: { portfolio } });
});

/** Export a portfolio as React Source ZIP or Static Website ZIP */
export const exportPortfolioById = asyncHandler(async (req, res) => {
  const format = req.query.format === "static" ? "static" : "source";
  const portfolio = await portfolioService.getPortfolioById(req.user.id, req.params.id);

  if (format === "static") {
    await portfolioExportService.exportPortfolioAsStaticZip(portfolio, res);
  } else {
    await portfolioExportService.exportPortfolioAsSourceZip(portfolio, res);
  }
});

