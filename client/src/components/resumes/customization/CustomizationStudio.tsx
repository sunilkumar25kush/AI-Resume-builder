import { useState } from "react";
import {
  RotateCcw,
  Check,
  AlignLeft,
  AlignCenter,
  Columns,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_CUSTOMIZATION,
  FONT_OPTIONS,
  COLOR_PALETTES,
  TEXT_COLORS,
  BACKGROUND_COLORS,
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
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Font Size</span>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-normal">
                  {current.fontSize}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Body Text Size (Primary Font)
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {(["12px", "13px", "14px", "15px", "16px"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => update("fontSize", size)}
                      className={`h-11 rounded-xl text-sm font-medium border flex flex-col items-center justify-center transition-all ${
                        current.fontSize === size
                          ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:border-purple-400 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{size}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {size === "12px" ? "Compact" : size === "14px" ? "Standard" : size === "16px" ? "Large" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Text Density Scale
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "compact", label: "Compact", desc: "Fits more on 1 page" },
                    { id: "normal", label: "Balanced", desc: "Recommended ATS" },
                    { id: "large", label: "Spacious", desc: "Easy scanning" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => update("fontSizeScale", preset.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        current.fontSizeScale === preset.id
                          ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="font-medium text-xs">{preset.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. SPACING */}
        {activeTab === "spacing" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Spacing & Margins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Page Margin (Outer Edge)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "compact", label: "Compact", sub: "20px / 0.5 in" },
                    { id: "normal", label: "Normal", sub: "32px / 0.75 in" },
                    { id: "relaxed", label: "Relaxed", sub: "44px / 1.0 in" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => update("pageMargin", m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.pageMargin === m.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground">{m.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Section Spacing (Gap between sections)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "compact", label: "Tight", sub: "10px" },
                    { id: "normal", label: "Standard", sub: "18px" },
                    { id: "relaxed", label: "Spacious", sub: "26px" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => update("sectionSpacing", s.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.sectionSpacing === s.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{s.label}</span>
                      <span className="text-[10px] text-muted-foreground">{s.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Entry Spacing (Gap between jobs / degrees)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "compact", label: "Tight", sub: "6px" },
                    { id: "normal", label: "Standard", sub: "12px" },
                    { id: "relaxed", label: "Spacious", sub: "18px" },
                  ].map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => update("entrySpacing", e.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.entrySpacing === e.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{e.label}</span>
                      <span className="text-[10px] text-muted-foreground">{e.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Line Height (Text Leading)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1.3", label: "Tight", sub: "1.30" },
                    { id: "1.45", label: "Normal", sub: "1.45" },
                    { id: "1.6", label: "Loose", sub: "1.60" },
                  ].map((lh) => (
                    <button
                      key={lh.id}
                      type="button"
                      onClick={() => update("lineHeight", lh.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.lineHeight === lh.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{lh.label}</span>
                      <span className="text-[10px] text-muted-foreground">{lh.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. ENTRIES */}
        {activeTab === "entries" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Entry Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Bullet Point Style</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: "dot", label: "Disc", symbol: "•" },
                    { id: "dash", label: "Dash", symbol: "–" },
                    { id: "circle", label: "Circle", symbol: "○" },
                    { id: "square", label: "Square", symbol: "▪" },
                    { id: "arrow", label: "Arrow", symbol: "▸" },
                    { id: "none", label: "None", symbol: "—" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => update("bulletStyle", b.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        current.bulletStyle === b.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-base font-semibold">{b.symbol}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Date Alignment</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update("datePlacement", "right")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      current.datePlacement === "right"
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-semibold">Right Aligned</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Title on left, dates on far right (Standard)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => update("datePlacement", "below")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      current.datePlacement === "below"
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-semibold">Below Title</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Dates sit right underneath job or school</div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. HEADINGS */}
        {activeTab === "headings" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Section Headings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Text Capitalization</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "uppercase", label: "EXPERIENCE", sub: "ALL CAPS" },
                    { id: "capitalize", label: "Experience", sub: "Title Case" },
                    { id: "normal", label: "experience", sub: "Standard" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => update("headingStyle", c.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.headingStyle === c.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{c.label}</span>
                      <span className="text-[10px] text-muted-foreground">{c.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Heading Font Size</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["14px", "16px", "18px", "20px"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update("headingSize", s)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.headingSize === s
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Divider Line Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "line", label: "Solid Line", sub: "Underline divider" },
                    { id: "bar", label: "Accent Bar", sub: "Bold accent bar" },
                    { id: "none", label: "No Line", sub: "Clean whitespace" },
                  ].map((div) => (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => update("headingDivider", div.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.headingDivider === div.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{div.label}</span>
                      <span className="text-[10px] text-muted-foreground">{div.sub}</span>
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
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Typography & Font Family</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FONT_OPTIONS.map((f) => {
                  const isSelected = current.fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => update("fontFamily", f.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 ring-2 ring-purple-600/20 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{f.category}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
                      </div>
                      <div className="text-base font-semibold" style={{ fontFamily: f.font }}>
                        {f.name}
                      </div>
                      <div className="text-xs text-muted-foreground/80 mt-1" style={{ fontFamily: f.font }}>
                        The quick brown fox
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. COLORS */}
        {activeTab === "colors" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Accent Color (Headings, badges, highlights)</span>
                  <span className="font-mono text-[11px] font-medium">{current.accentColor}</span>
                </Label>
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {COLOR_PALETTES.map((color) => {
                    const isSelected = current.accentColor?.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => update("accentColor", color.hex)}
                        title={color.name}
                        className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? "ring-2 ring-offset-2 ring-purple-600 scale-110 shadow-sm" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="color"
                    value={current.accentColor || "#4F46E5"}
                    onChange={(e) => update("accentColor", e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer border border-input p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={current.accentColor || ""}
                    onChange={(e) => update("accentColor", e.target.value)}
                    placeholder="#4F46E5"
                    className="h-8 px-2.5 rounded-lg border border-input text-xs font-mono uppercase bg-background flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Text Tone</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_COLORS.map((t) => (
                    <button
                      key={t.hex}
                      type="button"
                      onClick={() => update("textColor", t.hex)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                        current.textColor === t.hex
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: t.hex }} />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Page Background Tone</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUND_COLORS.map((bg) => (
                    <button
                      key={bg.hex}
                      type="button"
                      onClick={() => update("backgroundColor", bg.hex)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                        current.backgroundColor === bg.hex
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: bg.hex }} />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7. HEADER */}
        {activeTab === "header" && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Header & Photo Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Header Layout</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "left", label: "Left Aligned", icon: AlignLeft },
                    { id: "center", label: "Centered", icon: AlignCenter },
                    { id: "split", label: "2-Column Split", icon: Columns },
                  ].map((l) => {
                    const IconComp = l.icon;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => update("headerLayout", l.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          current.headerLayout === l.id
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                            : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <IconComp className="h-4 w-4 mb-1" />
                        <span className="text-xs font-medium">{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Candidate Name Size</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "24px", label: "Medium", sub: "24px" },
                    { id: "28px", label: "Standard", sub: "28px" },
                    { id: "34px", label: "Large", sub: "34px" },
                    { id: "40px", label: "Bold", sub: "40px" },
                  ].map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => update("headerNameSize", n.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        current.headerNameSize === n.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{n.label}</span>
                      <span className="text-[10px] text-muted-foreground">{n.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium">Show Photo on Resume</Label>
                    <p className="text-xs text-muted-foreground">Toggle photo display on templates that support it</p>
                  </div>
                  <Switch
                    checked={current.showPhoto !== false}
                    onCheckedChange={(val) => update("showPhoto", val)}
                  />
                </div>

                {current.showPhoto !== false && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Photo Shape</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "round", label: "Circle" },
                          { id: "rounded", label: "Rounded" },
                          { id: "square", label: "Square" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => update("photoShape", s.id as any)}
                            className={`p-2 rounded-lg border text-xs text-center transition-all ${
                              current.photoShape === s.id
                                ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Photo Size</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "small", label: "Small" },
                          { id: "medium", label: "Medium" },
                          { id: "large", label: "Large" },
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => update("photoSize", sz.id as any)}
                            className={`p-2 rounded-lg border text-xs text-center transition-all ${
                              current.photoSize === sz.id
                                ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {sz.label}
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
