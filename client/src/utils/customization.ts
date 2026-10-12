import type { ResumeCustomization } from "@/types";

export const DEFAULT_CUSTOMIZATION: ResumeCustomization = {
  // 1. Font Size (FlowCV Sliders)
  baseFontSize: "11.5pt",
  fullNameSize: "+12.5pt",
  titleSize: "+8pt",
  sectionHeadingsSize: "+4pt",
  entryHeaderSize: "+0.5pt",
  fontSize: "14px",
  fontSizeScale: "normal",

  // 2. Spacing (FlowCV Sliders)
  lineHeight: "1.25",
  spaceElements: "[0]",
  leftRightMargin: "22mm",
  topBottomMargin: "12mm",
  pageMargin: "normal",
  sectionSpacing: "normal",
  entrySpacing: "normal",

  // 3. Entries (FlowCV Layout)
  entryStructure: "full-width",
  datePosition: "right",
  subtitlePlacement: "same-line",
  bulletStyle: "dot",
  datePlacement: "right",
  entryLayout: "standard",

  // 4. Headings (FlowCV Styles)
  headingStyle: "line",
  headingCapitalization: "uppercase",
  headingIcons: "none",
  headingSize: "16px",
  headingWeight: "bold",
  headingDivider: "line",
  headingAlign: "left",

  // 5. Font (FlowCV Body & Name)
  bodyFont: "Alegreya",
  nameFont: "same",
  fontFamily: "Alegreya",

  // 6. Colors (FlowCV Color targets & checkboxes)
  accentColor: "#4F46E5",
  colorTarget: "page",
  textColor: "#111827",
  backgroundColor: "#FFFFFF",
  accentTargets: {
    name: true,
    jobTitle: true,
    headings: true,
    headingsLine: true,
    dots: false,
    dates: false,
    entrySubtitle: false,
  },

  // 7. Header (FlowCV Text align & arrangement)
  headerAlignment: "center",
  headerArrangement: "horizontal",
  headerSeparator: "icon",
  headerLayout: "center",
  headerNameSize: "28px",
  headerNameWeight: "bold",
  showPhoto: true,
  photoShape: "round",
  photoSize: "medium",
};

