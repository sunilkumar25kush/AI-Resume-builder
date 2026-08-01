import fs from "node:fs";

import multer from "multer";

import { ApiError } from "../utils/ApiError.js";

const AVATAR_DIR = "uploads/avatars";
const RESUME_DIR = "uploads/resumes";
const JD_DIR = "uploads/jds";

for (const dir of [AVATAR_DIR, RESUME_DIR, JD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const AVATAR_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const RESUME_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function extensionFor(mimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "application/pdf") return "pdf";
  return "docx";
}

/** Create a multer instance for a specific upload kind. */
function createUpload({ dir, maxBytes, allowedMime, message }) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extensionFor(file.mimetype)}`),
  });

  const fileFilter = (_req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(ApiError.badRequest(message));
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: maxBytes } });
}

export const uploadAvatar = createUpload({
  dir: AVATAR_DIR,
  maxBytes: 2 * 1024 * 1024,
  allowedMime: AVATAR_MIME,
  message: "Only JPEG, PNG or WebP images are allowed",
});

export const uploadResume = createUpload({
  dir: RESUME_DIR,
  maxBytes: 10 * 1024 * 1024,
  allowedMime: RESUME_MIME,
  message: "Only PDF or DOCX files are allowed",
});

export const uploadJd = createUpload({
  dir: JD_DIR,
  maxBytes: 10 * 1024 * 1024,
  allowedMime: RESUME_MIME,
  message: "Only PDF or DOCX files are allowed",
});
