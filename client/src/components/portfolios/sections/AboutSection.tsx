import { User } from "lucide-react";

export interface AboutSectionProps {
  bio?: string;
  variant?: "minimal" | "developer";
  showEmpty?: boolean;
}

export function AboutSection({
  bio,
  variant = "minimal",
  showEmpty = false,
}: AboutSectionProps) {
  if (!bio?.trim() && !showEmpty) {
    return null;
  }

  const content = bio || (showEmpty ? "Write a brief description about your background, values, and focus." : "");

  if (variant === "developer") {
    return (
      <section className="py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              // 01. Overview
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-neutral-500" />
            <span>About Me</span>
          </h2>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
            <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
              {content}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Minimal variant
  return (
    <section className="py-12 sm:py-16 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          About
        </h2>
        <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line font-light">
          {content}
        </p>
      </div>
    </section>
  );
}
