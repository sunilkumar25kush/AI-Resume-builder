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
