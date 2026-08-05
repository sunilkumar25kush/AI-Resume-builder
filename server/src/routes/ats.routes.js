import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { checkAts } from "../controllers/ats.controller.js";
import { atsCheckSchema } from "../validations/ats.js";

const router = Router();

router.use(protect);

router.post("/check", validate({ body: atsCheckSchema }), checkAts);

export default router;
