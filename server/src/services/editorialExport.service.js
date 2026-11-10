/**
 * Editorial Portfolio Template ("Crimson Editorial") Static HTML, CSS & JS Generators.
 * Mirrors client/src/components/portfolios/templates/EditorialTemplate.tsx pixel-for-pixel
 * across colors, typography, slide layouts, multi-image project slots, and interactive controls.
 */
import { getEditorialLanyardBundleJs } from "./editorialLanyardVendor.js";

const TRIVIAL_SKILL_PATTERNS = [
  /^dom\s*manipulation$/i,
  /^async[\s/]*await$/i,
  /^css\s*flexbox$/i,
  /^css\s*grid$/i,
  /^flexbox$/i,
  /^grid\s*layout$/i,
  /^responsive\s*(web\s*)?design$/i,
  /^cross[- ]browser/i,
  /^semantic\s*html$/i,
  /^rest(ful)?\s*api(\s*development|\s*integration)?$/i,
  /^api\s*integration$/i,
  /^state\s*management$/i,
  /^json$/i,
  /^ajax$/i,
  /^debugging$/i,
  /^clean\s*code$/i,
  /^code\s*review$/i,
  /^problem\s*solving$/i,
];

function cleanSkillName(raw) {
  const trimmed = String(raw || "").trim();
  if (/^javascript\s*(\(es6\+\)|\(es6\))?$/i.test(trimmed) || /^js$/i.test(trimmed)) return "JavaScript";
  if (/^typescript$/i.test(trimmed) || /^ts$/i.test(trimmed)) return "TypeScript";
  if (/^react(\.js|js)?$/i.test(trimmed)) return "React";
  if (/^next(\.js|js)?$/i.test(trimmed)) return "Next.js";
  if (/^node(\.js|js)?$/i.test(trimmed)) return "Node.js";
  if (/^express(\.js|js)?$/i.test(trimmed)) return "Express.js";
  if (/^html5?$/i.test(trimmed)) return "HTML5";
  if (/^css3?$/i.test(trimmed)) return "CSS3";
  if (/^tailwind(\s*css)?$/i.test(trimmed)) return "Tailwind CSS";
  if (/^mongo(\s*db)?$/i.test(trimmed)) return "MongoDB";
  if (/^postgres(ql)?$/i.test(trimmed)) return "PostgreSQL";
  return trimmed;
}

function normalizeEditorialSkills(rawSkills) {
  if (!rawSkills || !Array.isArray(rawSkills)) return [];
  const rawList = [];
  for (const item of rawSkills) {
    if (typeof item === "string" && item.trim()) {
      rawList.push({ name: item.trim(), category: "Core Technologies", level: "intermediate" });
    } else if (item && typeof item === "object" && item.name && String(item.name).trim()) {
      const level = ["beginner", "intermediate", "advanced", "expert"].includes(item.level || "")
        ? item.level
        : "intermediate";
      rawList.push({
        name: String(item.name).trim(),
        category: (item.category && String(item.category).trim()) || "Core Technologies",
        level,
      });
    }
  }
  if (rawList.length === 0) return [];
  const seen = new Set();
  const filtered = [];
  for (const sk of rawList) {
    const cleaned = cleanSkillName(sk.name);
    const key = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!key || seen.has(key)) continue;
    if (rawList.length > 5 && TRIVIAL_SKILL_PATTERNS.some((p) => p.test(sk.name.trim()))) continue;
    seen.add(key);
    filtered.push({ ...sk, name: cleaned });
  }
  return filtered.length > 0 ? filtered : rawList;
}

function getStaticTechIconSvg(name, size = 18) {
  const norm = String(name || "").toLowerCase().trim();
  const attrs = `width="${size}" height="${size}" aria-hidden="true" class="ed-tech-svg"`;

  if (norm.includes("react") || norm === "rn") {
    return `<svg ${attrs} viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="#61DAFB" stroke-width="1.2"><circle cx="0" cy="0" r="2.05" fill="#61DAFB"/><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></svg>`;
  }
  if (norm.includes("next") || norm === "nextjs") {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#000000"><circle cx="12" cy="12" r="10" fill="#000000"/><path d="M15.328 16.538 10.383 10.118v6.42H9.01V7.462h1.373l5.067 6.577V7.462h1.373v9.076h-1.495z" fill="#FFFFFF"/></svg>`;
  }
  if (norm.includes("typescript") || norm === "ts") {
    return `<svg ${attrs} viewBox="0 0 24 24"><rect width="22" height="22" x="1" y="1" rx="4" fill="#3178C6"/><path d="M4.5 10h5.5v2H7.5v7H5.2v-7H3V10h1.5zm6.5 4.8c.6.4 1.3.6 2 .6.9 0 1.4-.4 1.4-1 0-.6-.5-.9-1.4-1.3l-.6-.2c-1.3-.5-2-1.2-2-2.3 0-1.5 1.1-2.6 3-2.6 1 0 1.8.3 2.5.7l-.6 1.7c-.5-.3-1.1-.6-1.8-.6-.7 0-1.2.4-1.2 1 0 .5.5.8 1.3 1.2l.6.2c1.5.6 2.1 1.3 2.1 2.4 0 1.6-1.2 2.6-3.2 2.6-1.1 0-2.1-.3-2.9-.9l.8-1.5z" fill="#FFFFFF"/></svg>`;
  }
  if (norm.includes("javascript") || norm === "js" || norm.includes("es6")) {
    return `<svg ${attrs} viewBox="0 0 24 24"><rect width="22" height="22" x="1" y="1" rx="4" fill="#F7DF1E"/><path d="M11.5 15.5c0 2-1.3 2.8-3 2.8-.8 0-1.6-.2-2.2-.6l.5-1.7c.4.3.9.5 1.5.5.8 0 1.3-.4 1.3-1.2V8h1.9v7.5zm7 0c0 2-1.4 2.8-3.3 2.8-1.1 0-2.1-.3-2.8-.8l.6-1.7c.6.4 1.3.7 2.1.7.9 0 1.5-.4 1.5-1.1 0-.7-.5-1-1.6-1.5l-.6-.3c-1.4-.6-2.2-1.4-2.2-2.6 0-1.6 1.2-2.7 3.1-2.7 1 0 1.8.3 2.4.7l-.6 1.7c-.5-.3-1.1-.6-1.8-.6-.8 0-1.3.4-1.3 1 0 .6.4.9 1.4 1.3l.6.3c1.6.7 2.6 1.4 2.6 2.8z" fill="#000000"/></svg>`;
  }
  if (norm.includes("node") || norm.includes("nodejs")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#339933"><path d="M12 2.2 3.5 7.1v9.8L12 21.8l8.5-4.9V7.1L12 2.2zm-1 15.3c-2.3 0-3.6-1.2-3.6-3.2 0-2.1 1.5-3 3.8-3.4l1.3-.2v-.8c0-.7-.4-1.1-1.3-1.1-.8 0-1.4.3-1.8.8l-1-1.1c.8-.8 1.8-1.2 3.1-1.2 2.1 0 3.3 1.1 3.3 2.9v5h-1.9v-1.1c-.5.8-1.4 1.4-2.6 1.4zm.5-1.5c1.1 0 1.9-.6 1.9-1.6v-.8l-1.1.2c-1.3.2-2 .7-2 1.8 0 .8.5 1.4 1.2 1.4z"/></svg>`;
  }
  if (norm.includes("python") || norm === "py") {
    return `<svg ${attrs} viewBox="0 0 24 24"><path d="M11.9 2c-3.1 0-4.9.4-4.9 2.5v1.9h5v.6H5c-2.4 0-4.5 1.4-4.5 4.5 0 2.6 1.8 4.4 4.5 4.4h1.5v-2.1c0-2.4 2-4.4 4.4-4.4h5V7c0-2.2-1.9-5-5-5h.5zm-2.8 1.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" fill="#3776AB"/><path d="M12.1 22c3.1 0 4.9-.4 4.9-2.5v-1.9h-5v-.6h7c2.4 0 4.5-1.4 4.5-4.5 0-2.6-1.8-4.4-4.5-4.4h-1.5v2.1c0 2.4-2 4.4-4.4 4.4h-5V17c0 2.2 1.9 5 5 5h-.5zm2.8-1.5a.9.9 0 1 1 0-1.8.9.9 0 0 1 0-1.8z" fill="#FFD43B"/></svg>`;
  }
  if (norm.includes("html")) {
    return `<svg ${attrs} viewBox="0 0 24 24"><path d="M3 2l1.8 18.5L12 23l7.2-2.5L21 2H3z" fill="#E34F26"/><path d="M12 3.8v17.2l5.7-1.9L19 3.8H12z" fill="#EF652A"/><path d="M12 7.7H7.4l.3 3.3h4.3v-3.3zm0 5.4H9.5l.2 2.3 2.3.6v-2.9zm0-5.4h4.6l-.3 3.3H12v-3.3zm0 5.4v2.9l2.3-.6.3-2.3H12z" fill="#FFFFFF"/></svg>`;
  }
  if (norm.includes("css") || norm.includes("sass") || norm.includes("scss")) {
    return `<svg ${attrs} viewBox="0 0 24 24"><path d="M3 2l1.8 18.5L12 23l7.2-2.5L21 2H3z" fill="#1572B6"/><path d="M12 3.8v17.2l5.7-1.9L19 3.8H12z" fill="#33A9DC"/><path d="M12 7.7H7.4l.4 4.8h4.2V7.7zm0 6.6H9.7l.2 2.1 2.1.6v-2.7zm0-6.6h4.6l-.4 4.8H12V7.7zm0 6.6v2.7l2.1-.6.3-2.1H12z" fill="#FFFFFF"/></svg>`;
  }
  if (norm.includes("tailwind")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#06B6D4"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.974 12 6.001 12z"/></svg>`;
  }
  if (norm.includes("express") || norm.includes("api") || norm.includes("rest")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#1C1917"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;
  }
  if (norm.includes("mongo")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#47A248"><path d="M12.19 2.5s-.28.32-.48.56C10.15 4.9 6.5 9.4 6.5 14.15c0 4.1 3.2 7.35 5.5 7.35s5.5-3.25 5.5-7.35c0-4.75-3.65-9.25-5.21-11.09-.08-.09-.1-.56-.1-.56zm-.19 2.76c1.67 2.15 4.45 6.07 4.45 8.89 0 2.82-1.95 5.75-4.45 5.75v-14.64z"/></svg>`;
  }
  if (norm.includes("postgres") || norm.includes("sql") || norm.includes("mysql") || norm.includes("database")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#336791"><path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.48 6 2s-2.13 2-6 2-6-1.48-6-2 2.13-2 6-2zm-6 5.56c1.36.91 3.54 1.44 6 1.44s4.64-.53 6-1.44V12c0 .52-2.13 2-6 2s-6-1.48-6-2v-1.44zm0 5c1.36.91 3.54 1.44 6 1.44s4.64-.53 6-1.44V17c0 .52-2.13 2-6 2s-6-1.48-6-2v-1.44z"/></svg>`;
  }
  if (norm.includes("docker") || norm.includes("container")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#2496ED"><path d="M2.5 13.5c.3 3.9 3.5 7 7.5 7 4.4 0 8.1-3.4 8.5-7.8.6-.2 1.8-.4 2.5-.1.4.2.7.5.8.9.4-.5.7-1.2.7-2 0-.2-.1-.4-.2-.5-1-.9-2.5-.7-3.6-.4-.6-1.7-2-2.8-3.7-2.8h-.5v1.2c0 .4-.3.7-.7.7H13V8.5c0-.4-.3-.7-.7-.7h-2.1c-.4 0-.7.3-.7.7v1.2H8.3c-.4 0-.7.3-.7.7V11H6.4c-.4 0-.7.3-.7.7v1.8H2.5zm6.5-4.2h1.5v1.2H9V9.3zm-2.8 0h1.5v1.2H6.2V9.3zm5.6 0h1.5v1.2h-1.5V9.3z"/></svg>`;
  }
  if (norm.includes("git") || norm.includes("version")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#F05032"><path d="m21.7 11.3-9-9c-.4-.4-1-.4-1.4 0L9.1 4.5l2.8 2.8c.4-.1.9 0 1.2.3.4.4.5 1 .3 1.5l2.7 2.7c.5-.2 1.1-.1 1.5.3.6.6.6 1.5 0 2.1-.6.6-1.5.6-2.1 0-.4-.4-.5-1-.3-1.5l-2.6-2.6c-.3.1-.7.2-1 .1l-2.7 2.7c.1.3.1.7 0 1-.4.6-1.3.8-1.9.4-.6-.4-.8-1.3-.4-1.9.3-.4.7-.6 1.2-.6l2.7-2.7V6.4c-.5-.3-.8-.8-.8-1.4 0-.3.1-.6.3-.9L2.3 11.3c-.4.4-.4 1 0 1.4l9 9c.4.4 1 .4 1.4 0l9-9c.4-.4.4-1 0-1.4z"/></svg>`;
  }
  if (norm.includes("redis")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#DC382D"><path d="m12 2-9 4.5v11L12 22l9-4.5v-11L12 2zm0 2.3 6.6 3.3L12 10.9 5.4 7.6 12 4.3zM4.9 9.3l6.1 3.1v6.8L4.9 16.1V9.3zm8.1 9.9v-6.8l6.1-3.1v6.8l-6.1 3.1z"/></svg>`;
  }
  if (norm.includes("graphql")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#E10098"><path d="M12 2 3.3 7v10L12 22l8.7-5V7L12 2zm0 2.5 6.7 3.9v7.7L12 20l-6.7-3.9V8.4L12 4.5zM12 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4.3 7.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>`;
  }
  if (norm.includes("aws") || norm.includes("cloud") || norm.includes("azure") || norm.includes("gcp")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#FF9900"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/></svg>`;
  }
  if (norm === "go" || norm.includes("golang")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#00ADD8"><path d="M1.5 10.5c.3 0 .5.2.5.5v1c0 1.9 1.6 3.5 3.5 3.5h3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-3c-1.4 0-2.5-1.1-2.5-2.5v-1c0-.3-.2-.5-.5-.5zm9.5-3c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.6 0 4.8-1.8 5.3-4.2H11v-1.5h7.2c.1.4.1.8.1 1.2 0 4.1-3.4 7.5-7.5 7.5S3.3 18.1 3.3 14 6.7 6.5 10.8 6.5c2.1 0 4 .9 5.3 2.3l-1.1 1.1c-1.1-1.4-2.6-2.4-4-2.4zm10.5 4h-5c-.3 0-.5.2-.5.5s.2.5.5.5h5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zm-1 3h-4c-.3 0-.5.2-.5.5s.2.5.5.5h4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z"/></svg>`;
  }
  if (norm.includes("java") || norm.includes("spring")) {
    return `<svg ${attrs} viewBox="0 0 24 24" fill="#E76F00"><path d="M8.8 17.5c-2.4.2-3.8.4-3.8.4s1.4.8 4.2.8c3.2 0 5.4-.8 5.4-.8s-1.4-.3-3.4-.4h-2.4zm-1.8-3.1s-1.8.6 0 1.2c2.2.7 6.1.6 8.3 0 0 0 1.2-.5-.5-.9-1.9-.4-5.9-.6-7.8-.3zm8.1-4.9c-.8 2.1-2.5 3.5-2.5 3.5s3.2-1.6 2.3-4.5c-.8-2.5-3.3-3.8-3.3-3.8s1.6 1.1 1.7 2.1c.1.9-.3 1.7-.2 2.7zm-4.7-6.2c.4 1.4-.4 2.8-.4 2.8s1.8-1.5 1.1-3.5c-.7-1.8-2.7-2.6-2.7-2.6s1.3.8 1.4 1.7c.1.8-.4 1.6-.4 1.6z"/></svg>`;
  }
  return `<svg ${attrs} viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
}

const ICONS = {
  folderGit2: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5"/><circle cx="13" cy="12" r="2"/><path d="M18 19c-2.8 0-5-2.2-5-5v8"/><circle cx="20" cy="19" r="2"/></svg>`,
  externalLink: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`,
  mapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
  award: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>`,
  sparkles: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
  starFilled: `<svg width="12" height="12" viewBox="0 0 24 24" fill="#fcd34d" stroke="#fcd34d" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  arrowUp: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`,
};

