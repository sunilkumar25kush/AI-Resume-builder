import { ClassicRoseSerif } from "./ClassicRoseSerif.jsx";
import { NavySidebarTimeline } from "./NavySidebarTimeline.jsx";
import { ClassicAtsExecutive } from "./ClassicAtsExecutive.jsx";
import { PhotoHeaderSplitTimeline } from "./PhotoHeaderSplitTimeline.jsx";
import { DenseAnalystSerif } from "./DenseAnalystSerif.jsx";
import { RightSidebarLight } from "./RightSidebarLight.jsx";
import { BannerHeader } from "./BannerHeader.jsx";
import { CompactFresherAts } from "./CompactFresherAts.jsx";
import { CreativeBlocks } from "./CreativeBlocks.jsx";
import { ElegantSerifGold } from "./ElegantSerifGold.jsx";

export const TEMPLATES = [
  {
    id: "classic-rose-serif",
    name: "Classic Rose Serif",
    description: "Centered serif with crimson accent (#C2185B), justified summary, and full-width wrapped skills line.",
    component: ClassicRoseSerif,
    defaultTheme: {
      accentColor: "#C2185B",
      fontSize: "14px",
    },
    reference: "Reference E (T1)",
  },
  {
    id: "navy-sidebar-timeline",
    name: "Navy Sidebar Timeline",
    description: "Two-column layout (33/67) with dark navy sidebar (#2B3450), 140px photo, white badges, and work timeline.",
    component: NavySidebarTimeline,
    defaultTheme: {
      accentColor: "#2B3450",
      fontSize: "14px",
    },
    reference: "Reference A (T2)",
  },
  {
    id: "classic-ats-executive",
    name: "Classic ATS Executive",
    description: "Monochrome serif with small-caps name, 3-column skills bullet grid, 1.5px divider, and maximum ATS safety.",
    component: ClassicAtsExecutive,
    defaultTheme: {
      accentColor: "#000000",
      fontSize: "14px",
    },
    reference: "Reference B (T3)",
  },
  {
    id: "photo-header-split-timeline",
    name: "Photo Header, Split Timeline",
    description: "140x140 photo header, Montserrat name, and 2-column split experience (Left date/company, Right role/bullets).",
    component: PhotoHeaderSplitTimeline,
    defaultTheme: {
      accentColor: "#222222",
      fontSize: "14px",
    },
    reference: "Reference C (T4)",
  },
  {
    id: "dense-analyst-serif",
    name: "Dense Analyst Serif",
    description: "Centered small-caps name, contact icons, summary bullets, 4-col coursework, and dense one-page vertical rhythm.",
    component: DenseAnalystSerif,
    defaultTheme: {
      accentColor: "#000000",
      fontSize: "13.5px",
    },
    reference: "Reference D (T5)",
  },
  {
    id: "right-sidebar-light",
    name: "Right Sidebar Light",
    description: "Two-column (68/32) with light gray right sidebar (#F3F4F6), indigo accent (#4F46E5), and skill pills.",
    component: RightSidebarLight,
    defaultTheme: {
      accentColor: "#4F46E5",
      fontSize: "14px",
    },
    reference: "T6",
  },
  {
    id: "banner-header",
    name: "Banner Header",
    description: "Full-width colored banner (#0F4C81), left-accent headings, and bordered project cards.",
    component: BannerHeader,
    defaultTheme: {
      accentColor: "#0F4C81",
      fontSize: "14px",
    },
    reference: "T7",
  },
  {
    id: "compact-fresher-ats",
    name: "Compact Fresher ATS",
    description: "Arial, black & white, ultra-compact; education and projects placed before experience.",
    component: CompactFresherAts,
    defaultTheme: {
      accentColor: "#000000",
      fontSize: "13px",
    },
    reference: "T8",
  },
  {
    id: "creative-blocks",
    name: "Creative Blocks",
    description: "Purple pill headings (#7C3AED), colored surname, rounded skill tags, and top-bordered project cards.",
    component: CreativeBlocks,
    defaultTheme: {
      accentColor: "#7C3AED",
      fontSize: "14px",
    },
    reference: "T9",
  },
  {
    id: "elegant-serif-gold",
    name: "Elegant Serif Gold",
    description: "Centered Playfair Display name, gold divider (#B08D57), headings with side lines (— Experience —), Lora body.",
    component: ElegantSerifGold,
    defaultTheme: {
      accentColor: "#B08D57",
      fontSize: "14px",
    },
    reference: "T10",
  },
];

// Backward-compatibility mapping for legacy template IDs
const LEGACY_MAP = {
  "classic": "classic-rose-serif",
  "classic-serif-rose": "classic-rose-serif",
  "modern": "photo-header-split-timeline",
  "minimal": "classic-ats-executive",
  "compact": "compact-fresher-ats",
  "executive": "classic-ats-executive",
  "creative": "creative-blocks",
  "startup": "right-sidebar-light",
  "google": "banner-header",
  "microsoft": "banner-header",
  "harvard": "dense-analyst-serif",
  "elegant": "elegant-serif-gold",
  "modern-pro": "photo-header-split-timeline",
  "tech-engineer": "dense-analyst-serif",
  "navy-executive": "classic-ats-executive",
  "timeline": "navy-sidebar-timeline",
};

export function getTemplateById(id) {
  if (!id) return TEMPLATES[0];
  const targetId = LEGACY_MAP[id] || id;
  return TEMPLATES.find((t) => t.id === targetId) || TEMPLATES[0];
}

export * from "./primitives/index.js";
export { normalizeResume } from "./normalizeResume.js";
export { sampleResume } from "./sampleResume.js";
