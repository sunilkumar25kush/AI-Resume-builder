import type { ComponentType } from "react";

import { BuffaloRoomTemplate } from "@/components/portfolios/templates/BuffaloRoomTemplate";
import { DannyWebGLTemplate } from "@/components/portfolios/templates/DannyWebGLTemplate";
import { DatImmersiveTemplate } from "@/components/portfolios/templates/DatImmersiveTemplate";
import { DeveloperTemplate } from "@/components/portfolios/templates/DeveloperTemplate";
import { DevPortTemplate } from "@/components/portfolios/templates/DevPortTemplate";
import { MinimalTemplate } from "@/components/portfolios/templates/MinimalTemplate";
import type { PortfolioTemplateProps } from "@/components/portfolios/templates/MinimalTemplate";
import { ModernCreativeTemplate } from "@/components/portfolios/templates/ModernCreativeTemplate";
import { MotionCanvasTemplate } from "@/components/portfolios/templates/MotionCanvasTemplate";
import { NahuelCosmosTemplate } from "@/components/portfolios/templates/NahuelCosmosTemplate";
import { NareshKeyboardTemplate } from "@/components/portfolios/templates/NareshKeyboardTemplate";
import { NotebookRoomTemplate } from "@/components/portfolios/templates/NotebookRoomTemplate";
import { OpenSourceTemplate } from "@/components/portfolios/templates/OpenSourceTemplate";
import { PortfolioOSTemplate } from "@/components/portfolios/templates/PortfolioOSTemplate";
import { PosterTemplate } from "@/components/portfolios/templates/PosterTemplate";
import { RamenShopTemplate } from "@/components/portfolios/templates/RamenShopTemplate";
import { ResumePageTemplate } from "@/components/portfolios/templates/ResumePageTemplate";
import { SameeraMaterialTemplate } from "@/components/portfolios/templates/SameeraMaterialTemplate";
import { SeyiEditorialTemplate } from "@/components/portfolios/templates/SeyiEditorialTemplate";
import { SpotlightTemplate } from "@/components/portfolios/templates/SpotlightTemplate";
import { WorldfolioTemplate } from "@/components/portfolios/templates/WorldfolioTemplate";
import type { PortfolioTemplateId } from "@/types/portfolio";

export type TemplateCategory = "all" | "3d" | "technical" | "creative" | "editorial" | "minimal";

export interface TemplateDefinition {
  id: PortfolioTemplateId;
  name: string;
  description: string;
  idealFor: string;
  category: "3d" | "technical" | "creative" | "editorial" | "minimal";
  features?: string[];
  badge?: string;
  author?: string;
  license?: string;
  previewImage?: string;
  previewVideo?: string;
}

export const TEMPLATE_REGISTRY: Record<PortfolioTemplateId, ComponentType<PortfolioTemplateProps>> = {
  devport: DevPortTemplate,
  creative: ModernCreativeTemplate,
  modern: ModernCreativeTemplate,
  developer: DeveloperTemplate,
  minimal: MinimalTemplate,
  executive: MinimalTemplate,
  "oss-maintainer": OpenSourceTemplate,
  "motion-studio": MotionCanvasTemplate,
  "seyi-editorial": SeyiEditorialTemplate,
  "sameera-material": SameeraMaterialTemplate,
  "resume-page": ResumePageTemplate,
  poster: PosterTemplate,
  spotlight: SpotlightTemplate,
  "dat-immersive": DatImmersiveTemplate,
  "nahuel-cosmos": NahuelCosmosTemplate,
  "ramen-shop": RamenShopTemplate,
  "danny-webgl": DannyWebGLTemplate,
  "portfolio-os": PortfolioOSTemplate,
  "buffalo-room": BuffaloRoomTemplate,
  "folio-2019": WorldfolioTemplate,
  "notebook-room": NotebookRoomTemplate,
  "naresh-keyboard": NareshKeyboardTemplate,
};