function renderSafeImgHtml({ src, alt, className, fallbackText, escapeHtml }) {
  if (!src) {
    return `<div class="ed-img-fallback ${className || ""}">${ICONS.folderGit2}<span>${escapeHtml(fallbackText || "Project Showcase")}</span></div>`;
  }
  const safeSrc = escapeHtml(src);
  const safeAlt = escapeHtml(alt || "");
  const safeFallback = escapeHtml(fallbackText || "Project Showcase");
  return `<img src="${safeSrc}" alt="${safeAlt}" class="${className || ""}" decoding="async" onerror="var p=this.parentElement;if(p){var d=document.createElement('div');d.className='ed-img-fallback';d.innerHTML='<span>${safeFallback.replace(/'/g, "&#39;")}</span>';p.replaceChild(d,this);}else{this.remove();}" />`;
}

function renderNumberedFrame({ src, alt, slotNumber, slotLabel, extraClass = "", escapeHtml }) {
  return `
    <div class="ed-numbered-frame ${extraClass}">
      ${renderSafeImgHtml({
        src,
        alt,
        className: "ed-frame-img",
        fallbackText: `Photo ${slotNumber} • ${slotLabel}`,
        escapeHtml,
      })}
      <div class="ed-slot-badge">
        <span class="ed-slot-dot"></span>
        <span>${escapeHtml(slotNumber)}</span>
      </div>
      <div class="ed-slot-caption">
        <span class="ed-slot-label">${escapeHtml(slotLabel)}</span>
        <span class="ed-slot-num">Slot ${escapeHtml(slotNumber)}</span>
      </div>
    </div>`;
}

