import { Router } from "express";

import { env } from "../config/env.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { pingProvider } from "../services/ai/index.js";
import { assist } from "../controllers/assist.controller.js";
import { assistSchema } from "../validations/assist.js";

const router = Router();

// Dev-only diagnostic: verifies the configured AI provider responds.
router.get(
  "/ping",
  asyncHandler(async (req, res) => {
    if (env.NODE_ENV === "production") {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    const result = await pingProvider();
    if (!result.ok) {
      return res.status(503).json({
        success: false,
        message: `AI provider unavailable (${result.provider})`,
        data: result,
      });
    }
    res.json(ApiResponse.ok(result, "AI provider is responding"));
  }),
);

// Per-section AI assist (rewrite one summary/entry/skill set).
router.post("/assist", protect, validate({ body: assistSchema }), assist);

export default router;
