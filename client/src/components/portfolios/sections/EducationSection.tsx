import { GraduationCap } from "lucide-react";

import type { PortfolioEducation } from "@/types/portfolio";

export interface EducationSectionProps {
  education?: PortfolioEducation[];
  variant?: "minimal" | "developer";
  primaryColor?: string;
  showEmpty?: boolean;
}

export function EducationSection({
  education = [],
  variant = "minimal",
  primaryColor: _primaryColor,
  showEmpty = false,
}: EducationSectionProps) {
  const validEdu = education.filter((ed) => ed?.institution?.trim() || ed?.degree?.trim());

  if (validEdu.length === 0 && !showEmpty) {
    return null;
  }

  if (variant === "developer") {
    return (
      <section className="py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              // 05. Academia
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mb-8 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-neutral-500" />
            <span>Education</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {validEdu.map((ed, idx) => {
              const dates = [ed.startDate, ed.endDate].filter(Boolean).join(" — ");
              return (
                <div
                  key={`${ed.institution}-${idx}`}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm space-y-2"
                >
                  <h3 className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">
                    {ed.degree}
                    {ed.fieldOfStudy && (
                      <span className="font-normal text-neutral-600 dark:text-neutral-400">
                        {" "}
                        in {ed.fieldOfStudy}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {ed.institution}
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-1">
                    <span>{dates}</span>
                    {ed.grade && <span>GPA / Grade: {ed.grade}</span>}
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Education
        </h2>

        <div className="space-y-6">
          {validEdu.map((ed, idx) => {
            const dates = [ed.startDate, ed.endDate].filter(Boolean).join(" — ");
            return (
              <div key={`${ed.institution}-${idx}`} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                    {ed.degree}
                    {ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ""}
                  </h3>
                  {dates && <span className="text-xs text-neutral-400 font-light">{dates}</span>}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light">
                  {ed.institution}
                  {ed.grade ? ` · Grade: ${ed.grade}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
