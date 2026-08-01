import { generateJson, generateWithFallback } from "./ai/index.js";
import { buildAssistPrompt } from "./ai/prompts.js";

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
  const prompt = buildAssistPrompt({ section, action, content });

  if (section === "skills") {
    const raw = await generateJson(prompt, { timeoutMs: 60_000, temperature: 0.5 });
    return normalizeSkills(raw, content);
  }

  if (section === "summary") {
    const text = await generateWithFallback(prompt, { timeoutMs: 60_000, temperature: 0.6 });
    return cleanText(text) || content;
  }

  // Entry sections: JSON in → fact-merged entry out.
  const raw = await generateJson(prompt, { timeoutMs: 60_000, temperature: 0.5 });
  const description = cleanText(raw?.description) || content.description || "";
  return { ...content, description };
}
