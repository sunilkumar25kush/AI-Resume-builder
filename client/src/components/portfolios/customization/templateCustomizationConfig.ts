import type {
  PortfolioDesignSettings,
  PortfolioLayoutOptions,
  PortfolioTemplateId,
} from "@/types/portfolio";

export type SettingControlType = "boolean" | "select" | "text" | "number";

export interface SettingOption {
  label: string;
  value: string;
}

export interface TemplateSettingDefinition {
  key: string;
  label: string;
  description?: string;
  type: SettingControlType;
  defaultValue: unknown;
  options?: SettingOption[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface TemplateCustomizationConfig {
  templateId: PortfolioTemplateId;
  name: string;
  supportsThemeToggle: boolean;
  supportedThemes: Array<"light" | "dark" | "system">;
  supportsColorAccent: boolean;
  supportsTypography: boolean;
  supportedFonts: string[];
  supportedBackgroundEffects: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  supportedLayoutOptions: {
    heroLayout?: Array<"split" | "centered" | "minimal">;
    projectsLayout?: Array<"grid" | "cards" | "staggered" | "list">;
    skillsLayout?: Array<"badges" | "bars" | "pills" | "categories">;
  };
  templateSettings: TemplateSettingDefinition[];
}

export const APPROVED_FONTS = [
  { id: "Inter", label: "Modern Sans (Inter)", preview: "Sans" },
  { id: "Roboto", label: "Clean Sans (Roboto)", preview: "Sans" },
  { id: "Merriweather", label: "Editorial Serif (Merriweather)", preview: "Serif" },
  { id: "Playfair", label: "Display Serif (Playfair)", preview: "Serif" },
  { id: "JetBrains", label: "Technical Mono (JetBrains)", preview: "Mono" },
  { id: "Geist", label: "Geist Modern (Geist)", preview: "Sans" },
  { id: "Fira", label: "Fira Code (Fira)", preview: "Mono" },
];

export const COMMON_COLOR_PRESETS = [
  { name: "Cyan Glow", hex: "#06b6d4" },
  { name: "Cobalt Blue", hex: "#2563eb" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Royal Purple", hex: "#9333ea" },
  { name: "Electric Indigo", hex: "#4f46e5" },
  { name: "Amber Gold", hex: "#d97706" },
  { name: "Rose Crimson", hex: "#e11d48" },
  { name: "Slate Neutral", hex: "#334155" },
];

export const TEMPLATE_CAPABILITIES: Record<PortfolioTemplateId, TemplateCustomizationConfig> = {
  spotlight: {
    templateId: "spotlight",
    name: "Spotlight",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["Inter", "Roboto", "Merriweather", "Playfair", "JetBrains", "Geist", "Fira"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Obsidian dark-room spotlight aesthetic" },
      { id: "mesh", label: "Mesh Gradient", description: "Ambient dynamic color glow" },
      { id: "aurora", label: "Cosmic Aurora", description: "Radiant corner light dispersion" },
      { id: "clean", label: "Clean Solid", description: "Solid background without decorative overlays" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["grid", "cards"],
      skillsLayout: ["categories", "badges"],
    },
    templateSettings: [
      {
        key: "glowHalo",
        label: "Portrait Halo Glow",
        description: "Backlight glow ring behind the hero portrait",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "expertiseTree",
        label: "Expertise Connecting Tree",
        description: "Display decorative branching lines connecting skill nodes",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "typewriterSpeed",
        label: "Typewriter Pace",
        description: "Speed of the hero headline typewriter animation",
        type: "select",
        defaultValue: "normal",
        options: [
          { label: "Normal Pace", value: "normal" },
          { label: "Fast Pace", value: "fast" },
          { label: "Deliberate / Slow", value: "slow" },
        ],
      },
    ],
  },

  poster: {
    templateId: "poster",
    name: "Poster Brutalist",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["Inter", "Roboto", "JetBrains", "Fira"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Warm paper monochrome with editorial tint" },
      { id: "grid", label: "Architectural Grid", description: "Subtle drafting grid overlay" },
      { id: "clean", label: "Clean Solid", description: "Pure flat paper backdrop" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["staggered", "grid"],
    },
    templateSettings: [
      {
        key: "marqueeText",
        label: "Marquee Ticker Text",
        description: "Custom looping words for the infinite marquee banner",
        type: "text",
        defaultValue: "CREATIVE • VISIONARY • ENGINEER • FULLSTACK",
        placeholder: "CREATIVE • VISIONARY • ENGINEER",
      },
      {
        key: "borderStyle",
        label: "Brutalist Border Style",
        description: "Border accent thickness and framing style",
        type: "select",
        defaultValue: "brutalist",
        options: [
          { label: "Brutalist High-Contrast", value: "brutalist" },
          { label: "Solid Outline", value: "solid" },
          { label: "Dashed Technical", value: "dashed" },
        ],
      },
      {
        key: "watermarkOpacity",
        label: "Hero Watermark Opacity",
        description: "Opacity of the giant background initials watermark",
        type: "select",
        defaultValue: "subtle",
        options: [
          { label: "Subtle (6%)", value: "subtle" },
          { label: "Bold (14%)", value: "bold" },
          { label: "Hidden (0%)", value: "hidden" },
        ],
      },
    ],
  },

  devport: {
    templateId: "devport",
    name: "DevPort",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["Inter", "Roboto", "JetBrains", "Geist", "Fira"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Cosmic nebula with starfield particles" },
      { id: "aurora", label: "Cosmic Aurora", description: "High-energy aurora wave across top" },
      { id: "mesh", label: "Mesh Gradient", description: "Soft multi-point color gradient" },
      { id: "grid", label: "Cyberpunk Grid", description: "Cyan/purple grid matrix" },
      { id: "clean", label: "Clean Solid", description: "Minimalist dark slate background" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["grid", "cards"],
      skillsLayout: ["pills", "badges"],
    },
    templateSettings: [
      {
        key: "orbitalRing",
        label: "Orbital Rings & Pulse",
        description: "Spinning cosmic orbital rings around avatar photo",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "floatingCodeCard",
        label: "Floating IDE Code Card",
        description: "Glassmorphic developer.js snippet card in hero",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "starfieldDensity",
        label: "Starfield Particle Density",
        description: "Quantity and intensity of ambient cosmic stars",
        type: "select",
        defaultValue: "balanced",
        options: [
          { label: "Balanced (Recommended)", value: "balanced" },
          { label: "Dense Galaxy", value: "dense" },
          { label: "Minimalist Stars", value: "minimal" },
        ],
      },
    ],
  },

  creative: {
    templateId: "creative",
    name: "Modern 3D",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["Inter", "Roboto", "Merriweather", "Playfair", "Geist"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Deep midnight indigo with 3D spotlight" },
      { id: "mesh", label: "Electric Mesh", description: "Radiant purple and blue ambient blur" },
      { id: "aurora", label: "Aurora Wave", description: "Flowing light dispersion" },
      { id: "clean", label: "Clean Studio", description: "Solid studio backdrop" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["grid", "cards"],
      skillsLayout: ["badges", "pills"],
    },
    templateSettings: [
      {
        key: "glassBlur",
        label: "Glassmorphism Blur Depth",
        description: "Intensity of backdrop blur for cards and headers",
        type: "select",
        defaultValue: "medium",
        options: [
          { label: "Medium (Standard)", value: "medium" },
          { label: "Subtle (Light blur)", value: "subtle" },
          { label: "Deep Frost (Heavy blur)", value: "deep" },
        ],
      },
      {
        key: "gradientGlow",
        label: "Electric Glow Highlights",
        description: "Ambient neon glow behind featured badges and cards",
        type: "boolean",
        defaultValue: true,
      },
    ],
  },

  developer: {
    templateId: "developer",
    name: "Developer CLI",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["JetBrains", "Fira", "Inter", "Roboto"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Clean engineering workspace" },
      { id: "grid", label: "Terminal Matrix Grid", description: "Fine monospace coordinate grid" },
      { id: "dots", label: "Dot Matrix", description: "Subtle dot matrix field" },
      { id: "clean", label: "Clean Flat", description: "Pure flat IDE canvas" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["grid", "list"],
      skillsLayout: ["badges", "categories"],
    },
    templateSettings: [
      {
        key: "terminalPrompt",
        label: "CLI Terminal Prompt",
        description: "Custom prefix displayed on the interactive terminal prompt",
        type: "text",
        defaultValue: "dev@workstation:~$",
        placeholder: "user@machine:~$",
      },
      {
        key: "cursorBlink",
        label: "Blinking CLI Cursor",
        description: "Show blinking terminal cursor animation in hero",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "showLineNumbers",
        label: "Code Block Line Numbers",
        description: "Display numbered gutters inside code snippets",
        type: "boolean",
        defaultValue: true,
      },
    ],
  },

  minimal: {
    templateId: "minimal",
    name: "Minimal Editorial",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["Inter", "Roboto", "Merriweather", "Playfair", "Geist"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Whisper-clean white / obsidian paper" },
      { id: "clean", label: "Pure Clean", description: "Zero decorations or textures" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["list", "grid"],
      skillsLayout: ["badges", "pills"],
    },
    templateSettings: [
      {
        key: "whitespaceDensity",
        label: "Whitespace Density",
        description: "Vertical rhythm and spacing between career sections",
        type: "select",
        defaultValue: "normal",
        options: [
          { label: "Normal (Balanced)", value: "normal" },
          { label: "Compact (Dense)", value: "compact" },
          { label: "Relaxed (Generous)", value: "relaxed" },
        ],
      },
      {
        key: "editorialSerif",
        label: "Editorial Serif Accent",
        description: "Use serif typeface for major section headings",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },

  modern: {
    // Alias to creative
    templateId: "modern",
    name: "Modern 3D",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["Inter", "Roboto", "Merriweather", "Playfair", "Geist"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Deep midnight indigo with 3D spotlight" },
      { id: "mesh", label: "Electric Mesh", description: "Radiant purple and blue ambient blur" },
      { id: "clean", label: "Clean Studio", description: "Solid studio backdrop" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["grid", "cards"],
      skillsLayout: ["badges", "pills"],
    },
    templateSettings: [
      {
        key: "glassBlur",
        label: "Glassmorphism Blur Depth",
        description: "Intensity of backdrop blur",
        type: "select",
        defaultValue: "medium",
        options: [
          { label: "Medium", value: "medium" },
          { label: "Subtle", value: "subtle" },
          { label: "Deep", value: "deep" },
        ],
      },
    ],
  },

  executive: {
    // Alias to minimal
    templateId: "executive",
    name: "Executive Minimal",
    supportsThemeToggle: true,
    supportedThemes: ["light", "dark", "system"],
    supportsColorAccent: true,
    supportsTypography: true,
    supportedFonts: ["Inter", "Roboto", "Merriweather", "Playfair"],
    supportedBackgroundEffects: [
      { id: "default", label: "Template Default", description: "Editorial clean layout" },
      { id: "clean", label: "Pure Clean", description: "Zero decorations" },
    ],
    supportedLayoutOptions: {
      projectsLayout: ["list", "grid"],
      skillsLayout: ["badges", "pills"],
    },
    templateSettings: [
      {
        key: "whitespaceDensity",
        label: "Whitespace Density",
        type: "select",
        defaultValue: "normal",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Compact", value: "compact" },
          { label: "Relaxed", value: "relaxed" },
        ],
      },
    ],
  },
};

/** Hex color validation regex: #rgb, #rgba, #rrggbb, #rrggbbaa */
export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Returns the capability config for the given template */
export function getTemplateCustomizationConfig(
  templateId: PortfolioTemplateId = "spotlight",
): TemplateCustomizationConfig {
  return TEMPLATE_CAPABILITIES[templateId] || TEMPLATE_CAPABILITIES.spotlight;
}

/** Returns the default design settings for a template, preserving original design */
export function getDefaultDesignSettings(
  templateId: PortfolioTemplateId = "spotlight",
): PortfolioDesignSettings {
  const config = getTemplateCustomizationConfig(templateId);

  const defaultTemplateSettings: Record<string, unknown> = {};
  for (const s of config.templateSettings) {
    defaultTemplateSettings[s.key] = s.defaultValue;
  }

  const defaultLayoutOptions: PortfolioLayoutOptions = {
    projectsLayout: config.supportedLayoutOptions.projectsLayout?.[0] || "grid",
    skillsLayout: config.supportedLayoutOptions.skillsLayout?.[0] || "badges",
  };

  const defaultColor =
    templateId === "spotlight"
      ? "#e11d48"
      : templateId === "poster"
      ? "#e11d2a"
      : templateId === "devport"
      ? "#06b6d4"
      : templateId === "creative" || templateId === "modern"
      ? "#9333ea"
      : "#2563eb";

  return {
    template: templateId,
    theme: "system",
    primaryColor: defaultColor,
    fontFamily: config.supportedFonts[0] || "Inter",
    backgroundEffect: "default",
    layoutOptions: defaultLayoutOptions,
    templateSettings: defaultTemplateSettings,
    sectionOrder: [
      "hero",
      "about",
      "skills",
      "projects",
      "experience",
      "education",
      "certifications",
      "contact",
    ],
    sectionVisibility: {},
  };
}

/**
 * Validates customization input against the template's capability matrix.
 * Filters out unsupported options and ensures input values conform to constraints.
 */
export function validateCustomizationInput(
  templateId: PortfolioTemplateId,
  design: Partial<PortfolioDesignSettings>,
): {
  isValid: boolean;
  errors: string[];
  sanitized: PortfolioDesignSettings;
} {
  const config = getTemplateCustomizationConfig(templateId);
  const defaults = getDefaultDesignSettings(templateId);
  const errors: string[] = [];

  const sanitized: PortfolioDesignSettings = {
    ...defaults,
    ...design,
    template: templateId,
  };

  // 1. Validate primaryColor
  if (design.primaryColor !== undefined) {
    const trimmed = design.primaryColor.trim();
    if (!HEX_COLOR_REGEX.test(trimmed)) {
      errors.push(`Invalid primary color: "${design.primaryColor}". Must be a valid hex color code.`);
      sanitized.primaryColor = defaults.primaryColor;
    } else {
      sanitized.primaryColor = trimmed;
    }
  }

  // 2. Validate theme
  if (design.theme !== undefined) {
    if (!config.supportedThemes.includes(design.theme)) {
      errors.push(`Theme "${design.theme}" is not supported by ${config.name}. Defaulting to system.`);
      sanitized.theme = "system";
    }
  }

  // 3. Validate fontFamily
  if (design.fontFamily !== undefined) {
    if (!config.supportedFonts.includes(design.fontFamily)) {
      errors.push(`Font "${design.fontFamily}" is not supported by ${config.name}.`);
      sanitized.fontFamily = config.supportedFonts[0] || "Inter";
    }
  }

  // 4. Validate backgroundEffect
  if (design.backgroundEffect !== undefined) {
    const supportedIds = config.supportedBackgroundEffects.map((b) => b.id);
    if (!supportedIds.includes(design.backgroundEffect)) {
      sanitized.backgroundEffect = "default";
    }
  }

  // 5. Sanitize layoutOptions (do not expose or allow options the template does not support)
  const sanitizedLayout: PortfolioLayoutOptions = {};
  if (config.supportedLayoutOptions.projectsLayout && design.layoutOptions?.projectsLayout) {
    if (config.supportedLayoutOptions.projectsLayout.includes(design.layoutOptions.projectsLayout as any)) {
      sanitizedLayout.projectsLayout = design.layoutOptions.projectsLayout;
    } else {
      sanitizedLayout.projectsLayout = config.supportedLayoutOptions.projectsLayout[0];
    }
  }
  if (config.supportedLayoutOptions.skillsLayout && design.layoutOptions?.skillsLayout) {
    if (config.supportedLayoutOptions.skillsLayout.includes(design.layoutOptions.skillsLayout as any)) {
      sanitizedLayout.skillsLayout = design.layoutOptions.skillsLayout;
    } else {
      sanitizedLayout.skillsLayout = config.supportedLayoutOptions.skillsLayout[0];
    }
  }
  sanitized.layoutOptions = sanitizedLayout;

  // 6. Sanitize templateSettings (only keep keys defined in this template's schema)
  const sanitizedSettings: Record<string, unknown> = {};

  for (const settingDef of config.templateSettings) {
    const rawVal = design.templateSettings?.[settingDef.key];
    if (rawVal !== undefined) {
      if (settingDef.type === "boolean") {
        sanitizedSettings[settingDef.key] = Boolean(rawVal);
      } else if (settingDef.type === "select") {
        const allowedVals = settingDef.options?.map((o) => o.value) || [];
        if (allowedVals.includes(String(rawVal))) {
          sanitizedSettings[settingDef.key] = String(rawVal);
        } else {
          sanitizedSettings[settingDef.key] = settingDef.defaultValue;
        }
      } else if (settingDef.type === "text") {
        sanitizedSettings[settingDef.key] = String(rawVal).slice(0, 200);
      } else {
        sanitizedSettings[settingDef.key] = rawVal;
      }
    } else {
      sanitizedSettings[settingDef.key] = settingDef.defaultValue;
    }
  }
  sanitized.templateSettings = sanitizedSettings;

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}
