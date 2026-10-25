import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface PosterTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function PosterTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "projects", "skills", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: PosterTemplateProps) {
  const {
    profile,
    socialLinks = [],
    skills = [],
    experience = [],
    education = [],
    projects = [],
    certifications = [],
  } = portfolio;

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const isHidden = (sec: string) => hiddenSections.includes(sec);

  const sectionMap: Record<string, ReactNode> = {
    // -------------------------------------------------------------------------
    // HERO: Brutalist Poster Display
    // -------------------------------------------------------------------------
    hero: (
      <header key="hero" id="hero" className="border-b-4 border-black dark:border-white py-16 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between font-mono text-xs font-bold tracking-widest uppercase">
              <span className="bg-yellow-400 text-black px-2 py-0.5">POSTER / PORTFOLIO</span>
              <span>{profile?.location || "EARTH"}</span>
            </div>

            <div className="flex flex-col-reverse gap-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-4">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground sm:text-7xl md:text-8xl">
                  {profile?.fullName || (showEmpty ? "CREATOR" : "ENGINEER")}
                </h1>
                <p className="font-mono text-base font-bold uppercase tracking-wider text-yellow-500 sm:text-xl">
                  {profile?.headline || (showEmpty ? "FULL STACK ARCHITECT" : "SOFTWARE & SYSTEMS CRAFTSMAN")}
                </p>
              </div>

              {profile?.avatarUrl && (
                <div className="shrink-0">
                  <img
                    src={normalizeAvatarUrl(profile.avatarUrl)}
                    alt={profile.fullName || "Portrait"}
                    className="h-32 w-32 rounded-none border-4 border-black dark:border-white object-cover filter contrast-150 sm:h-44 sm:w-44"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 font-mono text-xs font-bold uppercase">
                {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                  <SafeLink
                    key={idx}
                    href={link.url}
                    className="inline-flex items-center gap-1.5 border-2 border-black dark:border-white bg-foreground text-background px-3 py-1.5 hover:bg-yellow-400 hover:text-black transition-colors"
                  >
                    <BrandIcon name={link.platform} size={13} />
                    <span>{link.label || link.platform}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </SafeLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
    ),

    // -------------------------------------------------------------------------
    // ABOUT
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="about" className="border-b-4 border-black dark:border-white py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="font-mono text-xs font-bold tracking-widest uppercase bg-foreground text-background inline-block px-2 py-0.5 mb-6">
            STATEMENT // 01
          </h2>
          <p className="text-xl font-bold uppercase leading-snug sm:text-3xl whitespace-pre-line text-foreground">
            {profile?.bio ||
              "UNCOMPROMISING SOFTWARE ENGINEERING. ZERO FLUFF. ROBUST ARCHITECTURE, HIGH DENSITY EXECUTION, AND MEASURABLE IMPACT."}
          </p>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // PROJECTS: Brutalist Block Cards
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="projects" className="border-b-4 border-black dark:border-white py-16 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
              WORKS CATALOG
            </h2>
            <span className="font-mono text-xs font-bold">COUNT: {projects.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {projects && projects.length > 0 ? (
              projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between border-4 border-black dark:border-white p-6 transition-all hover:bg-yellow-400 hover:text-black group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs font-bold">
                      <span>REF. {String(idx + 1).padStart(2, "0")}</span>
                      {proj.featured && <span className="bg-black text-yellow-400 px-1.5 py-0.5">STARRED</span>}
                    </div>

                    <h3 className="text-2xl font-black uppercase tracking-tight">{proj.title}</h3>
                    <p className="text-xs leading-relaxed font-mono opacity-80">{proj.description}</p>

                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {proj.tags.map((t, tIdx) => (
                          <span key={tIdx} className="font-mono text-[10px] font-bold border border-current px-1.5 py-0.5">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t-2 border-current pt-4 font-mono text-xs font-bold">
                    {proj.repoUrl && (
                      <SafeLink href={proj.repoUrl} className="hover:underline">
                        REPO ↗
                      </SafeLink>
                    )}
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="hover:underline">
                        LIVE DEMO ↗
                      </SafeLink>
                    )}
                  </div>
                </div>
              ))
            ) : (
              showEmpty && <p className="font-mono text-xs italic">NO PROJECTS RECORDED.</p>
            )}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SKILLS
    // -------------------------------------------------------------------------
    skills: (
      <section key="skills" id="skills" className="border-b-4 border-black dark:border-white py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8">STACK CAPABILITIES</h2>
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 font-mono text-xs font-bold uppercase">
              {skills.map((skill: PortfolioSkill, idx: number) => {
                const name = typeof skill === "string" ? skill : skill.name;
                return (
                  <span key={idx} className="border-2 border-black dark:border-white px-3 py-1 bg-card hover:bg-yellow-400 hover:text-black transition-colors">
                    {name}
                  </span>
                );
              })}
            </div>
          ) : (
            showEmpty && <p className="font-mono text-xs">NO SKILLS RECORDED.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------------------------------
    experience: (
      <section key="experience" id="experience" className="border-b-4 border-black dark:border-white py-16 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8">RECORDED HISTORY</h2>
          {experience && experience.length > 0 ? (
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-2 border-black dark:border-white p-5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between font-mono">
                    <span className="text-lg font-black uppercase">{exp.title}</span>
                    <span className="text-xs text-yellow-500 font-bold">{exp.startDate} – {exp.endDate || "NOW"}</span>
                  </div>
                  <p className="font-mono text-xs font-bold uppercase">{exp.company}</p>
                  {exp.description && (
                    <p className="font-mono text-xs leading-relaxed opacity-80 pt-1 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="font-mono text-xs">NO HISTORY RECORDED.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (
      <section key="education" id="education" className="border-b-4 border-black dark:border-white py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6">CREDENTIALS</h2>
          {education && education.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 font-mono text-xs">
              {education.map((edu, idx) => (
                <div key={idx} className="border-2 border-black dark:border-white p-4">
                  <p className="font-bold uppercase">{edu.degree}</p>
                  <p className="opacity-80 mt-1">{edu.institution}</p>
                  <p className="text-yellow-500 mt-2">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="font-mono text-xs">NO CREDENTIALS RECORDED.</p>
          )}
        </div>
      </section>
    ),

    certifications: (
      <section key="certifications" id="certifications" className="border-b-4 border-black dark:border-white py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6">CERTIFICATIONS</h2>
          {certifications && certifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono text-xs">
              {certifications.map((cert, idx) => (
                <div key={idx} className="border-2 border-black dark:border-white p-3">
                  <p className="font-bold">{cert.name}</p>
                  <p className="opacity-80 mt-1">{cert.issuer}</p>
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="font-mono text-xs">NO CERTIFICATIONS RECORDED.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // CONTACT
    // -------------------------------------------------------------------------
    contact: (
      <footer key="contact" id="contact" className="py-24 text-center">
        <div className="container mx-auto max-w-2xl px-4 space-y-4">
          <h2 className="text-4xl font-black uppercase sm:text-6xl">TRANSMIT DIRECT</h2>
          {profile?.email && (
            <SafeLink
              href={`mailto:${profile.email}`}
              className="inline-block border-4 border-black dark:border-white bg-yellow-400 text-black px-8 py-4 font-mono font-black text-sm uppercase hover:bg-black hover:text-yellow-400 transition-colors"
            >
              {profile.email}
            </SafeLink>
          )}
        </div>
      </footer>
    ),
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans">
      {sectionOrder.filter((sec) => !isHidden(sec)).map((sec) => sectionMap[sec] || null)}

      <AttributionFooter
        templateName="Poster"
        author="GitSkins Native"
        repoUrl="https://github.com"
      />

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center border-2 border-black dark:border-white bg-yellow-400 text-black font-bold shadow-xl hover:scale-110 transition-transform"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
