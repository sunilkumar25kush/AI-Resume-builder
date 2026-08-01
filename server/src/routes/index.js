import { Router } from "express";

import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import jdRoutes from "./jd.routes.js";
import notificationRoutes from "./notification.routes.js";
import resumeRoutes from "./resume.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/resumes", resumeRoutes);
router.use("/jds", jdRoutes);

export default router;
