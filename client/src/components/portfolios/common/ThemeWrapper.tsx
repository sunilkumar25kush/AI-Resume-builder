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

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  const style: CSSProperties = {
    // Custom portfolio primary color token accessible to all child elements
    ["--portfolio-primary" as string]: primaryColor,
    ["--primary" as string]: primaryColor,
  };

  return (
    <div
      className={`portfolio-theme-root min-h-screen transition-colors duration-200 ${
        isDark ? "dark bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"
      } ${fontClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
