import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface SameeraMaterialTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function SameeraMaterialTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "projects", "skills", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: SameeraMaterialTemplateProps) {
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
    // HERO: Material Surface Card
    // -------------------------------------------------------------------------
    hero: (
      <section key="hero" id="hero" className="py-12 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm transition-shadow hover:shadow-md sm:p-12">
            <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Product Engineer & Architect</span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {profile?.fullName || (showEmpty ? "Your Full Name" : "Software Craftsman")}
                </h1>

                <p className="text-base text-muted-foreground sm:text-lg">
                  {profile?.headline || (showEmpty ? "Building user-centric software" : "Creating scalable digital products with refined interaction")}
                </p>

                {profile?.location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-4">
                    {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                      <SafeLink
                        key={idx}
                        href={link.url}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary hover:text-primary"
                      >
                        <BrandIcon name={link.platform} size={14} />
                        <span>{link.label || link.platform}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </SafeLink>
                    ))}
                  </div>
                )}
              </div>

              {profile?.avatarUrl && (
                <div className="shrink-0">
                  <img
                    src={normalizeAvatarUrl(profile.avatarUrl)}
                    alt={profile.fullName || "Avatar"}
                    className="h-28 w-28 rounded-3xl object-cover shadow-md ring-4 ring-primary/10 sm:h-36 sm:w-36"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // ABOUT
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="about" className="py-8">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border/60 bg-muted/30 p-8 sm:p-10">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Perspective</h2>
            <div className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base whitespace-pre-line">
              {profile?.bio ||
                "Deep focus on engineering maintainable frontend and backend architectures, adhering to Material 3 interaction standards and clean code principles."}
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // PROJECTS: Material 3 Cards
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="projects" className="py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Featured Projects</h2>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{proj.title || "Project"}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {proj.description || "Production-ready software architecture and digital showcase."}
                    </p>

                    {proj.tags && proj.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {proj.tags.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 text-xs">
                    {proj.repoUrl && (
                      <SafeLink href={proj.repoUrl} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <BrandIcon name="github" size={14} />
                        <span>Source</span>
                      </SafeLink>
                    )}
                    {proj.liveUrl && (
                      <SafeLink href={proj.liveUrl} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        <span>Live Demo</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </SafeLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="text-sm italic text-muted-foreground">No projects recorded.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SKILLS
    // -------------------------------------------------------------------------
    skills: (
      <section key="skills" id="skills" className="py-8">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border/80 bg-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Technologies & Capabilities</h2>
            </div>
            {skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: PortfolioSkill, idx: number) => {
                  const name = typeof skill === "string" ? skill : skill.name;
                  return (
                    <span
                      key={idx}
                      className="rounded-full border border-border bg-muted/40 px-3.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            ) : (
              showEmpty && <p className="text-sm italic text-muted-foreground">No skills recorded.</p>
            )}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------------------------------
    experience: (
      <section key="experience" id="experience" className="py-8">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border/80 bg-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Work History</h2>
            </div>
            {experience && experience.length > 0 ? (
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx} className="border-b border-border/40 pb-6 last:border-none last:pb-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="font-bold text-foreground text-base">{exp.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-primary mt-0.5">{exp.company}</p>
                    {exp.description && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground whitespace-pre-line sm:text-sm">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              showEmpty && <p className="text-sm italic text-muted-foreground">No experience listed.</p>
            )}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (
      <section key="education" id="education" className="py-6">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border/80 bg-card p-8">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Education</h2>
            </div>
            {education && education.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <h3 className="font-semibold text-sm">{edu.degree}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{edu.institution}</p>
                    <p className="text-[11px] text-primary mt-1">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              showEmpty && <p className="text-xs italic text-muted-foreground">No education listed.</p>
            )}
          </div>
        </div>
      </section>
    ),

    certifications: (
      <section key="certifications" id="certifications" className="py-6">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border/80 bg-card p-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Certifications</h2>
            </div>
            {certifications && certifications.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <h3 className="font-semibold text-xs">{cert.name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{cert.issuer}</p>
                    {cert.url && (
                      <SafeLink href={cert.url} className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                        <span>Credential</span>
                        <ExternalLink className="h-3 w-3" />
                      </SafeLink>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              showEmpty && <p className="text-xs italic text-muted-foreground">No certifications listed.</p>
            )}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // CONTACT
    // -------------------------------------------------------------------------
    contact: (
      <section key="contact" id="contact" className="py-16 text-center">
        <div className="container mx-auto max-w-xl px-4 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Let's Connect</h2>
          <p className="text-sm text-muted-foreground">Feel free to reach out for inquiries or consulting.</p>
          {profile?.email && (
            <div className="pt-2">
              <SafeLink
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90"
              >
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </SafeLink>
            </div>
          )}
        </div>
      </section>
    ),
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {sectionOrder.filter((sec) => !isHidden(sec)).map((sec) => sectionMap[sec] || null)}

      <AttributionFooter
        templateName="Material Journal"
        author="Sameera Wijerathna"
        repoUrl="https://github.com"
      />

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg hover:scale-105 transition-transform"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
