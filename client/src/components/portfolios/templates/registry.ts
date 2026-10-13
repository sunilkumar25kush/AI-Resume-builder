import type { ComponentType } from "react";

import { DevPortTemplate } from "@/components/portfolios/templates/DevPortTemplate";
import { DeveloperTemplate } from "@/components/portfolios/templates/DeveloperTemplate";
import { MinimalTemplate } from "@/components/portfolios/templates/MinimalTemplate";
import type { PortfolioTemplateProps } from "@/components/portfolios/templates/MinimalTemplate";

export interface TemplateDefinition {
  id: "devport" | "minimal" | "developer";
  name: string;
  description: string;
  idealFor: string;
}

export const TEMPLATE_REGISTRY: Record<"devport" | "minimal" | "developer", ComponentType<PortfolioTemplateProps>> = {
  devport: DevPortTemplate,
  minimal: MinimalTemplate,
  developer: DeveloperTemplate,
};

export const TEMPLATE_METADATA: TemplateDefinition[] = [
  {
    id: "devport",
    name: "DevPort",
    description: "Cosmic dark aesthetics, orbital avatar, glowing typography, smooth scroll, and tech badges.",
    idealFor: "Full-Stack Developers, Tech Enthusiasts, Creative Engineers, UI/UX Devs",
  },
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

export const DEFAULT_TEMPLATE = "devport";
export const VALID_TEMPLATE_IDS = ["devport", "minimal", "developer"] as const;
export type ValidTemplateId = (typeof VALID_TEMPLATE_IDS)[number];

/**
 * Resolves a template component by ID.
 * Strictly uses the compile-time allowlist.
 * If unknown or missing, defaults to `DevPortTemplate`.
 */
export function getPortfolioTemplate(templateId?: string | null): ComponentType<PortfolioTemplateProps> {
  if (!templateId) return DevPortTemplate;
  const normalized = templateId.toLowerCase().trim();

  if (normalized === "devport") return DevPortTemplate;
  if (normalized === "developer") return DeveloperTemplate;
  if (normalized === "minimal") return MinimalTemplate;
  if (normalized === "modern" || normalized === "creative") return DevPortTemplate;

  // Secure default fallback
  return DevPortTemplate;
}

