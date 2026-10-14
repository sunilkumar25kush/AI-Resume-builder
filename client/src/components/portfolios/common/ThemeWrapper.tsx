import type { CSSProperties, ReactNode } from "react";
import type { PortfolioDesignSettings } from "@/types/portfolio";

export interface ThemeWrapperProps {
  design?: Partial<PortfolioDesignSettings>;
  className?: string;
  children: ReactNode;
}

const FONT_MAP: Record<string, string> = {
  Inter: "font-sans",
  Geist: "font-sans",
  Roboto: "font-sans",
  Merriweather: "font-serif",
  Playfair: "font-serif",
  JetBrains: "font-mono",
  Fira: "font-mono",
};

const FONT_FAMILY_RAW: Record<string, string> = {
  Inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  Geist: "'Geist Variable', 'Inter', sans-serif",
  Roboto: "'Roboto', 'Inter', sans-serif",
  Merriweather: "'Merriweather', Georgia, serif",
  Playfair: "'Playfair Display', Georgia, serif",
  JetBrains: "'JetBrains Mono', 'Fira Code', monospace",
  Fira: "'Fira Code', 'JetBrains Mono', monospace",
};

/**
 * Wraps portfolio rendering with isolated design variables (theme, primary color, font family).
 * Does not pollute global document styles.
 */
export function ThemeWrapper({
  design = {},
  className = "",
  children,
}: ThemeWrapperProps) {
  const theme = design.theme || "system";
  const primaryColor = design.primaryColor || "#2563eb";
  const fontFamilyKey = design.fontFamily || "Inter";
  const fontClass = FONT_MAP[fontFamilyKey] || "font-sans";
  const resolvedFontFamily = FONT_FAMILY_RAW[fontFamilyKey] || FONT_FAMILY_RAW.Inter;

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  const style: CSSProperties = {
    fontFamily: resolvedFontFamily,
    // Custom portfolio primary color token accessible to all child elements
    ["--portfolio-primary" as string]: primaryColor,
    ["--portfolio-primary-glow" as string]: `${primaryColor}40`,
    ["--primary" as string]: primaryColor,
    ["--primary-glow" as string]: `${primaryColor}33`,
  };

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      data-font={fontFamilyKey}
      className={`portfolio-theme-root min-h-screen transition-colors duration-200 ${
        isDark ? "dark bg-neutral-950 text-neutral-100" : "light bg-neutral-50 text-neutral-900"
      } ${fontClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
