import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  deleteOptimization,
  getOptimization,
  listOptimizations,
  runOptimization,
} from "../controllers/optimization.controller.js";
import { runOptimizationSchema } from "../validations/optimization.js";

const router = Router();

router.use(protect);

router.post("/", validate({ body: runOptimizationSchema }), runOptimization);
router.get("/", listOptimizations);
router.get("/:id", getOptimization);
router.delete("/:id", deleteOptimization);

export default router;
