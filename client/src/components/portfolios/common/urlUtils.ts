import { resolveAvatarUrl } from "@/lib/utils";

/**
 * Validates and sanitizes an external URL.
 * Permitted protocols: http:, https:, mailto:, tel:
 * Explicitly rejects dangerous schemes like javascript:, data:, vbscript:.
 */
export function sanitizeExternalUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Handle mailto and tel directly
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    // Basic sanity check to ensure no embedded scripts or line breaks
    if (trimmed.includes("\r") || trimmed.includes("\n") || trimmed.includes("\u0000")) {
      return null;
    }
    return trimmed;
  }

  // Auto-prefix protocol if user or AI omitted it (e.g. "github.com/user" -> "https://github.com/user")
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized) && !/^[a-z0-9+-.]+:/i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

const normalizedAvatarCache = new Map<string, string>();
const MAX_NORMALIZED_CACHE = 500;

/** Cleans and normalizes avatar image URLs, converting cloud storage view links into direct assets */
export function normalizeAvatarUrl(rawUrl?: string | null, targetSize?: number): string {
  if (!rawUrl) return "";
  const cacheKey = `${rawUrl}_${targetSize ?? 0}`;
  const cached = normalizedAvatarCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let url = rawUrl.trim().replace(/^["']|["']$/g, "");
  if (!url) return "";

  // Convert Google Drive share URLs:
  const gdriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
  }

  // Convert Dropbox share links to raw direct links
  if (url.includes("dropbox.com") && url.includes("dl=0")) {
    url = url.replace("dl=0", "raw=1");
  }

  const result = resolveAvatarUrl(url, targetSize);
  if (normalizedAvatarCache.size >= MAX_NORMALIZED_CACHE) {
    normalizedAvatarCache.clear();
  }
  normalizedAvatarCache.set(cacheKey, result);
  return result;
}

