import fs from "node:fs";
import path from "node:path";

import { ApiError } from "../utils/ApiError.js";
import { JobDescription } from "../models/JobDescription.js";
import { validateMagicBytes, JD_MIME } from "../middlewares/upload.js";
import { extractText } from "./resumeParser.js";
import { parseJdText } from "./jdParser.js";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

/** Create a JD from pasted text. */
export async function createFromText(userId, text) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) throw new ApiError(400, "Job description text is required");
  if (trimmed.length > 50000) throw new ApiError(413, "Job description is too long (max 50,000 characters)");

  let parsed;
  try {
    parsed = parseJdText(trimmed);
  } catch (error) {
    if (error?.code === "UNREADABLE") throw new ApiError(400, error.message);
    throw error;
  }
  return JobDescription.create({
    user: userId,
    source: "paste",
    text: trimmed,
    ...parsed,
  });
}

/** Create a JD from an uploaded PDF/DOCX file. */
export async function createFromFile(userId, file) {
  // Second gate: validate actual file magic bytes (client may spoof Content-Type).
  await validateMagicBytes(file, JD_MIME, "Only PDF, DOCX or TXT files are allowed");
  let parsed;
  try {
    const fileBuffer = await fs.promises.readFile(file.path);
    const text = await extractText(fileBuffer, file.mimetype);
    const trimmed = text.trim();
    if (!trimmed) {
      throw Object.assign(new Error("File contains no readable text"), { code: "UNREADABLE" });
    }
    parsed = parseJdText(trimmed);
    parsed.text = trimmed;
  } catch (err) {
    fs.unlink(file.path, () => {});
    if (err instanceof ApiError) throw err;
    if (err?.code === "UNREADABLE") {
      throw new ApiError(400, err.message || "File contains no readable text");
    }
    console.error("[jd-upload-error]", err);
    throw new ApiError(422, "Could not extract a job description from this file");
  }

  return JobDescription.create({
    user: userId,
    source: "file",
    fileName: file.originalname,
    fileSize: file.size,
    ...parsed,
  });
}

export async function listJds(userId, { page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [jds, total] = await Promise.all([
    JobDescription.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    JobDescription.countDocuments({ user: userId }),
  ]);

  return {
    jds,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getJd(userId, id) {
  const jd = await JobDescription.findOne({ _id: id, user: userId }).lean();
  if (!jd) throw new ApiError(404, "Job description not found");
  return jd;
}

export async function updateJd(userId, id, patch) {
  const jd = await JobDescription.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: patch },
    { returnDocument: "after", runValidators: true }
  ).lean();
  if (!jd) throw new ApiError(404, "Job description not found");
  return jd;
}

export async function deleteJd(userId, id) {
  const jd = await JobDescription.findOneAndDelete({ _id: id, user: userId });
  if (!jd) throw new ApiError(404, "Job description not found");
  return true;
}
