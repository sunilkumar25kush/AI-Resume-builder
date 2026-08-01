import multer from "multer";

import { ApiError } from "../utils/ApiError.js";

const AVATAR_DIR = "uploads/avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (_req, file, cb) => {
    const ext = file.mimetype === "image/png" ? "png" : file.mimetype === "image/webp" ? "webp" : "jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(ApiError.badRequest("Only JPEG, PNG or WebP images are allowed"));
  }
  cb(null, true);
};

export const uploadAvatar = multer({ storage, fileFilter, limits: { fileSize: MAX_AVATAR_BYTES } });
