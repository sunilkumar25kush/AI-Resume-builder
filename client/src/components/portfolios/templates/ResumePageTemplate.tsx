import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Printer,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface ResumePageTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function ResumePageTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "skills", "experience", "projects", "education", "certifications", "contact"],
  hiddenSections = [],
}: ResumePageTemplateProps) {
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

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const sectionMap: Record<string, ReactNode> = {
    // -------------------------------------------------------------------------
    // HERO: Clean Professional Header
    // -------------------------------------------------------------------------
    hero: (
      <header key="hero" id="hero" className="border-b border-border pb-6 pt-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {profile?.fullName || (showEmpty ? "Candidate Name" : "Professional Resume")}
            </h1>
            <p className="text-base font-medium text-primary">
              {profile?.headline || (showEmpty ? "Software Engineer" : "Senior Software Engineer")}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{profile.location}</span>
                </span>
              )}
              {profile?.email && (
                <SafeLink href={`mailto:${profile.email}`} className="flex items-center gap-1 hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{profile.email}</span>
                </SafeLink>
              )}
              {profile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{profile.phone}</span>
                </span>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                  <SafeLink
                    key={idx}
                    href={link.url}
                    className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground hover:bg-secondary/80"
                  >
                    <BrandIcon name={link.platform} size={12} />
                    <span>{link.label || link.platform}</span>
                  </SafeLink>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {profile?.avatarUrl && (
              <img
                src={normalizeAvatarUrl(profile.avatarUrl)}
                alt={profile.fullName || "Avatar"}
                className="h-24 w-24 rounded-xl border border-border object-cover shadow-sm sm:h-28 sm:w-28"
                loading="lazy"
              />
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-muted print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>
    ),

    // -------------------------------------------------------------------------
    // ABOUT
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="about" className="py-6 border-b border-border/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Executive Summary</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground whitespace-pre-line sm:text-sm">
          {profile?.bio ||
            "Results-driven software engineer with proven experience architecting reliable web services and user interfaces."}
        </p>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SKILLS
    // -------------------------------------------------------------------------
    skills: (
      <section key="skills" id="skills" className="py-6 border-b border-border/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Technical Expertise</h2>
        {skills && skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.map((skill: PortfolioSkill, idx: number) => {
              const name = typeof skill === "string" ? skill : skill.name;
              return (
                <span
                  key={idx}
                  className="rounded border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs text-foreground font-mono"
                >
                  {name}
                </span>
              );
            })}
          </div>
        ) : (
          showEmpty && <p className="text-xs italic text-muted-foreground">Add skills.</p>
        )}
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------------------------------
    experience: (
      <section key="experience" id="experience" className="py-6 border-b border-border/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Professional Experience</h2>
        {experience && experience.length > 0 ? (
          <div className="mt-4 space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs sm:text-sm">
                  <div className="font-bold text-foreground">
                    {exp.title} <span className="text-muted-foreground font-normal">at</span>{" "}
                    <span className="text-primary font-semibold">{exp.company}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate || "Present"}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line pt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          showEmpty && <p className="text-xs italic text-muted-foreground">No experience listed.</p>
        )}
      </section>
    ),

    // -------------------------------------------------------------------------
    // PROJECTS
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="projects" className="py-6 border-b border-border/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Key Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="rounded-lg border border-border/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-foreground">{proj.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    {proj.repoUrl && (
                      <SafeLink href={proj.repoUrl} className="text-muted-foreground hover:text-foreground">
                        <BrandIcon name="github" size={13} />
                      </SafeLink>
                    )}
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" />
                      </SafeLink>
                    )}
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">{proj.description}</p>
                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.tags.map((t, tIdx) => (
                      <span key={tIdx} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          showEmpty && <p className="text-xs italic text-muted-foreground">No projects listed.</p>
        )}
      </section>
    ),

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (
      <section key="education" id="education" className="py-6 border-b border-border/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Education</h2>
        {education && education.length > 0 ? (
          <div className="mt-3 space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">{edu.degree}</span>
                  <span className="text-muted-foreground"> — {edu.institution}</span>
                </div>
                <span className="font-mono text-muted-foreground">{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </div>
        ) : (
          showEmpty && <p className="text-xs italic text-muted-foreground">No education listed.</p>
        )}
      </section>
    ),

    certifications: (
      <section key="certifications" id="certifications" className="py-6 border-b border-border/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Certifications</h2>
        {certifications && certifications.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span>{cert.name} <span className="text-muted-foreground">({cert.issuer})</span></span>
                {cert.url && (
                  <SafeLink href={cert.url} className="text-primary hover:underline text-[11px]">
                    Verify
                  </SafeLink>
                )}
              </div>
            ))}
          </div>
        ) : (
          showEmpty && <p className="text-xs italic text-muted-foreground">No certifications listed.</p>
        )}
      </section>
    ),

    contact: (
      <section key="contact" id="contact" className="py-8 text-center">
        <p className="text-xs text-muted-foreground">Direct Contact: {profile?.email || "Available on request"}</p>
      </section>
    ),
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased py-8 px-4 sm:px-6">
      <main className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 sm:p-12 shadow-sm">
        {sectionOrder.filter((sec) => !isHidden(sec)).map((sec) => sectionMap[sec] || null)}
      </main>

      <AttributionFooter
        templateName="One-Page Web Resume"
        author="GitSkins Native"
        repoUrl="https://github.com"
      />

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md hover:scale-105 transition-transform"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