export function generateEditorialStaticHtml(data, helpers) {
  const { escapeHtml, sanitizeUrl, getStaticBackgroundEffectHtml, GOOGLE_FONTS_LINK_TAG } = helpers;
  const {
    profile = {},
    socialLinks = [],
    skills = [],
    experience = [],
    education = [],
    projects = [],
    certifications = [],
  } = data;

  const rawPrimary = data.design?.primaryColor;
  const primaryColor = !rawPrimary || rawPrimary === "#2563eb" ? "#8B151B" : rawPrimary;
  const isDarkMode = data.design?.theme === "dark";
  const customLabels = data.design?.customLabels || {};

  const fullName = profile.fullName || "Creative Developer";
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Creative";
  const lastName = nameParts.slice(1).join(" ") || "ALEXANDER";
  const headline = profile.headline || "Full Stack Software Engineer";
  const avatarUrl = profile.avatarUrl || "";
  const bio =
    profile.bio ||
    "Accomplished developer architecting modern web experiences, high-throughput systems, and design-led digital products.";
  const email = profile.email || "";
  const phone = profile.phone || "";
  const location = profile.location || "";

  const normalizedSkills = normalizeEditorialSkills(skills);
  const displaySkills =
    normalizedSkills.length > 0
      ? normalizedSkills
      : [
          { name: "React", category: "Languages & Frontend", level: "expert" },
          { name: "TypeScript", category: "Languages & Frontend", level: "expert" },
          { name: "JavaScript", category: "Languages & Frontend", level: "expert" },
          { name: "Node.js", category: "Backend & Systems", level: "advanced" },
          { name: "Express.js", category: "Backend & Systems", level: "advanced" },
          { name: "MongoDB", category: "Databases & Cloud", level: "advanced" },
          { name: "PostgreSQL", category: "Databases & Cloud", level: "advanced" },
          { name: "Tailwind CSS", category: "Languages & Frontend", level: "expert" },
          { name: "Docker", category: "DevOps & Tools", level: "intermediate" },
        ];

  const displayExp =
    experience.length > 0
      ? experience
      : [
          {
            company: "Studio Vanguard",
            title: "Lead Creative Strategist",
            startDate: "2023",
            current: true,
            description:
              "Directing multi-disciplinary squads shipping brand systems, digital flagships, and accessible product experiences across global markets.",
            highlights: [
              "500+ Digital Screens Designed and validated with end users",
              "Scaled multiple brand transformations from startup to enterprise",
              "Engineered end-to-end design systems reducing time-to-market by 40%",
              "Championed user-centered design frameworks across cross-functional squads",
            ],
          },
          {
            company: "InnoTech Collective",
            title: "Senior Product Designer",
            startDate: "2021",
            endDate: "2023",
            description: "Led core UI/UX redesigns and component token architecture for cloud enterprise platforms.",
            highlights: [
              "Boosted user task completion rates by 28% via streamlined interaction flows",
              "Mentored 10+ junior designers in design system maintenance and rapid prototyping",
            ],
          },
        ];

  const displayEdu =
    education.length > 0
      ? education
      : [
          {
            institution: "Metropolitan Institute of Technology",
            degree: "Bachelor of Information Systems",
            fieldOfStudy: "Human Computer Interaction",
            startDate: "2021",
            endDate: "2025",
            description:
              "Built a solid foundation in technology systems thinking, architecture, and human-centered digital product development.",
          },
          {
            institution: "Interaction Design Foundation",
            degree: "UX Design Professional Certificate",
            startDate: "2023",
            endDate: "2023",
            description: "Completed rigorous training in UX design and user research methodologies.",
          },
          {
            institution: "Civic Academy of Arts",
            degree: "Senior High School Diploma",
            startDate: "2019",
            endDate: "2021",
            description: "Graduated with honors in visual arts, media communications, and digital foundations.",
          },
        ];

  const displayProjects =
    projects.length > 0
      ? projects
      : [
          {
            title: "Interactive Web Experiences",
            description:
              "My first project marked the beginning of my design journey, where I explored kinetic typography, problem-solving, and digital product design.",
            tags: ["Creative Direction", "Typography", "WebGL", "React"],
            repoUrl: "https://github.com",
            liveUrl: "https://example.com",
            imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
          },
          {
            title: "AI Resume & Portfolio Engine",
            description:
              "A milestone project that introduced me to the fundamentals of systems design, automated tokenization, and creative algorithmic thinking.",
            tags: ["Systems Design", "TypeScript", "Tailwind CSS", "Next.js"],
            repoUrl: "https://github.com",
            liveUrl: "https://example.com",
            imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80",
          },
          {
            title: "Realtime Distributed Judge",
            description:
              "The project that introduced me to high-concurrency systems, real-world design challenges, and performant developer interfaces.",
            tags: ["Full Stack", "Docker", "Go", "Redis"],
            repoUrl: "https://github.com",
            liveUrl: "https://example.com",
            imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
          },
        ];

  const displayCerts =
    certifications.length > 0
      ? certifications
      : [
          {
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            issueDate: "2023",
            url: "",
          },
        ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "VP of Product",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      quote:
        "Professional, creative, and remarkably easy to work with. Highly recommended for any high-stakes digital initiative.",
    },
    {
      name: "Michael Chen",
      role: "Engineering Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      quote:
        "A talented designer and developer who consistently delivers high-quality work on tight deadlines with zero drama.",
    },
    {
      name: "David Wilson",
      role: "Design Lead",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      quote:
        "The user experience improved significantly after the redesign. Incredible attention to typography, spacing, and micro-interactions.",
    },
    {
      name: "Sophia Lee",
      role: "Founder & CEO",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      quote:
        "Reliable, efficient, and always focused on creating authentic value for users. Our conversion metrics jumped 35%.",
    },
  ];

  const baseOrder =
    Array.isArray(data.design?.sectionOrder) && data.design.sectionOrder.length > 0
      ? data.design.sectionOrder
      : ["hero", "about", "experience", "education", "projects", "skills", "testimonials", "contact"];
  const sectionOrder = baseOrder.includes("hero") ? baseOrder : ["hero", ...baseOrder];
  const sectionVisibility = data.design?.sectionVisibility || {};
  const visibleSections = sectionOrder.filter((sec) => sectionVisibility[sec] !== false);
  const heroNextTarget = visibleSections.find((sec) => sec !== "hero") || "hero";

  const safeLinksHtml = (links, cls) =>
    links
      .map((l) => {
        const href = sanitizeUrl(l.url);
        if (!href) return "";
        return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="${cls}">${escapeHtml(l.platform || l.label || "Link")}</a>`;
      })
      .join("");

  const sectionHtmlMap = {
    hero: `
      <section id="hero" class="editorial-slide ed-crimson ed-hero is-visible">
        <div class="ed-hero-vignette"></div>
        <div class="ed-hero-texture"></div>
        <div class="ed-sheen"></div>
        <div class="ed-orb ed-orb-a"></div>
        <div class="ed-orb ed-orb-b"></div>

        <!-- Exact 3D WebGL Lanyard (matches EditorialTemplate.tsx Lanyard component 100%, with crisp 2D fallback if WebGL is unavailable) -->
        <div
          id="edLanyardStage"
          class="lanyard ed-lanyard-stage"
          data-front-image="${escapeHtml(avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80")}"
          data-strap-length="0.62"
        >
          <div class="ed-lanyard-fallback" aria-hidden="true">
            <div class="ed-lanyard-fb-strap"></div>
            <div class="ed-lanyard-fb-clamp"></div>
            <div class="ed-lanyard-fb-ring"></div>
            <div class="ed-lanyard-fb-card">
              <img src="${escapeHtml(avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80")}" alt="${escapeHtml(fullName)}" class="ed-lanyard-fb-img" onerror="this.style.display='none'" />
            </div>
          </div>
        </div>

        <!-- Center Background Giant Condensed Display Title (Interactive TechText Canvas + Fallback) -->
        <div class="ed-hero-wordmark-wrap" id="edTechTextWrap" aria-hidden="true">
          <canvas id="edTechTextCanvas" class="ed-tech-canvas" data-text="PORTFOLIO"></canvas>
          <div class="ed-hero-wordmark" id="edHeroWordmarkFallback">PORTFOLIO</div>
        </div>

        <!-- Bottom Bar -->
        <div class="ed-hero-bottom">
          <span class="ed-hero-name">${escapeHtml(fullName)}</span>
          <div class="ed-hero-cta-wrap">
            <a href="#${escapeHtml(heroNextTarget)}" class="ed-hero-cta">Explore Deck &darr;</a>
          </div>
          <span class="ed-hero-headline">${escapeHtml(headline)}</span>
        </div>
      </section>`,

    about: `
      <section id="about" class="editorial-slide ed-paper">
        <div class="ed-slide-header">
          <h2 class="ed-display-heading ed-fold-target">${escapeHtml(customLabels.about || "ABOUT ME")}</h2>
          <span class="ed-slide-num">02</span>
        </div>

        <div class="ed-grid-12 ed-about-grid">
          <div class="ed-col-5 ed-center">
            <div class="ed-portrait-box">
              ${
                avatarUrl
                  ? renderSafeImgHtml({
                      src: avatarUrl,
                      alt: fullName,
                      className: "ed-portrait-img",
                      fallbackText: `${firstName.slice(0, 1)} • Portrait`,
                      escapeHtml,
                    })
                  : `<div class="ed-portrait-placeholder">
                      <span class="ed-portrait-initial">${escapeHtml(firstName.slice(0, 1))}</span>
                      <span class="ed-portrait-script">Portrait</span>
                    </div>`
              }
            </div>
          </div>

          <div class="ed-col-7 ed-about-info">
            <div>
              <p class="ed-script-lg">${escapeHtml(firstName)}</p>
              <h3 class="ed-display-sub ed-fold-target">${escapeHtml(lastName.toUpperCase())}</h3>
            </div>
            <p class="ed-body-copy">${escapeHtml(bio)}</p>
            <div class="ed-core-expertise">
              <h4>CORE EXPERTISE:</h4>
              <ul>
                ${displaySkills
                  .slice(0, 4)
                  .map((sk) => `<li><span class="ed-dot"></span><span>${escapeHtml(typeof sk === "string" ? sk : sk.name)}</span></li>`)
                  .join("")}
              </ul>
            </div>
          </div>
        </div>

        <div class="ed-slide-footer">
          <span class="ed-footer-loc">${ICONS.mapPin}<span>${escapeHtml(location || "Available Worldwide")}</span></span>
          <span class="ed-footer-strong">${escapeHtml(headline)}</span>
        </div>
      </section>`,

    experience: `
      <section id="experience" class="editorial-slide ed-paper">
        <div class="ed-slide-header">
          <div>
            <p class="ed-script-md">My</p>
            <h2 class="ed-display-heading ed-fold-target">${escapeHtml(customLabels.experience || "EXPERIENCES")}</h2>
          </div>
          <span class="ed-slide-num">03</span>
        </div>

        <div class="ed-grid-12 ed-exp-grid">
          <div class="ed-col-7 ed-exp-left">
            ${
              displayExp.length > 1
                ? `<div class="ed-exp-tabs" role="tablist">
                    ${displayExp
                      .map(
                        (exp, idx) =>
                          `<button type="button" class="ed-exp-tab ${idx === 0 ? "is-active" : ""}" data-exp-idx="${idx}">${escapeHtml(exp.company || `Role ${idx + 1}`)}</button>`,
                      )
                      .join("")}
                  </div>`
                : ""
            }

            <div class="ed-exp-panels">
              ${displayExp
                .map(
                  (exp, idx) => `
                  <div class="ed-exp-panel ${idx === 0 ? "is-active" : ""}" data-exp-panel="${idx}">
                    <div>
                      <h3 class="ed-exp-role">${escapeHtml(exp.title || "Software Engineer")}</h3>
                      <p class="ed-exp-meta">${escapeHtml(exp.company || "")} &bull; ${escapeHtml(exp.startDate || "")} &mdash; ${escapeHtml(exp.current ? "Present" : exp.endDate || "Present")}</p>
                    </div>
                    ${exp.description ? `<p class="ed-body-copy">${escapeHtml(exp.description)}</p>` : ""}
                    ${
                      Array.isArray(exp.highlights) && exp.highlights.length > 0
                        ? `<ul class="ed-highlights-list">
                            ${exp.highlights.map((h) => `<li><span class="ed-dot"></span><span>${escapeHtml(h)}</span></li>`).join("")}
                          </ul>`
                        : ""
                    }
                  </div>`,
                )
                .join("")}
            </div>
          </div>

          <div class="ed-col-5 ed-center">
            <div class="ed-portrait-box ed-exp-photo-box">
              ${renderSafeImgHtml({
                src: avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
                alt: fullName,
                className: "ed-portrait-img",
                fallbackText: "Production Experience",
                escapeHtml,
              })}
              <div class="ed-exp-glass-bar">
                <span>Production Experience</span>
                <span class="ed-verified-amber">&#9733; Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ed-slide-footer">
          <span>End-to-End Delivery Experience</span>
          <span class="ed-footer-muted">Selected Work History</span>
        </div>
      </section>`,

    education: `
      <section id="education" class="editorial-slide ed-paper">
        <div class="ed-slide-header">
          <div>
            <p class="ed-script-md">My</p>
            <h2 class="ed-display-heading ed-fold-target">${escapeHtml(customLabels.education || "EDUCATION")}</h2>
          </div>
          <span class="ed-slide-num">04</span>
        </div>

        <div class="ed-grid-12 ed-edu-grid">
          <div class="ed-col-5 ed-edu-arch-wrap">
            <div class="ed-edu-arch">
              <div class="ed-edu-arch-grad"></div>
              ${
                avatarUrl
                  ? renderSafeImgHtml({
                      src: avatarUrl,
                      alt: fullName,
                      className: "ed-edu-arch-img",
                      fallbackText: "ACADEMIC",
                      escapeHtml,
                    })
                  : `<div class="ed-edu-arch-fallback">
                      ${ICONS.award}
                      <span>ACADEMIC</span>
                    </div>`
              }
            </div>
          </div>

          <div class="ed-col-7 ed-edu-list">
            ${displayEdu
              .map(
                (edu) => `
                <div class="ed-edu-item">
                  <div class="ed-edu-capsule">( ${escapeHtml(edu.startDate || "2021")} &mdash; ${escapeHtml(edu.endDate || "Present")} )</div>
                  <h3 class="ed-edu-degree">${escapeHtml(edu.degree || "")}${edu.fieldOfStudy ? ` in ${escapeHtml(edu.fieldOfStudy)}` : ""}</h3>
                  <p class="ed-edu-inst">${escapeHtml(edu.institution || "")}</p>
                  ${edu.description ? `<p class="ed-edu-desc">${escapeHtml(edu.description)}</p>` : ""}
                </div>`,
              )
              .join("")}
          </div>
        </div>

        <div class="ed-slide-footer">
          <span>Continuous Learning &amp; Certification</span>
          <span class="ed-footer-strong">Academic Credentials</span>
        </div>
      </section>`,

    projects: `
      <div id="projects" class="ed-projects-stack">
        <!-- Slide 05: Projects Cover -->
        <section class="editorial-slide ed-crimson ed-proj-cover">
          <div class="ed-proj-vignette"></div>
          <div class="ed-proj-cover-top">
            <span class="ed-script-white">Featured Showcase</span>
            <span class="ed-slots-pill">PHOTO SLOTS #01 &ndash; #04</span>
          </div>

          <div class="ed-grid-12 ed-proj-cover-center">
            <div class="ed-col-3 ed-center">
              <div class="polaroid-card ed-polaroid-left">
                <div class="ed-polaroid-inner">
                  <div class="ed-polaroid-media">
                    ${renderSafeImgHtml({
                      src: displayProjects[0]?.imageUrl || displayProjects[0]?.images?.[0] || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80",
                      alt: displayProjects[0]?.title || "Project #01",
                      className: "ed-polaroid-img",
                      fallbackText: "Project #01 Cover",
                      escapeHtml,
                    })}
                    <span class="ed-polaroid-badge">#01</span>
                  </div>
                  <p class="ed-polaroid-caption">${escapeHtml(displayProjects[0]?.title || "Prototype Design")}</p>
                </div>
              </div>
            </div>

            <div class="ed-col-6 ed-center ed-proj-cover-title-col">
              <h2 class="ed-proj-giant-title ed-fold-target">${escapeHtml(customLabels.projects || "PROJECTS")}</h2>
              <p class="ed-proj-cover-sub">Each numbered badge (#01 &ndash; #04) maps directly to your uploaded project photos.</p>
            </div>

            <div class="ed-col-3 ed-center">
              <div class="polaroid-card ed-polaroid-right">
                <div class="ed-polaroid-inner">
                  <div class="ed-polaroid-media">
                    ${renderSafeImgHtml({
                      src: displayProjects[1]?.imageUrl || displayProjects[0]?.images?.[0] || "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400&auto=format&fit=crop&q=80",
                      alt: displayProjects[1]?.title || "Project #02",
                      className: "ed-polaroid-img",
                      fallbackText: "Project #02 Cover",
                      escapeHtml,
                    })}
                    <span class="ed-polaroid-badge">#02</span>
                  </div>
                  <p class="ed-polaroid-caption">${escapeHtml(displayProjects[1]?.title || "Design Systems")}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="ed-proj-cover-foot">
            <span>SELECTED SHOWCASE</span>
            <span>${displayProjects.length} Key ${displayProjects.length === 1 ? "Project" : "Projects"}</span>
          </div>
        </section>

        ${
          displayProjects[0]
            ? `
        <!-- Slide 06: First Project -->
        <section class="editorial-slide ed-paper ed-proj-slide">
          <div class="ed-grid-12 ed-proj1-grid">
            <div class="ed-col-5 ed-proj-info-col">
              <div class="ed-proj-head-row">
                <div>
                  <p class="ed-script-lg">First</p>
                  <h3 class="ed-display-sub ed-fold-target">PROJECT</h3>
                </div>
                <span class="ed-pill-badge">PROJECT 01</span>
              </div>
              <h4 class="ed-proj-name">${escapeHtml(displayProjects[0].title)}</h4>
              <p class="ed-body-copy">${escapeHtml(displayProjects[0].description)}</p>
              ${
                Array.isArray(displayProjects[0].tags) && displayProjects[0].tags.length > 0
                  ? `<div class="ed-tags-row">${displayProjects[0].tags.map((t) => `<span class="ed-tag-pill">#${escapeHtml(t)}</span>`).join("")}</div>`
                  : ""
              }
              <div class="ed-btn-row">
                ${
                  sanitizeUrl(displayProjects[0].liveUrl)
                    ? `<a href="${escapeHtml(sanitizeUrl(displayProjects[0].liveUrl))}" target="_blank" rel="noopener noreferrer" class="ed-btn-primary"><span>Live Demo</span>${ICONS.externalLink}</a>`
                    : ""
                }
                ${
                  sanitizeUrl(displayProjects[0].repoUrl)
                    ? `<a href="${escapeHtml(sanitizeUrl(displayProjects[0].repoUrl))}" target="_blank" rel="noopener noreferrer" class="ed-btn-outline">${ICONS.folderGit2}<span>Code Repo</span></a>`
                    : ""
                }
              </div>
            </div>

            <div class="ed-col-7 ed-proj1-collage">
              ${renderNumberedFrame({
                src: displayProjects[0].imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
                alt: `${displayProjects[0].title} - Photo #01`,
                slotNumber: "#01",
                slotLabel: "Primary Cover",
                extraClass: "ed-frame-h",
                escapeHtml,
              })}
              ${renderNumberedFrame({
                src: displayProjects[0].images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
                alt: `${displayProjects[0].title} - Photo #02`,
                slotNumber: "#02",
                slotLabel: "Secondary Frame",
                extraClass: "ed-frame-h",
                escapeHtml,
              })}
              ${renderNumberedFrame({
                src: displayProjects[0].images?.[1] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
                alt: `${displayProjects[0].title} - Photo #03`,
                slotNumber: "#03",
                slotLabel: "Detail Frame",
                extraClass: "ed-frame-h",
                escapeHtml,
              })}
              ${
                displayProjects[0].images?.[2]
                  ? renderNumberedFrame({
                      src: displayProjects[0].images[2],
                      alt: `${displayProjects[0].title} - Photo #04`,
                      slotNumber: "#04",
                      slotLabel: "Bento Highlight",
                      extraClass: "ed-frame-h",
                      escapeHtml,
                    })
                  : `<div class="ed-numbered-frame ed-frame-h ed-bento-card">
                      <div class="ed-slot-badge"><span class="ed-slot-dot"></span><span>#04</span></div>
                      <div class="ed-bento-center">
                        ${ICONS.sparkles}
                        <p class="ed-bento-title">FEATURED</p>
                        <p class="ed-bento-sub">${escapeHtml(displayProjects[0].title || "Design Sprint 01")}</p>
                      </div>
                      <div class="ed-slot-caption"><span>Bento Highlight</span><span>Slot #04</span></div>
                    </div>`
              }
            </div>
          </div>
        </section>`
            : ""
        }

        ${
          displayProjects[1]
            ? `
        <!-- Slide 07: Second Project -->
        <section class="editorial-slide ed-paper ed-proj-slide">
          <div class="ed-proj2-top-grid">
            ${renderNumberedFrame({
              src: displayProjects[1].imageUrl || "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&auto=format&fit=crop&q=80",
              alt: `${displayProjects[1].title} - Photo #01`,
              slotNumber: "#01",
              slotLabel: "Primary Cover",
              extraClass: "ed-frame-tall",
              escapeHtml,
            })}
            ${renderNumberedFrame({
              src: displayProjects[1].images?.[0] || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
              alt: `${displayProjects[1].title} - Photo #02`,
              slotNumber: "#02",
              slotLabel: "Secondary Frame",
              extraClass: "ed-frame-tall",
              escapeHtml,
            })}
            ${renderNumberedFrame({
              src: displayProjects[1].images?.[1] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
              alt: `${displayProjects[1].title} - Photo #03`,
              slotNumber: "#03",
              slotLabel: "Detail Frame",
              extraClass: "ed-frame-tall",
              escapeHtml,
            })}
          </div>

          <div class="ed-grid-12 ed-proj2-bottom">
            <div class="ed-col-5">
              <div class="ed-proj-head-row-gap">
                <div>
                  <p class="ed-script-lg">Second</p>
                  <h3 class="ed-display-sub ed-fold-target">PROJECT</h3>
                </div>
                <span class="ed-pill-badge">PROJECT 02</span>
              </div>
              <h4 class="ed-proj-name-sm">${escapeHtml(displayProjects[1].title)}</h4>
            </div>
            <div class="ed-col-7 ed-proj2-desc-col">
              <p class="ed-body-copy">${escapeHtml(displayProjects[1].description)}</p>
              <div class="ed-btn-row">
                ${
                  sanitizeUrl(displayProjects[1].liveUrl)
                    ? `<a href="${escapeHtml(sanitizeUrl(displayProjects[1].liveUrl))}" target="_blank" rel="noopener noreferrer" class="ed-btn-pill-primary"><span>Explore Live</span>${ICONS.externalLink}</a>`
                    : ""
                }
                ${
                  sanitizeUrl(displayProjects[1].repoUrl)
                    ? `<a href="${escapeHtml(sanitizeUrl(displayProjects[1].repoUrl))}" target="_blank" rel="noopener noreferrer" class="ed-btn-pill-outline">${ICONS.folderGit2}<span>Source</span></a>`
                    : ""
                }
              </div>
            </div>
          </div>
        </section>`
            : ""
        }

        ${displayProjects
          .slice(2)
          .map((proj, extraIdx) => {
            const projectNumber = extraIdx + 3;
            const ordinalLabels = ["Third", "Fourth", "Fifth", "Sixth"];
            const scriptLabel = ordinalLabels[extraIdx] || `Project #0${projectNumber}`;
            return `
        <section class="editorial-slide ed-paper ed-proj-slide">
          <div class="ed-grid-12 ed-proj3-grid">
            <div class="ed-col-4">
              ${renderNumberedFrame({
                src: proj.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
                alt: `${proj.title} - Photo #01`,
                slotNumber: "#01",
                slotLabel: "Primary Cover",
                extraClass: "ed-frame-330",
                escapeHtml,
              })}
            </div>
            <div class="ed-col-4 ed-proj3-center">
              <span class="ed-pill-badge">PROJECT 0${projectNumber}</span>
              <p class="ed-script-lg">${escapeHtml(scriptLabel)}</p>
              <h3 class="ed-display-sub ed-fold-target">PROJECT</h3>
              <h4 class="ed-proj-name-sm">${escapeHtml(proj.title)}</h4>
              <p class="ed-body-copy">${escapeHtml(proj.description)}</p>
              <div class="ed-btn-row ed-center">
                ${
                  sanitizeUrl(proj.liveUrl)
                    ? `<a href="${escapeHtml(sanitizeUrl(proj.liveUrl))}" target="_blank" rel="noopener noreferrer" class="ed-btn-pill-primary"><span>View Project</span>${ICONS.externalLink}</a>`
                    : ""
                }
                ${
                  sanitizeUrl(proj.repoUrl)
                    ? `<a href="${escapeHtml(sanitizeUrl(proj.repoUrl))}" target="_blank" rel="noopener noreferrer" class="ed-btn-pill-outline">${ICONS.folderGit2}<span>Source</span></a>`
                    : ""
                }
              </div>
            </div>
            <div class="ed-col-4 ed-proj3-stack">
              ${renderNumberedFrame({
                src: proj.images?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
                alt: `${proj.title} - Photo #02`,
                slotNumber: "#02",
                slotLabel: "Secondary Frame",
                extraClass: "ed-frame-158",
                escapeHtml,
              })}
              ${renderNumberedFrame({
                src: proj.images?.[1] || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
                alt: `${proj.title} - Photo #03`,
                slotNumber: "#03",
                slotLabel: "Detail Frame",
                extraClass: "ed-frame-158",
                escapeHtml,
              })}
            </div>
          </div>
        </section>`;
          })
          .join("")}
      </div>`,

    certifications: `
      <section id="certifications" class="editorial-slide ed-paper ed-certs-slide">
        <div class="ed-slide-header">
          <div>
            <p class="ed-script-md">Verified</p>
            <h2 class="ed-display-heading ed-fold-target">${escapeHtml(customLabels.certifications || "CERTIFICATIONS")}</h2>
          </div>
          <span class="ed-pill-badge-ink">07</span>
        </div>

        <div class="ed-certs-grid">
          ${displayCerts
            .map(
              (cert, idx) => `
              <div class="ed-cert-card">
                <div class="ed-cert-top">
                  <div class="ed-cert-header">
                    <div class="ed-cert-icon-box">${ICONS.award}</div>
                    <span class="ed-pill-badge">CREDENTIAL #0${idx + 1}</span>
                  </div>
                  <h3 class="ed-cert-title">${escapeHtml(cert.name)}</h3>
                  <p class="ed-cert-issuer">${escapeHtml(cert.issuer)}${cert.issueDate ? ` &bull; ${escapeHtml(cert.issueDate)}` : ""}</p>
                </div>
                ${
                  sanitizeUrl(cert.url)
                    ? `<a href="${escapeHtml(sanitizeUrl(cert.url))}" target="_blank" rel="noopener noreferrer" class="ed-cert-verify-link"><span>Verify Official Credential</span>${ICONS.externalLink}</a>`
                    : `<div class="ed-cert-status"><span>Status: Active</span><span class="ed-cert-verified">&#10003; Verified</span></div>`
                }
              </div>`,
            )
            .join("")}

          ${
            certifications.length <= 2
              ? `
              <div class="ed-cert-summary-card">
                <div>
                  <span class="ed-cert-summary-pill">Industry Validated</span>
                  <h3 class="ed-cert-summary-title">CONTINUOUS EXCELLENCE</h3>
                  <p class="ed-cert-summary-copy">Backed by verified technical certifications, hands-on architecture assessments, and modern engineering standards.</p>
                </div>
                <div class="ed-cert-summary-foot">
                  <span>Accredited Standards</span>
                  <span>100% Verified</span>
                </div>
              </div>`
              : ""
          }
        </div>

        <div class="ed-slide-footer">
          <span>Official Industry Credentials</span>
          <span class="ed-footer-strong">Verified Standards</span>
        </div>
      </section>`,

    skills: `
      <section id="skills" class="editorial-slide ed-paper">
        <div class="ed-slide-header">
          <div>
            <p class="ed-script-md">Specialized</p>
            <h2 class="ed-display-heading ed-fold-target">${escapeHtml(customLabels.skills || "TECHNICAL SKILLS")}</h2>
          </div>
          <span class="ed-slide-num">08</span>
        </div>

        <div class="ed-skills-grid">
          ${displaySkills
            .map((sk) => {
              const skName = typeof sk === "string" ? sk : sk.name;
              const skCat = typeof sk === "string" ? "Skill" : sk.category || "Skill";
              const skLevel = typeof sk !== "string" && sk.level === "expert" ? "95%" : typeof sk !== "string" && sk.level === "advanced" ? "86%" : "74%";
              return `
              <div class="skill-card ed-skill-card">
                <div class="ed-skill-row">
                  <div class="ed-skill-left">
                    <div class="ed-skill-icon-box">${getStaticTechIconSvg(skName, 18)}</div>
                    <span class="ed-skill-name">${escapeHtml(skName)}</span>
                  </div>
                  <span class="ed-skill-cat">${escapeHtml(skCat)}</span>
                </div>
                <div class="ed-skill-track">
                  <div class="ed-skill-fill" style="width: ${skLevel};"></div>
                </div>
              </div>`;
            })
            .join("")}
        </div>

        <div class="ed-slide-footer">
          <span>Continuous Skill Validation</span>
          <span class="ed-footer-muted">${displaySkills.length} Technologies Mastered</span>
        </div>
      </section>`,

    testimonials: `
      <section id="testimonials" class="editorial-slide ed-paper">
        <div class="ed-slide-header">
          <div>
            <p class="ed-script-md">Our</p>
            <h2 class="ed-display-heading ed-fold-target">CLIENT SAY</h2>
          </div>
          <span class="ed-slide-num">09</span>
        </div>

        <div class="ed-testimonials-grid">
          ${testimonials
            .map(
              (item) => `
              <div class="ed-testimonial-card">
                <div class="ed-testimonial-head">
                  ${renderSafeImgHtml({
                    src: item.avatar,
                    alt: item.name,
                    className: "ed-testimonial-avatar",
                    fallbackText: item.name.slice(0, 1),
                    escapeHtml,
                  })}
                  <div class="ed-testimonial-meta">
                    <h4>${escapeHtml(item.name)}</h4>
                    <p>${escapeHtml(item.role)}</p>
                  </div>
                </div>
                <div class="ed-stars-row">${ICONS.starFilled.repeat(5)}</div>
                <p class="ed-testimonial-quote">&ldquo;${escapeHtml(item.quote)}&rdquo;</p>
              </div>`,
            )
            .join("")}
        </div>

        <div class="ed-slide-footer">
          <span>Client Testimonials &amp; Feedback</span>
          <span class="ed-footer-muted">100% Satisfaction Rate</span>
        </div>
      </section>`,

    contact: `
      <section id="contact" class="editorial-slide ed-crimson ed-contact-slide">
        <div class="ed-contact-vignette"></div>
        <div class="ed-grid-12 ed-contact-grid">
          <div class="ed-col-5 ed-center">
            <div class="ed-contact-portrait-wrap">
              ${
                avatarUrl
                  ? renderSafeImgHtml({
                      src: avatarUrl,
                      alt: fullName,
                      className: "ed-contact-portrait",
                      fallbackText: `${firstName.slice(0, 1)} • Let's Connect`,
                      escapeHtml,
                    })
                  : `<div class="ed-contact-initial-card">
                      <span class="ed-contact-initial">${escapeHtml(firstName.slice(0, 1))}</span>
                      <span class="ed-contact-script">Let&apos;s Connect</span>
                    </div>`
              }
            </div>
          </div>

          <div class="ed-col-7 ed-contact-right">
            <div>
              <p class="ed-script-white-lg">let&apos;s Connect</p>
              <h2 class="ed-thankyou-title ed-fold-target">${escapeHtml(customLabels.contact || "THANK YOU")}</h2>
            </div>

            <div class="ed-contact-pills">
              ${
                phone
                  ? `<a href="tel:${escapeHtml(phone)}" class="ed-contact-pill">${ICONS.phone}<span>${escapeHtml(phone)}</span></a>`
                  : ""
              }
              ${
                email
                  ? `<a href="mailto:${escapeHtml(email)}" class="ed-contact-pill">${ICONS.mail}<span class="truncate">${escapeHtml(email)}</span></a>`
                  : ""
              }
            </div>

            ${
              socialLinks.length > 0
                ? `<div class="ed-social-row">${safeLinksHtml(socialLinks, "ed-social-pill")}</div>`
                : ""
            }

            <p class="ed-contact-closing">Let&apos;s create something meaningful together.</p>
          </div>
        </div>

        <div class="ed-contact-footer">
          <span>&copy; ${new Date().getFullYear()} ${escapeHtml(fullName)}. All rights reserved.</span>
          <span>Editorial Portfolio Edition</span>
        </div>
      </section>`,
  };

  const renderedSectionsHtml = visibleSections
    .map((sec) => {
      if (sectionHtmlMap[sec]) return sectionHtmlMap[sec];
      const label = sec.replace(/[-_]/g, " ");
      return `
      <section id="${escapeHtml(sec)}" class="editorial-slide ed-paper ed-custom-slide">
        <div>
          <p class="ed-script-md">Custom</p>
          <h2 class="ed-display-heading ed-fold-target">${escapeHtml(label.toUpperCase())}</h2>
        </div>
        <div class="ed-custom-card">
          <p>Editorial section for ${escapeHtml(label)}. Customize your content anytime in the portfolio editor.</p>
        </div>
        <div class="ed-slide-footer">
          <span style="text-transform: capitalize;">${escapeHtml(label)}</span>
          <span class="ed-footer-strong">Custom Section</span>
        </div>
      </section>`;
    })
    .join("\n");

  const menuItemsHtml = visibleSections
    .map((sec) => {
      const label = sec.charAt(0).toUpperCase() + sec.slice(1).replace(/[-_]/g, " ");
      return `<li class="sm-panel-itemWrap"><a class="sm-panel-item" href="#${escapeHtml(sec)}" aria-label="Go to ${escapeHtml(sec)} section"><span class="sm-panel-itemLabel">${escapeHtml(label)}</span></a></li>`;
    })
    .join("");

  const menuSocialsHtml =
    socialLinks.length > 0
      ? socialLinks
          .map((s) => {
            const href = sanitizeUrl(s.url);
            if (!href) return "";
            return `<li class="sm-socials-item"><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="sm-socials-link">${escapeHtml(s.platform || "Link")}</a></li>`;
          })
          .join("")
      : email
      ? `<li class="sm-socials-item"><a href="mailto:${escapeHtml(email)}" class="sm-socials-link">Email</a></li>`
      : "";

  const bgEffectHtml = getStaticBackgroundEffectHtml(data.design?.backgroundEffect, isDarkMode, primaryColor);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="referrer" content="no-referrer" />
  <title>${escapeHtml(data.publication?.seoTitle || data.title)}</title>
  <meta name="description" content="${escapeHtml(data.publication?.seoDescription || headline)}" />
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="assets/style.css" />
</head>
<body class="${isDarkMode ? "dark" : "light"}">
  ${bgEffectHtml}
  <div class="editorial-root">
    <!-- Interactive StaggeredMenu -->
    <div class="ed-sticky-menu-wrap">
      <div class="staggered-menu-wrapper" id="edStaggeredMenu" data-position="left" style="--sm-accent: ${escapeHtml(primaryColor)};">
        <div class="sm-prelayers" aria-hidden="true">
          <div class="sm-prelayer" style="background: #141418;"></div>
          <div class="sm-prelayer" style="background: ${escapeHtml(primaryColor)};"></div>
        </div>
        <header class="staggered-menu-header" aria-label="Main navigation header">
          <button type="button" id="edMenuToggle" class="sm-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="edStaggeredPanel">
            <span class="sm-toggle-textWrap" aria-hidden="true">
              <span class="sm-toggle-textInner">
                <span class="sm-toggle-line">Menu</span>
                <span class="sm-toggle-line">Close</span>
              </span>
            </span>
            <span class="sm-icon" aria-hidden="true">
              <span class="sm-icon-line"></span>
              <span class="sm-icon-line sm-icon-line-v"></span>
            </span>
          </button>
        </header>
        <aside id="edStaggeredPanel" class="staggered-menu-panel" aria-hidden="true">
          <div class="sm-panel-inner">
            <ul class="sm-panel-list" data-numbering="true">
              ${menuItemsHtml}
            </ul>
            ${
              menuSocialsHtml
                ? `<div class="sm-socials">
                    <h3 class="sm-socials-title">Socials</h3>
                    <ul class="sm-socials-list">${menuSocialsHtml}</ul>
                  </div>`
                : ""
            }
          </div>
        </aside>
      </div>
    </div>

    <main class="editorial-main">
      ${renderedSectionsHtml}
    </main>

    <button type="button" id="scrollTopBtn" class="ed-scroll-top" aria-label="Back to top" style="display: none;">
      ${ICONS.arrowUp}
    </button>
  </div>
  <script src="assets/script.js"></script>
</body>
</html>`;
}

