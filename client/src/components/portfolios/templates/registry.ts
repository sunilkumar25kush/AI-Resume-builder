import type { ComponentType } from "react";

import { DeveloperTemplate } from "@/components/portfolios/templates/DeveloperTemplate";
import { MinimalTemplate } from "@/components/portfolios/templates/MinimalTemplate";
import type { PortfolioTemplateProps } from "@/components/portfolios/templates/MinimalTemplate";

export interface TemplateDefinition {
  id: "minimal" | "developer";
  name: string;
  description: string;
  idealFor: string;
}

export const TEMPLATE_REGISTRY: Record<"minimal" | "developer", ComponentType<PortfolioTemplateProps>> = {
  minimal: MinimalTemplate,
  developer: DeveloperTemplate,
};

export const TEMPLATE_METADATA: TemplateDefinition[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean typography, quiet elegance, and refined whitespace.",
    idealFor: "Executives, Designers, Product Managers, Writers",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Terminal aesthetics, interactive project cards, and tech stack badges.",
    idealFor: "Software Engineers, Cloud Architects, Full Stack Developers",
  },
];

export const DEFAULT_TEMPLATE = "minimal";
export const VALID_TEMPLATE_IDS = ["minimal", "developer"] as const;
export type ValidTemplateId = (typeof VALID_TEMPLATE_IDS)[number];

/**
 * Resolves a template component by ID.
 * Strictly uses the compile-time allowlist.
 * If unknown or missing, securely defaults to `MinimalTemplate`.
 */
export function getPortfolioTemplate(templateId?: string | null): ComponentType<PortfolioTemplateProps> {
  if (!templateId) return MinimalTemplate;
  const normalized = templateId.toLowerCase().trim();

  if (normalized === "developer") return DeveloperTemplate;
  if (normalized === "minimal") return MinimalTemplate;
  if (normalized === "modern") return DeveloperTemplate; // Map legacy/alias modern to developer

  // Secure default fallback for any unapproved or malicious input
  return MinimalTemplate;
}