export const FONT_OPTIONS = [
  { id: "Alegreya", name: "Alegreya", category: "Classic Serif", font: "'Alegreya', Georgia, serif" },
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
  { name: "Ocean Blue", hex: "#2563EB" },
  { name: "Deep Navy", hex: "#1E293B" },
  { name: "Teal", hex: "#0D9488" },
  { name: "Sage Emerald", hex: "#059669" },
  { name: "Rose Crimson", hex: "#C2185B" },
  { name: "Magenta Berry", hex: "#BE185D" },
  { name: "Coral Sunset", hex: "#E11D48" },
  { name: "Warm Amber", hex: "#D97706" },
  { name: "Amethyst Violet", hex: "#7C3AED" },
  { name: "Slate Charcoal", hex: "#475569" },
  { name: "Executive Onyx", hex: "#111827" },
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

  const bodyFontObj = FONT_OPTIONS.find((f) => f.id === (c.bodyFont || c.fontFamily)) || FONT_OPTIONS[0];
  const nameFontObj = c.nameFont && c.nameFont !== "same"
    ? FONT_OPTIONS.find((f) => f.id === c.nameFont) || bodyFontObj
    : bodyFontObj;

  const baseFontVal = c.baseFontSize || c.fontSize || "11.5pt";

  // Section gap from spaceElements notch
  const sectionGapMap: Record<string, string> = {
    "[--]": "10px",
    "[-]": "14px",
    "[0]": "18px",
    "[+]": "24px",
    "[++]": "30px",
  };
  const entryGapMap: Record<string, string> = {
    "[--]": "6px",
    "[-]": "9px",
    "[0]": "13px",
    "[+]": "18px",
    "[++]": "24px",
  };

  const activeAccent = c.accentColor || templateAccent || "#4F46E5";
  const targets = c.accentTargets || DEFAULT_CUSTOMIZATION.accentTargets || {};

  return {
    "--rc-font-family": bodyFontObj.font,
    "--rc-name-font-family": nameFontObj.font,
    "--rc-font-size": baseFontVal,
    "--rc-base-font-size": baseFontVal,
    "--rc-name-size": `calc(${baseFontVal} + ${c.fullNameSize || "+12.5pt"})`,
    "--rc-title-size": `calc(${baseFontVal} + ${c.titleSize || "+8pt"})`,
    "--rc-heading-size": `calc(${baseFontVal} + ${c.sectionHeadingsSize || "+4pt"})`,
    "--rc-entry-header-size": `calc(${baseFontVal} + ${c.entryHeaderSize || "+0.5pt"})`,
    "--rc-line-height": c.lineHeight || "1.25",
    "--rc-margin-x": c.leftRightMargin || "22mm",
    "--rc-margin-y": c.topBottomMargin || "12mm",
    "--rc-section-gap": sectionGapMap[c.spaceElements || "[0]"] || "18px",
    "--rc-entry-gap": entryGapMap[c.spaceElements || "[0]"] || "13px",
    "--rc-heading-transform": c.headingCapitalization || c.headingStyle || "uppercase",
    "--rc-accent-color": activeAccent,
    "--rc-text-color": c.textColor || "#111827",
    "--rc-bg-color": c.backgroundColor || "#FFFFFF",
    "--rc-name-color": targets.name !== false ? activeAccent : (c.textColor || "#111827"),
    "--rc-title-color": targets.jobTitle ? activeAccent : "#4B5563",
    "--rc-heading-color": targets.headings !== false ? activeAccent : (c.textColor || "#111827"),
    "--rc-heading-line-color": targets.headingsLine !== false ? activeAccent : "#E5E7EB",
    "--rc-bullet-color": targets.dots ? activeAccent : "currentColor",
    "--rc-date-color": targets.dates ? activeAccent : "#6B7280",
    "--rc-entry-subtitle-color": targets.entrySubtitle ? activeAccent : "#374151",
    "--rc-photo-display": c.showPhoto ? "block" : "none",
    "--rc-photo-radius": c.photoShape === "round" ? "9999px" : c.photoShape === "rounded" ? "12px" : "2px",
    "--rc-photo-size": c.photoSize === "small" ? "65px" : c.photoSize === "large" ? "110px" : "85px",
  } as React.CSSProperties;
}

/**
 * Returns helper CSS class names reflecting the customization options for live layout adjustments
 */
export function getCustomizationClassNames(customization?: ResumeCustomization): string {
  const c = { ...DEFAULT_CUSTOMIZATION, ...customization };
  return [
    `heading-style-${c.headingStyle || "line"}`,
    `header-align-${c.headerAlignment || "center"}`,
    `header-sep-${c.headerSeparator || "icon"}`,
    `entry-structure-${c.entryStructure || "full-width"}`,
    `date-pos-${c.datePosition || "right"}`,
    `bullet-style-${c.bulletStyle || "dot"}`,
  ].join(" ");
}

/**
 * Returns authentic default customization settings matching each resume template's native style,
 * color, font, and format.
 */
