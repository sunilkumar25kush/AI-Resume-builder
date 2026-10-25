import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Award,
  Car,
  Compass,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface WorldfolioTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function WorldfolioTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: WorldfolioTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "World Explorer" };
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
          <section key="projects" id="projects" className="space-y-6">
            <div className="flex items-center gap-3 border-b-4 border-yellow-400 pb-3">
              <Gamepad2 className="w-7 h-7 text-yellow-400" />
              <h2 className="text-2xl font-black font-mono text-black uppercase tracking-wider">
                WORLD ZONES // PROJECTS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="p-6 rounded-3xl border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-mono px-3 py-1 rounded-full bg-yellow-400 border-2 border-black text-black">
                        ZONE 0{idx + 1}
                      </span>
                      <Car className="w-5 h-5 text-black" />
                    </div>

                    <h3 className="text-xl font-black font-mono text-black">{proj.title}</h3>
                    <p className="text-sm text-neutral-700 leading-relaxed font-sans">{proj.description}</p>

                    {proj.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((t) => (
                          <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-md bg-neutral-100 border border-black text-black">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t-2 border-black mt-6 text-xs font-mono font-bold">
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="text-black hover:text-yellow-600 flex items-center gap-1">
                        <span>EXPLORE</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink href={proj.repoUrl} className="text-neutral-600 hover:text-black flex items-center gap-1">
                        <span>SOURCE</span>
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
          <section key="experience" id="experience" className="space-y-6">
            <div className="flex items-center gap-3 border-b-4 border-black pb-3">
              <Compass className="w-7 h-7 text-black" />
              <h2 className="text-2xl font-black font-mono text-black uppercase tracking-wider">EXP EXPEDITIONS</h2>
            </div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-6 rounded-3xl border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 font-mono">
                    <span className="font-black text-base text-black">{exp.title} @ {exp.company}</span>
                    <span className="text-xs bg-yellow-300 border-2 border-black px-2 py-0.5 rounded font-bold">{exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}</span>
                  </div>
                  {exp.description && <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (skills.length === 0 && !showEmpty) return null;
        return (
          <section key="skills" id="skills" className="space-y-6">
            <div className="flex items-center gap-3 border-b-4 border-black pb-3">
              <Sparkles className="w-7 h-7 text-yellow-500" />
              <h2 className="text-2xl font-black font-mono text-black uppercase tracking-wider">POWER-UPS & SKILLS</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((sk: PortfolioSkill) => (
                <span key={sk.name} className="px-4 py-2 rounded-2xl border-2 border-black bg-white text-xs font-mono font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  ★ {sk.name}
                </span>
              ))}
            </div>
          </section>
        );

      case "education":
        if (education.length === 0 && !showEmpty) return null;
        return (
          <section key="education" id="education" className="space-y-4">
            <div className="flex items-center gap-2 border-b-4 border-black pb-3">
              <GraduationCap className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-black font-mono text-black uppercase">ACADEMIC CHECKPOINTS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono">
                  <div className="font-bold text-black">{edu.institution}</div>
                  <div className="text-xs text-neutral-700">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</div>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-4">
            <div className="flex items-center gap-2 border-b-4 border-black pb-3">
              <Award className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-black font-mono text-black uppercase">ACHIEVEMENTS UNLOCKED</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border-2 border-black bg-white flex justify-between items-center font-mono text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <div className="font-bold text-black">{c.name}</div>
                    <div className="text-neutral-600">{c.issuer}</div>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-black hover:text-yellow-600">
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

  const defaultOrder = ["projects", "experience", "skills", "education", "certifications"];
  const displayOrder = (sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder).filter(
    (key) => !hiddenSections.includes(key),
  );

  return (
    <div className="min-h-screen bg-[#ffe853] text-black font-sans selection:bg-black selection:text-yellow-300">
      {/* Top Controls Banner */}
      <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-white px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚗</span>
          <div>
            <div className="text-base font-black font-mono text-black">{profile.fullName}</div>
            <div className="text-xs font-mono font-bold text-yellow-600">WORLDFOLIO 3D // SIMON LEVEL</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {socialLinks.map((link: PortfolioSocialLink) => (
            <SafeLink
              key={link.url}
              href={link.url}
              className="p-2 rounded-xl border-2 border-black bg-yellow-300 hover:bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              title={link.label || link.platform}
            >
              <BrandIcon name={link.platform} size={16} />
            </SafeLink>
          ))}
        </div>
      </header>

      {/* Hero Canvas Banner */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="relative inline-block mx-auto">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={profile.fullName}
              className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            />
          ) : (
            <div className="w-28 h-28 mx-auto rounded-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-4xl font-black font-mono text-black">
              {profile.fullName.charAt(0)}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black font-mono text-black tracking-tight">
            {profile.fullName}
          </h1>
          <p className="text-lg font-mono font-bold text-black max-w-xl mx-auto">
            {profile.headline || "Physics-driven 3D web experiences and playful craft."}
          </p>
          {profile.bio && (
            <p className="text-sm font-sans text-neutral-800 max-w-xl mx-auto pt-2">
              {profile.bio}
            </p>
          )}
        </div>
      </section>

      {/* Main Sections */}
      <main className="max-w-5xl mx-auto px-4 pb-24 space-y-16">
        {displayOrder.map((key) => renderSection(key))}
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="Bruno Simon"
        templateName="Worldfolio (folio-2019)"
        license="MIT License"
        originalUrl="https://github.com/brunosimon/folio-2019"
        notes="Playful low-poly physics vehicle terrain world."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-black text-yellow-300 shadow-2xl border-2 border-white transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default WorldfolioTemplate;
