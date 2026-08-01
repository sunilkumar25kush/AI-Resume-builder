import { AiError } from "./base.js";

/**
 * Robustly extract a JSON value from model output.
 * Handles ```json fences, leading prose, and balanced-brace scanning so a
 * noisy model response still yields usable structured data.
 * @param {string} text
 * @returns {unknown} Parsed JSON value.
 */
export function extractJson(text) {
  if (typeof text !== "string") {
    throw new AiError("Model returned no text", "AI_BAD_RESPONSE");
  }

  let body = text.trim();

  // Strip markdown code fences.
  const fenceMatch = body.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) body = fenceMatch[1].trim();

  // Balanced-scan for the first complete {…} or […].
  for (const open of ["{", "["]) {
    const start = body.indexOf(open);
    if (start === -1) continue;
    const end = findClosing(body, start, open);
    if (end !== -1) {
      const candidate = body.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // Fall through — maybe a different fragment parses.
      }
    }
  }

  // Last resort: the whole body might already be JSON.
  try {
    return JSON.parse(body);
  } catch {
    throw new AiError("Could not parse JSON from model output", "AI_BAD_RESPONSE", {
      preview: body.slice(0, 200),
    });
  }
}

/** Index of the closing bracket for `open` at `start`, respecting strings. */
function findClosing(text, start, open) {
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === open) {
      depth += 1;
    } else if (char === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}
