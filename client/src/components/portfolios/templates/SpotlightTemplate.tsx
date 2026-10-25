import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  Flame,
  GraduationCap,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface SpotlightTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function SpotlightTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: SpotlightTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Creative Technologist" };
  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experience = portfolio.experience ?? [];
  const education = portfolio.education ?? [];
  const certifications = portfolio.certifications ?? [];
  const socialLinks = portfolio.socialLinks ?? [];

  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const avatarSrc = normalizeAvatarUrl(profile.avatarUrl);
  const activeProject = projects[activeProjectIdx] ?? projects[0];

  const renderSection = (key: string): ReactNode => {
    switch (key) {
      case "projects":
        if (projects.length === 0 && !showEmpty) return null;
        return (
          <section key="projects" id="projects" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-rose-900/40 pb-3">
              <Flame className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider font-mono">
                Featured Works & Spotlight
              </h2>
            </div>

            {/* Spotlight Showcase View */}
            {activeProject && (
              <div className="p-6 sm:p-8 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-neutral-900/60 to-black relative overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Spotlight Selection #{activeProjectIdx + 1}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {activeProject.title}
                    </h3>

                    <p className="text-neutral-300 text-base leading-relaxed">
                      {activeProject.description || "A signature work highlighting engineering excellence and refined craft."}
                    </p>

                    {activeProject.tags && activeProject.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {activeProject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-mono px-2.5 py-1 rounded-md bg-neutral-800/80 border border-neutral-700/60 text-neutral-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                      {activeProject.liveUrl && (
                        <SafeLink
                          href={activeProject.liveUrl}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-colors shadow-lg shadow-rose-900/40"
                        >
                          <span>Live Experience</span>
                          <ExternalLink className="w-4 h-4" />
                        </SafeLink>
                      )}
                      {activeProject.repoUrl && (
                        <SafeLink
                          href={activeProject.repoUrl}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-sm border border-neutral-700 transition-colors"
                        >
                          <span>Source Repository</span>
                          <ExternalLink className="w-4 h-4" />
                        </SafeLink>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-center items-center">
                    {activeProject.imageUrl ? (
                      <img
                        src={activeProject.imageUrl}
                        alt={activeProject.title}
                        className="w-full h-56 object-cover rounded-xl border border-rose-500/30 shadow-2xl"
                      />
                    ) : (
                      <div className="w-full h-56 rounded-xl border border-rose-500/20 bg-neutral-900/80 flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <Code2 className="w-10 h-10 text-rose-500/60" />
                        <span className="text-xs font-mono text-neutral-400">Production Ready Artifact</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Project Picker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {projects.map((proj, idx) => {
                const isSelected = idx === activeProjectIdx;
                return (
                  <button
                    key={proj.title || idx}
                    type="button"
                    onClick={() => setActiveProjectIdx(idx)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "border-rose-500 bg-rose-950/30 shadow-lg shadow-rose-950/50"
                        : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-rose-400">0{idx + 1}</span>
                      {isSelected && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white text-sm truncate">{proj.title}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        );

      case "experience":
        if (experience.length === 0 && !showEmpty) return null;
        return (
          <section key="experience" id="experience" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-rose-900/40 pb-3">
              <Briefcase className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider font-mono">
                Professional Trajectory
              </h2>
            </div>

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                    <h3 className="text-lg font-bold text-white">
                      {exp.title} <span className="text-rose-400 font-normal">@ {exp.company}</span>
                    </h3>
                    <span className="text-xs font-mono text-neutral-400">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-xs text-neutral-400 font-mono mb-2">📍 {exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line mb-3">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (skills.length === 0 && !showEmpty) return null;
        return (
          <section key="skills" id="skills" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-rose-900/40 pb-3">
              <Zap className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider font-mono">
                Technical Arsenal
              </h2>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {skills.map((sk: PortfolioSkill) => (
                <div
                  key={sk.name}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/70 hover:border-rose-500/50 transition-colors group"
                >
                  <Terminal className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400" />
                  <span className="text-sm font-mono text-neutral-200">{sk.name}</span>
                  {sk.level && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/50">
                      {sk.level}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "education":
        if (education.length === 0 && !showEmpty) return null;
        return (
          <section key="education" id="education" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-900/40 pb-3">
              <GraduationCap className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider font-mono">Education</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
                  <h3 className="font-semibold text-white">{edu.institution}</h3>
                  <p className="text-sm text-neutral-400 mt-0.5">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                  {(edu.startDate || edu.endDate) && (
                    <span className="text-xs font-mono text-rose-400/80 block mt-2">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-900/40 pb-3">
              <Award className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider font-mono">Certifications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{c.name}</h4>
                    <p className="text-xs text-neutral-400">{c.issuer} {c.issueDate ? `· ${c.issueDate}` : ""}</p>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-rose-400 hover:text-rose-300">
                      <ExternalLink className="w-4 h-4" />
                    </SafeLink>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const defaultOrder = ["projects", "skills", "experience", "education", "certifications"];
  const displayOrder = (sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder).filter(
    (key) => !hiddenSections.includes(key),
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-200 font-sans selection:bg-rose-500/20 selection:text-rose-300">
      {/* Spotlight Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-rose-950/60 bg-[#0c0c0e]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-bold font-mono shadow-lg shadow-rose-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">{profile.fullName}</div>
              <div className="text-xs text-rose-400/90 font-mono">{profile.headline || "Spotlight Portfolio"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-lg hover:bg-neutral-800/80 text-neutral-400 hover:text-rose-400 transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={18} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Spotlight Section */}
      <section className="relative overflow-hidden border-b border-neutral-800/80 bg-radial from-rose-950/20 via-[#08080a] to-[#08080a] py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="relative inline-block mx-auto">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-600 to-rose-400 opacity-60 blur-md animate-pulse" />
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={profile.fullName}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-rose-500 shadow-2xl"
              />
            ) : (
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-neutral-900 border-2 border-rose-500 flex items-center justify-center text-4xl font-bold font-mono text-rose-400">
                {profile.fullName.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {profile.fullName}
            </h1>
            <p className="text-lg sm:text-xl text-rose-400 font-mono max-w-2xl mx-auto">
              {profile.headline || "Engineering high-impact solutions & digital craft"}
            </p>
            {profile.bio && (
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed pt-2">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Key Metric Counters */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-center">
            <div className="px-5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="block text-2xl font-bold font-mono text-white">{projects.length}</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Projects</span>
            </div>
            <div className="px-5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="block text-2xl font-bold font-mono text-rose-400">{skills.length}</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Skills</span>
            </div>
            <div className="px-5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="block text-2xl font-bold font-mono text-white">{experience.length}+</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Positions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section Content */}
      <main className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        {displayOrder.map((key) => renderSection(key))}
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="GitSkins Native"
        templateName="Spotlight"
        license="MIT License"
        notes="Designed with high-contrast obsidian and crimson spotlight aesthetics."
      />

      {/* Back to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl transition-all z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default SpotlightTemplate;
