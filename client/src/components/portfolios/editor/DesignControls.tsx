import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Laptop,
  Layers,
  Moon,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TEMPLATE_METADATA, type TemplateCategory } from "@/components/portfolios/templates/registry";
import {
  APPROVED_FONTS,
  COMMON_COLOR_PRESETS,
  HEX_COLOR_REGEX,
  getDefaultDesignSettings,
  getTemplateCustomizationConfig,
  validateCustomizationInput,
} from "@/components/portfolios/customization/templateCustomizationConfig";
import type { PortfolioDesignSettings, PortfolioTemplateId } from "@/types/portfolio";

export interface DesignControlsProps {
  design: PortfolioDesignSettings;
  onChange: (updated: PortfolioDesignSettings) => void;
}

const CATEGORIES: Array<{ id: TemplateCategory; label: string }> = [
  { id: "all", label: "All Templates" },
  { id: "creative", label: "Creative" },
  { id: "technical", label: "Technical" },
  { id: "minimal", label: "Minimal" },
];

export function DesignControls({ design, onChange }: DesignControlsProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("all");
  const [hexInputError, setHexInputError] = useState<string | null>(null);

  const currentTemplate: PortfolioTemplateId = (design.template as PortfolioTemplateId) || "spotlight";
  const config = useMemo(() => getTemplateCustomizationConfig(currentTemplate), [currentTemplate]);

  const currentTheme = design.theme || "system";
  const currentColor = design.primaryColor || "#2563eb";
  const currentFont = design.fontFamily || config.supportedFonts[0] || "Inter";
  const currentBgEffect = design.backgroundEffect || "default";

  // Filter fonts supported by the active template
  const availableFonts = useMemo(() => {
    return APPROVED_FONTS.filter((f) => config.supportedFonts.includes(f.id));
  }, [config.supportedFonts]);

  const handleUpdate = (patch: Partial<PortfolioDesignSettings>) => {
    const nextDesign: Partial<PortfolioDesignSettings> = {
      ...design,
      ...patch,
    };
    const { sanitized } = validateCustomizationInput(currentTemplate, nextDesign);
    onChange(sanitized);
  };

  const handleTemplateSwitch = (newTemplateId: PortfolioTemplateId) => {
    // When switching templates, use defaults for the new template while preserving existing theme preference
    const defaults = getDefaultDesignSettings(newTemplateId);
    onChange({
      ...defaults,
      theme: design.theme || defaults.theme,
      sectionOrder: design.sectionOrder || defaults.sectionOrder,
      sectionVisibility: design.sectionVisibility || defaults.sectionVisibility,
    });
  };

  const handleResetDefaults = () => {
    const defaults = getDefaultDesignSettings(currentTemplate);
    onChange({
      ...defaults,
      sectionOrder: design.sectionOrder || defaults.sectionOrder,
      sectionVisibility: design.sectionVisibility || defaults.sectionVisibility,
    });
  };

  const handleCustomHexChange = (value: string) => {
    const formatted = value.startsWith("#") ? value : `#${value}`;
    if (value.trim() === "" || value.trim() === "#") {
      setHexInputError(null);
      return;
    }

    if (!HEX_COLOR_REGEX.test(formatted)) {
      setHexInputError("Invalid hex code (e.g. #2563eb)");
    } else {
      setHexInputError(null);
      handleUpdate({ primaryColor: formatted });
    }
  };

  const handleTemplateSettingChange = (key: string, value: unknown) => {
    const existing = design.templateSettings || {};
    handleUpdate({
      templateSettings: {
        ...existing,
        [key]: value,
      },
    });
  };

  const handleLayoutOptionChange = (key: string, value: string) => {
    const existing = design.layoutOptions || {};
    handleUpdate({
      layoutOptions: {
        ...existing,
        [key]: value,
      },
    });
  };

  const filteredTemplates = TEMPLATE_METADATA.filter((tpl) => {
    if (selectedCategory === "all") return true;
    return tpl.category === selectedCategory;
  });

  return (
    <div className="space-y-7">
      {/* Header with Title and Reset Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Design & Portfolio Customization</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Customize styling, typography, backgrounds, and layout options for {config.name}.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetDefaults}
          className="text-xs gap-1.5 h-8 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          title="Restore this template's original default design"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Defaults</span>
        </Button>
      </div>

      {/* 1. Template Selection Grid */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredTemplates.map((tpl) => {
            const isSelected = currentTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleTemplateSwitch(tpl.id)}
                className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all relative ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {tpl.name}
                  </span>
                  {tpl.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {tpl.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2 line-clamp-2">
                  {tpl.description}
                </p>
                {tpl.features && tpl.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
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

      {/* 2. Color Accent Picker */}
      {config.supportsColorAccent && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <span>Theme Accent Color</span>
            </Label>
            <span className="text-[11px] font-mono text-neutral-400">{currentColor}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {COMMON_COLOR_PRESETS.map((color) => {
              const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => {
                    setHexInputError(null);
                    handleUpdate({ primaryColor: color.hex });
                  }}
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

            {/* Custom HEX Input */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-neutral-400 font-mono">#</span>
              <Input
                defaultValue={currentColor.replace(/^#/, "")}
                key={currentColor}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                maxLength={8}
                placeholder="2563eb"
                className={`h-7 w-24 text-xs font-mono ${hexInputError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              <div
                className="w-5 h-5 rounded-md border border-neutral-300 dark:border-neutral-700 shadow-xs shrink-0"
                style={{ backgroundColor: currentColor }}
              />
            </div>
          </div>
          {hexInputError && (
            <p className="text-[11px] text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {hexInputError}
            </p>
          )}
        </div>
      )}

      {/* 3. Color Theme (Light / Dark / System) */}
      {config.supportsThemeToggle && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Visual Theme Mode
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleUpdate({ theme: "light" })}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                currentTheme === "light"
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shadow-xs"
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
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shadow-xs"
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
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>System</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Typography Selection */}
      {config.supportsTypography && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Typography ({availableFonts.length} options)
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {availableFonts.map((f) => {
              const isSelected = currentFont === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleUpdate({ fontFamily: f.id })}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-medium shadow-xs"
                      : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{f.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono">
                      {f.preview}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Background & Visual Theme */}
      {config.supportedBackgroundEffects.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
            <span>Background & Visual Aura</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {config.supportedBackgroundEffects.map((bg) => {
              const isSelected = currentBgEffect === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => handleUpdate({ backgroundEffect: bg.id })}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>{bg.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                    {bg.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Supported Layout Options (Only displayed if template supports multiple options) */}
      {(config.supportedLayoutOptions.projectsLayout && config.supportedLayoutOptions.projectsLayout.length > 1) ||
      (config.supportedLayoutOptions.skillsLayout && config.supportedLayoutOptions.skillsLayout.length > 1) ? (
        <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-neutral-500" />
            <span>Supported Layout Options</span>
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Projects Layout */}
            {config.supportedLayoutOptions.projectsLayout && config.supportedLayoutOptions.projectsLayout.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Projects Layout
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {config.supportedLayoutOptions.projectsLayout.map((layout) => {
                    const activeLayout =
                      design.layoutOptions?.projectsLayout ||
                      config.supportedLayoutOptions.projectsLayout![0];
                    const isSelected = activeLayout === layout;
                    return (
                      <button
                        key={layout}
                        type="button"
                        onClick={() => handleLayoutOptionChange("projectsLayout", layout)}
                        className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-medium"
                            : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                        }`}
                      >
                        {layout}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skills Layout */}
            {config.supportedLayoutOptions.skillsLayout && config.supportedLayoutOptions.skillsLayout.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Skills Display Mode
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {config.supportedLayoutOptions.skillsLayout.map((layout) => {
                    const activeLayout =
                      design.layoutOptions?.skillsLayout ||
                      config.supportedLayoutOptions.skillsLayout![0];
                    const isSelected = activeLayout === layout;
                    return (
                      <button
                        key={layout}
                        type="button"
                        onClick={() => handleLayoutOptionChange("skillsLayout", layout)}
                        className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-medium"
                            : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                        }`}
                      >
                        {layout}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* 7. Template-Specific Settings (Only displayed if supported by active template) */}
      {config.templateSettings.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-neutral-500" />
              <span>{config.name} Unique Settings</span>
            </Label>
            <span className="text-[10px] text-neutral-400 font-mono">
              {config.templateSettings.length} customizable {config.templateSettings.length === 1 ? "option" : "options"}
            </span>
          </div>

          <div className="space-y-3">
            {config.templateSettings.map((setting) => {
              const currentVal =
                design.templateSettings?.[setting.key] !== undefined
                  ? design.templateSettings[setting.key]
                  : setting.defaultValue;

              if (setting.type === "boolean") {
                const checked = Boolean(currentVal);
                return (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50"
                  >
                    <div className="space-y-0.5 pr-4">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {setting.label}
                      </div>
                      {setting.description && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleTemplateSettingChange(setting.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600" />
                    </label>
                  </div>
                );
              }

              if (setting.type === "select" && setting.options) {
                return (
                  <div
                    key={setting.key}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 space-y-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {setting.label}
                      </div>
                      {setting.description && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {setting.options.map((opt) => {
                        const isSelected = String(currentVal) === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleTemplateSettingChange(setting.key, opt.value)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              if (setting.type === "text") {
                return (
                  <div
                    key={setting.key}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 space-y-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {setting.label}
                      </div>
                      {setting.description && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <Input
                      value={String(currentVal ?? "")}
                      placeholder={setting.placeholder}
                      onChange={(e) => handleTemplateSettingChange(setting.key, e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
