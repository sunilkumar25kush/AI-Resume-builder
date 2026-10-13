import type { ComponentType } from "react";

import { DevPortTemplate } from "@/components/portfolios/templates/DevPortTemplate";
import { DeveloperTemplate } from "@/components/portfolios/templates/DeveloperTemplate";
import { MinimalTemplate } from "@/components/portfolios/templates/MinimalTemplate";
import { ModernCreativeTemplate } from "@/components/portfolios/templates/ModernCreativeTemplate";
import type { PortfolioTemplateProps } from "@/components/portfolios/templates/MinimalTemplate";

export interface TemplateDefinition {
  id: "devport" | "creative" | "developer" | "minimal";
  name: string;
  description: string;
  idealFor: string;
}

export const TEMPLATE_REGISTRY: Record<"devport" | "creative" | "developer" | "minimal", ComponentType<PortfolioTemplateProps>> = {
  devport: DevPortTemplate,
  creative: ModernCreativeTemplate,
  developer: DeveloperTemplate,
  minimal: MinimalTemplate,
};

export const TEMPLATE_METADATA: TemplateDefinition[] = [
  {
    id: "devport",
    name: "DevPort",
    description: "Cosmic dark aesthetics, orbital avatar, glowing typography, smooth scroll, and tech badges.",
    idealFor: "Full-Stack Developers, Tech Enthusiasts, Creative Engineers, UI/UX Devs",
  },
  {
    id: "creative",
    name: "Modern 3D",
    description: "Midnight indigo theme, 3D avatar spotlight, electric purple gradient, and floating experience card.",
    idealFor: "Data Analysts, Product Designers, Modern Engineers, Creatives",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Terminal aesthetics, interactive project cards, and tech stack badges.",
    idealFor: "Software Engineers, Cloud Architects, Full Stack Developers",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean typography, quiet elegance, and refined whitespace.",
    idealFor: "Executives, Designers, Product Managers, Writers",
  },
];

export const DEFAULT_TEMPLATE = "devport";
export const VALID_TEMPLATE_IDS = ["devport", "creative", "developer", "minimal"] as const;
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
  if (normalized === "creative" || normalized === "modern") return ModernCreativeTemplate;
  if (normalized === "developer") return DeveloperTemplate;
  if (normalized === "minimal" || normalized === "executive") return MinimalTemplate;

  // Secure default fallback
  return DevPortTemplate;
}


