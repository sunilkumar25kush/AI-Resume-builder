import { Router } from "express";

import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  deleteOptimizationById,
  getOptimizationById,
  getUserOptimizations,
  runResumeOptimization,
} from "../controllers/optimization.controller.js";
import { runOptimizationSchema } from "../validations/optimization.js";

const router = Router();

router.use(protect);

router.post("/", validate({ body: runOptimizationSchema }), runResumeOptimization);
router.get("/", getUserOptimizations);
router.get("/:id", getOptimizationById);
router.delete("/:id", deleteOptimizationById);

export default router;

