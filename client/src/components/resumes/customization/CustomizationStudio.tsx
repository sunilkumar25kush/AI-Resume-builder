import { useState } from "react";
import {
  RotateCcw,
  Check,
  Minus,
  Plus,
  Smile,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_CUSTOMIZATION,
  FONT_OPTIONS,
  COLOR_PALETTES,
} from "@/utils/customization";
import type { ResumeCustomization } from "@/types";

export type CustomizationTab =
  | "font-size"
  | "spacing"
  | "entries"
  | "headings"
  | "font"
  | "colors"
  | "header";

interface CustomizationStudioProps {
  customization?: ResumeCustomization;
  onChange: (next: ResumeCustomization) => void;
  onReset?: () => void;
}

const MENU_ITEMS: { id: CustomizationTab; label: string }[] = [
  { id: "font-size", label: "Font Size" },
  { id: "spacing", label: "Spacing" },
  { id: "entries", label: "Entries" },
  { id: "headings", label: "Headings" },
  { id: "font", label: "Font" },
  { id: "colors", label: "Colors" },
  { id: "header", label: "Header" },
];

/** FlowCV-style Notch Slider with - and + step buttons */
function NotchSlider({
  label,
  value,
  displayValue,
  options,
  onChange,
}: {
  label: string;
  value: string;
  displayValue?: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  const currentIndex = Math.max(0, options.indexOf(value));

  const handlePrev = () => {
    if (currentIndex > 0) {
      onChange(options[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < options.length - 1) {
      onChange(options[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
        <span>{label}</span>
        <span className="text-slate-500 font-medium text-[11px]">{displayValue || value}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Notch Track */}
        <div className="relative flex-1 h-8 bg-slate-100 dark:bg-slate-800/80 rounded-lg flex items-center px-1 select-none border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-full flex items-center justify-between relative">
            {options.map((opt, i) => {
              const isActive = i === currentIndex;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(opt)}
                  className="group relative flex items-center justify-center h-7 focus:outline-hidden"
                  style={{ width: `${100 / options.length}%` }}
                >
                  {/* Notch line */}
                  <span
                    className={`h-3 w-[1.5px] rounded-full transition-colors ${
                      isActive
                        ? "bg-transparent"
                        : "bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400"
                    }`}
                  />
                  {/* Purple Thumb Indicator */}
                  {isActive && (
                    <span className="absolute inset-0 m-auto h-6 w-8 rounded-md bg-purple-600 dark:bg-purple-500 shadow-sm flex items-center justify-center transition-all animate-in fade-in zoom-in-90" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={currentIndex <= 0}
            onClick={handlePrev}
            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Decrease"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={currentIndex >= options.length - 1}
            onClick={handleNext}
            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Increase"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomizationStudio({
  customization = {},
  onChange,
  onReset,
}: CustomizationStudioProps) {
  const [activeTab, setActiveTab] = useState<CustomizationTab>("font-size");

  const current = { ...DEFAULT_CUSTOMIZATION, ...customization };

  const update = <K extends keyof ResumeCustomization>(key: K, value: ResumeCustomization[K]) => {
    onChange({
      ...current,
      [key]: value,
    });
  };

  const updateAccentTarget = (key: keyof NonNullable<ResumeCustomization["accentTargets"]>, val: boolean) => {
    onChange({
      ...current,
      accentTargets: {
        ...(current.accentTargets || DEFAULT_CUSTOMIZATION.accentTargets),
        [key]: val,
      },
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start w-full">
      {/* FlowCV-Style Vertical Navigation */}
      <div className="w-full sm:w-44 shrink-0 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 px-1">
          Customization
        </div>
        <nav className="flex flex-wrap sm:flex-col gap-1 sm:gap-2" aria-label="Resume Customization Sections">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`text-left px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 flex items-center justify-between group ${
                  isActive
                    ? "text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/40 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                )}
              </button>
            );
          })}
        </nav>

        {onReset && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 hidden sm:block">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset defaults
            </Button>
          </div>
        )}
      </div>

      {/* Main Options Panel */}
      <div className="flex-1 w-full min-w-0">
        {/* 1. FONT SIZE */}
        {activeTab === "font-size" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Font Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <NotchSlider
                label="Base Font Size"
                value={current.baseFontSize || "11.5pt"}
                options={["9pt", "9.5pt", "10pt", "10.5pt", "11pt", "11.5pt", "12pt", "12.5pt", "13pt"]}
                onChange={(val) => {
                  update("baseFontSize", val);
                  update("fontSize", val);
                }}
              />

              <NotchSlider
                label="Full Name"
                value={current.fullNameSize || "+12.5pt"}
                options={["+6pt", "+8pt", "+10pt", "+12.5pt", "+15pt", "+18pt", "+22pt"]}
                onChange={(val) => update("fullNameSize", val)}
              />

              <NotchSlider
                label="Professional Title"
                value={current.titleSize || "+8pt"}
                options={["+2pt", "+4pt", "+6pt", "+8pt", "+10pt", "+12pt"]}
                onChange={(val) => update("titleSize", val)}
              />

              <NotchSlider
                label="Section Headings"
                value={current.sectionHeadingsSize || "+4pt"}
                options={["+1pt", "+2pt", "+3pt", "+4pt", "+5pt", "+6pt"]}
                onChange={(val) => update("sectionHeadingsSize", val)}
              />

              <NotchSlider
                label="Entry Header"
                value={current.entryHeaderSize || "+0.5pt"}
                options={["0pt", "+0.5pt", "+1pt", "+1.5pt", "+2pt", "+2.5pt", "+3pt"]}
                onChange={(val) => update("entryHeaderSize", val)}
              />
            </CardContent>
          </Card>
        )}

        {/* 2. SPACING */}
        {activeTab === "spacing" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Spacing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <NotchSlider
                label="Line Height"
                value={current.lineHeight || "1.25"}
                options={["1.15", "1.2", "1.25", "1.3", "1.35", "1.45", "1.6"]}
                onChange={(val) => update("lineHeight", val)}
              />

              <NotchSlider
                label="Space Between Elements"
                value={current.spaceElements || "[0]"}
                options={["[--]", "[-]", "[0]", "[+]", "[++]"]}
                onChange={(val) => update("spaceElements", val)}
              />

              <NotchSlider
                label="Left & Right Margin"
                value={current.leftRightMargin || "22mm"}
                options={["12mm", "16mm", "18mm", "22mm", "26mm", "30mm"]}
                onChange={(val) => update("leftRightMargin", val)}
              />

              <NotchSlider
                label="Top & Bottom Margin"
                value={current.topBottomMargin || "12mm"}
                options={["8mm", "10mm", "12mm", "15mm", "18mm", "22mm"]}
                onChange={(val) => update("topBottomMargin", val)}
              />
            </CardContent>
          </Card>
        )}

        {/* 3. ENTRIES */}
        {activeTab === "entries" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Entry Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Structure */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Structure</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update("entryStructure", "full-width")}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      current.entryStructure !== "columns"
                        ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="flex flex-col gap-1 items-center w-12">
                      <div className="h-1 w-full bg-current rounded-full opacity-60" />
                      <div className="h-1 w-full bg-current rounded-full opacity-60" />
                      <div className="h-1 w-full bg-current rounded-full opacity-60" />
                    </div>
                    <span className="text-xs font-medium">Full Width</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => update("entryStructure", "columns")}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      current.entryStructure === "columns"
                        ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1.5 w-12">
                      <div className="h-1 w-full bg-current rounded-full opacity-60" />
                      <div className="h-1 w-full bg-current rounded-full opacity-60" />
                      <div className="h-1 w-full bg-current rounded-full opacity-60" />
                      <div className="h-1 w-full bg-current rounded-full opacity-60" />
                    </div>
                    <span className="text-xs font-medium">Columns</span>
                  </button>
                </div>
              </div>

              {/* Date & Location Position */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Date & Location Position
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["right", "left", "split"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => update("datePosition", pos)}
                      className={`h-10 rounded-lg text-xs font-medium border capitalize transition-all ${
                        (current.datePosition || "right") === pos
                          ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Placement */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Subtitle Placement
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update("subtitlePlacement", "same-line")}
                    className={`h-10 rounded-lg text-xs font-medium border transition-all ${
                      current.subtitlePlacement !== "below"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Try Same Line
                  </button>
                  <button
                    type="button"
                    onClick={() => update("subtitlePlacement", "below")}
                    className={`h-10 rounded-lg text-xs font-medium border transition-all ${
                      current.subtitlePlacement === "below"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Below Title
                  </button>
                </div>
              </div>

              {/* Bullet Style */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Bullet Style
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: "dot", label: "• Dot" },
                    { id: "dash", label: "– Dash" },
                    { id: "circle", label: "○ Circle" },
                    { id: "square", label: "■ Square" },
                    { id: "arrow", label: "▸ Arrow" },
                    { id: "none", label: "None" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => update("bulletStyle", b.id as any)}
                      className={`h-9 rounded-lg text-xs font-medium border transition-all ${
                        (current.bulletStyle || "dot") === b.id
                          ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. HEADINGS */}
        {activeTab === "headings" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Section Headings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Style Icons (8 Options from FlowCV) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Style</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    {
                      id: "line",
                      render: (
                        <div className="w-10 flex flex-col gap-1 items-start">
                          <div className="h-1.5 w-7 bg-current rounded-xs" />
                          <div className="h-[1px] w-full bg-current opacity-60" />
                        </div>
                      ),
                    },
                    {
                      id: "box",
                      render: (
                        <div className="w-10 border border-current rounded-xs p-1 flex items-center justify-center">
                          <div className="h-1.5 w-6 bg-current rounded-xs" />
                        </div>
                      ),
                    },
                    {
                      id: "double",
                      render: (
                        <div className="w-10 flex flex-col gap-1 items-start">
                          <div className="h-[1px] w-full bg-current opacity-60" />
                          <div className="h-1.5 w-7 bg-current rounded-xs" />
                          <div className="h-[1px] w-full bg-current opacity-60" />
                        </div>
                      ),
                    },
                    {
                      id: "split",
                      render: (
                        <div className="w-10 flex items-center justify-between gap-1">
                          <div className="h-[1px] flex-1 bg-current opacity-60" />
                          <div className="h-1.5 w-5 bg-current rounded-xs" />
                          <div className="h-[1px] flex-1 bg-current opacity-60" />
                        </div>
                      ),
                    },
                    {
                      id: "left-bar",
                      render: (
                        <div className="w-10 flex items-center gap-1.5">
                          <div className="h-4 w-1 bg-purple-600 rounded-xs" />
                          <div className="h-1.5 w-6 bg-current rounded-xs" />
                        </div>
                      ),
                    },
                    {
                      id: "thick-line",
                      render: (
                        <div className="w-10 flex flex-col gap-1 items-start">
                          <div className="h-1.5 w-7 bg-current rounded-xs" />
                          <div className="h-1 w-full bg-current opacity-70" />
                        </div>
                      ),
                    },
                    {
                      id: "colored-line",
                      render: (
                        <div className="w-10 flex flex-col gap-1 items-start">
                          <div className="h-1.5 w-7 bg-current rounded-xs" />
                          <div className="h-1 w-full bg-purple-600 rounded-xs" />
                        </div>
                      ),
                    },
                    {
                      id: "wave",
                      render: (
                        <div className="w-10 flex flex-col gap-1 items-start">
                          <div className="h-1.5 w-7 bg-current rounded-xs" />
                          <div className="w-full text-[9px] tracking-widest leading-none text-current opacity-70">
                            〰〰〰
                          </div>
                        </div>
                      ),
                    },
                  ].map((styleOpt) => (
                    <button
                      key={styleOpt.id}
                      type="button"
                      onClick={() => update("headingStyle", styleOpt.id as any)}
                      className={`h-14 rounded-xl border flex items-center justify-center transition-all ${
                        (current.headingStyle || "line") === styleOpt.id
                          ? "border-purple-600 bg-purple-50/70 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-600/30"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                      }`}
                    >
                      {styleOpt.render}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capitalization */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Capitalization
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["capitalize", "uppercase", "normal"] as const).map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => update("headingCapitalization", cap)}
                      className={`h-10 rounded-lg text-xs font-medium border capitalize transition-all ${
                        (current.headingCapitalization || "uppercase") === cap
                          ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Icons
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["none", "outline", "filled"] as const).map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => update("headingIcons", ico)}
                      className={`h-10 rounded-lg text-xs font-medium border capitalize transition-all ${
                        (current.headingIcons || "none") === ico
                          ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. FONT */}
        {activeTab === "font" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Font
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Body Font Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Body Font
                </label>
                <div className="relative">
                  <select
                    value={current.bodyFont || current.fontFamily || "Alegreya"}
                    onChange={(e) => {
                      update("bodyFont", e.target.value);
                      update("fontFamily", e.target.value);
                    }}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-purple-600/30"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Name Font Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Name Font
                </label>
                <div className="relative">
                  <select
                    value={current.nameFont || "same"}
                    onChange={(e) => update("nameFont", e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-purple-600/30"
                  >
                    <option value="same">Same as body font</option>
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. COLORS */}
        {activeTab === "colors" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Target Buttons (Full Page / Header / Border) */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    id: "page",
                    label: "Full Page",
                    render: <div className="h-9 w-6 rounded-xs bg-purple-100 border border-purple-400" />,
                  },
                  {
                    id: "header",
                    label: "Header",
                    render: (
                      <div className="h-9 w-6 rounded-xs border border-slate-300 flex flex-col overflow-hidden">
                        <div className="h-3 w-full bg-slate-400" />
                      </div>
                    ),
                  },
                  {
                    id: "border",
                    label: "Border",
                    render: (
                      <div className="h-9 w-6 rounded-xs border-2 border-slate-400" />
                    ),
                  },
                ].map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => update("colorTarget", target.id as any)}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      (current.colorTarget || "page") === target.id
                        ? "border-purple-600 bg-purple-50/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-600/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {target.render}
                    <span className="text-xs font-medium">{target.label}</span>
                  </button>
                ))}
              </div>

              {/* Color Swatches Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Palette Colors
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {COLOR_PALETTES.map((color) => {
                    const isSelected = (current.accentColor || "#4F46E5").toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => update("accentColor", color.hex)}
                        title={color.name}
                        className="h-8 w-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <Check className="h-4 w-4 text-white drop-shadow-sm" />
                        )}
                      </button>
                    );
                  })}

                  {/* Custom Color Rainbow Picker */}
                  <label
                    title="Custom color"
                    className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 border-2 border-dashed border-slate-300 relative overflow-hidden"
                    style={{
                      background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                    }}
                  >
                    <input
                      type="color"
                      value={current.accentColor || "#4F46E5"}
                      onChange={(e) => update("accentColor", e.target.value)}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
              </div>

              {/* Apply Accent Color Checkboxes (FlowCV Model) */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Apply Accent Color
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: "name", label: "Name" },
                    { key: "dots", label: "Dots/bars/bubbles" },
                    { key: "jobTitle", label: "Job title" },
                    { key: "dates", label: "Dates" },
                    { key: "headings", label: "Headings" },
                    { key: "entrySubtitle", label: "Entry subtitle" },
                    { key: "headingsLine", label: "Headings line" },
                  ].map((item) => {
                    const isChecked = current.accentTargets?.[item.key as keyof NonNullable<ResumeCustomization["accentTargets"]>] ?? false;
                    return (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            updateAccentTarget(
                              item.key as keyof NonNullable<ResumeCustomization["accentTargets"]>,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7. HEADER */}
        {activeTab === "header" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Header
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Text Alignment */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Text Alignment
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update("headerAlignment", "left")}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      current.headerAlignment === "left"
                        ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="flex flex-col gap-1 items-start w-8">
                      <div className="h-1.5 w-7 bg-current rounded-full" />
                      <div className="h-1.5 w-5 bg-current rounded-full" />
                    </div>
                    <span className="text-xs font-medium">Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => update("headerAlignment", "center")}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      current.headerAlignment !== "left"
                        ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="flex flex-col gap-1 items-center w-8">
                      <div className="h-1.5 w-7 bg-current rounded-full" />
                      <div className="h-1.5 w-5 bg-current rounded-full" />
                    </div>
                    <span className="text-xs font-medium">Center</span>
                  </button>
                </div>
              </div>

              {/* Details Arrangement & Separators */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Details Arrangement
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => update("headerSeparator", "icon")}
                    className={`h-11 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      current.headerSeparator === "icon"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Smile className="h-3.5 w-3.5 text-purple-600" />
                    Icon
                  </button>

                  <button
                    type="button"
                    onClick={() => update("headerSeparator", "bullet")}
                    className={`h-11 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      current.headerSeparator === "bullet"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm">•</span>
                    Bullet
                  </button>

                  <button
                    type="button"
                    onClick={() => update("headerSeparator", "bar")}
                    className={`h-11 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      current.headerSeparator === "bar"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-600/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>|</span>
                    Bar
                  </button>
                </div>
              </div>

              {/* Profile Photo Controls */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Profile Photo
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Show or hide photo in header
                    </span>
                  </div>
                  <Switch
                    checked={current.showPhoto !== false}
                    onCheckedChange={(checked) => update("showPhoto", checked)}
                  />
                </div>

                {current.showPhoto !== false && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-slate-500">Shape</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["round", "rounded", "square"] as const).map((shape) => (
                          <button
                            key={shape}
                            type="button"
                            onClick={() => update("photoShape", shape)}
                            className={`h-8 rounded-lg text-xs font-medium border capitalize ${
                              (current.photoShape || "round") === shape
                                ? "border-purple-600 bg-purple-50 text-purple-700"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            {shape}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-slate-500">Size</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["small", "medium", "large"] as const).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => update("photoSize", size)}
                            className={`h-8 rounded-lg text-xs font-medium border capitalize ${
                              (current.photoSize || "medium") === size
                                ? "border-purple-600 bg-purple-50 text-purple-700"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
