import { asyncHandler } from "../utils/asyncHandler.js";
import * as portfolioService from "../services/portfolio.service.js";

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
