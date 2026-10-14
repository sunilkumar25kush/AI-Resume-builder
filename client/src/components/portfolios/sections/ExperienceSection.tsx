import { Briefcase, Calendar } from "lucide-react";

import type { PortfolioExperience } from "@/types/portfolio";

export interface ExperienceSectionProps {
  experience?: PortfolioExperience[];
  variant?: "minimal" | "developer";
  primaryColor?: string;
  showEmpty?: boolean;
}

export function ExperienceSection({
  experience = [],
  variant = "minimal",
  primaryColor: _primaryColor,
  showEmpty = false,
}: ExperienceSectionProps) {
  const validExp = experience.filter((e) => e?.title?.trim() || e?.company?.trim());

  if (validExp.length === 0 && !showEmpty) {
    return null;
  }

  if (variant === "developer") {
    return (
      <section className="py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              // 04. Career History
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mb-8 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-neutral-500" />
            <span>Work Experience</span>
          </h2>

          <div className="relative border-l-2 border-neutral-200 dark:border-neutral-800 ml-3 sm:ml-4 space-y-10 pl-6 sm:pl-8">
            {validExp.map((exp, idx) => {
              const dateRange = [exp.startDate, exp.current ? "Present" : exp.endDate]
                .filter(Boolean)
                .join(" — ");

              return (
                <div key={`${exp.company}-${idx}`} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-neutral-950 border-2 border-neutral-400 dark:border-neutral-600 group-hover:border-blue-500 transition-colors" />

                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100">
                          {exp.title}
                        </h3>
                        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          {exp.company}
                          {exp.location && (
                            <span className="text-neutral-500 font-normal"> · {exp.location}</span>
                          )}
                        </p>
                      </div>

                      {dateRange && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md self-start sm:self-auto">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{dateRange}</span>
                        </div>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {exp.description}
                      </p>
                    )}

                    {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                      <ul className="space-y-1.5 pt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        {exp.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2">
                            <span className="text-neutral-400 font-mono select-none">›</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Minimal variant
  return (
    <section className="py-12 sm:py-16 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Experience
        </h2>

        <div className="space-y-8">
          {validExp.map((exp, idx) => {
            const dateRange = [exp.startDate, exp.current ? "Present" : exp.endDate]
              .filter(Boolean)
              .join(" — ");

            return (
              <div key={`${exp.company}-${idx}`} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    {exp.title} <span className="text-neutral-400 font-light">at</span> {exp.company}
                  </h3>
                  {dateRange && (
                    <span className="text-xs text-neutral-400 font-light">{dateRange}</span>
                  )}
                </div>

                {exp.description && (
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                  <ul className="space-y-1 pt-1 text-sm text-neutral-600 dark:text-neutral-400 font-light">
                    {exp.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <span className="text-neutral-300 dark:text-neutral-600 select-none">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
