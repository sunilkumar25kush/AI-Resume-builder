import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Award,
  Book,
  Bookmark,
  Briefcase,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface NotebookRoomTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function NotebookRoomTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: NotebookRoomTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Creative Developer" };
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
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold text-emerald-100">Notebook Projects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="p-6 rounded-2xl border border-emerald-900/40 bg-[#16221d] hover:border-emerald-500/40 transition-colors space-y-3"
                >
                  <span className="text-xs font-mono text-emerald-400">ENTRY #{idx + 1}</span>
                  <h3 className="text-lg font-serif font-bold text-white">{proj.title}</h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">{proj.description}</p>
                  {proj.tags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.tags.map((t) => (
                        <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-900/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-3 border-t border-emerald-900/40 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <span>Open Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink href={proj.repoUrl} className="text-neutral-400 hover:text-white flex items-center gap-1">
                        <span>Source</span>
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
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold text-emerald-100">Journal Timeline</h2>
            </div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-emerald-900/40 bg-[#16221d]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 font-serif">
                    <span className="font-bold text-white text-base">{exp.title} · {exp.company}</span>
                    <span className="text-xs font-mono text-emerald-400">{exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}</span>
                  </div>
                  {exp.description && <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (skills.length === 0 && !showEmpty) return null;
        return (
          <section key="skills" id="skills" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold text-emerald-100">Desk Apparatus & Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((sk: PortfolioSkill) => (
                <span key={sk.name} className="px-3.5 py-1.5 rounded-xl border border-emerald-900/40 bg-[#16221d] text-xs font-mono text-emerald-200">
                  {sk.name}
                </span>
              ))}
            </div>
          </section>
        );

      case "education":
        if (education.length === 0 && !showEmpty) return null;
        return (
          <section key="education" id="education" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold text-emerald-100">Education</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-emerald-900/40 bg-[#16221d]">
                  <h3 className="font-serif font-bold text-white">{edu.institution}</h3>
                  <p className="text-xs text-emerald-300/80 mt-1">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-900/30 pb-3">
              <Award className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold text-emerald-100">Certificates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-emerald-900/40 bg-[#16221d] flex justify-between items-center text-xs">
                  <div>
                    <div className="font-serif font-bold text-white">{c.name}</div>
                    <div className="text-neutral-400">{c.issuer}</div>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-emerald-400 hover:underline">
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
    <div className="min-h-screen bg-[#0e1613] text-[#e3ece7] font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-emerald-900/30 bg-[#0e1613]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-serif font-bold text-emerald-300">
            <Book className="w-4 h-4 text-emerald-400" />
            <span>{profile.fullName}</span>
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-lg text-neutral-400 hover:text-emerald-300 transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={18} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Showcase */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center space-y-6">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={profile.fullName}
            className="w-28 h-28 mx-auto rounded-3xl object-cover border-2 border-emerald-500/60 shadow-2xl"
          />
        ) : (
          <div className="w-28 h-28 mx-auto rounded-3xl bg-[#16221d] border-2 border-emerald-500/60 flex items-center justify-center text-3xl font-serif text-emerald-300">
            {profile.fullName.charAt(0)}
          </div>
        )}

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {profile.fullName}
          </h1>
          <p className="text-base font-serif italic text-emerald-300 max-w-xl mx-auto">
            {profile.headline || "Notebook Room & 3D Isometric Journal"}
          </p>
          {profile.bio && (
            <p className="text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed pt-2">
              {profile.bio}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 pb-24 space-y-16">
        {displayOrder.map((key) => renderSection(key))}
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="Arthur Panazolo"
        templateName="Notebook Room 3D"
        license="MIT License"
        notes="Isometric 3D desk journal built with React Three Fiber."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default NotebookRoomTemplate;
