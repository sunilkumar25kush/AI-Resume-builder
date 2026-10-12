import type { ResumeCustomization } from "@/types";

export const DEFAULT_CUSTOMIZATION: ResumeCustomization = {
  // 1. Font Size
  fontSize: "14px",
  fontSizeScale: "normal",

  // 2. Spacing
  pageMargin: "normal",
  sectionSpacing: "normal",
  entrySpacing: "normal",
  lineHeight: "1.45",

  // 3. Entries
  bulletStyle: "dot",
  datePlacement: "right",
  entryLayout: "standard",

  // 4. Headings
  headingStyle: "uppercase",
  headingSize: "16px",
  headingWeight: "bold",
  headingDivider: "line",
  headingAlign: "left",

  // 5. Font
  fontFamily: "Inter",

  // 6. Colors
  accentColor: "#4F46E5",
  textColor: "#111827",
  backgroundColor: "#FFFFFF",

  // 7. Header
  headerLayout: "left",
  headerNameSize: "28px",
  headerNameWeight: "bold",
  showPhoto: true,
  photoShape: "round",
  photoSize: "medium",
};

export const FONT_OPTIONS = [
  { id: "Inter", name: "Inter", category: "Modern Sans", font: "'Inter', sans-serif" },
  { id: "Roboto", name: "Roboto", category: "Clean Sans", font: "'Roboto', sans-serif" },
  { id: "Open Sans", name: "Open Sans", category: "Balanced Sans", font: "'Open Sans', sans-serif" },
  { id: "Montserrat", name: "Montserrat", category: "Geometric Sans", font: "'Montserrat', sans-serif" },
  { id: "Raleway", name: "Raleway", category: "Elegant Sans", font: "'Raleway', sans-serif" },
  { id: "Lora", name: "Lora", category: "Contemporary Serif", font: "'Lora', serif" },
  { id: "Merriweather", name: "Merriweather", category: "Stately Serif", font: "'Merriweather', serif" },
  { id: "Playfair Display", name: "Playfair Display", category: "Luxury Serif", font: "'Playfair Display', serif" },
  { id: "EB Garamond", name: "EB Garamond", category: "Timeless Serif", font: "'EB Garamond', serif" },
] as const;

export const COLOR_PALETTES = [
  { name: "FlowCV Indigo", hex: "#4F46E5" },
  { name: "Rose Crimson", hex: "#C2185B" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Deep Navy", hex: "#1E293B" },
  { name: "Slate Charcoal", hex: "#475569" },
  { name: "Executive Onyx", hex: "#111827" },
  { name: "Warm Amber", hex: "#D97706" },
  { name: "Amethyst Violet", hex: "#7C3AED" },
  { name: "Forest Teal", hex: "#0D9488" },
] as const;

export const TEXT_COLORS = [
  { name: "Deep Black", hex: "#111827" },
  { name: "Charcoal Slate", hex: "#374151" },
  { name: "Muted Gray", hex: "#4B5563" },
] as const;

export const BACKGROUND_COLORS = [
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Warm Ivory", hex: "#FAFAF9" },
  { name: "Cool Ice", hex: "#F8FAFC" },
] as const;

/**
 * Generate CSS variable object from customization state for real-time live preview
 */
export function getCustomizationCssVariables(customization?: ResumeCustomization, templateAccent?: string) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...customization };

  const fontFamilyObj = FONT_OPTIONS.find((f) => f.id === c.fontFamily) || FONT_OPTIONS[0];

  const marginMap = {
    compact: "20px 24px",
    normal: "32px 36px",
    relaxed: "44px 48px",
  };

  const sectionGapMap = {
    compact: "10px",
    normal: "18px",
    relaxed: "26px",
  };

  const entryGapMap = {
    compact: "6px",
    normal: "12px",
    relaxed: "18px",
  };

  const headingWeightMap = {
    normal: "400",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  };

  const activeAccent = c.accentColor || templateAccent || "#4F46E5";

  return {
    "--rc-font-family": fontFamilyObj.font,
    "--rc-font-size": c.fontSize || "14px",
    "--rc-line-height": c.lineHeight || "1.45",
    "--rc-page-padding": marginMap[c.pageMargin as keyof typeof marginMap] || marginMap.normal,
    "--rc-section-gap": sectionGapMap[c.sectionSpacing as keyof typeof sectionGapMap] || sectionGapMap.normal,
    "--rc-entry-gap": entryGapMap[c.entrySpacing as keyof typeof entryGapMap] || entryGapMap.normal,
    "--rc-heading-transform": c.headingStyle || "uppercase",
    "--rc-heading-size": c.headingSize || "16px",
    "--rc-heading-weight": headingWeightMap[c.headingWeight as keyof typeof headingWeightMap] || "700",
    "--rc-heading-align": c.headingAlign || "left",
    "--rc-accent-color": activeAccent,
    "--rc-text-color": c.textColor || "#111827",
    "--rc-bg-color": c.backgroundColor || "#FFFFFF",
    "--rc-name-size": c.headerNameSize || "28px",
    "--rc-name-weight": c.headerNameWeight === "extrabold" ? "800" : "700",
    "--rc-header-align": c.headerLayout === "center" ? "center" : "left",
    "--rc-header-justify": c.headerLayout === "center" ? "center" : c.headerLayout === "split" ? "space-between" : "flex-start",
    "--rc-photo-display": c.showPhoto ? "block" : "none",
    "--rc-photo-radius": c.photoShape === "round" ? "9999px" : c.photoShape === "rounded" ? "12px" : "2px",
    "--rc-photo-size": c.photoSize === "small" ? "60px" : c.photoSize === "large" ? "100px" : "80px",
  } as React.CSSProperties;
}
