import { Check, Laptop, Moon, Palette, Sun, Type } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortfolioDesignSettings } from "@/types/portfolio";

export interface DesignControlsProps {
  design: PortfolioDesignSettings;
  onChange: (updated: PortfolioDesignSettings) => void;
}

const COLOR_PRESETS = [
  { name: "Cobalt Blue", hex: "#2563eb" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Royal Purple", hex: "#7c3aed" },
  { name: "Electric Indigo", hex: "#4f46e5" },
  { name: "Amber Gold", hex: "#d97706" },
  { name: "Rose Crimson", hex: "#e11d48" },
  { name: "Sky Cyan", hex: "#0284c7" },
  { name: "Slate Neutral", hex: "#334155" },
];

const TEMPLATES: Array<{
  id: PortfolioDesignSettings["template"];
  name: string;
  desc: string;
  badge: string;
}> = [
  {
    id: "devport",
    name: "DevPort",
    desc: "Cosmic dark aesthetic, orbital avatar, glowing typewriter header, and smooth scroll navigation.",
    badge: "Featured ★",
  },
  {
    id: "creative",
    name: "Modern 3D",
    desc: "Midnight indigo theme, 3D avatar spotlight, electric purple gradient, and floating stats.",
    badge: "New ★",
  },
  {
    id: "developer",
    name: "Developer",
    desc: "Terminal aesthetic, tech-stack cards, active status badge, and code styling.",
    badge: "Engineering",
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Quiet elegance, refined typography, and serene editorial whitespace.",
    badge: "Editorial",
  },
];

const FONTS = [
  { id: "Inter", label: "Modern Sans (Inter)", preview: "Sans" },
  { id: "Merriweather", label: "Editorial Serif (Merriweather)", preview: "Serif" },
  { id: "JetBrains", label: "Technical Mono (JetBrains)", preview: "Mono" },
];

export function DesignControls({ design, onChange }: DesignControlsProps) {
  const currentTemplate = design.template || "devport";
  const currentTheme = design.theme || "system";
  const currentColor = design.primaryColor || "#2563eb";
  const currentFont = design.fontFamily || "Inter";

  const handleUpdate = (patch: Partial<PortfolioDesignSettings>) => {
    onChange({
      ...design,
      ...patch,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Palette className="h-4 w-4 text-neutral-500" />
          <span>Design & Template Appearance</span>
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Customize layouts, theme modes, colors, and typography without altering career content.
        </p>
      </div>

      {/* Template Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Portfolio Template
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((tpl) => {
            const isSelected = currentTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleUpdate({ template: tpl.id })}
                className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all relative ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {tpl.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {tpl.desc}
                </p>
                {isSelected && (
                  <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Accent Picker */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Accent Color
        </Label>
        <div className="flex flex-wrap items-center gap-2.5">
          {COLOR_PRESETS.map((color) => {
            const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleUpdate({ primaryColor: color.hex })}
                title={color.name}
                style={{ backgroundColor: color.hex }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs ${
                  isSelected ? "ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-110" : ""
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            );
          })}

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-neutral-400 font-mono">#</span>
            <Input
              value={currentColor.replace(/^#/, "")}
              onChange={(e) => handleUpdate({ primaryColor: `#${e.target.value.trim()}` })}
              maxLength={7}
              placeholder="2563eb"
              className="h-7 w-20 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Color Theme
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleUpdate({ theme: "light" })}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
              currentTheme === "light"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => handleUpdate({ theme: "dark" })}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
              currentTheme === "dark"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => handleUpdate({ theme: "system" })}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
              currentTheme === "system"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Typography
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {FONTS.map((f) => {
            const isSelected = currentFont === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleUpdate({ fontFamily: f.id })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{f.label}</span>
                  <Type className="h-3.5 w-3.5 opacity-60" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
