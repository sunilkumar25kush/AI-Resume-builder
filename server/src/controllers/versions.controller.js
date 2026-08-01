import { asyncHandler } from "../utils/asyncHandler.js";
import * as versionsService from "../services/versions.service.js";

export const listVersions = asyncHandler(async (req, res) => {
  const versions = await versionsService.listVersions(req.user.id, req.params.id);
  res.json({ success: true, data: { versions } });
});

export const getVersion = asyncHandler(async (req, res) => {
  const version = await versionsService.getVersion(req.user.id, req.params.id, req.params.versionId);
  res.json({ success: true, data: { version } });
});

export const restoreVersion = asyncHandler(async (req, res) => {
  const resume = await versionsService.restoreVersion(req.user.id, req.params.id, req.params.versionId);
  res.json({ success: true, data: { resume } });
});

export const duplicateVersion = asyncHandler(async (req, res) => {
  const version = await versionsService.duplicateVersion(req.user.id, req.params.id, req.params.versionId);
  res.status(201).json({ success: true, data: { version } });
});
