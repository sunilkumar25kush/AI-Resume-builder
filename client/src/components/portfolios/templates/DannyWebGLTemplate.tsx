import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  ExternalLink,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface DannyWebGLTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function DannyWebGLTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: DannyWebGLTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Creative Engineer" };
  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experience = portfolio.experience ?? [];
  const education = portfolio.education ?? [];
  const certifications = portfolio.certifications ?? [];
  const socialLinks = portfolio.socialLinks ?? [];

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

  const renderSection = (key: string): ReactNode => {
    switch (key) {
      case "projects":
        if (projects.length === 0 && !showEmpty) return null;
        return (
          <section key="projects" id="projects" className="space-y-8">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-800 pb-2">
              Selected Works
            </h2>

            <div className="space-y-12">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline py-6 border-b border-neutral-850 hover:border-neutral-700 transition-colors"
                >
                  <div className="md:col-span-2 text-xs font-mono text-neutral-500">
                    0{idx + 1} / {projects.length.toString().padStart(2, "0")}
                  </div>

                  <div className="md:col-span-6 space-y-2">
                    <h3 className="text-xl font-medium text-white group-hover:text-emerald-400 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                      {proj.description}
                    </p>
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proj.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4 flex items-center md:justify-end gap-4 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink
                        href={proj.liveUrl}
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink
                        href={proj.repoUrl}
                        className="inline-flex items-center gap-1 text-neutral-500 hover:text-white"
                      >
                        <span>Code</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </SafeLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "experience":
        if (experience.length === 0 && !showEmpty) return null;
        return (
          <section key="experience" id="experience" className="space-y-8">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-800 pb-2">
              Experience
            </h2>

            <div className="space-y-8">
              {experience.map((exp, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                  <div className="md:col-span-3 text-xs font-mono text-neutral-500">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate || "Present"}
                  </div>
                  <div className="md:col-span-9 space-y-2">
                    <h3 className="text-base font-medium text-white">
                      {exp.title} <span className="text-neutral-500 font-normal">at</span> {exp.company}
                    </h3>
                    {exp.description && (
                      <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
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
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-800 pb-2">
              Capabilities
            </h2>

            <div className="flex flex-wrap gap-2">
              {skills.map((sk: PortfolioSkill) => (
                <span
                  key={sk.name}
                  className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono"
                >
                  {sk.name}
                </span>
              ))}
            </div>
          </section>
        );

      case "education":
        if (education.length === 0 && !showEmpty) return null;
        return (
          <section key="education" id="education" className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-800 pb-2">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-sm">
                  <span className="font-medium text-white">{edu.institution}</span>
                  <span className="text-xs font-mono text-neutral-500">{edu.degree}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-800 pb-2">
              Certifications
            </h2>
            <div className="space-y-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-300">{c.name} — <span className="text-neutral-500">{c.issuer}</span></span>
                  {c.url && (
                    <SafeLink href={c.url} className="text-xs text-neutral-500 hover:text-white font-mono">
                      Link →
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

  const defaultOrder = ["projects", "experience", "skills", "education", "certifications"];
  const displayOrder = (sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder).filter(
    (key) => !hiddenSections.includes(key),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-300 font-sans relative selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Background WebGL Fluid Shader plane */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_30%,#10b981_0%,transparent_60%)] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-850 bg-[#0a0a0c]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-mono tracking-tight text-white">{profile.fullName}</div>
          <div className="flex items-center gap-3">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="text-neutral-500 hover:text-white transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={16} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="text-xs font-mono text-emerald-400 tracking-wider">AVAILABLE FOR PROJECTS</div>
          <div className="flex items-center gap-6">
            {avatarSrc && (
              <img
                src={avatarSrc}
                alt={profile.fullName}
                className="w-20 h-20 rounded-full object-cover border border-neutral-800"
              />
            )}
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
              {profile.fullName}
            </h1>
          </div>
          <p className="text-lg text-neutral-400 font-light max-w-xl leading-relaxed">
            {profile.headline || "Developing digital systems with precision and kinetic art."}
          </p>
          {profile.bio && (
            <p className="text-sm text-neutral-500 max-w-lg leading-relaxed pt-2">
              {profile.bio}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pb-24 space-y-20 relative z-10">
        {displayOrder.map((key) => renderSection(key))}
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="Danny Garcia"
        templateName="WebGL Résumé"
        license="ISC License"
        originalUrl="https://github.com/dannygarcia"
        notes="Fluid shader canvas plane with minimal typography."
      />

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-neutral-900 border border-neutral-800 text-white shadow-xl hover:bg-neutral-800 transition-all z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default DannyWebGLTemplate;
