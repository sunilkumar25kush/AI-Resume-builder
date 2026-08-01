import { ApiError } from "../utils/ApiError.js";
import { Resume } from "../models/Resume.js";
import { ResumeVersion } from "../models/ResumeVersion.js";

export const MAX_VERSIONS = 15;

function snapshotPayload(resume) {
  return {
    parsedData: resume.parsedData ?? {},
    template: resume.template ?? "classic",
  };
}

/** Drop the oldest versions once the cap is exceeded. */
async function prune(resumeId) {
  const versions = await ResumeVersion.find({ resume: resumeId }).sort({ version: -1 }).select("_id").lean();
  if (versions.length > MAX_VERSIONS) {
    const toDelete = versions.slice(MAX_VERSIONS).map((v) => v._id);
    await ResumeVersion.deleteMany({ _id: { $in: toDelete } });
  }
}

/**
 * Snapshot a resume state. Skips when it is byte-identical to the latest
 * version (no-op saves never create duplicates).
 */
export async function createSnapshot(userId, resumeId, resume) {
  const payload = snapshotPayload(resume);
  const latest = await ResumeVersion.findOne({ resume: resumeId }).sort({ version: -1 }).lean();
  if (latest) {
    const identical =
      latest.template === payload.template &&
      JSON.stringify(latest.parsedData ?? {}) === JSON.stringify(payload.parsedData);
    if (identical) return null;
  }
  const version = (latest?.version ?? 0) + 1;
  const doc = await ResumeVersion.create({ user: userId, resume: resumeId, version, ...payload });
  await prune(resumeId);
  return doc;
}

async function ownedResume(userId, resumeId) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).lean();
  if (!resume) throw new ApiError(404, "Resume not found");
  return resume;
}

export async function listVersions(userId, resumeId) {
  await ownedResume(userId, resumeId);
  return ResumeVersion.find({ resume: resumeId, user: userId }).sort({ version: -1 }).select("-user -__v").lean();
}

export async function getVersion(userId, resumeId, versionId) {
  await ownedResume(userId, resumeId);
  const version = await ResumeVersion.findOne({ _id: versionId, resume: resumeId, user: userId }).select("-user -__v").lean();
  if (!version) throw new ApiError(404, "Version not found");
  return version;
}

/**
 * Restore a version onto the resume. Undo is naturally supported: the
 * pre-restore state is already the latest snapshot (post-update), so
 * restoring it again reverts the restore.
 */
export async function restoreVersion(userId, resumeId, versionId) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new ApiError(404, "Resume not found");
  const version = await ResumeVersion.findOne({ _id: versionId, resume: resumeId, user: userId }).lean();
  if (!version) throw new ApiError(404, "Version not found");

  resume.parsedData = version.parsedData;
  resume.template = version.template;
  await resume.save();
  const updated = resume.toObject();
  delete updated.filePath;
  delete updated.__v;
  return updated;
}

/**
 * Duplicate a version: copies its snapshot as a NEW version (branch point)
 * so edits from that state get their own history line.
 */
export async function duplicateVersion(userId, resumeId, versionId) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).select("_id").lean();
  if (!resume) throw new ApiError(404, "Resume not found");
  const version = await ResumeVersion.findOne({ _id: versionId, resume: resumeId, user: userId }).lean();
  if (!version) throw new ApiError(404, "Version not found");

  const latest = await ResumeVersion.findOne({ resume: resumeId }).sort({ version: -1 }).lean();
  const created = await ResumeVersion.create({
    user: userId,
    resume: resumeId,
    version: (latest?.version ?? 0) + 1,
    parsedData: version.parsedData,
    template: version.template,
  });
  await prune(resumeId);
  return created.toObject();
}
