import { Router } from "express";

import * as notificationController from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/", notificationController.listNotifications);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.patch("/:id/read", notificationController.markNotificationRead);

export default router;
