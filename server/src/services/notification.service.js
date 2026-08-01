import Notification from "../models/Notification.js";

const PAGE_SIZE = 20;

async function createNotification({ userId, title, body = "", type = "info", link = "" }) {
  return Notification.create({ user: userId, title, body, type, link });
}

async function listForUser(userId, page = 1) {
  const limit = PAGE_SIZE;
  const skip = Math.max(0, (page - 1) * limit);

  const [items, total] = await Promise.all([
    Notification.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ user: userId }),
  ]);

  return {
    items: items.map((n) => ({ ...n, read: Boolean(n.readAt) })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function unreadCount(userId) {
  return Notification.countDocuments({ user: userId, readAt: null });
}

async function markRead(userId, notificationId) {
  const result = await Notification.updateOne(
    { _id: notificationId, user: userId },
    { $set: { readAt: new Date() } },
  );
  if (result.matchedCount === 0) return false;
  return true;
}

async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, readAt: null }, { $set: { readAt: new Date() } });
}

export const notificationService = {
  createNotification,
  listForUser,
  unreadCount,
  markRead,
  markAllRead,
};