export function generateEditorialStaticCss(data, helpers) {
  const { getFontFamilyCss, getStaticBackgroundEffectCss } = helpers;
  const rawPrimary = data.design?.primaryColor;
  const primaryColor = !rawPrimary || rawPrimary === "#2563eb" ? "#8B151B" : rawPrimary;
  const isDarkMode = data.design?.theme === "dark";
  const fontFamilyCss = getFontFamilyCss(data.design?.fontFamily);

  const paper = isDarkMode ? "#120F17" : "#FDFBF7";
  const paperCard = isDarkMode ? "#1D1518" : "#FFFFFF";
  const paperBorder = isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.12)";
  const ink = isDarkMode ? "#FFFFFF" : "#0F172A";
  const inkMuted = isDarkMode ? "#CBD5E1" : "#334155";
  const badgeBg = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.05)";

  return `/* Crimson Editorial Standalone Portfolio CSS */
:root {
  --ed-primary: ${primaryColor};
  --ed-paper: ${paper};
  --ed-paper-card: ${paperCard};
  --ed-paper-border: ${paperBorder};
  --ed-ink: ${ink};
  --ed-ink-muted: ${inkMuted};
  --ed-badge-bg: ${badgeBg};
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  margin: 0;
  padding: 0;
  font-family: ${fontFamilyCss};
  background-color: var(--ed-paper);
  color: var(--ed-ink);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

${getStaticBackgroundEffectCss(isDarkMode)}

.editorial-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 1.5rem 0.75rem;
  background-color: var(--ed-paper);
  color: var(--ed-ink);
}

@media (min-width: 640px) {
  .editorial-root {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .editorial-root {
    padding: 3rem 2.5rem;
  }
}

.editorial-main {
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: relative;
  z-index: 1;
}

@media (min-width: 640px) {
  .editorial-main {
    gap: 4rem;
  }
}

/* Staggered Menu Navigation */
.ed-sticky-menu-wrap {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 0;
  max-width: 72rem;
  margin: 0 auto;
}

.staggered-menu-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 50;
  pointer-events: none;
}

.staggered-menu-wrapper.fixed-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.staggered-menu-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: transparent;
  pointer-events: none;
  z-index: 30;
}

@media (min-width: 640px) {
  .staggered-menu-header {
    padding: 1.5rem 2rem;
  }
}

.sm-toggle {
  pointer-events: auto;
  position: relative;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
  transition: color 0.2s ease;
  padding: 0.35rem 0.5rem;
}

.sm-toggle.is-on-light {
  color: #0F172A;
}

.staggered-menu-wrapper.sm-open .sm-toggle {
  color: #0F172A;
}

.sm-toggle-textWrap {
  position: relative;
  display: inline-block;
  height: 1em;
  overflow: hidden;
  white-space: nowrap;
}

.sm-toggle-textInner {
  display: flex;
  flex-direction: column;
  line-height: 1;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.staggered-menu-wrapper.sm-open .sm-toggle-textInner {
  transform: translateY(-50%);
}

.sm-toggle-line {
  display: block;
  height: 1em;
  line-height: 1;
}

.sm-icon {
  position: relative;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.staggered-menu-wrapper.sm-open .sm-icon {
  transform: rotate(45deg);
}

.sm-icon-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
  transform: translate(-50%, -50%);
}

.sm-icon-line-v {
  transform: translate(-50%, -50%) rotate(90deg);
}

.sm-prelayers {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: clamp(280px, 38vw, 440px);
  height: 100vh;
  pointer-events: none;
  z-index: 15;
  transform: translateX(-105%);
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.sm-prelayer {
  position: absolute;
  inset: 0;
}

.staggered-menu-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: clamp(280px, 38vw, 440px);
  height: 100vh;
  background: #ffffff;
  color: #111111;
  display: flex;
  flex-direction: column;
  padding: 5.5em 2.25em 2.25em 2.25em;
  overflow-y: auto;
  z-index: 20;
  pointer-events: none;
  transform: translateX(-105%);
  box-shadow: 20px 0 60px rgba(0, 0, 0, 0.35);
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (max-width: 640px) {
  .sm-prelayers,
  .staggered-menu-panel {
    width: 100%;
  }
}

.staggered-menu-wrapper.sm-open .sm-prelayers,
.staggered-menu-wrapper.sm-open .staggered-menu-panel {
  transform: translateX(0);
  pointer-events: auto;
}

.sm-panel-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sm-panel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  counter-reset: smItem;
}

.sm-panel-item {
  position: relative;
  color: #000000;
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-weight: 600;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-decoration: none;
  display: inline-block;
  padding-right: 1.4em;
  transition: color 0.2s ease, transform 0.2s ease;
}

.sm-panel-item:hover {
  color: var(--ed-primary);
  transform: translateX(6px);
}

.sm-panel-list[data-numbering="true"] .sm-panel-item::after {
  counter-increment: smItem;
  content: counter(smItem, decimal-leading-zero);
  position: absolute;
  top: 0.1em;
  right: 0.2em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--ed-primary);
}

.sm-socials {
  margin-top: auto;
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sm-socials-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ed-primary);
}

.sm-socials-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.sm-socials-link {
  font-size: 1rem;
  font-weight: 500;
  color: #111111;
  text-decoration: none;
  transition: color 0.2s ease;
}

.sm-socials-link:hover {
  color: var(--ed-primary);
}

/* Slides Architecture */
.editorial-slide {
  position: relative;
  width: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  opacity: 0;
  transform: translateY(28px) scale(0.985);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 640px) {
  .editorial-slide {
    padding: 3rem;
  }
}

@media (min-width: 768px) {
  .editorial-slide {
    min-height: 580px;
  }
  .editorial-slide.ed-hero {
    min-height: 680px;
    aspect-ratio: 16 / 10;
    max-height: 860px;
  }
}

.editorial-slide.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.editorial-slide::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(480px circle at var(--mx, 50%) var(--my, 35%), rgba(255, 255, 255, 0.08), transparent 65%);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
  z-index: 2;
}

.editorial-slide:hover::after {
  opacity: 1;
}

/* FoldText 3D Paper Character Folding Engine */
.ed-fold-target {
  position: relative;
}

.fold-text-word {
  display: inline-block;
  white-space: nowrap;
}

.fold-text-segment {
  display: inline-block;
  perspective: 700px;
  vertical-align: baseline;
}

.fold-text-piece {
  --fold-shade: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.58) 0%,
    rgba(0, 0, 0, 0.22) 42%,
    rgba(255, 255, 255, 0.26) 100%
  );
  position: relative;
  display: inline-block;
  backface-visibility: hidden;
  transform-origin: 50% 0%;
  will-change: transform, opacity;
}

.fold-text-piece::after {
  content: attr(data-fold-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: transparent;
  -webkit-text-fill-color: transparent;
  background-image: var(--fold-shade);
  -webkit-background-clip: text;
  background-clip: text;
  opacity: var(--fold-crease, 0);
}

.ed-crimson {
  background-color: var(--ed-primary);
  color: #ffffff;
}

.ed-paper {
  background-color: var(--ed-paper);
  border: 1px solid var(--ed-paper-border);
  color: var(--ed-ink);
}

/* Hero Slide & Swinging Lanyard */
.ed-hero {
  min-height: 600px;
}

.ed-hero-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(255, 255, 255, 0.14), transparent 60%, rgba(0, 0, 0, 0.32));
  pointer-events: none;
}

.ed-hero-texture {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.06) 0px, rgba(0, 0, 0, 0.06) 1px, transparent 1px, transparent 4px);
  pointer-events: none;
}

.ed-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%);
  transform: translateX(-100%);
  animation: edSheen 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes edSheen {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.ed-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.25;
  pointer-events: none;
}

.ed-orb-a {
  width: 240px;
  height: 240px;
  background: #ffffff;
  top: -60px;
  right: 10%;
  animation: edOrbFloatA 9s ease-in-out infinite;
}

.ed-orb-b {
  width: 280px;
  height: 280px;
  background: #000000;
  bottom: -80px;
  left: 5%;
  animation: edOrbFloatB 11s ease-in-out infinite;
}

@keyframes edOrbFloatA {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-24px, 18px) scale(1.1); }
}

@keyframes edOrbFloatB {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(24px, -20px) scale(1.08); }
}

.ed-hero-wordmark-wrap {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  pointer-events: none;
  user-select: none;
}

.ed-tech-canvas {
  display: block;
  width: 100%;
  height: 480px;
  max-height: 92%;
}

.ed-hero-wordmark {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: clamp(72px, 16vw, 200px);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.18);
  text-align: center;
}

.ed-hero-wordmark.is-canvas-active {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.lanyard,
.ed-lanyard-stage {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 600px;
  z-index: 30;
  overflow: hidden;
}

.lanyard-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.ed-lanyard-stage.has-webgl .ed-lanyard-fallback {
  display: none;
}

.ed-lanyard-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  pointer-events: none;
}

.ed-lanyard-fb-strap {
  width: 34px;
  height: 155px;
  background: #141417;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
}

.ed-lanyard-fb-clamp {
  width: 38px;
  height: 22px;
  border-radius: 5px;
  background: linear-gradient(155deg, #e2e8f0, #64748b);
  margin-top: -2px;
  z-index: 2;
}

.ed-lanyard-fb-ring {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2.5px solid #e2e8f0;
  margin-top: -4px;
  z-index: 3;
}

.ed-lanyard-fb-card {
  width: clamp(164px, 21.5vw, 246px);
  aspect-ratio: 1.6 / 2.25;
  border-radius: 14px;
  overflow: hidden;
  margin-top: -12px;
  background: #141418;
  box-shadow: 0 26px 52px rgba(0, 0, 0, 0.46), 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.ed-lanyard-fb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ed-hero-bottom {
  position: relative;
  z-index: 40;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.78rem;
}

@media (min-width: 640px) {
  .ed-hero-bottom {
    flex-direction: row;
    font-size: 0.875rem;
  }
}

.ed-hero-name, .ed-hero-headline {
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.95);
}

.ed-hero-cta {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  background: #ffffff;
  color: var(--ed-primary);
  font-weight: 700;
  font-size: 0.75rem;
  text-decoration: none;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, background 0.2s ease;
}

.ed-hero-cta:hover {
  transform: scale(1.05);
}

/* Shared Slide Headers, Grids & Footers */
.ed-slide-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.ed-display-heading {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: clamp(44px, 7vw, 92px);
  line-height: 0.88;
  text-transform: uppercase;
  color: var(--ed-primary);
  margin: 0;
  letter-spacing: 0.01em;
}

.ed-display-sub {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: clamp(36px, 5.5vw, 72px);
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--ed-primary);
  margin: 0.15rem 0 0;
}

.ed-script-md {
  font-family: 'Caveat', cursive;
  font-weight: 700;
  font-size: clamp(1.5rem, 2.5vw, 1.875rem);
  color: var(--ed-primary);
  margin: 0;
  line-height: 1;
}

.ed-script-lg {
  font-family: 'Caveat', cursive;
  font-weight: 700;
  font-size: clamp(1.85rem, 3vw, 2.35rem);
  color: var(--ed-primary);
  margin: 0;
  line-height: 1;
}

.ed-script-white {
  font-family: 'Caveat', cursive;
  font-weight: 700;
  font-size: clamp(1.85rem, 3vw, 2.35rem);
  color: #FAF5EF;
}

.ed-script-white-lg {
  font-family: 'Caveat', cursive;
  font-weight: 700;
  font-size: clamp(1.9rem, 3.2vw, 2.5rem);
  color: #FAF5EF;
  margin: 0;
  line-height: 1;
}

.ed-slide-num {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.6;
}

.ed-pill-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-badge-bg);
  color: var(--ed-primary);
}

.ed-pill-badge-ink {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-badge-bg);
  color: var(--ed-ink);
}

.ed-slide-footer {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--ed-paper-border);
  color: var(--ed-ink-muted);
  font-family: ui-monospace, monospace;
}

.ed-footer-loc {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.ed-footer-loc svg {
  color: var(--ed-primary);
}

.ed-footer-strong {
  font-weight: 600;
}

.ed-footer-muted {
  opacity: 0.85;
}

.ed-grid-12 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: center;
  margin: auto 0;
}

@media (min-width: 768px) {
  .ed-grid-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 2.25rem;
  }
  .ed-col-3 { grid-column: span 3 / span 3; }
  .ed-col-4 { grid-column: span 4 / span 4; }
  .ed-col-5 { grid-column: span 5 / span 5; }
  .ed-col-6 { grid-column: span 6 / span 6; }
  .ed-col-7 { grid-column: span 7 / span 7; }
}

.ed-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ed-body-copy {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--ed-ink-muted);
  margin: 0;
}

/* Portrait Box (About & Experience) */
.ed-portrait-box {
  position: relative;
  width: min(65vw, 260px);
  aspect-ratio: 3 / 4;
  border-radius: 1rem;
  overflow: hidden;
  border: 4px solid #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22);
  background: #e5e5e5;
}

@media (min-width: 640px) {
  .ed-portrait-box {
    width: min(26vw, 300px);
  }
}

.ed-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ed-portrait-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--ed-primary);
  color: #ffffff;
}

.ed-portrait-initial {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 4rem;
}

.ed-portrait-script {
  font-family: 'Caveat', cursive;
  font-size: 1.25rem;
}

.ed-about-info {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.ed-core-expertise h4 {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 0.6rem;
}

.ed-core-expertise ul,
.ed-highlights-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.ed-core-expertise li,
.ed-highlights-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.ed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--ed-primary);
  flex-shrink: 0;
  margin-top: 0.42em;
}

/* Experience Tabs & Glass Footer */
.ed-exp-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ed-exp-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ed-exp-tab {
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  cursor: pointer;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-badge-bg);
  color: var(--ed-ink);
  transition: all 0.2s ease;
}

.ed-exp-tab.is-active {
  background-color: var(--ed-primary);
  border-color: var(--ed-primary);
  color: #ffffff;
}

.ed-exp-panel {
  display: none;
  flex-direction: column;
  gap: 0.9rem;
}

.ed-exp-panel.is-active {
  display: flex;
}

.ed-exp-role {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.ed-exp-meta {
  margin: 0.2rem 0 0;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ed-ink-muted);
}

.ed-exp-glass-bar {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.75rem;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(8px);
  color: #ffffff;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ed-verified-amber {
  color: #F59E0B;
  font-weight: 700;
}

/* Education Arch & Timeline */
.ed-edu-arch-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 1.5rem;
}

.ed-edu-arch {
  position: relative;
  width: 210px;
  height: 195px;
  border-radius: 9999px 9999px 0 0;
  background-color: var(--ed-primary);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

@media (min-width: 640px) {
  .ed-edu-arch {
    width: 240px;
    height: 215px;
  }
}

.ed-edu-arch-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.28), transparent);
  pointer-events: none;
}

.ed-edu-arch-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.ed-edu-arch-fallback {
  color: #ffffff;
  text-align: center;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.ed-edu-arch-fallback span {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.08em;
}

.ed-edu-list {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.ed-edu-capsule {
  display: inline-block;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 0.2rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--ed-primary);
  color: var(--ed-primary);
  background-color: var(--ed-badge-bg);
  margin-bottom: 0.35rem;
}

.ed-edu-degree {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ed-primary);
}

.ed-edu-inst {
  margin: 0.15rem 0 0;
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 700;
}

.ed-edu-desc {
  margin: 0.25rem 0 0;
  font-size: 0.84rem;
  color: var(--ed-ink-muted);
  line-height: 1.55;
  max-width: 50ch;
}

/* Projects Cover & Showcase Slides */
.ed-projects-stack {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

@media (min-width: 640px) {
  .ed-projects-stack {
    gap: 3rem;
  }
}

.ed-proj-cover-top {
  position: relative;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.ed-slots-pill {
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.ed-proj-cover-center {
  position: relative;
  z-index: 10;
  padding: 1rem 0;
}

.ed-proj-cover-title-col {
  flex-direction: column;
  text-align: center;
}

.ed-proj-giant-title {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: clamp(60px, 12vw, 160px);
  line-height: 0.85;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0;
}

.ed-proj-cover-sub {
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 28rem;
  margin: 0.5rem auto 0;
}

.polaroid-card {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
}

.ed-polaroid-left {
  transform: rotate(-6deg);
  animation: editorialSway 6s ease-in-out infinite;
}

.ed-polaroid-right {
  transform: rotate(6deg);
  animation: editorialSwayReverse 7s ease-in-out infinite;
}

@keyframes editorialSway {
  0%, 100% { transform: rotate(-6deg) translateY(0); }
  50% { transform: rotate(-4deg) translateY(-8px); }
}

@keyframes editorialSwayReverse {
  0%, 100% { transform: rotate(6deg) translateY(0); }
  50% { transform: rotate(4deg) translateY(-8px); }
}

.polaroid-card:hover {
  transform: rotate(0deg) scale(1.06) !important;
  z-index: 30;
}

.ed-polaroid-inner {
  padding: 0.625rem 0.625rem 1rem;
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
  width: 200px;
}

.ed-polaroid-media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #171717;
}

.ed-polaroid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ed-polaroid-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-family: ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background-color: var(--ed-primary);
}

.ed-polaroid-caption {
  font-family: 'Caveat', cursive;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0F172A;
  text-align: center;
  margin: 0.5rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ed-proj-cover-foot {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 600;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  padding-top: 1rem;
}

/* Numbered Project Collage & Detail Slides */
.ed-proj-info-col {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.ed-proj-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ed-proj-head-row-gap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ed-proj-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.ed-proj-name-sm {
  margin: 0.35rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.ed-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ed-tag-pill {
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-badge-bg);
  color: var(--ed-primary);
}

.ed-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 0.35rem;
}

.ed-btn-primary,
.ed-btn-pill-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  background-color: var(--ed-primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.78rem;
  text-decoration: none;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.ed-btn-pill-primary,
.ed-btn-pill-outline {
  border-radius: 9999px;
}

.ed-btn-outline,
.ed-btn-pill-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-paper-card);
  color: var(--ed-ink);
  font-weight: 600;
  font-size: 0.78rem;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.ed-btn-outline svg,
.ed-btn-pill-outline svg {
  color: var(--ed-primary);
}

.ed-proj1-collage {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@media (min-width: 640px) {
  .ed-proj1-collage {
    grid-template-columns: repeat(2, 1fr);
    height: 410px;
  }
}

.ed-proj2-top-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .ed-proj2-top-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.ed-proj2-bottom {
  padding-top: 1.25rem;
  border-top: 1px solid var(--ed-paper-border);
  align-items: flex-end;
}

.ed-proj2-desc-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ed-proj3-center {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}

.ed-proj3-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ed-numbered-frame {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  border: 2px solid #ffffff;
  background: #171717;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.ed-frame-h { height: 192px; }
@media (min-width: 640px) { .ed-frame-h { height: 100%; } }
.ed-frame-tall { height: 210px; }
@media (min-width: 640px) { .ed-frame-tall { height: 260px; } }
.ed-frame-330 { height: 256px; }
@media (min-width: 640px) { .ed-frame-330 { height: 330px; } }
.ed-frame-158 { height: 158px; }

.ed-frame-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.ed-numbered-frame:hover .ed-frame-img {
  transform: scale(1.05);
}

.ed-img-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #171717, #262626);
  color: rgba(255, 255, 255, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1rem;
  text-align: center;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.06em;
}

.ed-slot-badge {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
}

.ed-slot-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--ed-primary);
}

.ed-slot-caption {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 10;
  padding: 0.45rem 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
  color: rgba(255, 255, 255, 0.92);
  display: flex;
  justify-content: space-between;
  font-family: ui-monospace, monospace;
  font-size: 10px;
}

.ed-bento-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  text-align: center;
}

.ed-bento-center {
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.ed-bento-center svg { color: #fbbf24; }
.ed-bento-title {
  margin: 0;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.06em;
}
.ed-bento-sub {
  margin: 0;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  opacity: 0.85;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Certifications */
.ed-certs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin: auto 0;
}

@media (min-width: 768px) {
  .ed-certs-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .ed-certs-grid { grid-template-columns: repeat(3, 1fr); }
}

.ed-cert-card {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-paper-card);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  transition: transform 0.25s ease;
}

.ed-cert-card:hover {
  transform: translateY(-4px);
}

.ed-cert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.ed-cert-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  background-color: var(--ed-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ed-cert-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.ed-cert-issuer {
  margin: 0.4rem 0 0;
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ed-ink-muted);
}

.ed-cert-verify-link,
.ed-cert-status {
  padding-top: 0.65rem;
  border-top: 1px solid var(--ed-paper-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
}

.ed-cert-verify-link {
  color: var(--ed-primary);
}

.ed-cert-status {
  font-family: ui-monospace, monospace;
  color: var(--ed-ink-muted);
}

.ed-cert-verified {
  color: var(--ed-primary);
}

.ed-cert-summary-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background-color: var(--ed-primary);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.ed-cert-summary-pill {
  display: inline-block;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
}

.ed-cert-summary-title {
  margin: 0.5rem 0 0;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.85rem;
  letter-spacing: 0.04em;
}

.ed-cert-summary-copy {
  margin: 0.45rem 0 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.55;
}

.ed-cert-summary-foot {
  padding-top: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
}

/* Skills Grid */
.ed-skills-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: auto 0;
}

@media (min-width: 640px) {
  .ed-skills-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .ed-skills-grid { grid-template-columns: repeat(3, 1fr); }
}

.ed-skill-card {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-paper-card);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.65rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.ed-skill-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px -8px rgba(139, 21, 27, 0.18);
  border-color: var(--ed-primary);
}

.ed-skill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.ed-skill-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.ed-skill-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-badge-bg);
}

.ed-skill-name {
  font-weight: 700;
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ed-skill-cat {
  font-family: ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.18rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-badge-bg);
  color: var(--ed-ink-muted);
  flex-shrink: 0;
}

.ed-skill-track {
  height: 6px;
  width: 100%;
  border-radius: 9999px;
  overflow: hidden;
  background-color: var(--ed-badge-bg);
}

.ed-skill-fill {
  height: 100%;
  border-radius: 9999px;
  background-color: var(--ed-primary);
}

/* Testimonials */
.ed-testimonials-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: auto 0;
}

@media (min-width: 640px) { .ed-testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .ed-testimonials-grid { grid-template-columns: repeat(4, 1fr); } }

.ed-testimonial-card {
  padding: 1.25rem;
  border-radius: 1rem;
  background-color: var(--ed-primary);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
  transition: transform 0.25s ease;
}

.ed-testimonial-card:hover {
  transform: translateY(-6px);
}

.ed-testimonial-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ed-testimonial-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.ed-testimonial-meta h4 {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
}

.ed-testimonial-meta p {
  margin: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
}

.ed-stars-row {
  display: flex;
  gap: 2px;
}

.ed-testimonial-quote {
  margin: 0;
  font-size: 0.78rem;
  font-style: italic;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.92);
}

/* Contact Slide */
.ed-contact-portrait-wrap {
  width: min(65vw, 260px);
  aspect-ratio: 3 / 4;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 640px) {
  .ed-contact-portrait-wrap { width: min(26vw, 310px); }
}

.ed-contact-portrait {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 20px 35px rgba(0, 0, 0, 0.55));
}

.ed-contact-initial-card {
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.ed-contact-initial {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 4.5rem;
  color: #ffffff;
}

.ed-contact-script {
  font-family: 'Caveat', cursive;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.85);
}

.ed-contact-right {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ed-thankyou-title {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: clamp(54px, 10vw, 128px);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0;
  color: #ffffff;
}

.ed-contact-pills {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-width: 28rem;
}

.ed-contact-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
  text-decoration: none;
  backdrop-filter: blur(8px);
  transition: background 0.2s ease;
}

.ed-contact-pill:hover {
  background: rgba(255, 255, 255, 0.25);
}

.ed-social-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ed-social-pill {
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.ed-social-pill:hover {
  background: #ffffff;
  color: #111111;
}

.ed-contact-closing {
  margin: 0;
  font-family: 'Caveat', cursive;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.85);
}

.ed-contact-footer {
  position: relative;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0.85;
}

/* Custom Fallback Section */
.ed-custom-card {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid var(--ed-paper-border);
  background-color: var(--ed-paper-card);
  margin: auto 0;
}

.ed-custom-card p {
  margin: 0;
  color: var(--ed-ink-muted);
}

/* Scroll to Top Button */
.ed-scroll-top {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  border: none;
  background-color: var(--ed-primary);
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.ed-scroll-top:hover {
  transform: scale(1.1);
}

@media (prefers-reduced-motion: reduce) {
  .editorial-slide {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .ed-sheen,
  .ed-orb-a,
  .ed-orb-b,
  .ed-lanyard-pendulum,
  .ed-polaroid-left,
  .ed-polaroid-right {
    animation: none !important;
  }
  .fold-text-piece {
    transform: none !important;
    opacity: 1 !important;
  }
  .fold-text-piece::after {
    opacity: 0 !important;
  }
}
`;
}

