import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves an avatar URL into an absolute URL.
 * - Leaves Cloudinary, Google OAuth, and data/blob URLs as-is.
 * - Resolves relative paths (e.g. /uploads/avatars/...) against the backend API origin.
 */
export function resolveAvatarUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const backendOrigin = apiUrl.replace(/\/api\/?$/, "");
  return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
}

