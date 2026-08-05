import { Router } from "express";

import { isDbConnected } from "../config/db.js";
import { env } from "../config/env.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(
      ApiResponse.ok(
        {
          service: "ai-resume-builder-api",
          status: "ok",
          db: isDbConnected() ? "connected" : "disconnected",
          ai: { provider: "gemini", model: env.GEMINI_MODEL },
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        },
        "API is healthy",
      ),
    );
  }),
);

export default router;
