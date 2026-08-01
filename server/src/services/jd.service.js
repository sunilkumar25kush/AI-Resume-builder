import fs from "node:fs";
import path from "node:path";

import { ApiError } from "../utils/ApiError.js";
import { JobDescription } from "../models/JobDescription.js";
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
  let parsed;
  try {
    const text = await extractText(fs.readFileSync(file.path), file.mimetype);
    parsed = parseJdText(text);
    if (!text.trim()) throw Object.assign(new Error("empty"), { code: "UNREADABLE" });
    parsed.text = text.trim();
  } catch {
    fs.unlink(file.path, () => {});
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

export async function listJds(userId) {
  return JobDescription.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export async function getJd(userId, id) {
  const jd = await JobDescription.findOne({ _id: id, user: userId }).lean();
  if (!jd) throw new ApiError(404, "Job description not found");
  return jd;
}

export async function updateJd(userId, id, patch) {
  const jd = await JobDescription.findOne({ _id: id, user: userId });
  if (!jd) throw new ApiError(404, "Job description not found");
  Object.assign(jd, patch);
  await jd.save();
  return jd.toObject();
}

export async function deleteJd(userId, id) {
  const jd = await JobDescription.findOneAndDelete({ _id: id, user: userId });
  if (!jd) throw new ApiError(404, "Job description not found");
  return true;
}