export const TEMPLATE_METADATA: TemplateDefinition[] = [
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
  {
    id: "oss-maintainer",
    name: "Open-Source Maintainer",
    description: "GitHub-native developer aesthetic with pinned repositories, contributions, and ecosystem badges.",
    idealFor: "Open Source Authors, Systems Engineers, Core Contributors",
    category: "technical",
    features: ["GitHub Telemetry", "Pinned Repositories", "Ecosystem Badges", "Repository Stats"],
    badge: "OSS ★",
    author: "GitSkins Community",
    license: "MIT",
  },
  {
    id: "motion-studio",
    name: "Motion Canvas",
    description: "Kinetic typography, smooth Framer Motion viewport transitions, and full-screen project decks.",
    idealFor: "Creative Developers, UI/UX Designers, Motion Animators",
    category: "creative",
    features: ["Kinetic Typography", "Framer Motion Transitions", "Full-Screen Project Decks"],
    badge: "Kinetic ★",
    author: "Hamish Williams",
    license: "MIT",
  },
  {
    id: "seyi-editorial",
    name: "Kinetic Editorial",
    description: "Oluwaseyi-inspired high-fashion editorial magazine with kinetic ticker ribbons and narrative stories.",
    idealFor: "Digital Designers, Creative Directors, Stylists, Storytellers",
    category: "editorial",
    features: ["High-Fashion Magazine", "Kinetic Ticker Ribbon", "Narrative Stories", "Fluid Typography"],
    badge: "Editorial",
    author: "Oluwadare Oluwaseyi",
    license: "MIT",
  },
  {
    id: "sameera-material",
    name: "Material Journal",
    description: "Material Design 3 card elevations, organic pastel surfaces, and journal typography.",
    idealFor: "Product Managers, UX Researchers, Technical Writers",
    category: "minimal",
    features: ["Material Design 3", "Card Elevations", "Pastel Surfaces", "Journal Layout"],
    badge: "Clean",
    author: "Sameera Wijerathna",
    license: "Author Permission",
  },
  {
    id: "resume-page",
    name: "One-Page Résumé",
    description: "Structured A4 print-ready grid designed for hiring managers and ATS readability.",
    idealFor: "Corporate Applicants, Academics, Consultants",
    category: "minimal",
    features: ["A4 Print CSS", "ATS-Friendly", "Structured Recruiter Grid", "High Readability"],
    badge: "Recruiter-Ready",
    author: "GitSkins Native",
    license: "MIT",
  },
  {
    id: "poster",
    name: "Poster Brutalist",
    description: "High-contrast brutalist monochrome typography, stark geometric borders, and poster layouts.",
    idealFor: "Architects, Avant-garde Creators, Visual Artists",
    category: "creative",
    features: ["Brutalist Monochrome", "Dynamic Viewport Sizing (vw)", "Staggered Floating Cards"],
    badge: "Brutalist",
    author: "GitSkins Native",
    license: "MIT",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Obsidian & crimson aesthetic with avatar halo, live metrics, and featured work spotlights.",
    idealFor: "Tech Leads, Founders, Startup Creators",
    category: "creative",
    features: ["Obsidian & Crimson", "Avatar Halo", "Video Spotlight Hero", "Connected Expertise Tree"],
    badge: "Spotlight ★",
    author: "GitSkins Native",
    license: "MIT",
  },
  {
    id: "dat-immersive",
    name: "Immersive Engineer",
    description: "Glassmorphic cyan telemetry HUD with real-time cyber status and modular node grid.",
    idealFor: "DevOps, SREs, Systems Architects, Cyber Security",
    category: "technical",
    features: ["Glassmorphism", "Real-Time Clock (UTC)", "Telemetry HUD", "Glowing Gradient Borders"],
    badge: "HUD Telemetry",
    author: "Trần Hữu Đạt",
    license: "MIT",
  },
  {
    id: "nahuel-cosmos",
    name: "Nahuel Cosmos",
    description: "Constellation particle aesthetic with deep obsidian and cosmic gold typography.",
    idealFor: "Creative Explorers, Space Enthusiasts, Frontend Engineers",
    category: "creative",
    features: ["Constellation Star Grid", "Gold Foil Typography", "Interactive Particles", "Cosmic Dark"],
    badge: "Cosmic",
    author: "Nahuel Carrizo",
    license: "Author Permission",
  },
  {
    id: "ramen-shop",
    name: "Ramen Shop 3D",
    description: "Cyberpunk retro-futuristic Japanese ramen arcade diner with 3D canvas and neon aesthetics.",
    idealFor: "Game Developers, Cyberpunk Creators, Creative Technologists",
    category: "3d",
    features: ["3D WebGL Canvas", "Neon Cyberpunk Diner", "Sound Effects Toggle", "Arcade Cabinet Cards"],
    badge: "3D WebGL ★",
    author: "enderh3art",
    license: "Author Permission",
    previewImage: "/portfolio-templates/previews/ramen-shop.jpg",
    previewVideo: "/portfolio-templates/previews/ramen-shop.mp4",
  },
  {
    id: "danny-webgl",
    name: "WebGL Résumé",
    description: "Fluid shader background plane with minimal Swiss typography and fluid hover interactions.",
    idealFor: "Shader Developers, Creative Coders, Designers",
    category: "creative",
    features: ["Fluid GLSL Shader", "Interactive Background Plane", "Minimal Swiss Typography"],
    badge: "Shader WebGL",
    author: "Danny Garcia",
    license: "ISC",
  },
  {
    id: "portfolio-os",
    name: "Portfolio OS",
    description: "Interactive 3D desktop OS window manager environment with app windows and menubar.",
    idealFor: "Systems Developers, Unix Fans, Software Engineers",
    category: "3d",
    features: ["Desktop OS GUI", "Draggable App Windows", "Workspace Navigator", "System Menubar"],
    badge: "Desktop OS",
    author: "Henry Heffernan",
    license: "MIT",
  },
  {
    id: "buffalo-room",
    name: "Buffalo Room 3D",
    description: "Isometric 3D interactive room environment with warm clay surfaces and spatial objects.",
    idealFor: "Spatial Designers, 3D Generalists, Architects",
    category: "3d",
    features: ["Isometric 3D Room", "Warm Clay Surfaces", "Ambient Lighting", "HUD Overlay"],
    badge: "Isometric 3D",
    author: "Byunggeun Cho",
    license: "Author Permission",
  },
  {
    id: "folio-2019",
    name: "Worldfolio (folio-2019)",
    description: "Playful low-poly physics vehicle terrain world with zone checkpoints and high-impact arcade style.",
    idealFor: "Game Designers, Interactive Web Artists, Creative Developers",
    category: "3d",
    features: ["Low-Poly Physics Terrain", "Vehicle Driving Simulation", "Gamified Navigation", "Arcade Style"],
    badge: "Physics 3D ★",
    author: "Bruno Simon",
    license: "MIT",
  },
  {
    id: "notebook-room",
    name: "Notebook Room 3D",
    description: "Isometric 3D desk journal built with warm forest tones and parchment notebook pages.",
    idealFor: "Writers, Creative Developers, Journal Authors",
    category: "3d",
    features: ["Isometric Desk Journal", "Warm Forest Palette", "Parchment Notebook Pages", "Story Narratives"],
    badge: "Journal 3D",
    author: "Arthur Panazolo",
    license: "MIT",
  },
  {
    id: "naresh-keyboard",
    name: "Skills Keyboard 3D",
    description: "Interactive mechanical key switch matrix with responsive keycaps and firmware credentials.",
    idealFor: "Hardware Enthusiasts, Mechanical Keyboard Fans, Frontend Devs",
    category: "3d",
    features: ["Mechanical Keyboard Matrix", "Tactile Audio", "Responsive Keycaps", "Skill Proof Modals"],
    badge: "Keyboard 3D",
    author: "Naresh Khatri",
    license: "MIT + Permission",
  },
];

export const DEFAULT_TEMPLATE: PortfolioTemplateId = "devport";

export const VALID_TEMPLATE_IDS = [
  "devport",
  "creative",
  "modern",
  "developer",
  "minimal",
  "executive",
  "oss-maintainer",
  "motion-studio",
  "seyi-editorial",
  "sameera-material",
  "resume-page",
  "poster",
  "spotlight",
  "dat-immersive",
  "nahuel-cosmos",
  "ramen-shop",
  "danny-webgl",
  "portfolio-os",
  "buffalo-room",
  "folio-2019",
  "notebook-room",
  "naresh-keyboard",
] as const;

/**
 * Resolves a template component by ID.
 * Strictly uses the compile-time allowlist.
 * If unknown or missing, securely defaults to `DevPortTemplate`.
 */
export function getPortfolioTemplate(templateId?: string | null): ComponentType<PortfolioTemplateProps> {
  if (!templateId) return DevPortTemplate;
  const normalized = templateId.toLowerCase().trim() as PortfolioTemplateId;

  if (TEMPLATE_REGISTRY[normalized]) {
    return TEMPLATE_REGISTRY[normalized];
  }

  // Secure default fallback
  return DevPortTemplate;
}
