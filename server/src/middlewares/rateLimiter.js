import rateLimit from "express-rate-limit";

import { RATE_LIMITS } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";

const handler = () => ApiError.tooManyRequests();

/** Global limiter — applied to all /api routes. */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  limit: RATE_LIMITS.GLOBAL.max,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler,
});

/** Stricter limiter — applied to auth routes. */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  limit: RATE_LIMITS.AUTH.max,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler,
});

/** AI route limiter. */
export const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI.windowMs,
  limit: RATE_LIMITS.AI.max,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler,
});
