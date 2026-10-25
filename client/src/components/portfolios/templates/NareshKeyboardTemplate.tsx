import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Award,
  Briefcase,
  Command,
  ExternalLink,
  GraduationCap,
  Keyboard,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface NareshKeyboardTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function NareshKeyboardTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: NareshKeyboardTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Mechanical Dev" };
  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experience = portfolio.experience ?? [];
  const education = portfolio.education ?? [];
  const certifications = portfolio.certifications ?? [];
  const socialLinks = portfolio.socialLinks ?? [];

  const [activeKey, setActiveKey] = useState<string | null>(null);
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

  const handleKeyPress = (keyName: string) => {
    setActiveKey(keyName);
    setTimeout(() => setActiveKey(null), 300);
  };

  const avatarSrc = normalizeAvatarUrl(profile.avatarUrl);

  const renderSection = (key: string): ReactNode => {
    switch (key) {
      case "projects":
        if (projects.length === 0 && !showEmpty) return null;
        return (
          <section key="projects" id="projects" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
              <Command className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
                Macro Functions // Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="p-6 rounded-2xl border-2 border-neutral-800 bg-[#14151f] hover:border-indigo-500/60 transition-all duration-200 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      KEY_0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-mono text-white mb-2">{proj.title}</h3>
                  <p className="text-sm text-neutral-300 leading-relaxed mb-4">{proj.description}</p>
                  {proj.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.tags.map((t) => (
                        <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-indigo-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-3 border-t border-neutral-800 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold">
                        <span>Execute</span>
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
            <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Keystroke History</h2>
            </div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-5 rounded-2xl border-2 border-neutral-800 bg-[#14151f]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 font-mono">
                    <span className="font-bold text-white text-base">{exp.title} · {exp.company}</span>
                    <span className="text-xs text-indigo-400">{exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}</span>
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
            <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
              <Keyboard className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Mechanical Switchboard</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {skills.map((sk: PortfolioSkill) => {
                const isPressed = activeKey === sk.name;
                return (
                  <button
                    key={sk.name}
                    type="button"
                    onClick={() => handleKeyPress(sk.name)}
                    className={`p-4 rounded-xl border-2 text-left font-mono transition-all duration-100 ${
                      isPressed
                        ? "border-indigo-400 bg-indigo-600 text-white translate-y-1 shadow-inner"
                        : "border-neutral-700 bg-neutral-850 hover:border-neutral-500 shadow-[0_4px_0_0_#262626] text-neutral-200"
                    }`}
                  >
                    <div className="text-xs text-indigo-400 mb-1">SW_KEY</div>
                    <div className="font-bold text-sm truncate">{sk.name}</div>
                    {sk.level && <div className="text-[10px] text-neutral-400 mt-1 capitalize">{sk.level}</div>}
                  </button>
                );
              })}
            </div>
          </section>
        );

      case "education":
        if (education.length === 0 && !showEmpty) return null;
        return (
          <section key="education" id="education" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-mono font-bold text-white uppercase">Firmware Credentials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border-2 border-neutral-800 bg-[#14151f] font-mono text-xs">
                  <h3 className="font-bold text-white text-sm">{edu.institution}</h3>
                  <p className="text-indigo-400 mt-1">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-mono font-bold text-white uppercase">Validations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border-2 border-neutral-800 bg-[#14151f] flex justify-between items-center text-xs font-mono">
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-neutral-400">{c.issuer}</div>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-indigo-400 hover:underline">
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
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-indigo-950 bg-[#0b0c10]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-mono font-bold text-indigo-400">
            <Keyboard className="w-5 h-5" />
            <span>{profile.fullName}</span>
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-lg text-neutral-400 hover:text-indigo-300 transition-colors"
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
            className="w-28 h-28 mx-auto rounded-3xl object-cover border-2 border-indigo-500/60 shadow-2xl shadow-indigo-950/50"
          />
        ) : (
          <div className="w-28 h-28 mx-auto rounded-3xl bg-[#14151f] border-2 border-indigo-500/60 flex items-center justify-center text-3xl font-mono text-indigo-400">
            {profile.fullName.charAt(0)}
          </div>
        )}

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
            {profile.fullName}
          </h1>
          <p className="text-base font-mono text-indigo-400 max-w-xl mx-auto">
            {profile.headline || "Interactive 3D Mechanical Skills Keyboard"}
          </p>
          {profile.bio && (
            <p className="text-sm font-sans text-neutral-400 max-w-2xl mx-auto leading-relaxed pt-2">
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
        author="Naresh Khatri"
        templateName="Skills Keyboard 3D"
        license="MIT + Author Permission"
        notes="Interactive mechanical key switch matrix built with 3D Spline."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default NareshKeyboardTemplate;
