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

  // Strip trailing commas before braces/brackets only outside quoted string values
  const stripTrailingCommas = (str) => {
    let result = "";
    let inString = false;
    let escaped = false;
    let lastCommaIdx = -1;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        result += char;
        continue;
      }

      if (char === '"') {
        inString = true;
        result += char;
      } else if (char === ",") {
        lastCommaIdx = result.length;
        result += char;
      } else if (char === "}" || char === "]") {
        if (lastCommaIdx !== -1) {
          const between = result.slice(lastCommaIdx + 1);
          if (/^\s*$/.test(between)) {
            result = result.slice(0, lastCommaIdx) + between + char;
            lastCommaIdx = -1;
            continue;
          }
        }
        lastCommaIdx = -1;
        result += char;
      } else {
        if (!/\s/.test(char)) {
          lastCommaIdx = -1;
        }
        result += char;
      }
    }
    return result;
  };

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
        try {
          return JSON.parse(stripTrailingCommas(candidate));
        } catch {
          // Fall through — maybe a different fragment parses.
        }
      }
    }
  }

  // Last resort: the whole body might already be JSON.
  try {
    return JSON.parse(body);
  } catch {
    try {
      return JSON.parse(stripTrailingCommas(body));
    } catch {
      throw new AiError("Could not parse JSON from model output", "AI_BAD_RESPONSE", {
        preview: body.slice(0, 200),
      });
    }
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
