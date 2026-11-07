import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { RATE_LIMITS } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";

const handler = (req, res, next) => next(ApiError.tooManyRequests());

/**
 * Normalizes IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
 * before delegating to express-rate-limit's ipKeyGenerator so IPv4 and IPv6
 * clients are bucketed consistently without bypass.
 */
function resolveClientIpKey(req) {
  const rawIp = typeof req.ip === "string" && req.ip.trim() ? req.ip.trim() : "127.0.0.1";
  const normalizedIp = rawIp.replace(/^::ffff:/i, "");
  return ipKeyGenerator(normalizedIp);
}

/** Global limiter — applied to all /api routes. */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  limit: RATE_LIMITS.GLOBAL.max,
  keyGenerator: (req) => resolveClientIpKey(req),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler,
});

/** Stricter limiter — applied to auth routes. */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  limit: RATE_LIMITS.AUTH.max,
  keyGenerator: (req) => resolveClientIpKey(req),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler,
});

/** AI route limiter — per-user if authenticated, otherwise per-IP. */
export const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI.windowMs,
  limit: RATE_LIMITS.AI.max,
  keyGenerator: (req) => req.user?.id || resolveClientIpKey(req),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler,
});
