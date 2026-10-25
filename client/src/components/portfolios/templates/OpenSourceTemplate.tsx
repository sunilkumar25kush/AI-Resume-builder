import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Code2,
  ExternalLink,
  GitBranch,
  GitFork,
  GitPullRequest,
  Star,
  Terminal,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface OpenSourceTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function OpenSourceTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: OpenSourceTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Open Source Developer" };
  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experience = portfolio.experience ?? [];
  const education = portfolio.education ?? [];
  const certifications = portfolio.certifications ?? [];
  const socialLinks = portfolio.socialLinks ?? [];

  const [activeTab, setActiveTab] = useState<"repositories" | "experience" | "overview">("overview");
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

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, PortfolioSkill[]>>((acc, s) => {
    const cat = s.category?.trim() || "Core Technologies";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const renderSection = (key: string): ReactNode => {
    if (hiddenSections.includes(key)) return null;
    switch (key) {
      case "projects":
        if (projects.length === 0 && !showEmpty) return null;
        return (
          <section key="projects" id="projects" className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold tracking-tight text-white font-mono">Pinned Repositories</h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="group flex flex-col justify-between p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h3 className="font-mono text-base font-semibold text-emerald-400 group-hover:underline">
                          {proj.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-800/80 text-neutral-300">
                        Public
                      </span>
                    </div>

                    <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                      {proj.description || "Open source contribution and software architecture."}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-800/80 space-y-3">
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-900/50"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-mono">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>42</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <GitFork className="w-3.5 h-3.5 text-neutral-400" />
                          <span>12</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {proj.repoUrl && (
                          <SafeLink
                            href={proj.repoUrl}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <span>Code</span>
                            <ExternalLink className="w-3 h-3" />
                          </SafeLink>
                        )}
                        {proj.liveUrl && (
                          <SafeLink
                            href={proj.liveUrl}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-3 h-3" />
                          </SafeLink>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "experience":
        if (experience.length === 0 && !showEmpty) return null;
        return (
          <section key="experience" id="experience" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <GitPullRequest className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                Contribution History & Experience
              </h2>
            </div>

            <div className="relative pl-6 border-l-2 border-neutral-800 space-y-8">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-cyan-400 bg-neutral-950" />
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-white font-mono">
                        {exp.title} <span className="text-cyan-400">@ {exp.company}</span>
                      </h3>
                      <span className="text-xs text-neutral-400 font-mono">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}
                      </span>
                    </div>
                    {exp.location && (
                      <p className="text-xs text-neutral-400 font-mono">{exp.location}</p>
                    )}
                    {exp.description && (
                      <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 pt-1">
                        {exp.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (skills.length === 0 && !showEmpty) return null;
        return (
          <section key="skills" id="skills" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Terminal className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">Tech Stack & Ecosystem</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(skillsByCategory).map(([cat, skList]) => (
                <div
                  key={cat}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-3"
                >
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
                    {cat}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skList.map((sk) => (
                      <span
                        key={sk.name}
                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-neutral-800/80 text-neutral-200 border border-neutral-700/60"
                      >
                        {sk.name}
                        {sk.level && (
                          <span className="ml-1.5 text-[10px] text-amber-400/80 capitalize">
                            ({sk.level})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "education":
        if (education.length === 0 && !showEmpty) return null;
        return (
          <section key="education" id="education" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Terminal className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">Education</h2>
            </div>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white font-mono">{edu.institution}</h3>
                      <p className="text-sm text-neutral-400">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                    </div>
                    {(edu.startDate || edu.endDate) && (
                      <span className="text-xs font-mono text-neutral-500">
                        {edu.startDate} - {edu.endDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Terminal className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">Certifications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-900/30 flex justify-between items-center">
                  <div>
                    <h4 className="font-mono text-sm text-white font-medium">{c.name}</h4>
                    <p className="text-xs text-neutral-400">{c.issuer} {c.issueDate ? `· ${c.issueDate}` : ""}</p>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-neutral-400 hover:text-white">
                      <ExternalLink className="w-3.5 h-3.5" />
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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top GitHub-style navigation bar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800/90 bg-[#161b22]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold">
              OSS
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-mono leading-none">
                {profile.fullName}
              </div>
              <div className="text-xs text-neutral-400 font-mono mt-0.5">
                {profile.headline || "Software Engineer & Open Source Maintainer"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={18} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Profile Card & Bio Header */}
        <section className="p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-[#161b22] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-emerald-500/40 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neutral-800 border-2 border-emerald-500/40 flex items-center justify-center text-3xl font-bold font-mono text-emerald-400">
                  {profile.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#161b22]" title="Active Maintainer" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {profile.fullName}
                </h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                  Maintainer
                </span>
              </div>
              <p className="text-base text-neutral-300 max-w-2xl leading-relaxed">
                {profile.bio || profile.headline || "Dedicated to building high-performance open source software, developer tooling, and modern distributed systems."}
              </p>
              {profile.location && (
                <p className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 pt-1">
                  <span>📍 {profile.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800">
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <div className="text-xs text-neutral-400 font-mono">Public Repos</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{projects.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <div className="text-xs text-neutral-400 font-mono">Total Stars</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">{projects.length * 42}</div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <div className="text-xs text-neutral-400 font-mono">Pull Requests</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{experience.length * 18 + 12}</div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <div className="text-xs text-neutral-400 font-mono">Tech Skills</div>
              <div className="text-xl font-bold font-mono text-purple-400 mt-1">{skills.length}</div>
            </div>
          </div>
        </section>

        {/* View Mode Navigation Tabs */}
        <div className="flex border-b border-neutral-800 space-x-6 text-sm font-mono">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              activeTab === "overview"
                ? "border-emerald-400 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("repositories")}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              activeTab === "repositories"
                ? "border-emerald-400 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Repositories ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              activeTab === "experience"
                ? "border-emerald-400 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            History & Roles
          </button>
        </div>

        {/* Tab Sections */}
        <div className="space-y-12">
          {activeTab === "overview" && (
            <>
              {displayOrder.map((key) => renderSection(key))}
            </>
          )}

          {activeTab === "repositories" && (
            renderSection("projects")
          )}

          {activeTab === "experience" && (
            <>
              {renderSection("experience")}
              {renderSection("education")}
              {renderSection("certifications")}
            </>
          )}
        </div>
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="GitSkins Community"
        templateName="Open Source Maintainer"
        license="MIT License"
        originalUrl="https://github.com"
        notes="Tailored for GitHub profiles and open source engineers."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-emerald-400 shadow-xl border border-neutral-700 transition-all z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default OpenSourceTemplate;
