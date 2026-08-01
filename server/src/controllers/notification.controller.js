import { notificationService } from "../services/notification.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page ?? "1", 10) || 1;
  const data = await notificationService.listForUser(req.user._id, page);
  res.json(ApiResponse.ok(data));
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const updated = await notificationService.markRead(req.user._id, req.params.id);
  if (!updated) return res.status(404).json(ApiResponse.error("Notification not found", 404));
  res.json(ApiResponse.ok(null, "Notification marked as read"));
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  res.json(ApiResponse.ok(null, "All notifications marked as read"));
});
