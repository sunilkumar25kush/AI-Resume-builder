import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface SeyiEditorialTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function SeyiEditorialTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "projects", "skills", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: SeyiEditorialTemplateProps) {
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
    // HERO: Editorial Magazine Cover
    // -------------------------------------------------------------------------
    hero: (
      <header key="hero" id="hero" className="border-b-2 border-black/80 dark:border-white/20 pb-12 pt-16 sm:pt-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-black/20 dark:border-white/20 pb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span>Vol. 01 — Edition 2026</span>
              <span>{profile?.location || "Global / Remote"}</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-serif font-black tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-9xl uppercase">
                {profile?.fullName || (showEmpty ? "Candidate" : "Editorial")}
              </h1>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
                <p className="max-w-xl text-lg font-serif italic text-muted-foreground sm:text-2xl">
                  {profile?.headline || (showEmpty ? "Creative Director & Systems Architect" : "Engineering Craft & Thoughtful Design")}
                </p>

                {profile?.avatarUrl && (
                  <img
                    src={normalizeAvatarUrl(profile.avatarUrl)}
                    alt={profile.fullName || "Portrait"}
                    className="h-24 w-24 rounded-full border-2 border-black dark:border-white object-cover filter grayscale contrast-125 sm:h-32 sm:w-32"
                    loading="lazy"
                  />
                )}
              </div>
            </div>

            {/* Marquee Headline Ticker */}
            <div className="overflow-hidden border-y border-black/20 dark:border-white/20 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <div className="flex w-max gap-8 animate-marquee">
                <span>✦ AVAILABLE FOR SELECT ENGAGEMENTS</span>
                <span>✦ FULL-STACK ARCHITECTURE</span>
                <span>✦ EDITORIAL INTERFACE CRAFT</span>
                <span>✦ OPEN SOURCE CONTRIBUTION</span>
                <span>✦ AVAILABLE FOR SELECT ENGAGEMENTS</span>
                <span>✦ FULL-STACK ARCHITECTURE</span>
              </div>
            </div>

            {/* Social Link Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                <SafeLink
                  key={idx}
                  href={link.url}
                  className="inline-flex items-center gap-1.5 font-serif text-sm font-semibold uppercase tracking-wider text-foreground hover:underline"
                >
                  <BrandIcon name={link.platform} size={14} />
                  <span>{link.label || link.platform}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </SafeLink>
              ))}
            </div>
          </div>
        </div>
      </header>
    ),

    // -------------------------------------------------------------------------
    // ABOUT
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="about" className="border-b border-black/20 dark:border-white/20 py-16 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="font-mono text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400">
                [ Introduction ]
              </span>
              <h2 className="mt-2 text-3xl font-serif font-bold text-foreground">Biography & Perspective</h2>
            </div>
            <div className="md:col-span-8 space-y-4 font-serif text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:font-serif whitespace-pre-line">
                {profile?.bio ||
                  "Approaching software as editorial publication: typography, structure, pacing, and architectural integrity working in complete harmony."}
              </p>
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // PROJECTS: Editorial Spread
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="projects" className="border-b border-black/20 dark:border-white/20 py-16 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mb-12 flex items-baseline justify-between border-b border-black/20 dark:border-white/20 pb-4">
            <h2 className="text-3xl font-serif font-black uppercase tracking-tight text-foreground sm:text-4xl">
              Selected Works
            </h2>
            <span className="font-mono text-xs text-muted-foreground">Index 01 — {projects.length}</span>
          </div>

          <div className="space-y-12">
            {projects && projects.length > 0 ? (
              projects.map((proj, idx) => (
                <article
                  key={idx}
                  className="group grid grid-cols-1 gap-6 border-b border-black/10 dark:border-white/10 pb-10 md:grid-cols-12"
                >
                  <div className="md:col-span-2 font-mono text-4xl font-light text-muted-foreground/60 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  <div className="space-y-3 md:col-span-7">
                    <h3 className="text-2xl font-serif font-bold text-foreground group-hover:underline">
                      {proj.title || "Project Title"}
                    </h3>
                    <p className="font-serif text-sm leading-relaxed text-muted-foreground">
                      {proj.description || "In-depth editorial case study demonstrating architectural execution."}
                    </p>
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proj.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="font-mono text-xs uppercase tracking-wider text-muted-foreground border border-black/20 dark:border-white/20 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col md:items-end justify-start gap-3 md:col-span-3 text-xs font-mono">
                    {proj.liveUrl && (
                      <SafeLink
                        href={proj.liveUrl}
                        className="inline-flex items-center gap-1 font-semibold uppercase text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        <span>Visit Site</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink
                        href={proj.repoUrl}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <BrandIcon name="github" size={13} />
                        <span>Source</span>
                      </SafeLink>
                    )}
                  </div>
                </article>
              ))
            ) : (
              showEmpty && <p className="font-serif italic text-muted-foreground">No projects cataloged.</p>
            )}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SKILLS
    // -------------------------------------------------------------------------
    skills: (
      <section key="skills" id="skills" className="border-b border-black/20 dark:border-white/20 py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="mb-8 text-2xl font-serif font-bold uppercase tracking-tight text-foreground">
            Competencies & Tooling
          </h2>
          {skills && skills.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 font-mono text-xs uppercase tracking-wider">
              {skills.map((skill: PortfolioSkill, idx: number) => {
                const name = typeof skill === "string" ? skill : skill.name;
                return (
                  <div key={idx} className="border-l-2 border-amber-600 dark:border-amber-400 pl-3 py-1">
                    <span className="font-semibold text-foreground">{name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            showEmpty && <p className="font-serif italic text-muted-foreground">Add technical skills.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------------------------------
    experience: (
      <section key="experience" id="experience" className="border-b border-black/20 dark:border-white/20 py-16 sm:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="mb-10 text-2xl font-serif font-bold uppercase tracking-tight text-foreground">
            Chronology
          </h2>
          {experience && experience.length > 0 ? (
            <div className="space-y-8">
              {experience.map((exp, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 border-b border-black/10 dark:border-white/10 pb-6 sm:grid-cols-12">
                  <div className="font-mono text-xs text-muted-foreground sm:col-span-3">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate || "Present"}
                  </div>
                  <div className="sm:col-span-9 space-y-1">
                    <h3 className="text-lg font-serif font-bold text-foreground">{exp.title}</h3>
                    <p className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">{exp.company}</p>
                    {exp.description && (
                      <p className="pt-2 font-serif text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="font-serif italic text-muted-foreground">No experience history cataloged.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (
      <section key="education" id="education" className="border-b border-black/20 dark:border-white/20 py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="mb-6 text-xl font-serif font-bold uppercase tracking-tight text-foreground">
            Academic Background
          </h2>
          {education && education.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {education.map((edu, idx) => (
                <div key={idx} className="border border-black/20 dark:border-white/20 p-5 rounded">
                  <h3 className="font-serif font-bold text-foreground">{edu.degree}</h3>
                  <p className="font-mono text-xs text-muted-foreground mt-1">{edu.institution}</p>
                  <p className="font-mono text-xs text-amber-600 dark:text-amber-400 mt-2">
                    {edu.startDate} — {edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="font-serif italic text-muted-foreground">No education listed.</p>
          )}
        </div>
      </section>
    ),

    certifications: (
      <section key="certifications" id="certifications" className="border-b border-black/20 dark:border-white/20 py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8">
          <h2 className="mb-6 text-xl font-serif font-bold uppercase tracking-tight text-foreground">
            Credentials
          </h2>
          {certifications && certifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {certifications.map((cert, idx) => (
                <div key={idx} className="border border-black/20 dark:border-white/20 p-4 rounded">
                  <h3 className="font-serif text-xs font-bold text-foreground">{cert.name}</h3>
                  <p className="font-mono text-[11px] text-muted-foreground mt-1">{cert.issuer}</p>
                  {cert.url && (
                    <SafeLink href={cert.url} className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-amber-600 hover:underline">
                      <span>Verify</span>
                      <ExternalLink className="h-3 w-3" />
                    </SafeLink>
                  )}
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="font-serif italic text-muted-foreground">No certifications listed.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // CONTACT
    // -------------------------------------------------------------------------
    contact: (
      <footer key="contact" id="contact" className="py-20 sm:py-32 text-center">
        <div className="container mx-auto max-w-2xl px-4 space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400">
            [ Inquiries ]
          </span>
          <h2 className="text-4xl font-serif font-black uppercase text-foreground sm:text-6xl">
            Let's Converse
          </h2>
          {profile?.email && (
            <div className="pt-4">
              <SafeLink
                href={`mailto:${profile.email}`}
                className="font-serif text-xl sm:text-3xl text-foreground underline decoration-amber-500 underline-offset-8 hover:text-amber-600"
              >
                {profile.email}
              </SafeLink>
            </div>
          )}
        </div>
      </footer>
    ),
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-black font-serif">
      {sectionOrder.filter((sec) => !isHidden(sec)).map((sec) => sectionMap[sec] || null)}

      <AttributionFooter
        templateName="Kinetic Editorial"
        author="Oluwadare Oluwaseyi"
        repoUrl="https://github.com"
      />

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-black/20 dark:border-white/20 bg-background text-foreground shadow-lg hover:scale-110 transition-transform"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
