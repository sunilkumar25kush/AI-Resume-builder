import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const cnCache = new Map<string, string>();
const MAX_CN_CACHE = 1000;

export function cn(...inputs: ClassValue[]): string {
  const key = clsx(inputs);
  if (!key) return "";
  const cached = cnCache.get(key);
  if (cached !== undefined) return cached;
  const merged = twMerge(key);
  if (cnCache.size >= MAX_CN_CACHE) {
    cnCache.clear();
  }
  cnCache.set(key, merged);
  return merged;
}

/**
 * Resolves an avatar URL into an absolute URL.
 * - Leaves Google OAuth and data/blob URLs as-is.
 * - Injects auto-format, quality, and dimensions into Cloudinary URLs for fast loading.
 * - Resolves relative paths (e.g. /uploads/avatars/...) against the backend API origin.
 */
const avatarUrlCache = new Map<string, string>();
const MAX_AVATAR_CACHE = 500;

export function resolveAvatarUrl(url: string | undefined | null, targetSize?: number): string {
  if (!url) return "";
  const cacheKey = `${url}_${targetSize ?? 0}`;
  const cached = avatarUrlCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let resolved = url.trim();

  if (
    !resolved.startsWith("http://") &&
    !resolved.startsWith("https://") &&
    !resolved.startsWith("data:") &&
    !resolved.startsWith("blob:")
  ) {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const backendOrigin = apiUrl.replace(/\/api\/?$/, "");
    resolved = `${backendOrigin}${resolved.startsWith("/") ? "" : "/"}${resolved}`;
  }

  // Cloudinary performance optimization: inject modern format (f_auto), compression (q_auto), and target dimension
  if (resolved.includes("res.cloudinary.com") && resolved.includes("/image/upload/")) {
    if (!resolved.includes("/f_auto") && !resolved.includes("/c_fill")) {
      const dimension = targetSize ? Math.min(targetSize * 2, 400) : 128;
      resolved = resolved.replace("/image/upload/", `/image/upload/c_fill,w_${dimension},h_${dimension},f_auto,q_auto/`);
    }
  }

  if (avatarUrlCache.size >= MAX_AVATAR_CACHE) {
    avatarUrlCache.clear();
  }
  avatarUrlCache.set(cacheKey, resolved);
  return resolved;
}


