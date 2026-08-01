import multer from "multer";

import { env } from "../config/env.js";
import { HTTP_STATUS } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";

/** Central error handler — single place for logging + client response. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Multer upload errors (size limits etc.) → 413
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message;
    return res.status(413).json({ success: false, message });
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  if (statusCode >= 500) {
    console.error("[error]", err);
  }

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : err.message,
    details: err.details,
    ...(env.NODE_ENV === "development" && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

/** 404 handler for unknown routes. */
export function notFound(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
