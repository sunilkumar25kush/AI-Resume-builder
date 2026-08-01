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
    name: "Classic",
    description: "Serif type, centered header — the traditional standard.",
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
];

export function getTemplate(id: ResumeTemplate | undefined): ResumeTemplateDef {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
}
