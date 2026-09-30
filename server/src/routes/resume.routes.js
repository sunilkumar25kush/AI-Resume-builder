import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { uploadResume as uploadResumeMulter } from "../middlewares/upload.js";
import {
  createBlankResume,
  createResumeFromFile,
  deleteResumeById,
  exportResumePdf,
  getResumeById,
  getResumePrintPreview,
  getUserResumes,
  updateResumeById,
} from "../controllers/resume.controller.js";
import {
  cloneResumeVersion,
  getResumeVersionById,
  getResumeVersions,
  revertToResumeVersion,
} from "../controllers/versions.controller.js";
import {
  generateResumeFromJobDescription,
  generateTailoredResume,
} from "../controllers/generation.controller.js";
import { validate } from "../middlewares/validate.js";
import { createBlankResumeSchema, updateResumeSchema } from "../validations/resume.js";
import { generateFromJdSchema, generateResumeSchema } from "../validations/generation.js";

const router = Router();

// Print preview endpoints accept short-lived query token (for Puppeteer) or user session
router.get("/:id/print-preview", getResumePrintPreview);
router.get("/:id/print-data", getResumePrintPreview); // Alias for backward compatibility

router.use(protect);

// PDF export endpoints
router.get("/:id/pdf", exportResumePdf);
router.get("/:id/export/pdf", exportResumePdf); // Alias

// Core collection endpoints
router.get("/", getUserResumes);
router.post("/", uploadResumeMulter.single("resume"), createResumeFromFile);

// Template & generation creation endpoints
router.post("/templates/blank", validate({ body: createBlankResumeSchema }), createBlankResume);
router.post("/blank", validate({ body: createBlankResumeSchema }), createBlankResume); // Alias
router.post("/scratch", validate({ body: createBlankResumeSchema }), createBlankResume); // Alias

router.post("/from-job-description", validate({ body: generateFromJdSchema }), generateResumeFromJobDescription);
router.post("/generate-from-jd", validate({ body: generateFromJdSchema }), generateResumeFromJobDescription); // Alias

// Single document endpoints
router.get("/:id", getResumeById);
router.patch("/:id", validate({ body: updateResumeSchema }), updateResumeById);
router.delete("/:id", deleteResumeById);

// Resume tailoring & optimization
router.post("/:id/tailored-variants", validate({ body: generateResumeSchema }), generateTailoredResume);
router.post("/:id/generate", validate({ body: generateResumeSchema }), generateTailoredResume); // Alias

// Version history sub-resource
router.get("/:id/versions", getResumeVersions);
router.get("/:id/versions/:versionId", getResumeVersionById);
router.post("/:id/versions/:versionId/revert", revertToResumeVersion);
router.post("/:id/versions/:versionId/restore", revertToResumeVersion); // Alias
router.post("/:id/versions/:versionId/clone", cloneResumeVersion);
router.post("/:id/versions/:versionId/duplicate", cloneResumeVersion); // Alias

export default router;

