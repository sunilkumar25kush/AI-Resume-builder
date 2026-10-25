import { useEffect, useState, type ReactNode } from "react";
import {
  AppWindow,
  ArrowUp,
  ExternalLink,
  Folder,
  Wifi,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface PortfolioOSTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function PortfolioOSTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: PortfolioOSTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "OS Architect" };
  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experience = portfolio.experience ?? [];
  const education = portfolio.education ?? [];
  const certifications = portfolio.certifications ?? [];
  const socialLinks = portfolio.socialLinks ?? [];

  const [activeWindow, setActiveWindow] = useState<string>("projects");
  const [currentTime, setCurrentTime] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
          <div key="projects" className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-750">
              <span className="text-xs font-mono text-neutral-400">Directory: /home/user/projects ({projects.length} items)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="p-4 rounded-xl border border-neutral-700 bg-neutral-850/80 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-4 h-4 text-amber-400" />
                    <h4 className="font-mono text-sm font-bold text-white truncate">{proj.title}</h4>
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-3 mb-3 leading-relaxed">
                    {proj.description}
                  </p>
                  {proj.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {proj.tags.map((t) => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-blue-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-2 border-t border-neutral-750 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="text-blue-400 hover:underline flex items-center gap-1">
                        <span>Launch</span>
                        <ExternalLink className="w-3 h-3" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink href={proj.repoUrl} className="text-neutral-400 hover:text-white flex items-center gap-1">
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </SafeLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "experience":
        if (experience.length === 0 && !showEmpty) return null;
        return (
          <div key="experience" className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-750">
              <span className="text-xs font-mono text-neutral-400">Process Table: /sys/work_history</span>
            </div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-700 bg-neutral-850/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-sm font-bold text-white">{exp.title} @ {exp.company}</span>
                    <span className="font-mono text-xs text-blue-400">{exp.startDate} - {exp.current ? "Active" : exp.endDate || "Active"}</span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-neutral-300 whitespace-pre-line mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        if (skills.length === 0 && !showEmpty) return null;
        return (
          <div key="skills" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-750">
              <span className="text-xs font-mono text-neutral-400">Kernel Drivers: /lib/modules</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((sk: PortfolioSkill) => (
                <span key={sk.name} className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-mono text-neutral-200">
                  {sk.name} {sk.level && <span className="text-blue-400">({sk.level})</span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "education":
        if (education.length === 0 && !showEmpty) return null;
        return (
          <div key="education" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-750">
              <span className="text-xs font-mono text-neutral-400">Archives: /etc/credentials/education</span>
            </div>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-neutral-700 bg-neutral-800 font-mono text-xs">
                  <div className="font-bold text-white">{edu.institution}</div>
                  <div className="text-blue-300">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <div key="certifications" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-750">
              <span className="text-xs font-mono text-neutral-400">Certificates: /etc/ssl/certs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-neutral-700 bg-neutral-800 flex justify-between items-center font-mono text-xs">
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-neutral-400">{c.issuer}</div>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-blue-400 hover:text-blue-300">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </SafeLink>
                  )}
                </div>
              ))}
            </div>
          </div>
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
    <div className="min-h-screen bg-[#111317] text-neutral-200 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* OS Top Menu Bar */}
      <header className="sticky top-0 z-50 w-full h-8 bg-neutral-900/90 border-b border-neutral-800 backdrop-blur-md px-4 flex items-center justify-between text-xs font-mono text-neutral-300">
        <div className="flex items-center gap-4">
          <span className="font-bold text-white flex items-center gap-1.5">
            <AppWindow className="w-3.5 h-3.5 text-blue-400" />
            <span>PortfolioOS v2.4</span>
          </span>
          <span className="hidden sm:inline text-neutral-500">|</span>
          <span className="hidden sm:inline text-neutral-400">{profile.fullName}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="text-neutral-400 hover:text-white"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={14} />
              </SafeLink>
            ))}
          </div>
          <span className="text-neutral-500">|</span>
          <div className="flex items-center gap-2 text-neutral-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Desktop Canvas */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Card / Desktop Info */}
        <section className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center gap-6">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={profile.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/40"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-neutral-800 border-2 border-blue-500/40 flex items-center justify-center font-bold font-mono text-blue-400 text-2xl">
              {profile.fullName.charAt(0)}
            </div>
          )}
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold font-mono text-white">{profile.fullName}</h1>
            <p className="text-sm font-mono text-blue-400">{profile.headline || "Desktop OS Environment"}</p>
            {profile.bio && <p className="text-xs text-neutral-400 max-w-xl">{profile.bio}</p>}
          </div>
        </section>

        {/* Desktop App Window */}
        <div className="rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden">
          {/* Window Title Bar */}
          <div className="h-10 bg-neutral-800 px-4 flex items-center justify-between border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-2 font-mono text-xs text-neutral-300 font-bold">Workspace Navigator</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveWindow("projects")}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeWindow === "projects" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => setActiveWindow("experience")}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeWindow === "experience" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Experience
              </button>
              <button
                type="button"
                onClick={() => setActiveWindow("skills")}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeWindow === "skills" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Skills
              </button>
              <button
                type="button"
                onClick={() => setActiveWindow("all")}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  activeWindow === "all" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Window Body */}
          <div className="min-h-[400px]">
            {activeWindow === "all" ? (
              displayOrder.map((key) => renderSection(key))
            ) : (
              renderSection(activeWindow)
            )}
          </div>
        </div>
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="Henry Heffernan"
        templateName="Portfolio OS"
        license="MIT License"
        originalUrl="https://github.com/henryheffernan"
        notes="Interactive 3D desktop OS window manager environment."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default PortfolioOSTemplate;
