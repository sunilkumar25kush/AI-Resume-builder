import { useState } from "react";
import { Check, Laptop, Moon, Palette, Sun, Type } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEMPLATE_METADATA, type TemplateCategory } from "@/components/portfolios/templates/registry";
import type { PortfolioDesignSettings } from "@/types/portfolio";

export interface DesignControlsProps {
  design: PortfolioDesignSettings;
  onChange: (updated: PortfolioDesignSettings) => void;
}

const COLOR_PRESETS = [
  { name: "Cyan Glow", hex: "#06b6d4" },
  { name: "Cobalt Blue", hex: "#2563eb" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Royal Purple", hex: "#9333ea" },
  { name: "Electric Indigo", hex: "#4f46e5" },
  { name: "Amber Gold", hex: "#d97706" },
  { name: "Rose Crimson", hex: "#e11d48" },
  { name: "Slate Neutral", hex: "#334155" },
];

const FONTS = [
  { id: "Inter", label: "Modern Sans (Inter)", preview: "Sans" },
  { id: "Roboto", label: "Clean Sans (Roboto)", preview: "Sans" },
  { id: "Merriweather", label: "Editorial Serif (Merriweather)", preview: "Serif" },
  { id: "Playfair", label: "Display Serif (Playfair)", preview: "Serif" },
  { id: "JetBrains", label: "Technical Mono (JetBrains)", preview: "Mono" },
];

const CATEGORIES: Array<{ id: TemplateCategory; label: string }> = [
  { id: "all", label: "All Templates" },
  { id: "3d", label: "3D & WebGL" },
  { id: "technical", label: "Technical" },
  { id: "creative", label: "Creative" },
  { id: "editorial", label: "Editorial" },
  { id: "minimal", label: "Minimal" },
];

export function DesignControls({ design, onChange }: DesignControlsProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("all");
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

  const filteredTemplates = TEMPLATE_METADATA.filter((tpl) => {
    if (selectedCategory === "all") return true;
    return tpl.category === selectedCategory;
  });

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
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Portfolio Template ({filteredTemplates.length})
          </Label>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredTemplates.map((tpl) => {
            const isSelected = currentTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleUpdate({ template: tpl.id })}
                className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all relative ${isSelected
                    ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {tpl.name}
                  </span>
                  {tpl.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {tpl.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2">
                  {tpl.description}
                </p>
                {tpl.features && tpl.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tpl.features.slice(0, 3).map((feat) => (
                      <span
                        key={feat}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}
                {tpl.author && (
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                    By {tpl.author} {tpl.license ? `(${tpl.license})` : ""}
                  </div>
                )}
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
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs ${isSelected ? "ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-110" : ""
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
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${currentTheme === "light"
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
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${currentTheme === "dark"
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
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${currentTheme === "system"
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
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${isSelected
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
