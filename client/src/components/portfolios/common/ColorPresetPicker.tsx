import { Check, Palette } from "lucide-react";

export interface ColorPreset {
  name: string;
  value: string;
}

export interface ColorPresetPickerProps {
  currentColor: string;
  onChange: (colorHex: string) => void;
  colors?: ColorPreset[];
  showLabel?: boolean;
  className?: string;
}

export const DEFAULT_PRESET_COLORS: ColorPreset[] = [
  { name: "Crimson", value: "#e3141f" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#9333ea" },
  { name: "Emerald", value: "#059669" },
  { name: "Amber", value: "#d97706" },
  { name: "Slate", value: "#475569" },
];

export function ColorPresetPicker({
  currentColor,
  onChange,
  colors = DEFAULT_PRESET_COLORS,
  showLabel = true,
  className = "",
}: ColorPresetPickerProps) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 ${className}`}>
      {showLabel && <Palette className="h-3 w-3 text-neutral-400" aria-hidden />}
      {colors.map((col) => {
        const isSelected = currentColor.toLowerCase() === col.value.toLowerCase();
        return (
          <button
            key={col.name}
            type="button"
            title={col.name}
            aria-label={`Select ${col.name} accent color`}
            onClick={() => onChange(col.value)}
            className="w-3.5 h-3.5 rounded-full border border-white/20 transition-transform hover:scale-125 flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white"
            style={{ backgroundColor: col.value }}
          >
            {isSelected && <Check className="h-2 w-2 text-white" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
