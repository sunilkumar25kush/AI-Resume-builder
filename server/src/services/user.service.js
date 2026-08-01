import { existsSync, unlinkSync } from "node:fs";

import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

async function updateProfile(userId, { name }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  user.name = name;
  await user.save();
  return user.toSafeJSON();
}

/** Removes the previous avatar file if it was stored locally on this server. */
function removeStoredAvatar(avatarPath) {
  if (!avatarPath || !avatarPath.startsWith("/uploads/")) return;
  const absolute = new URL(`..${avatarPath}`, import.meta.url).pathname;
  if (existsSync(absolute)) unlinkSync(absolute);
}

async function updateAvatar(userId, file) {
  if (!file) throw ApiError.badRequest("No avatar file provided");

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const previousAvatar = user.avatar;
  user.avatar = `/uploads/avatars/${file.filename}`;
  await user.save();

  // Clean up the old file after the DB update succeeded.
  removeStoredAvatar(previousAvatar);
  return user.toSafeJSON();
}

export const userService = { updateProfile, updateAvatar };
