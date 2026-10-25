import { Moon, Sun } from "lucide-react";

export interface ThemeModeToggleProps {
  theme: "light" | "dark" | "system";
  onChange: (theme: "light" | "dark") => void;
  className?: string;
}

export function ThemeModeToggle({ theme, onChange, className = "" }: ThemeModeToggleProps) {
  return (
    <div className={`inline-flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800 ${className}`}>
      <button
        type="button"
        title="Switch to light mode"
        aria-label="Light mode"
        onClick={() => onChange("light")}
        className={`p-1.5 rounded-md transition-colors ${
          theme === "light"
            ? "bg-neutral-800 text-amber-300 font-semibold shadow-xs"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Switch to dark mode"
        aria-label="Dark mode"
        onClick={() => onChange("dark")}
        className={`p-1.5 rounded-md transition-colors ${
          theme === "dark"
            ? "bg-neutral-800 text-blue-300 font-semibold shadow-xs"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
