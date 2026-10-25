import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUp,
  Cpu,
  ExternalLink,
  Layers,
  Radio,
  Terminal,
  Wifi,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface DatImmersiveTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function DatImmersiveTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: DatImmersiveTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Systems Architect" };
  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experience = portfolio.experience ?? [];
  const education = portfolio.education ?? [];
  const certifications = portfolio.certifications ?? [];
  const socialLinks = portfolio.socialLinks ?? [];

  const [currentTime, setCurrentTime] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0] + " UTC");
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
          <section key="projects" id="projects" className="space-y-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-400 uppercase">
                  [SYSTEM_DEPLOYMENTS]
                </h2>
              </div>
              <span className="text-xs font-mono text-cyan-500/70">NODES: {projects.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="relative p-6 rounded-2xl border border-cyan-500/20 bg-neutral-900/60 backdrop-blur-xl hover:border-cyan-400/50 transition-all duration-300 group shadow-lg shadow-cyan-950/20"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400/80">#SYS_UNIT_0{idx + 1}</span>
                      <h3 className="text-lg font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                        {proj.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                      OPERATIONAL
                    </span>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                    {proj.description}
                  </p>

                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {proj.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800/80 text-cyan-200 border border-cyan-900/40"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t border-cyan-500/10 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink
                        href={proj.liveUrl}
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>TELEMETRY LIVE</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink
                        href={proj.repoUrl}
                        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
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
          <section key="experience" id="experience" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-400 uppercase">
                [MISSION_LOGS]
              </h2>
            </div>

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-cyan-500/20 bg-neutral-900/40 backdrop-blur-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-base font-bold font-mono text-white">
                      {exp.title} <span className="text-cyan-400 font-normal">@ {exp.company}</span>
                    </h3>
                    <span className="text-xs font-mono text-cyan-400/70">
                      {exp.startDate} - {exp.current ? "ACTIVE" : exp.endDate || "CONCLUDED"}
                    </span>
                  </div>
                  {exp.location && (
                    <span className="text-xs font-mono text-neutral-400 block">COORD: {exp.location}</span>
                  )}
                  {exp.description && (
                    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 pt-1 font-mono text-xs">
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
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-400 uppercase">
                [PROTOCOL_MODULES]
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {skills.map((sk: PortfolioSkill) => (
                <div
                  key={sk.name}
                  className="p-3.5 rounded-xl border border-cyan-500/20 bg-neutral-900/50 backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{sk.name}</span>
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400/80 mt-2">
                    {sk.level ? `SYNC: ${sk.level.toUpperCase()}` : "STATUS: VERIFIED"}
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
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-400 uppercase">[ACADEMIC_CREDENTIALS]</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-cyan-500/20 bg-neutral-900/40 font-mono text-xs space-y-1">
                  <div className="text-white font-bold">{edu.institution}</div>
                  <div className="text-cyan-300">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</div>
                  {(edu.startDate || edu.endDate) && (
                    <div className="text-neutral-500">{edu.startDate} - {edu.endDate}</div>
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
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-400 uppercase">[SECURITY_CLEARANCES]</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-cyan-500/20 bg-neutral-900/40 flex justify-between items-center font-mono text-xs">
                  <div>
                    <div className="text-white font-bold">{c.name}</div>
                    <div className="text-cyan-400/80">{c.issuer} {c.issueDate ? `· ${c.issueDate}` : ""}</div>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-cyan-400 hover:text-cyan-300">
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
    <div className="min-h-screen bg-[#070b12] text-neutral-200 font-sans relative selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1e2d_1px,transparent_1px),linear-gradient(to_bottom,#0e1e2d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Telemetry Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#070b12]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs">
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              <span>HUD ONLINE</span>
            </div>
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline">{currentTime}</span>
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-lg hover:bg-cyan-950/50 text-cyan-400 hover:text-white transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={18} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* HUD Hero Banner */}
      <section className="relative max-w-6xl mx-auto px-4 py-16 space-y-8">
        <div className="p-8 rounded-3xl border border-cyan-500/30 bg-neutral-900/60 backdrop-blur-2xl relative overflow-hidden shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.fullName}
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-cyan-950/50 border-2 border-cyan-400 flex items-center justify-center text-4xl font-mono text-cyan-400">
                  {profile.fullName.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-cyan-500 text-black font-mono font-bold text-[10px]">
                ONLINE
              </div>
            </div>

            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                OPERATIONAL TELEMETRY // {profile.location || "GLOBAL_NODE"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {profile.fullName}
              </h1>
              <p className="text-base text-cyan-200/90 font-mono">
                {profile.headline || "Full-Stack Engineer & Distributed Infrastructure Architect"}
              </p>
              {profile.bio && (
                <p className="text-sm text-neutral-300 leading-relaxed pt-1">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Stream Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20 space-y-16">
        {displayOrder.map((key) => renderSection(key))}
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="Trần Hữu Đạt"
        templateName="Immersive Engineer"
        license="MIT License"
        notes="Adapted from glassmorphic telemetry HUD design."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-xl shadow-cyan-500/30 transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default DatImmersiveTemplate;
