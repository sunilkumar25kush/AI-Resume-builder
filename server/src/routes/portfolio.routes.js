import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { aiLimiter } from "../middlewares/rateLimiter.js";
import { uploadPortfolioResume } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import {
  createPortfolio,
  deletePortfolioById,
  generatePortfolioFromResume,
  generatePortfolioFromUpload,
  getPortfolioById,
  getPublicPortfolioBySlug,
  getUserPortfolios,
  publishPortfolioById,
  unpublishPortfolioById,
  updatePortfolioById,
} from "../controllers/portfolio.controller.js";
import {
  createPortfolioSchema,
  generateFromResumeSchema,
  generateFromUploadSchema,
  publishPortfolioSchema,
  updatePortfolioSchema,
} from "../validations/portfolio.validation.js";

const router = Router();

// Publicly viewable portfolio route (no auth required)
router.get("/public/:slug", getPublicPortfolioBySlug);

// All subsequent routes require authentication
router.use(protect);

// AI Generation routes (guarded by per-user AI rate limiter)
router.post(
  "/generate/upload",
  aiLimiter,
  uploadPortfolioResume.single("resume"),
  validate({ body: generateFromUploadSchema }),
  generatePortfolioFromUpload,
);
router.post(
  "/generate/from-resume",
  aiLimiter,
  validate({ body: generateFromResumeSchema }),
  generatePortfolioFromResume,
);

// CRUD collection endpoints
router.get("/", getUserPortfolios);
router.post("/", validate({ body: createPortfolioSchema }), createPortfolio);

// Specific portfolio document endpoints
router.get("/:id", getPortfolioById);
router.patch("/:id", validate({ body: updatePortfolioSchema }), updatePortfolioById);
router.delete("/:id", deletePortfolioById);

// Publication state transition endpoints
router.post("/:id/publish", validate({ body: publishPortfolioSchema.optional() }), publishPortfolioById);
router.post("/:id/unpublish", unpublishPortfolioById);

export default router;
