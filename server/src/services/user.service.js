import { existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import {
  isCloudinaryConfigured,
  uploadAvatarToCloudinary,
  deleteAvatarFromCloudinary,
} from "./cloudinary.service.js";

async function updateProfile(userId, data) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined && data.email) user.email = data.email.toLowerCase().trim();
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.location !== undefined) user.location = data.location;
  if (data.targetJobTitle !== undefined) user.targetJobTitle = data.targetJobTitle;
  if (data.linkedin !== undefined) user.linkedin = data.linkedin;
  if (data.github !== undefined) user.github = data.github;
  if (data.website !== undefined) user.website = data.website;
  if (data.linkedinUrl !== undefined) user.linkedinUrl = data.linkedinUrl;
  if (data.githubUrl !== undefined) user.githubUrl = data.githubUrl;
  if (data.websiteUrl !== undefined) user.websiteUrl = data.websiteUrl;
  if (data.contactOrder !== undefined) user.contactOrder = data.contactOrder;
  if (data.customLinks !== undefined) user.customLinks = data.customLinks;
  if (data.autoPopulateResume !== undefined) user.autoPopulateResume = Boolean(data.autoPopulateResume);

  await user.save();
  return user.toSafeJSON();
}

/** Removes the previous avatar file if it was stored locally on this server. */
function removeStoredAvatar(avatarPath) {
  if (!avatarPath || !avatarPath.startsWith("/uploads/")) return;
  try {
    const absolute = fileURLToPath(new URL(`../../${avatarPath.replace(/^\//, "")}`, import.meta.url));
    if (existsSync(absolute)) unlinkSync(absolute);
  } catch {}
}

async function updateAvatar(userId, file) {
  if (!file) throw ApiError.badRequest("No avatar file provided");

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const previousAvatar = user.avatar;

  // Primary: Upload to Cloudinary when configured
  if (isCloudinaryConfigured()) {
    try {
      const uploadResult = await uploadAvatarToCloudinary(file.path, userId);
      user.avatar = uploadResult.url;
      await user.save();

      // Clean up the temporary local file written by multer
      if (file.path && existsSync(file.path)) {
        try { unlinkSync(file.path); } catch {}
      }

      // Delete old avatar from Cloudinary or local disk
      if (previousAvatar) {
        if (previousAvatar.includes("res.cloudinary.com")) {
          deleteAvatarFromCloudinary(previousAvatar);
        } else {
          removeStoredAvatar(previousAvatar);
        }
      }

      return user.toSafeJSON();
    } catch (err) {
      if (file.path && existsSync(file.path)) {
        try { unlinkSync(file.path); } catch {}
      }
      throw ApiError.internal(`Cloudinary image upload failed: ${err.message}`);
    }
  }

  // Fallback: Local storage (e.g. offline dev without Cloudinary keys)
  user.avatar = `/uploads/avatars/${file.filename}`;
  await user.save();

  // Clean up the old file after the DB update succeeded.
  removeStoredAvatar(previousAvatar);
  return user.toSafeJSON();
}

export const userService = { updateProfile, updateAvatar };

