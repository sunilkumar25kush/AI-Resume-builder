import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";

/** Extracts JWT from httpOnly cookie or Authorization header, loads the user. */
export async function protect(req, res, next) {
  try {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const token = req.cookies?.token || bearer;
    if (!token) throw ApiError.unauthorized("Not authenticated");

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized("Account unavailable");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Extracts JWT if present. If no token, proceeds as guest without throwing 401. */
export async function optionalProtect(req, res, next) {
  try {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const token = req.cookies?.token || bearer;
    if (!token) return next();

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}

/** Role-based access control — must run after protect. */
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
