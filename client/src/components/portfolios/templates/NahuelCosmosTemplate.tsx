import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Award,
  Compass,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Star,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface NahuelCosmosTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function NahuelCosmosTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: NahuelCosmosTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Cosmic Explorer" };
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
            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <Star className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-serif font-bold tracking-wide text-amber-100">
                Constellation of Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="group relative p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#14120f] to-[#0c0a08] hover:border-amber-400/50 transition-all duration-300 shadow-xl shadow-amber-950/10 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-amber-400/70">
                      <span>ORBIT #{idx + 1}</span>
                      <span>PUBLIC</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-amber-50 group-hover:text-amber-300 transition-colors">
                      {proj.title}
                    </h3>

                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-amber-500/10 text-xs font-mono mt-6">
                    {proj.liveUrl && (
                      <SafeLink
                        href={proj.liveUrl}
                        className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
                      >
                        <span>DISCOVER LIVE</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink
                        href={proj.repoUrl}
                        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-amber-200"
                      >
                        <span>SOURCE CODE</span>
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
            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <Compass className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-serif font-bold tracking-wide text-amber-100">
                Stellar Trajectory
              </h2>
            </div>

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-amber-500/15 bg-[#12100d] hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="text-lg font-serif font-bold text-amber-50">
                      {exp.title} <span className="text-amber-400 font-sans font-normal">@ {exp.company}</span>
                    </h3>
                    <span className="text-xs font-mono text-amber-400/80">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-xs text-neutral-400 font-mono mb-2">{exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (skills.length === 0 && !showEmpty) return null;
        return (
          <section key="skills" id="skills" className="space-y-8">
            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-serif font-bold tracking-wide text-amber-100">
                Luminance & Skills
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {skills.map((sk: PortfolioSkill) => (
                <div
                  key={sk.name}
                  className="px-4 py-2 rounded-xl border border-amber-500/20 bg-amber-950/20 text-amber-200 text-sm font-mono flex items-center gap-2"
                >
                  <span>{sk.name}</span>
                  {sk.level && (
                    <span className="text-[10px] text-amber-400/70 capitalize">
                      · {sk.level}
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
          <section key="education" id="education" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <GraduationCap className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-serif font-bold tracking-wide text-amber-100">Foundations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-amber-500/15 bg-[#12100d]">
                  <h3 className="font-serif font-bold text-amber-50">{edu.institution}</h3>
                  <p className="text-sm text-amber-300/80">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <Award className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-serif font-bold tracking-wide text-amber-100">Accreditations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-amber-500/15 bg-[#12100d] flex justify-between items-center">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-50">{c.name}</h4>
                    <p className="text-xs text-neutral-400">{c.issuer} {c.issueDate ? `· ${c.issueDate}` : ""}</p>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-amber-400 hover:text-amber-300">
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
    <div className="min-h-screen bg-[#0a0907] text-[#e8e4dc] font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-amber-500/15 bg-[#0a0907]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-base font-serif font-bold tracking-wide text-amber-200">
            {profile.fullName}
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-lg text-amber-300/80 hover:text-amber-100 transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={18} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center space-y-6">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={profile.fullName}
            className="w-28 h-28 mx-auto rounded-full object-cover border-2 border-amber-400/60 shadow-2xl shadow-amber-950/40"
          />
        ) : (
          <div className="w-28 h-28 mx-auto rounded-full bg-amber-950/40 border-2 border-amber-400/60 flex items-center justify-center text-3xl font-serif text-amber-300">
            {profile.fullName.charAt(0)}
          </div>
        )}

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-amber-100 tracking-tight">
            {profile.fullName}
          </h1>
          <p className="text-lg sm:text-xl text-amber-300/90 font-serif italic max-w-xl mx-auto">
            {profile.headline || "Architecting digital worlds with cosmic precision"}
          </p>
          {profile.bio && (
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed pt-2">
              {profile.bio}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pb-24 space-y-20">
        {displayOrder.map((key) => renderSection(key))}
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="Nahuel Carrizo"
        templateName="Nahuel Cosmos"
        license="Author Permission"
        notes="Adapted from constellation particle grid design."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-xl transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default NahuelCosmosTemplate;
