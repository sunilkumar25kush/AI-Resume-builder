import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { isDbConnected, getDbError } from "./config/db.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

// Ensure avatar upload dir exists before serving it
const UPLOADS_DIR = "uploads/avatars";
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();

// Security headers
app.use(helmet());

// CORS — allow configured client origin with credentials (cookies)
const corsOptions = {
  origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests for all routes (Express 5 compatible)
app.options(/.*/, cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Database availability check — fail fast with 503 instead of hanging for 10s and causing Vite proxy 502
app.use("/api", (req, res, next) => {
  const isGuestMe = req.path === "/auth/me" && !req.cookies?.token && !req.headers.authorization;
  if (req.path === "/health" || isGuestMe || isDbConnected()) return next();
  const detail = getDbError() ? ` (${getDbError()})` : "";
  res.status(503).json({
    success: false,
    message: `Database connection unavailable${detail}. Please check your MONGO_URI in server/.env.`,
  });
});

// Global rate limit + routes
app.use("/api", apiLimiter, routes);

// User-uploaded files (avatars)
app.use("/uploads", express.static("uploads", { maxAge: "7d", immutable: true }));

// Production: serve the built client from this same service (single deploy).
// Skipped automatically in dev — Vite serves the client on its own port.
const CLIENT_DIST = fileURLToPath(new URL("../../client/dist", import.meta.url));
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { maxAge: "1d", index: "index.html" }));
  // SPA fallback — anything that is not an API/upload path gets index.html
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(join(CLIENT_DIST, "index.html"));
  });
}

// 404 + centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
