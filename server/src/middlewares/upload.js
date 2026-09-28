import fs from "node:fs";
import { fileTypeFromFile } from "file-type";

import multer from "multer";

import { ApiError } from "../utils/ApiError.js";

const AVATAR_DIR = "uploads/avatars";
const RESUME_DIR = "uploads/resumes";
const JD_DIR = "uploads/jds";

for (const dir of [AVATAR_DIR, RESUME_DIR, JD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const AVATAR_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
export const RESUME_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export const JD_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function extensionFor(mimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "text/plain") return "txt";
  return "docx";
}

/** Create a multer instance for a specific upload kind. */
function createUpload({ dir, maxBytes, allowedMime, message }) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extensionFor(file.mimetype)}`),
  });

  // First gate: reject bad Content-Type headers before the file hits disk.
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
  allowedMime: JD_MIME,
  message: "Only PDF, DOCX or TXT files are allowed",
});

/**
 * Second gate: validate actual file content via magic bytes.
 * Call AFTER multer has saved the file (req.file is populated).
 *
 * Reads the first bytes from disk and confirms the real MIME type is in the
 * allowed set. Deletes the file and throws 400 if it does not match.
 * Plain-text files have no magic bytes — file-type returns undefined for them,
 * which we allow through (content is harmless text the parser handles safely).
 *
 * @param {Express.Multer.File} file   req.file from the multer middleware
 * @param {Set<string>}         allowedMime  same set used by the fileFilter
 * @param {string}              message      user-facing rejection message
 */
export async function validateMagicBytes(file, allowedMime, message) {
  if (!file) return;

  let detected;
  try {
    detected = await fileTypeFromFile(file.path);
  } catch {
    fs.unlink(file.path, () => {});
    throw ApiError.badRequest("Could not verify file integrity — please try again");
  }

  // Plain-text files have no binary magic bytes — allow only if text/plain is in allowedMime.
  if (detected === undefined) {
    if (allowedMime.has("text/plain")) return;
    fs.unlink(file.path, () => {});
    throw ApiError.badRequest(message);
  }

  if (!allowedMime.has(detected.mime)) {
    fs.unlink(file.path, () => {});
    throw ApiError.badRequest(message);
  }
}
