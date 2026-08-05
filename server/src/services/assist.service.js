import { geminiService } from "./ai/gemini.service.js";

/** Strip quotes/fences/markdown that a model may wrap around plain text. */
function cleanText(text) {
  if (typeof text !== "string") return "";
  return text
    .trim()
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .replace(/^"(.*)"$/s, "$1")
    .trim();
}

/** Skills result: must be an array of non-empty strings (no invention). */
function normalizeSkills(raw, original) {
  const list = Array.isArray(raw) ? raw.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean) : [];
  if (list.length === 0) return original;
  const known = new Set(original.map((skill) => skill.toLowerCase()));
  const reordered = list.filter((skill) => known.has(skill.toLowerCase()));
  if (reordered.length === 0) return original;
  const tail = original.filter((skill) => !reordered.some((r) => r.toLowerCase() === skill.toLowerCase()));
  return [...reordered, ...tail];
}

/**
 * Single-section AI assist. Facts (title/company/dates/...) always come
 * from the input; only the writing (summary / description / skill order)
 * may be changed by the AI.
 */
export async function assistSection({ section, action, content }) {
  const raw = await geminiService.assistSection({ section, action, content });

  if (section === "skills") {
    return normalizeSkills(raw, content);
  }

  if (section === "summary") {
    return cleanText(raw) || content;
  }

  // Entry sections: JSON in → fact-merged entry out.
  const description = cleanText(raw?.description) || content.description || "";
  return { ...content, description };
}
