import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { evaluateAtsScorecard } from "../controllers/ats.controller.js";
import { atsCheckSchema } from "../validations/ats.js";

const router = Router();

router.use(protect);

router.post("/", validate({ body: atsCheckSchema }), evaluateAtsScorecard);
router.post("/check", validate({ body: atsCheckSchema }), evaluateAtsScorecard); // Alias

export default router;

