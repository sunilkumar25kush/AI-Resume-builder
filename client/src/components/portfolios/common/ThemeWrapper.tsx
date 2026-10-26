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

  const bgEffect = design.backgroundEffect || "default";

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      data-font={fontFamilyKey}
      data-bg-effect={bgEffect}
      className={`portfolio-theme-root min-h-screen relative transition-colors duration-200 ${
        isDark ? "dark bg-neutral-950 text-neutral-100" : "light bg-neutral-50 text-neutral-900"
      } ${fontClass} ${className}`}
      style={style}
    >
      {/* Dynamic Background Effects (when selected by user, non-intrusive) */}
      {bgEffect === "mesh" && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-screen overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px]"
            style={{ backgroundColor: `${primaryColor}25` }}
          />
          <div
            className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full blur-[140px]"
            style={{ backgroundColor: `${primaryColor}1a` }}
          />
        </div>
      )}

      {bgEffect === "grid" && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-25"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      )}

      {bgEffect === "dots" && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      )}

      {bgEffect === "aurora" && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-35 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -top-[30%] left-[20%] w-[70vw] h-[45vw] rounded-full blur-[130px]"
            style={{
              background: `radial-gradient(circle, ${primaryColor}33 0%, #ec489922 45%, transparent 70%)`,
            }}
          />
        </div>
      )}

      <div className="relative z-[1] min-h-screen">{children}</div>
    </div>
  );
}
