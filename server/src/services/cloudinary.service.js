import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Check if credentials exist either via standard keys or full CLOUDINARY_URL
const hasDirectKeys = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
const hasUrlKey = Boolean(env.CLOUDINARY_URL);
const isConfigured = hasDirectKeys || hasUrlKey;

if (hasDirectKeys) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (hasUrlKey) {
  cloudinary.config({
    cloudinary_url: env.CLOUDINARY_URL,
    secure: true,
  });
}

/** Check if Cloudinary upload is configured with active credentials */
export function isCloudinaryConfigured() {
  return isConfigured;
}

/**
 * Upload a local image file to Cloudinary with automatic optimization.
 *
 * @param {string} filePath - Absolute or relative path to local temp file
 * @param {string} userId - User identifier to tag/name the asset
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadAvatarToCloudinary(filePath, userId) {
  if (!isConfigured) {
    throw new Error("Cloudinary credentials are not configured on the server.");
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: "ai-resume-builder/avatars",
    public_id: `user_${userId}_${Date.now()}`,
    resource_type: "image",
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Extract the public_id from a Cloudinary secure delivery URL.
 * Example URL: https://res.cloudinary.com/cloud/image/upload/v12345/ai-resume-builder/avatars/user_123.webp
 */
export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

/**
 * Remove an old avatar from Cloudinary if it belongs to Cloudinary.
 */
export async function deleteAvatarFromCloudinary(url) {
  if (!isConfigured || !url) return;
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`[cloudinary] Failed to remove asset ${publicId}:`, err.message);
  }
}
