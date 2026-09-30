import { asyncHandler } from "../utils/asyncHandler.js";
import * as versionsService from "../services/versions.service.js";

export const getResumeVersions = asyncHandler(async (req, res) => {
  const versions = await versionsService.listVersions(req.user.id, req.params.id);
  res.json({ success: true, data: { versions } });
});

export const getResumeVersionById = asyncHandler(async (req, res) => {
  const version = await versionsService.getVersion(req.user.id, req.params.id, req.params.versionId);
  res.json({ success: true, data: { version } });
});

export const revertToResumeVersion = asyncHandler(async (req, res) => {
  const resume = await versionsService.restoreVersion(req.user.id, req.params.id, req.params.versionId);
  res.json({ success: true, data: { resume } });
});

export const cloneResumeVersion = asyncHandler(async (req, res) => {
  const version = await versionsService.duplicateVersion(req.user.id, req.params.id, req.params.versionId);
  res.status(201).json({ success: true, data: { version } });
});

// Backward-compatible aliases
export const listVersions = getResumeVersions;
export const getVersion = getResumeVersionById;
export const restoreVersion = revertToResumeVersion;
export const duplicateVersion = cloneResumeVersion;

