import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Award,
  ExternalLink,
  Flame,
  GraduationCap,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { WebGLErrorBoundary } from "@/components/portfolios/common/WebGLErrorBoundary";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface RamenShopTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function RamenShopTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections = [],
}: RamenShopTemplateProps) {
  const profile = portfolio.profile ?? { fullName: "Neon Chef & Dev" };
  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experience = portfolio.experience ?? [];
  const education = portfolio.education ?? [];
  const certifications = portfolio.certifications ?? [];
  const socialLinks = portfolio.socialLinks ?? [];

  const [isMuted, setIsMuted] = useState(true);
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
            <div className="flex items-center justify-between border-b-2 border-pink-500/30 pb-4">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-black tracking-wider text-pink-400 font-mono uppercase">
                  SPECIAL MENU // PROJECTS
                </h2>
              </div>
              <span className="text-xs font-mono text-cyan-400 border border-cyan-500/40 px-2 py-1 rounded bg-cyan-950/30">
                SERVED FRESH
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj, idx) => (
                <div
                  key={proj.title || idx}
                  className="relative p-6 rounded-2xl border-2 border-pink-500/30 bg-neutral-900/80 hover:border-cyan-400 transition-all duration-300 shadow-xl shadow-pink-950/20 group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-pink-600 text-black font-mono font-bold text-xs rounded-bl-xl">
                    ORDER #{idx + 1}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold font-mono text-cyan-300 group-hover:text-pink-400 transition-colors">
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
                            className="text-xs font-mono px-2.5 py-1 rounded-md bg-neutral-800 text-pink-300 border border-pink-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-neutral-800 mt-6 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink
                        href={proj.liveUrl}
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        <span>TASTE LIVE</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink
                        href={proj.repoUrl}
                        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white"
                      >
                        <span>RECIPE CODE</span>
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
            <div className="flex items-center gap-3 border-b-2 border-pink-500/30 pb-4">
              <Flame className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-black tracking-wider text-pink-400 font-mono uppercase">
                KITCHEN LOGS // EXPERIENCE
              </h2>
            </div>

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:border-pink-500/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="text-lg font-bold font-mono text-white">
                      {exp.title} <span className="text-pink-400 font-normal">@ {exp.company}</span>
                    </h3>
                    <span className="text-xs font-mono text-cyan-400">
                      {exp.startDate} - {exp.current ? "PRESENT" : exp.endDate || "PRESENT"}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-xs text-neutral-400 font-mono mb-2">📍 {exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 pt-2 font-mono text-xs">
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
          <section key="skills" id="skills" className="space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-pink-500/30 pb-4">
              <Zap className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-black tracking-wider text-pink-400 font-mono uppercase">
                FLAVOR PROFILE // INGREDIENTS
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {skills.map((sk: PortfolioSkill) => (
                <div
                  key={sk.name}
                  className="px-4 py-2 rounded-xl border border-pink-500/30 bg-neutral-900 text-neutral-200 text-sm font-mono flex items-center gap-2 hover:border-cyan-400 transition-colors"
                >
                  <span className="text-pink-500">❖</span>
                  <span className="font-bold">{sk.name}</span>
                  {sk.level && (
                    <span className="text-[10px] text-cyan-400 uppercase font-mono">
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
            <div className="flex items-center gap-3 border-b-2 border-pink-500/30 pb-4">
              <GraduationCap className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-black tracking-wider text-pink-400 font-mono uppercase">APPRENTICESHIP</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 font-mono">
                  <h3 className="font-bold text-white text-base">{edu.institution}</h3>
                  <p className="text-sm text-cyan-400 mt-1">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0 && !showEmpty) return null;
        return (
          <section key="certifications" id="certifications" className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-pink-500/30 pb-4">
              <Award className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-black tracking-wider text-pink-400 font-mono uppercase">CERTIFICATES OF CRAFT</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex justify-between items-center font-mono">
                  <div>
                    <h4 className="font-bold text-sm text-white">{c.name}</h4>
                    <p className="text-xs text-neutral-400">{c.issuer} {c.issueDate ? `· ${c.issueDate}` : ""}</p>
                  </div>
                  {c.url && (
                    <SafeLink href={c.url} className="text-pink-400 hover:text-pink-300">
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
    <div className="min-h-screen bg-[#0d0914] text-[#f1e8f8] font-sans selection:bg-pink-500/30 selection:text-pink-200">
      {/* Neon Ramen Header */}
      <header className="sticky top-0 z-40 w-full border-b border-pink-500/20 bg-[#0d0914]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍜</span>
            <div>
              <div className="text-base font-black font-mono tracking-wide text-pink-400">
                {profile.fullName}
              </div>
              <div className="text-xs font-mono text-cyan-400">RAMEN ARCADE 3D</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-neutral-900 border border-pink-500/30 text-pink-400 hover:text-pink-300 transition-colors"
              title={isMuted ? "Unmute Ambient" : "Mute Ambient"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {socialLinks.map((link: PortfolioSocialLink) => (
              <SafeLink
                key={link.url}
                href={link.url}
                className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-cyan-400 transition-colors"
                title={link.label || link.platform}
              >
                <BrandIcon name={link.platform} size={18} />
              </SafeLink>
            ))}
          </div>
        </div>
      </header>

      {/* 3D Ramen Shop Hero Canvas with Fallback */}
      <section className="relative w-full max-w-6xl mx-auto px-4 pt-8 pb-16">
        <div className="relative rounded-3xl overflow-hidden border-2 border-pink-500/40 bg-black aspect-video max-h-[500px] w-full shadow-2xl shadow-pink-950/40">
          <WebGLErrorBoundary
            fallbackPosterUrl="/portfolio-templates/previews/ramen-shop.jpg"
            fallbackTitle="Ramen Shop 3D Arcade"
          >
            {/* Interactive Video / Canvas Loop */}
            <video
              src="/portfolio-templates/previews/ramen-shop.mp4"
              poster="/portfolio-templates/previews/ramen-shop.jpg"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          </WebGLErrorBoundary>

          {/* CRT Overlay scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40" />

          {/* Floating Neon Badge */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-pink-500/50">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={profile.fullName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-400"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-neutral-800 border-2 border-cyan-400 flex items-center justify-center font-bold font-mono text-cyan-400 text-2xl">
                {profile.fullName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-mono text-white">{profile.fullName}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500 text-black font-bold">OPEN</span>
              </div>
              <p className="text-xs font-mono text-cyan-300 mt-1 max-w-md line-clamp-2">
                {profile.headline || "Serving digital experiences day & night."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-6xl mx-auto px-4 pb-24 space-y-20">
        {displayOrder.map((key) => renderSection(key))}
      </main>

      {/* Attribution Footer */}
      <AttributionFooter
        author="enderh3art"
        templateName="Ramen Shop 3D"
        license="Author Permission"
        originalUrl="https://github.com/enderh3art"
        notes="Cyberpunk retro-futuristic arcade diner with Three.js WebGL canvas."
      />

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-xl shadow-pink-900/50 transition-all z-50 font-bold"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default RamenShopTemplate;
