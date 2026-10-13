import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createPortfolio,
  deletePortfolioById,
  getPortfolioById,
  getPublicPortfolioBySlug,
  getUserPortfolios,
  publishPortfolioById,
  unpublishPortfolioById,
  updatePortfolioById,
} from "../controllers/portfolio.controller.js";
import {
  createPortfolioSchema,
  publishPortfolioSchema,
  updatePortfolioSchema,
} from "../validations/portfolio.validation.js";

const router = Router();

// Publicly viewable portfolio route (no auth required)
router.get("/public/:slug", getPublicPortfolioBySlug);

// All subsequent routes require authentication
router.use(protect);

router.get("/", getUserPortfolios);
router.post("/", validate({ body: createPortfolioSchema }), createPortfolio);

router.get("/:id", getPortfolioById);
router.patch("/:id", validate({ body: updatePortfolioSchema }), updatePortfolioById);
router.delete("/:id", deletePortfolioById);

router.post("/:id/publish", validate({ body: publishPortfolioSchema.optional() }), publishPortfolioById);
router.post("/:id/unpublish", unpublishPortfolioById);

export default router;
