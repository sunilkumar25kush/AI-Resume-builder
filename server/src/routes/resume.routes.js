import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { uploadResume as uploadResumeMulter } from "../middlewares/upload.js";
import {
  createBlankResume,
  deleteResume,
  getResume,
  listResumes,
  updateResume,
  uploadResume,
} from "../controllers/resume.controller.js";
import { duplicateVersion, getVersion, listVersions, restoreVersion } from "../controllers/versions.controller.js";
import { generateResume, generateResumeFromJd } from "../controllers/generation.controller.js";
import { validate } from "../middlewares/validate.js";
import { createBlankResumeSchema, updateResumeSchema } from "../validations/resume.js";
import { generateFromJdSchema, generateResumeSchema } from "../validations/generation.js";

const router = Router();

router.use(protect);

router.post("/", uploadResumeMulter.single("resume"), uploadResume);
router.post("/generate-from-jd", validate({ body: generateFromJdSchema }), generateResumeFromJd);
router.post("/blank", validate({ body: createBlankResumeSchema }), createBlankResume);
router.get("/", listResumes);
router.get("/:id", getResume);
router.patch("/:id", validate({ body: updateResumeSchema }), updateResume);
router.delete("/:id", deleteResume);

router.get("/:id/versions", listVersions);
router.get("/:id/versions/:versionId", getVersion);
router.post("/:id/versions/:versionId/restore", restoreVersion);
router.post("/:id/versions/:versionId/duplicate", duplicateVersion);
router.post("/:id/generate", validate({ body: generateResumeSchema }), generateResume);

export default router;