export function generateEditorialStaticJs(data) {
  const isDarkMode = data.design?.theme === "dark";
  return `${getEditorialLanyardBundleJs()}
(function () {
  var isReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isDarkMode = ${isDarkMode ? "true" : "false"};

  // 1. Slide Scroll Reveal & Cursor Spotlight
  var slides = Array.prototype.slice.call(document.querySelectorAll(".editorial-slide"));
  if (isReduced || typeof IntersectionObserver === "undefined") {
    slides.forEach(function (s) { s.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    slides.forEach(function (s) { io.observe(s); });
  }

  if (!isReduced) {
    document.addEventListener("pointermove", function (e) {
      var target = e.target && e.target.closest ? e.target.closest(".editorial-slide") : null;
      if (!target) return;
      var rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", (e.clientX - rect.left).toFixed(1) + "px");
      target.style.setProperty("--my", (e.clientY - rect.top).toFixed(1) + "px");
    }, { passive: true });
  }

  // 2. Staggered Menu Toggle & Scroll Adaptive Contrast
  var menuWrapper = document.getElementById("edStaggeredMenu");
  var menuToggle = document.getElementById("edMenuToggle");
  var menuPanel = document.getElementById("edStaggeredPanel");

  function setMenuOpen(next) {
    if (!menuWrapper || !menuToggle || !menuPanel) return;
    menuWrapper.classList.toggle("sm-open", next);
    menuToggle.setAttribute("aria-expanded", next ? "true" : "false");
    menuToggle.setAttribute("aria-label", next ? "Close menu" : "Open menu");
    menuPanel.setAttribute("aria-hidden", next ? "false" : "true");
  }

  if (menuToggle && menuWrapper) {
    menuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenuOpen(!menuWrapper.classList.contains("sm-open"));
    });

    var navLinks = menuPanel ? menuPanel.querySelectorAll("a[href^='#']") : [];
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener("click", function () {
        setMenuOpen(false);
      });
    }

    document.addEventListener("click", function (e) {
      if (!menuWrapper.classList.contains("sm-open")) return;
      if (menuPanel && !menuPanel.contains(e.target) && !menuToggle.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuWrapper.classList.contains("sm-open")) {
        setMenuOpen(false);
      }
    });
  }

  // 3. Scroll Top & Adaptive Hamburger Button Color
  var scrollTopBtn = document.getElementById("scrollTopBtn");
  function handleScroll() {
    if (scrollTopBtn) {
      scrollTopBtn.style.display = window.scrollY > 400 ? "flex" : "none";
    }
    if (!menuToggle || isDarkMode) return;
    var rect = menuToggle.getBoundingClientRect();
    var probeY = rect && rect.height > 0 ? rect.top + rect.height / 2 : 36;
    var overColored = false;
    for (var i = 0; i < slides.length; i++) {
      var sRect = slides[i].getBoundingClientRect();
      if (sRect.top <= probeY && sRect.bottom >= probeY) {
        if (slides[i].classList.contains("ed-crimson")) {
          overColored = true;
        }
        break;
      }
    }
    menuToggle.classList.toggle("is-on-light", !overColored);
  }
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: isReduced ? "auto" : "smooth" });
    });
  }

  // 4. Experience Tab Switcher
  var expTabs = document.querySelectorAll(".ed-exp-tab");
  var expPanels = document.querySelectorAll(".ed-exp-panel");
  for (var t = 0; t < expTabs.length; t++) {
    expTabs[t].addEventListener("click", function () {
      var targetIdx = this.getAttribute("data-exp-idx");
      for (var j = 0; j < expTabs.length; j++) {
        expTabs[j].classList.toggle("is-active", expTabs[j].getAttribute("data-exp-idx") === targetIdx);
      }
      for (var k = 0; k < expPanels.length; k++) {
        expPanels[k].classList.toggle("is-active", expPanels[k].getAttribute("data-exp-panel") === targetIdx);
      }
    });
  }

  // 5. Original Three.js WebGL Lanyard Engine (Direct from client Lanyard.tsx)
  var lanyardStage = document.getElementById("edLanyardStage");
  if (lanyardStage && typeof window.mountEditorialLanyard === "function") {
    var lanyardImg = lanyardStage.getAttribute("data-front-image") || "";
    var lanyardLen = parseFloat(lanyardStage.getAttribute("data-strap-length") || "0.62");
    window.mountEditorialLanyard(lanyardStage, {
      frontImage: lanyardImg,
      backImage: lanyardImg,
      strapLength: isNaN(lanyardLen) ? 0.62 : lanyardLen,
      breeze: 0,
      intro: false,
      interactive: true
    });
    if (lanyardStage.querySelector("canvas.lanyard-canvas")) {
      lanyardStage.classList.add("has-webgl");
    }
  }

  // 6. Exact TechText Blueprint Canvas Engine for "PORTFOLIO" Wordmark (Ported from TechText.tsx)
  function initTechText() {
    var heroEl = document.getElementById("hero");
    var container = document.getElementById("edTechTextWrap");
    var canvas = document.getElementById("edTechTextCanvas");
    var fallback = document.getElementById("edHeroWordmarkFallback");
    if (!heroEl || !container || !canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var scratchCanvas = document.createElement("canvas");
    var scratchCtx = scratchCanvas.getContext("2d");
    if (!ctx || !scratchCtx) return;

    var cfg = {
      text: canvas.getAttribute("data-text") || "PORTFOLIO",
      fontFamily: "'Bebas Neue', 'Anton', sans-serif",
      fontWeight: 600,
      fontSize: 210,
      letterSpacing: 0,
      color: "#FFFFFF",
      accentColor: "#FFFFFF",
      dashLength: 4,
      dashGap: 2,
      strokeWidth: 1.5,
      specks: 15,
      bounce: 0.4,
      speed: 1
    };

    var SPRING = 320;
    var KICK_DECAY = 0.62;
    var LABEL_FONT = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

    function clamp01(v) { return Math.min(1, Math.max(0, Number(v) || 0)); }
    function approach(curr, target, dt, seconds) {
      return curr + (target - curr) * (1 - Math.exp(-dt / seconds));
    }
    function noise(a, b, c, d) {
      var vals = [a | 0, b | 0, c | 0, d | 0];
      var h = 2166136261;
      for (var i = 0; i < vals.length; i++) {
        h = Math.imul(h ^ vals[i], 16777619);
        h ^= h >>> 13;
        h = Math.imul(h, 0x5bd1e995);
        h ^= h >>> 15;
      }
      return (h >>> 0) / 4294967296;
    }
    function signed(v) { return v > 0 ? "+" + v : v < 0 ? "-" + (-v) : "0"; }

    var width = 1;
    var height = 1;
    var dpr = 1;
    var layoutKey = "";
    var glyphs = [];
    var wordView = null;
    var clock = 0;
    var pulse = 0;
    var placed = false;
    var dragging = -1;
    var pointer = { x: 0, y: 0, inside: false };
    var grab = { x: 0, y: 0 };
    var lens = { x: 0, y: 0 };
    var frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };
    var kicks = [];
    var press = { x: 0, y: 0, time: 0, index: -1 };
    var lastTs = performance.now();
    var readyDrawn = false;

    function setFont(target, size) {
      target.font = cfg.fontWeight + " " + size + "px " + cfg.fontFamily;
      if ("letterSpacing" in target) {
        target.letterSpacing = (cfg.letterSpacing * size) + "px";
      }
      target.textAlign = "left";
      target.textBaseline = "alphabetic";
    }

    function buildSprite(view, glyphBase, stroke) {
      var pad = Math.ceil(cfg.strokeWidth * 2 + 4);
      var left = glyphBase.box.x1 - pad;
      var top = glyphBase.box.y1 - pad;
      var w = glyphBase.box.x2 - glyphBase.box.x1 + pad * 2;
      var h = glyphBase.box.y2 - glyphBase.box.y1 + pad * 2;
      var img = document.createElement("canvas");
      img.width = Math.max(1, Math.ceil(w * dpr));
      img.height = Math.max(1, Math.ceil(h * dpr));
      var c = img.getContext("2d");
      if (!c) return { image: img, left: left, top: top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      setFont(c, view.size);
      if (stroke) {
        c.lineJoin = "round";
        c.lineWidth = cfg.strokeWidth * 2;
        c.lineCap = "butt";
        c.strokeStyle = cfg.color;
        c.setLineDash([Math.max(1, cfg.dashLength), Math.max(1, cfg.dashGap)]);
        c.strokeText(glyphBase.char, glyphBase.x, view.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = "destination-out";
        c.fillStyle = "#000000";
        c.fillText(glyphBase.char, glyphBase.x, view.baseline);
        c.globalCompositeOperation = "source-over";
      } else {
        c.fillStyle = cfg.color;
        c.fillText(glyphBase.char, glyphBase.x, view.baseline);
      }
      return { image: img, left: left, top: top };
    }

    function ensureLayout() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      var key = width + "|" + height + "|" + dpr;
      if (key === layoutKey && wordView) return wordView;
      layoutKey = key;

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));

      setFont(scratchCtx, cfg.fontSize);
      var m = scratchCtx.measureText(cfg.text);
      var fit = Math.min(
        1,
        (width * 0.9) / Math.max(m.actualBoundingBoxLeft + m.actualBoundingBoxRight, 1),
        (height * 0.68) / Math.max(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, 1)
      );
      var size = cfg.fontSize * fit;
      setFont(scratchCtx, size);
      m = scratchCtx.measureText(cfg.text);
      var inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      var inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      var start = (width - inkWidth) * 0.5;
      var x = start + m.actualBoundingBoxLeft;
      var baseline = (height - inkHeight) * 0.5 + m.actualBoundingBoxAscent;
      var top = baseline - m.actualBoundingBoxAscent;
      var bottom = baseline + m.actualBoundingBoxDescent;

      wordView = { size: size, baseline: baseline, left: x - m.actualBoundingBoxLeft, right: x + m.actualBoundingBoxRight, top: top, bottom: bottom };

      var chars = cfg.text.split("");
      var previous = glyphs;
      glyphs = [];
      var prefix = "";
      for (var i = 0; i < chars.length; i++) {
        var ch = chars[i];
        prefix += ch;
        var own = scratchCtx.measureText(ch);
        var gx = x + scratchCtx.measureText(prefix).width - own.width;
        if (!ch.trim()) continue;
        var base = {
          char: ch,
          x: gx,
          box: {
            x1: gx - own.actualBoundingBoxLeft,
            y1: baseline - own.actualBoundingBoxAscent,
            x2: gx + own.actualBoundingBoxRight,
            y2: baseline + own.actualBoundingBoxDescent
          }
        };
        var kept = previous[glyphs.length];
        glyphs.push({
          char: base.char,
          x: base.x,
          box: base.box,
          offset: kept && kept.char === ch ? kept.offset : { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          outline: kept ? kept.outline : 0,
          fill: buildSprite(wordView, base, false),
          dashes: buildSprite(wordView, base, true)
        });
      }

      if (!readyDrawn && fallback) {
        readyDrawn = true;
        fallback.classList.add("is-canvas-active");
      }
      return wordView;
    }

    function glyphAt(px, py) {
      if (!wordView || py < wordView.top - 28 || py > wordView.bottom + 28) return -1;
      var best = -1;
      var bestDist = Infinity;
      for (var i = 0; i < glyphs.length; i++) {
        var g = glyphs[i];
        var x1 = g.box.x1 + g.offset.x;
        var x2 = g.box.x2 + g.offset.x;
        var d = px < x1 ? x1 - px : px > x2 ? px - x2 : 0;
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return bestDist < 28 ? best : -1;
    }

    function blit(art, dx, dy) {
      ctx.drawImage(art.image, Math.round((art.left + dx) * dpr), Math.round((art.top + dy) * dpr));
    }

    function crisp(value) { return (Math.round(value * dpr) + 0.5) / dpr; }

    function perimeterPoint(distance, w, h) {
      var perim = 2 * (w + h);
      var d = ((distance % perim) + perim) % perim;
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    }

    function drawSpecks(a) {
      var w = frame.x2 - frame.x1;
      var h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      var perim = 2 * (w + h);
      var seed = frame.index + 1;
      var grid = 3;
      ctx.fillStyle = cfg.accentColor;
      ctx.strokeStyle = cfg.accentColor;

      for (var k = 0; k < cfg.specks; k++) {
        var period = 0.5 + noise(seed, k, 11, 0) * 1.2;
        var t = pulse / period + noise(seed, k, 17, 0);
        var cycle = Math.floor(t);
        var life = t - cycle;
        if (life > 0.7) continue;
        var pt = perimeterPoint(noise(seed, k, cycle, 0) * perim, w, h);
        var pick = noise(seed, k, cycle, 2);
        var size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        var large = size >= 8;
        var out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        var sx = frame.x1 + Math.round((pt[0] + pt[2] * out - frame.x1) / grid) * grid;
        var sy = frame.y1 + Math.round((pt[1] + pt[3] * out - frame.y1) / grid) * grid;
        var tone = noise(seed, k, cycle, 3);
        var blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        ctx.globalAlpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        var left = Math.round(sx - size / 2);
        var top = Math.round(sy - size / 2);
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) ctx.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 2, 2);
        } else {
          ctx.fillRect(left, top, size, size);
        }
      }

      for (var j = 0; j < 2; j++) {
        var head = (pulse * 0.42 * cfg.speed + j * 0.5) * perim;
        for (var i = 0; i < 4; i++) {
          var p = perimeterPoint(head - i * 6, w, h);
          var sz = i === 0 ? 3 : 2;
          ctx.globalAlpha = a * [0.95, 0.55, 0.32, 0.16][i];
          ctx.fillRect(Math.round(p[0] - sz / 2), Math.round(p[1] - sz / 2), sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawFrame() {
      var glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      var a = frame.alpha;
      var x1 = crisp(frame.x1);
      var y1 = crisp(frame.y1);
      var x2 = crisp(frame.x2);
      var y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = cfg.accentColor;
      ctx.strokeStyle = cfg.accentColor;
      ctx.lineWidth = 1;

      var moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        var hx = (glyph.box.x1 + glyph.box.x2) * 0.5;
        var hy = (glyph.box.y1 + glyph.box.y2) * 0.5;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.globalAlpha = 0.45 * a;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        ctx.globalAlpha = 0.7 * a;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.globalAlpha = 0.5 * a;
      ctx.stroke();

      var corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
      ctx.beginPath();
      for (var c = 0; c < corners.length; c++) {
        ctx.rect(Math.round(corners[c][0]) - 2, Math.round(corners[c][1]) - 2, 5, 5);
      }
      ctx.globalAlpha = 0.95 * a;
      ctx.fill();
      ctx.globalAlpha = 1;

      drawSpecks(a);

      ctx.font = LABEL_FONT;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = cfg.accentColor;
      ctx.globalAlpha = 0.62 * a;
      var lbl = moved > 1
        ? signed(Math.round(glyph.offset.x)) + ", " + signed(Math.round(-glyph.offset.y))
        : glyph.char + "  " + Math.round(glyph.box.x2 - glyph.box.x1) + " \u00d7 " + Math.round(glyph.box.y2 - glyph.box.y1);
      ctx.fillText(lbl, Math.round(frame.x1), Math.round(frame.y1) - 7);
      ctx.globalAlpha = 1;
    }

    function kickGlyph(index) {
      var strength = (wordView ? wordView.size : 120) * 11;
      kicks.push({ index: index, at: pulse, velocity: strength });
      for (var d = 1; d < glyphs.length; d++) {
        var velocity = strength * Math.pow(KICK_DECAY, d);
        if (velocity < 30) break;
        if (index - d >= 0) kicks.push({ index: index - d, at: pulse + d * 0.055, velocity: velocity });
        if (index + d < glyphs.length) kicks.push({ index: index + d, at: pulse + d * 0.055, velocity: velocity });
      }
    }

    function locate(e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    }

    heroEl.addEventListener("pointermove", function (e) {
      locate(e);
      pointer.inside = true;
    }, { passive: true });

    heroEl.addEventListener("pointerleave", function () {
      if (dragging < 0) pointer.inside = false;
    }, { passive: true });

    heroEl.addEventListener("pointerdown", function (e) {
      if (isReduced) return;
      if (e.target && e.target.closest && (e.target.closest("#edLanyardCard") || e.target.closest(".ed-hero-cta"))) return;
      locate(e);
      pointer.inside = true;
      var index = glyphAt(pointer.x, pointer.y);
      press.x = pointer.x;
      press.y = pointer.y;
      press.time = performance.now();
      press.index = index;
      if (index >= 0) {
        dragging = index;
        grab.x = pointer.x - glyphs[index].offset.x;
        grab.y = pointer.y - glyphs[index].offset.y;
      }
    }, { passive: true });

    window.addEventListener("pointerup", function (e) {
      if (dragging >= 0) {
        dragging = -1;
        var rect = canvas.getBoundingClientRect();
        pointer.inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      if (press.index >= 0 && !isReduced && performance.now() - press.time < 450) {
        var r2 = canvas.getBoundingClientRect();
        if (Math.hypot(e.clientX - r2.left - press.x, e.clientY - r2.top - press.y) < 6) {
          kickGlyph(press.index);
        }
      }
      press.index = -1;
    }, { passive: true });

    window.addEventListener("resize", function () { layoutKey = ""; ensureLayout(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { layoutKey = ""; ensureLayout(); });
    }
    ensureLayout();

    function tick(now) {
      var dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      var view = ensureLayout();
      if (!view) {
        requestAnimationFrame(tick);
        return;
      }

      var damping = 2 * Math.sqrt(SPRING) * (1 - clamp01(cfg.bounce) * 0.96);
      var sweeping = !isReduced && !pointer.inside && dragging < 0;
      if (sweeping) clock += dt * cfg.speed;
      pulse += dt;

      var targetX = pointer.x;
      var targetY = pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      var active = !isReduced && (pointer.inside || sweeping || dragging >= 0);
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        var lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;

      for (var k = kicks.length - 1; k >= 0; k--) {
        if (kicks[k].at > pulse) continue;
        var kg = glyphs[kicks[k].index];
        if (kg) kg.velocity.y -= kicks[k].velocity;
        kicks.splice(k, 1);
      }

      for (var i = 0; i < glyphs.length; i++) {
        var gl = glyphs[i];
        if (i === dragging) {
          gl.offset.x = approach(gl.offset.x, pointer.x - grab.x, dt, 0.03);
          gl.offset.y = approach(gl.offset.y, pointer.y - grab.y, dt, 0.03);
          gl.velocity.x = 0;
          gl.velocity.y = 0;
        } else if (Math.abs(gl.offset.x) > 0.05 || Math.abs(gl.offset.y) > 0.05 || Math.hypot(gl.velocity.x, gl.velocity.y) > 0.5) {
          gl.velocity.x += (-SPRING * gl.offset.x - damping * gl.velocity.x) * dt;
          gl.velocity.y += (-SPRING * gl.offset.y - damping * gl.velocity.y) * dt;
          gl.offset.x += gl.velocity.x * dt;
          gl.offset.y += gl.velocity.y * dt;
        } else {
          gl.offset.x = 0;
          gl.offset.y = 0;
          gl.velocity.x = 0;
          gl.velocity.y = 0;
        }
      }

      var focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0) {
        var fg = glyphs[focus];
        var bx1 = fg.box.x1 + fg.offset.x - 6;
        var by1 = fg.box.y1 + fg.offset.y - 6;
        var bx2 = fg.box.x2 + fg.offset.x + 6;
        var by2 = fg.box.y2 + fg.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1; frame.y1 = by1; frame.x2 = bx2; frame.y2 = by2;
        }
        var glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 ? 1 : 0, dt, 0.1);

      for (var g = 0; g < glyphs.length; g++) {
        var item = glyphs[g];
        var tOut = g === focus && g !== dragging ? 1 : 0;
        item.outline = approach(item.outline, tOut, dt, 0.035);
        if (Math.abs(item.outline - tOut) <= 0.015) item.outline = tOut;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var mIdx = 0; mIdx < glyphs.length; mIdx++) {
        var mg = glyphs[mIdx];
        var dMoved = Math.hypot(mg.offset.x, mg.offset.y);
        if (dMoved > 1) {
          ctx.globalAlpha = Math.min(1, dMoved / 24) * 0.55;
          blit(mg.dashes, 0, 0);
          ctx.globalAlpha = 1;
        }
      }

      for (var rIdx = 0; rIdx < glyphs.length; rIdx++) {
        var rg = glyphs[rIdx];
        if (rg.outline < 0.999) {
          ctx.globalAlpha = 1 - rg.outline;
          blit(rg.fill, rg.offset.x, rg.offset.y);
        }
        if (rg.outline > 0.001) {
          ctx.globalAlpha = rg.outline;
          blit(rg.dashes, rg.offset.x, rg.offset.y);
        }
      }
      ctx.globalAlpha = 1;

      drawFrame();
      if (!isReduced) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }
  initTechText();

  // 7. 3D Paper-Folding Headings (FoldText Scroll Reveal + Cursor Hover-Refold)
  function initFoldText() {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".ed-fold-target"));
    if (!targets.length || isReduced) return;

    var groups = [];
    targets.forEach(function (el) {
      var rawText = (el.textContent || "").trim();
      if (!rawText) return;
      el.setAttribute("aria-label", rawText);
      el.textContent = "";

      var pieces = [];
      var tokens = rawText.split(/(\\s+)/);
      for (var t = 0; t < tokens.length; t++) {
        var part = tokens[t];
        if (!part) continue;
        if (/^\\s+$/.test(part)) {
          el.appendChild(document.createTextNode(part));
          continue;
        }
        var wordSpan = document.createElement("span");
        wordSpan.className = "fold-text-word";
        wordSpan.setAttribute("aria-hidden", "true");
        for (var c = 0; c < part.length; c++) {
          var ch = part.charAt(c);
          var seg = document.createElement("span");
          seg.className = "fold-text-segment";
          var piece = document.createElement("span");
          piece.className = "fold-text-piece";
          piece.setAttribute("data-fold-text", ch);
          piece.textContent = ch;
          piece.style.opacity = "0";
          piece.style.transform = "rotateX(-92deg)";
          seg.appendChild(piece);
          wordSpan.appendChild(seg);
          pieces.push({ el: piece, prog: 0, tilt: 0, aim: 0 });
        }
        el.appendChild(wordSpan);
      }

      var group = { root: el, pieces: pieces, playing: false, done: false, startTime: 0, hovering: false };
      groups.push(group);

      el.addEventListener("pointermove", function (e) {
        if (!group.done) return;
        group.hovering = true;
        var mx = e.clientX;
        var my = e.clientY;
        var radius = 140;
        for (var p = 0; p < group.pieces.length; p++) {
          var r = group.pieces[p].el.getBoundingClientRect();
          var cx = r.left + r.width * 0.5;
          var cy = r.top + r.height * 0.5;
          var d = Math.hypot(mx - cx, my - cy);
          group.pieces[p].aim = d < radius ? Math.pow(1 - d / radius, 1.5) : 0;
        }
        ensureFoldLoop();
      }, { passive: true });

      el.addEventListener("pointerleave", function () {
        group.hovering = false;
        for (var p = 0; p < group.pieces.length; p++) {
          group.pieces[p].aim = 0;
        }
        ensureFoldLoop();
      });
    });

    var foldRaf = 0;
    function ensureFoldLoop() {
      if (!foldRaf) foldRaf = requestAnimationFrame(tickFold);
    }

    function cubicOut(t) {
      var u = 1 - Math.max(0, Math.min(1, t));
      return 1 - u * u * u;
    }

    function tickFold(now) {
      foldRaf = 0;
      var active = false;

      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g];
        if (!grp.playing && !grp.done && !grp.hovering) continue;

        var elapsed = (now - grp.startTime) / 1000;
        var allUnfolded = true;
        var hoverMoving = false;

        for (var p = 0; p < grp.pieces.length; p++) {
          var pc = grp.pieces[p];
          if (grp.playing && !grp.done) {
            var localT = (elapsed - p * 0.045) / 0.65;
            if (localT < 1) allUnfolded = false;
            pc.prog = cubicOut(localT);
          } else if (grp.done) {
            pc.prog = 1;
          }

          pc.tilt += (pc.aim - pc.tilt) * 0.2;
          if (Math.abs(pc.aim - pc.tilt) > 0.004) hoverMoving = true;
          else pc.tilt = pc.aim;

          var angleDeg = -((1 - pc.prog) * 92 + pc.tilt * 45);
          pc.el.style.transform = Math.abs(angleDeg) < 0.05 ? "none" : "rotateX(" + angleDeg.toFixed(2) + "deg)";
          pc.el.style.opacity = pc.prog.toFixed(3);
          var shade = 0.55 * Math.max(0, Math.min(1, (1 - pc.prog) + (pc.tilt * 45) / 90));
          pc.el.style.setProperty("--fold-crease", shade.toFixed(3));
        }

        if (grp.playing && allUnfolded) {
          grp.done = true;
          grp.playing = false;
        }
        if (grp.playing || hoverMoving || grp.hovering) active = true;
      }

      if (active) foldRaf = requestAnimationFrame(tickFold);
    }

    function revealGroup(grp) {
      if (grp.done || grp.playing) return;
      grp.playing = true;
      grp.startTime = performance.now();
      ensureFoldLoop();
    }

    if (typeof IntersectionObserver !== "undefined") {
      var foldIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          for (var g = 0; g < groups.length; g++) {
            if (groups[g].root === entry.target) {
              revealGroup(groups[g]);
              break;
            }
          }
          foldIo.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      groups.forEach(function (grp) { foldIo.observe(grp.root); });
    } else {
      groups.forEach(revealGroup);
    }
  }
  initFoldText();
})();`;
}
