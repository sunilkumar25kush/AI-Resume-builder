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
import { validate } from "../middlewares/validate.js";
import { updateResumeSchema } from "../validations/resume.js";

const router = Router();

router.use(protect);

router.post("/", uploadResumeMulter.single("resume"), uploadResume);
router.get("/", listResumes);
router.get("/:id", getResume);
router.patch("/:id", validate(updateResumeSchema), updateResume);
router.delete("/:id", deleteResume);

export default router;
