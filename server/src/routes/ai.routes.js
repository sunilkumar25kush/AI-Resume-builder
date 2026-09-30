import { Router } from "express";

import { env } from "../config/env.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { geminiService } from "../services/ai/gemini.service.js";
import { rewriteResumeSection } from "../controllers/assist.controller.js";
import { suggestResumeAdditions } from "../controllers/suggestions.controller.js";
import { assistSchema } from "../validations/assist.js";
import { suggestionsSchema } from "../validations/suggestions.js";

const router = Router();

const statusHandler = asyncHandler(async (req, res) => {
  if (env.NODE_ENV === "production") {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  const result = await geminiService.ping();
  if (!result.ok) {
    return res.status(503).json({
      success: false,
      message: `AI provider unavailable (${result.provider})`,
      data: result,
    });
  }
  res.json(ApiResponse.ok(result, "AI provider is responding"));
});

// Dev-only diagnostic
router.get("/status", statusHandler);
router.get("/health", statusHandler); // Alias
router.get("/ping", statusHandler); // Alias

// Per-section AI assist
router.post("/section-rewrites", protect, validate({ body: assistSchema }), rewriteResumeSection);
router.post("/assist", protect, validate({ body: assistSchema }), rewriteResumeSection); // Alias

// Editor-time suggestions
router.post("/content-suggestions", protect, validate({ body: suggestionsSchema }), suggestResumeAdditions);
router.post("/suggestions", protect, validate({ body: suggestionsSchema }), suggestResumeAdditions); // Alias

export default router;

