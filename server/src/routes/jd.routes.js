import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { uploadJd as uploadJdMiddleware } from "../middlewares/upload.js";
import {
  createJobDescription,
  deleteJobDescriptionById,
  getJobDescriptionById,
  getUserJobDescriptions,
  updateJobDescriptionById,
} from "../controllers/jd.controller.js";
import { jdUpdateSchema } from "../validations/jd.js";

const router = Router();

router.use(protect);

// Accepts JSON { text } or multipart with a `jd` file (PDF/DOCX).
router.post("/", uploadJdMiddleware.single("jd"), createJobDescription);
router.get("/", getUserJobDescriptions);
router.get("/:id", getJobDescriptionById);
router.patch("/:id", validate({ body: jdUpdateSchema }), updateJobDescriptionById);
router.delete("/:id", deleteJobDescriptionById);

export default router;

