/**
 * Generates an SEO-safe and URL-friendly slug from any title or candidate name.
 * Handles diacritics, unicode characters, multiple dashes, and edge cases.
 *
 * @param input Raw text string (e.g. "Sunil Kumar's Portfolio #1")
 * @returns Clean kebab-cased slug (e.g. "sunil-kumars-portfolio-1")
 */
export function slugify(input: string): string {
  if (!input) return "portfolio";

  const clean = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accent diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except space and hyphen
    .replace(/[\s_]+/g, "-") // collapse spaces and underscores to hyphen
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // strip leading/trailing hyphens

  return clean.slice(0, 60) || "portfolio";
}
