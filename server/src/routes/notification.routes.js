import { Router } from "express";

import * as notificationController from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/", notificationController.getUserNotifications);

// Canonical REST bulk update & legacy alias
router.patch("/", notificationController.markAllNotificationsAsRead);
router.patch("/read-all", notificationController.markAllNotificationsAsRead);

// Canonical REST document update & legacy alias
router.patch("/:id", notificationController.markNotificationAsRead);
router.patch("/:id/read", notificationController.markNotificationAsRead);

export default router;

