import type { ResumeTemplate } from "@/types";

export interface ResumeTemplateDef {
  id: ResumeTemplate;
  name: string;
  description: string;
  reference?: string;
  accentColor?: string;
}

export const RESUME_TEMPLATES: ResumeTemplateDef[] = [
  {
    id: "classic-rose-serif",
    name: "Classic Rose Serif",
    description: "Centered serif with crimson accent (#C2185B), justified summary, and full-width wrapped skills line.",
    reference: "Reference E",
    accentColor: "#C2185B",
  },
  {
    id: "navy-sidebar-timeline",
    name: "Navy Sidebar Timeline",
    description: "Two-column layout (33/67) with dark navy sidebar (#2B3450), 140px photo, white badges, and work timeline.",
    reference: "Reference A",
    accentColor: "#2B3450",
  },
  {
    id: "classic-ats-executive",
    name: "Classic ATS Executive",
    description: "Monochrome serif with small-caps name, 3-column skills bullet grid, 1.5px divider, and maximum ATS safety.",
    reference: "Reference B",
    accentColor: "#000000",
  },
  {
    id: "photo-header-split-timeline",
    name: "Photo Header Split Timeline",
    description: "140x140 photo header, Montserrat name, and 2-column split experience (Left date/company, Right role/bullets).",
    reference: "Reference C",
    accentColor: "#222222",
  },
  {
    id: "dense-analyst-serif",
    name: "Dense Analyst Serif",
    description: "Centered small-caps name, contact icons, summary bullets, 4-col coursework, and dense one-page vertical rhythm.",
    reference: "Reference D",
    accentColor: "#000000",
  },
  {
    id: "right-sidebar-light",
    name: "Right Sidebar Light",
    description: "Two-column (68/32) with light gray right sidebar (#F3F4F6), indigo accent (#4F46E5), and skill pills.",
    reference: "T6 Light",
    accentColor: "#4F46E5",
  },
  {
    id: "banner-header",
    name: "Banner Header",
    description: "Full-width colored banner (#0F4C81) with white text, left-accent headings, and bordered project cards.",
    reference: "T7 Banner",
    accentColor: "#0F4C81",
  },
  {
    id: "compact-fresher-ats",
    name: "Compact Fresher ATS",
    description: "Pure B&W Arial, ultra-compact. Education & projects placed before experience, one-line skills rows.",
    reference: "T8 Fresher",
    accentColor: "#000000",
  },
  {
    id: "creative-blocks",
    name: "Creative Blocks",
    description: "Purple pill headings (#7C3AED), colored surname, rounded skill tags, and top-bordered project cards.",
    reference: "T9 Creative",
    accentColor: "#7C3AED",
  },
  {
    id: "elegant-serif-gold",
    name: "Elegant Serif Gold",
    description: "Centered Playfair Display name, gold divider (#B08D57), headings with side lines (— Experience —), Lora body.",
    reference: "T10 Gold",
    accentColor: "#B08D57",
  },
];

const LEGACY_MAP: Record<string, ResumeTemplate> = {
  classic: "classic-rose-serif",
  "classic-serif-rose": "classic-rose-serif",
  modern: "photo-header-split-timeline",
  minimal: "classic-ats-executive",
  compact: "dense-analyst-serif",
  executive: "classic-ats-executive",
  creative: "classic-rose-serif",
  startup: "right-sidebar-light",
  "modern-pro": "photo-header-split-timeline",
  "tech-engineer": "dense-analyst-serif",
  "navy-executive": "classic-ats-executive",
  timeline: "navy-sidebar-timeline",
};

export function getTemplate(id: ResumeTemplate | undefined): ResumeTemplateDef {
  if (!id) return RESUME_TEMPLATES[0];
  const targetId = LEGACY_MAP[id] || id;
  return RESUME_TEMPLATES.find((t) => t.id === targetId) ?? RESUME_TEMPLATES[0];
}
