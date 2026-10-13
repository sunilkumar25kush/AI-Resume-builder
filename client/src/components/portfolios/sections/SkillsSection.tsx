import { Cpu } from "lucide-react";

import type { PortfolioSkill } from "@/types/portfolio";

export interface SkillsSectionProps {
  skills?: PortfolioSkill[];
  variant?: "minimal" | "developer";
  primaryColor?: string;
  showEmpty?: boolean;
}

export function SkillsSection({
  skills = [],
  variant = "minimal",
  primaryColor: _primaryColor,
  showEmpty = false,
}: SkillsSectionProps) {
  const validSkills = skills.filter((s) => s?.name?.trim());

  if (validSkills.length === 0 && !showEmpty) {
    return null;
  }

  // Group by category if available
  const categories: Record<string, PortfolioSkill[]> = {};
  for (const skill of validSkills) {
    const cat = skill.category?.trim() || "Core Competencies";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(skill);
  }

  const categoryEntries = Object.entries(categories);

  if (variant === "developer") {
    return (
      <section className="py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              // 02. Stack & Skills
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mb-8 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-neutral-500" />
            <span>Technologies & Skills</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryEntries.length > 0 ? (
              categoryEntries.map(([catName, catSkills]) => (
                <div
                  key={catName}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm space-y-3"
                >
                  <h3 className="text-sm font-mono font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    {catName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill, idx) => (
                      <span
                        key={`${skill.name}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                      >
                        <span>{skill.name}</span>
                        {skill.level && skill.level !== "intermediate" && (
                          <span className="text-[10px] text-neutral-500 uppercase">
                            · {skill.level}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : showEmpty ? (
              <p className="text-sm text-neutral-500 font-mono">No skills added yet.</p>
            ) : null}
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
          Skills & Expertise
        </h2>

        <div className="flex flex-wrap gap-2">
          {validSkills.map((skill, idx) => (
            <span
              key={`${skill.name}-${idx}`}
              className="inline-block px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60"
            >
              {skill.name}
            </span>
          ))}
          {validSkills.length === 0 && showEmpty && (
            <span className="text-xs text-neutral-400 italic">No skills listed</span>
          )}
        </div>
      </div>
    </section>
  );
}
