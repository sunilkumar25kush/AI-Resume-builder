import { Router } from "express";

import aiRoutes from "./ai.routes.js";
import atsRoutes from "./ats.routes.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import jdRoutes from "./jd.routes.js";
import notificationRoutes from "./notification.routes.js";
import optimizationRoutes from "./optimization.routes.js";
import resumeRoutes from "./resume.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/resumes", resumeRoutes);

// Canonical REST resources with backward-compatible aliases
router.use("/job-descriptions", jdRoutes);
router.use("/jds", jdRoutes); // Alias

router.use("/resume-optimizations", optimizationRoutes);
router.use("/optimizations", optimizationRoutes); // Alias

router.use("/ats-evaluations", atsRoutes);
router.use("/ats", atsRoutes); // Alias

router.use("/ai", aiRoutes);

export default router;

