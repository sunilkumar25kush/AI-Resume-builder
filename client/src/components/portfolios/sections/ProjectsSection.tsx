import { ExternalLink, FolderGit2, Star } from "lucide-react";

import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import type { PortfolioProject } from "@/types/portfolio";

export interface ProjectsSectionProps {
  projects?: PortfolioProject[];
  variant?: "minimal" | "developer";
  primaryColor?: string;
  showEmpty?: boolean;
}

export function ProjectsSection({
  projects = [],
  variant = "minimal",
  primaryColor: _primaryColor,
  showEmpty = false,
}: ProjectsSectionProps) {
  const validProjects = projects.filter((p) => p?.title?.trim());

  if (validProjects.length === 0 && !showEmpty) {
    return null;
  }

  if (variant === "developer") {
    return (
      <section className="py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              // 03. Featured Work
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mb-8 flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-neutral-500" />
            <span>Projects & Engineering</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {validProjects.map((project, idx) => (
              <div
                key={`${project.title}-${idx}`}
                className="group flex flex-col justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>

                    {project.featured && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Featured
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {Array.isArray(project.tags) && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tags.map((tag, tIdx) => (
                        <span
                          key={`${tag}-${tIdx}`}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {(project.liveUrl || project.repoUrl) && (
                  <div className="flex items-center gap-4 pt-5 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-xs font-mono">
                    {project.liveUrl && (
                      <SafeLink
                        href={project.liveUrl}
                        className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Live Demo</span>
                      </SafeLink>
                    )}
                    {project.repoUrl && (
                      <SafeLink
                        href={project.repoUrl}
                        className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:underline font-medium"
                      >
                        <BrandIcon name="github" size={14} />
                        <span>Repository</span>
                      </SafeLink>
                    )}
                  </div>
                )}
              </div>
            ))}
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
          Selected Projects
        </h2>

        <div className="space-y-8">
          {validProjects.map((project, idx) => (
            <div key={`${project.title}-${idx}`} className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  {project.title}
                </h3>
                {project.liveUrl && (
                  <SafeLink
                    href={project.liveUrl}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 inline-flex items-center gap-1 underline underline-offset-4"
                  >
                    View Project <ExternalLink className="h-3 w-3" />
                  </SafeLink>
                )}
              </div>

              {project.description && (
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  {project.description}
                </p>
              )}

              {Array.isArray(project.tags) && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-neutral-400">
                  {project.tags.join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
