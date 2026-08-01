import type { ResumeTemplate } from "@/types";

export interface ResumeTemplateDef {
  id: ResumeTemplate;
  name: string;
  description: string;
  className: string;
}

/**
 * Built-in resume templates. The `className` is applied to the preview
 * wrapper — the actual styles live in `src/index.css` under the same
 * class names (static strings so Tailwind/shadcn never purge them).
 */
export const RESUME_TEMPLATES: ResumeTemplateDef[] = [
  {
    id: "classic",
    name: "ATS Professional",
    description: "Serif type, centered header — the traditional ATS-safe standard.",
    className: "resume-tpl-classic",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean sans-serif with a blue accent bar.",
    className: "resume-tpl-modern",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Light spacing, no accent color, lots of air.",
    className: "resume-tpl-minimal",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Smaller type for dense, one-page resumes.",
    className: "resume-tpl-compact",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Bold serif with a gold accent — boardroom-ready.",
    className: "resume-tpl-executive",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant purple/pink accents for design roles.",
    className: "resume-tpl-creative",
  },
  {
    id: "startup",
    name: "Startup",
    description: "Bold indigo and modern sans — product-team energy.",
    className: "resume-tpl-startup",
  },
  {
    id: "google",
    name: "Google Style",
    description: "Playful multi-color name, clean and minimal body.",
    className: "resume-tpl-google",
  },
  {
    id: "microsoft",
    name: "Microsoft Style",
    description: "Crisp sans-serif with a single strong blue accent.",
    className: "resume-tpl-microsoft",
  },
  {
    id: "harvard",
    name: "Harvard",
    description: "Academic serif with a crimson accent.",
    className: "resume-tpl-harvard",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined serif, thin rules and a rose-gold accent.",
    className: "resume-tpl-elegant",
  },
];

export function getTemplate(id: ResumeTemplate | undefined): ResumeTemplateDef {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
}
