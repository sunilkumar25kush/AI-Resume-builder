import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { uploadJd as uploadJdMiddleware } from "../middlewares/upload.js";
import { deleteJd, getJd, listJds, updateJd, uploadJd } from "../controllers/jd.controller.js";
import { jdUpdateSchema } from "../validations/jd.js";

const router = Router();

router.use(protect);

// Accepts JSON { text } or multipart with a `jd` file (PDF/DOCX).
router.post("/", uploadJdMiddleware.single("jd"), uploadJd);
router.get("/", listJds);
router.get("/:id", getJd);
router.patch("/:id", validate({ body: jdUpdateSchema }), updateJd);
router.delete("/:id", deleteJd);

export default router;
