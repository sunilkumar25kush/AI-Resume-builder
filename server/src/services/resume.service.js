import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { extractText, normalizeResumeText } from "./resumeParser.js";
import { createSnapshot } from "./versions.service.js";

const UPLOADS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..", "uploads");

/** Parse an uploaded file, storing the result in a Resume document. */
export async function createResume({ userId, file }) {
  if (!file) throw ApiError.badRequest("No file uploaded");

  let parsedData;
  let parseError = "";

  try {
    const text = await extractText(fs.readFileSync(file.path), file.mimetype);
    parsedData = normalizeResumeText(text);
  } catch (error) {
    parseError = error.code === "UNREADABLE" ? error.message : "Could not parse this file — it may be corrupted or scanned (no selectable text)";
  }

  if (!parsedData) {
    fs.unlink(file.path, () => {});
    throw ApiError.badRequest(parseError);
  }

  return Resume.create({
    user: userId,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    filePath: path.relative(UPLOADS_ROOT, file.path),
    parsedData,
  });
}

export async function listResumes(userId) {
  return Resume.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("-filePath -__v")
    .lean();
}

export async function getResume(userId, resumeId) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).select("-filePath -__v").lean();
  if (!resume) throw new ApiError(404, "Resume not found");
  return resume;
}

export async function updateResume(userId, resumeId, update) {
  // $set with dotted paths so partial parsedData patches never wipe
  // the sibling sections (nested object assignment would replace them).
  const set = {};
  if (update.parsedData) {
    for (const [key, value] of Object.entries(update.parsedData)) set[`parsedData.${key}`] = value;
  }
  if (update.template) set.template = update.template;
  const resume = await Resume.findOneAndUpdate({ _id: resumeId, user: userId }, { $set: set }, { new: true, runValidators: true })
    .select("-filePath -__v")
    .lean();
  if (!resume) throw new ApiError(404, "Resume not found");
  // Snapshot the saved state (post-update) — no-op saves are deduped.
  await createSnapshot(userId, resumeId, resume);
  return resume;
}

export async function deleteResume(userId, resumeId) {
  const resume = await Resume.findOneAndDelete({ _id: resumeId, user: userId });
  if (!resume) throw new ApiError(404, "Resume not found");
  if (resume.filePath) {
    fs.unlink(path.join(UPLOADS_ROOT, resume.filePath), () => {});
  }
  return { id: resumeId };
}
