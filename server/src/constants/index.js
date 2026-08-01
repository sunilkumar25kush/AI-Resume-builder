export const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});

export const RATE_LIMITS = Object.freeze({
  GLOBAL: { windowMs: 15 * 60 * 1000, max: 300 },
  AUTH: { windowMs: 15 * 60 * 1000, max: 20 },
  AI: { windowMs: 60 * 1000, max: 10 },
});

export const STORAGE_LIMITS = Object.freeze({
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_MIME: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
});
