import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Award,
  Box,
  Briefcase,
  ExternalLink,
  GraduationCap,
  Layers,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface BuffaloRoomTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function BuffaloRoomTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: BuffaloRoomTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Spatial Designer" };
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
            <div className="flex items-center gap-2 border-b border-orange-500/20 pb-3">
              <Box className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold font-mono text-orange-200">Crafted Objects & Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="p-6 rounded-2xl border border-orange-900/30 bg-[#1e1b18] hover:border-orange-500/40 transition-all duration-300 shadow-xl"
                >
                  <h3 className="text-lg font-bold text-orange-100 mb-2">{proj.title}</h3>
                  <p className="text-sm text-neutral-300 leading-relaxed mb-4">{proj.description}</p>
                  {proj.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.tags.map((t) => (
                        <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-3 border-t border-orange-950 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="text-orange-400 hover:text-orange-300 flex items-center gap-1">
                        <span>Inspect</span>
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
            <div className="flex items-center gap-2 border-b border-orange-500/20 pb-3">
              <Briefcase className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold font-mono text-orange-200">Spatial Journey</h2>
            </div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-orange-900/30 bg-[#1e1b18]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="font-bold text-white">{exp.title} · {exp.company}</span>
                    <span className="text-xs font-mono text-orange-400">{exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}</span>
                  </div>
                  {exp.description && <p className="text-sm text-neutral-300 whitespace-pre-line">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (skills.length === 0 && !showEmpty) return null;
        return (
          <section key="skills" id="skills" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-orange-500/20 pb-3">
              <Layers className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold font-mono text-orange-200">Tools & Materials</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((sk: PortfolioSkill) => (
                <span key={sk.name} className="px-3.5 py-1.5 rounded-xl border border-orange-900/40 bg-[#1e1b18] text-xs font-mono text-orange-200">
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
            <div className="flex items-center gap-2 border-b border-orange-500/20 pb-3">
              <GraduationCap className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold font-mono text-orange-200">Education</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-orange-900/30 bg-[#1e1b18]">
                  <h3 className="font-bold text-white text-sm">{edu.institution}</h3>
                  <p className="text-xs text-orange-300 mt-0.5">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-orange-500/20 pb-3">
              <Award className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold font-mono text-orange-200">Certificates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-orange-900/30 bg-[#1e1b18] flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-neutral-400">{c.issuer}</div>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-orange-400 hover:underline">
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
    <div className="min-h-screen bg-[#151311] text-[#eae5df] font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-orange-900/20 bg-[#151311]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-base font-bold font-mono text-orange-300">{profile.fullName}</div>
          <div className="flex items-center gap-2">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-lg text-neutral-400 hover:text-orange-300 transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={18} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Showcase with Isometric Studio fallback */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center space-y-6">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={profile.fullName}
            className="w-24 h-24 mx-auto rounded-3xl object-cover border-2 border-orange-500/60 shadow-2xl"
          />
        ) : (
          <div className="w-24 h-24 mx-auto rounded-3xl bg-[#1e1b18] border-2 border-orange-500/60 flex items-center justify-center text-3xl font-bold font-mono text-orange-400">
            {profile.fullName.charAt(0)}
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight">
            {profile.fullName}
          </h1>
          <p className="text-base font-mono text-orange-400 max-w-xl mx-auto">
            {profile.headline || "Isometric 3D Room & Spatial Experiences"}
          </p>
          {profile.bio && (
            <p className="text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed pt-2">
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
        author="Byunggeun Cho"
        templateName="Buffalo Room 3D"
        license="Author Permission"
        notes="Isometric 3D interactive room environment."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-xl transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default BuffaloRoomTemplate;