export function getDefaultCustomizationForTemplate(templateId?: string): ResumeCustomization {
  const tid = (templateId || "classic-rose-serif").toLowerCase();

  if (tid.includes("rose") || tid === "classic") {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#C2185B", // Rose Crimson
      bodyFont: "EB Garamond",
      nameFont: "same",
      fontFamily: "EB Garamond",
      headingStyle: "line",
      headingCapitalization: "uppercase",
      headerAlignment: "center",
      bulletStyle: "dot",
      baseFontSize: "11pt",
      leftRightMargin: "22mm",
      topBottomMargin: "12mm",
    };
  }

  if (tid.includes("navy") || tid.includes("timeline")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#2B3450", // Dark Navy
      bodyFont: "Inter",
      nameFont: "same",
      fontFamily: "Inter",
      headingStyle: "left-bar",
      headingCapitalization: "uppercase",
      headerAlignment: "left",
      bulletStyle: "dot",
      baseFontSize: "10.5pt",
      leftRightMargin: "16mm",
      topBottomMargin: "12mm",
    };
  }

  if (tid.includes("executive") || tid.includes("minimal")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#000000", // Monochrome ATS
      bodyFont: "EB Garamond",
      nameFont: "same",
      fontFamily: "EB Garamond",
      headingStyle: "thick-line",
      headingCapitalization: "uppercase",
      headerAlignment: "left",
      bulletStyle: "square",
      baseFontSize: "10.5pt",
      leftRightMargin: "18mm",
      topBottomMargin: "12mm",
    };
  }

  if (tid.includes("photo") || tid.includes("split") || tid.includes("modern")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#222222",
      bodyFont: "Montserrat",
      nameFont: "same",
      fontFamily: "Montserrat",
      headingStyle: "line",
      headingCapitalization: "uppercase",
      headerAlignment: "left",
      bulletStyle: "dot",
      baseFontSize: "10.5pt",
      showPhoto: true,
      leftRightMargin: "18mm",
      topBottomMargin: "12mm",
    };
  }

  if (tid.includes("analyst") || tid.includes("dense") || tid.includes("harvard") || tid.includes("tech")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#111827",
      bodyFont: "EB Garamond",
      nameFont: "same",
      fontFamily: "EB Garamond",
      headingStyle: "line",
      headingCapitalization: "uppercase",
      headerAlignment: "center",
      bulletStyle: "dot",
      baseFontSize: "10pt",
      spaceElements: "[-]",
      leftRightMargin: "16mm",
      topBottomMargin: "10mm",
    };
  }

  if (tid.includes("right-sidebar") || tid.includes("startup")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#4F46E5", // FlowCV Indigo
      bodyFont: "Inter",
      nameFont: "same",
      fontFamily: "Inter",
      headingStyle: "line",
      headingCapitalization: "uppercase",
      headerAlignment: "left",
      bulletStyle: "dot",
      baseFontSize: "11pt",
      leftRightMargin: "18mm",
      topBottomMargin: "12mm",
    };
  }

  if (tid.includes("banner") || tid.includes("google") || tid.includes("microsoft")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#0F4C81", // Classic Blue
      bodyFont: "Roboto",
      nameFont: "same",
      fontFamily: "Roboto",
      headingStyle: "left-bar",
      headingCapitalization: "uppercase",
      headerAlignment: "left",
      bulletStyle: "dot",
      baseFontSize: "10.5pt",
      leftRightMargin: "18mm",
      topBottomMargin: "12mm",
    };
  }

  if (tid.includes("compact") || tid.includes("fresher")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#111827",
      bodyFont: "Roboto",
      nameFont: "same",
      fontFamily: "Roboto",
      headingStyle: "line",
      headingCapitalization: "uppercase",
      headerAlignment: "left",
      bulletStyle: "dot",
      baseFontSize: "9.5pt",
      spaceElements: "[--]",
      leftRightMargin: "14mm",
      topBottomMargin: "10mm",
    };
  }

  if (tid.includes("creative")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#7C3AED", // Vibrant Purple
      bodyFont: "Inter",
      nameFont: "same",
      fontFamily: "Inter",
      headingStyle: "box",
      headingCapitalization: "uppercase",
      headerAlignment: "left",
      bulletStyle: "circle",
      baseFontSize: "10.5pt",
      leftRightMargin: "18mm",
      topBottomMargin: "12mm",
    };
  }

  if (tid.includes("gold") || tid.includes("elegant")) {
    return {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#B08D57", // Gold
      bodyFont: "Lora",
      nameFont: "Playfair Display",
      fontFamily: "Lora",
      headingStyle: "split",
      headingCapitalization: "uppercase",
      headerAlignment: "center",
      bulletStyle: "circle",
      baseFontSize: "11pt",
      leftRightMargin: "20mm",
      topBottomMargin: "12mm",
    };
  }

  return DEFAULT_CUSTOMIZATION;
}
