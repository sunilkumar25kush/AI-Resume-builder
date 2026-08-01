import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { uploadResume as uploadResumeMulter } from "../middlewares/upload.js";
import {
  deleteResume,
  getResume,
  listResumes,
  updateResume,
  uploadResume,
} from "../controllers/resume.controller.js";
import { getVersion, listVersions, restoreVersion } from "../controllers/versions.controller.js";
import { validate } from "../middlewares/validate.js";
import { updateResumeSchema } from "../validations/resume.js";

const router = Router();

router.use(protect);

router.post("/", uploadResumeMulter.single("resume"), uploadResume);
router.get("/", listResumes);
router.get("/:id", getResume);
router.patch("/:id", validate({ body: updateResumeSchema }), updateResume);
router.delete("/:id", deleteResume);

router.get("/:id/versions", listVersions);
router.get("/:id/versions/:versionId", getVersion);
router.post("/:id/versions/:versionId/restore", restoreVersion);

export default router;
