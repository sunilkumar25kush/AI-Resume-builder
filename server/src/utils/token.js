import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

export const COOKIE_NAME = "token";
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const COOKIE_OPTIONS = {
  httpOnly: true,
  // Production (Vercel client + Render API) is CROSS-SITE — Lax cookies are
  // never attached to cross-site fetch/XHR, so every protected API 401s
  // after login. SameSite=None (+ Secure) lets the browser send the cookie
  // on every request. Dev (localhost client + server) stays Lax.
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  secure: env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
  path: "/",
};

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
}
