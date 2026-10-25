import type { ComponentType } from "react";

import { DeveloperTemplate } from "@/components/portfolios/templates/DeveloperTemplate";
import { DevPortTemplate } from "@/components/portfolios/templates/DevPortTemplate";
import { MinimalTemplate } from "@/components/portfolios/templates/MinimalTemplate";
import type { PortfolioTemplateProps } from "@/components/portfolios/templates/MinimalTemplate";
import { ModernCreativeTemplate } from "@/components/portfolios/templates/ModernCreativeTemplate";
import { PosterTemplate } from "@/components/portfolios/templates/PosterTemplate";
import { SpotlightTemplate } from "@/components/portfolios/templates/SpotlightTemplate";
import type { PortfolioTemplateId } from "@/types/portfolio";

export type TemplateCategory = "all" | "creative" | "technical" | "minimal";

export interface TemplateDefinition {
  id: PortfolioTemplateId;
  name: string;
  description: string;
  idealFor: string;
  category: "creative" | "technical" | "minimal";
  features?: string[];
  badge?: string;
  author?: string;
  license?: string;
  previewImage?: string;
  previewVideo?: string;
}

export const TEMPLATE_REGISTRY: Record<PortfolioTemplateId, ComponentType<PortfolioTemplateProps>> = {
  spotlight: SpotlightTemplate,
  poster: PosterTemplate,
  devport: DevPortTemplate,
  creative: ModernCreativeTemplate,
  modern: ModernCreativeTemplate,
  developer: DeveloperTemplate,
  minimal: MinimalTemplate,
  executive: MinimalTemplate,
};

export const TEMPLATE_METADATA: TemplateDefinition[] = [
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Obsidian & crimson aesthetic with avatar halo, dynamic typewriter, connected expertise tree, and featured project spotlight.",
    idealFor: "Frontend Engineers, Full-Stack Devs, Founders, Creative Tech Leads",
    category: "creative",
    features: ["Obsidian & Crimson", "Hanging Portrait Halo", "Dual CTA Buttons", "Connected Expertise Tree"],
    badge: "Spotlight ★",
    author: "GitSkins Native",
    license: "MIT",
  },
  {
    id: "poster",
    name: "Poster Brutalist",
    description: "High-contrast brutalist monochrome typography, giant watermark, infinite marquee ticker, and staggered cards.",
    idealFor: "Architects, Visual Artists, Creative Engineers, UI Designers",
    category: "creative",
    features: ["Brutalist Monochrome", "Dynamic Viewport Sizing (vw)", "Infinite Marquee", "Staggered Floating Cards"],
    badge: "Brutalist ★",
    author: "GitSkins Native",
    license: "MIT",
  },
  {
    id: "devport",
    name: "DevPort",
    description: "Cosmic dark aesthetics, orbital avatar, glowing typography, smooth scroll, and tech badges.",
    idealFor: "Full-Stack Developers, Tech Enthusiasts, Creative Engineers, UI/UX Devs",
    category: "technical",
    features: ["Cosmic Dark Theme", "Orbital Avatar Ring", "Tech Badge Grid", "Floating Experience Card"],
    badge: "Featured ★",
  },
  {
    id: "creative",
    name: "Modern 3D",
    description: "Midnight indigo theme, 3D avatar spotlight, electric purple gradient, and floating experience card.",
    idealFor: "Data Analysts, Product Designers, Modern Engineers, Creatives",
    category: "creative",
    features: ["Midnight Indigo", "3D Avatar Spotlight", "Electric Purple Gradient", "Glassmorphic Cards"],
    badge: "Popular ★",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Terminal aesthetics, interactive project cards, and tech stack badges.",
    idealFor: "Software Engineers, Cloud Architects, Full Stack Developers",
    category: "technical",
    features: ["CLI Terminal Header", "Code Syntax Blocks", "Monospace Accents", "Blinking Cursor"],
    badge: "Engineering",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean typography, quiet elegance, and refined whitespace.",
    idealFor: "Executives, Designers, Product Managers, Writers",
    category: "minimal",
    features: ["Minimalist Executive", "Refined Whitespace", "Single-Column Reading", "Zero Distraction"],
    badge: "Editorial",
  },
];

export const DEFAULT_TEMPLATE: PortfolioTemplateId = "spotlight";

export const VALID_TEMPLATE_IDS = [
  "spotlight",
  "poster",
  "devport",
  "creative",
  "modern",
  "developer",
  "minimal",
  "executive",
] as const;

/**
 * Resolves a template component by ID.
 * Strictly uses the compile-time allowlist.
 * If unknown or missing, securely defaults to `SpotlightTemplate`.
 */
export function getPortfolioTemplate(templateId?: string | null): ComponentType<PortfolioTemplateProps> {
  if (!templateId) return SpotlightTemplate;
  const normalized = templateId.toLowerCase().trim() as PortfolioTemplateId;

  if (TEMPLATE_REGISTRY[normalized]) {
    return TEMPLATE_REGISTRY[normalized];
  }

  // Secure default fallback
  return SpotlightTemplate;
}
