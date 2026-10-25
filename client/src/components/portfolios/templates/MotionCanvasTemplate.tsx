import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  ExternalLink,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface MotionCanvasTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function MotionCanvasTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "projects", "skills", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: MotionCanvasTemplateProps) {
  const {
    profile,
    socialLinks = [],
    skills = [],
    experience = [],
    education = [],
    projects = [],
    certifications = [],
    design,
  } = portfolio;

  const primaryColor = design?.primaryColor || "#6366f1";
  const [showBackToTop, setShowBackToTop] = useState(false);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isHidden = (sec: string) => hiddenSections.includes(sec);

  const sectionMap: Record<string, ReactNode> = {
    // -------------------------------------------------------------------------
    // HERO: Kinetic Full-Screen Typography
    // -------------------------------------------------------------------------
    hero: (
      <section
        key="hero"
        id="hero"
        className="relative flex min-h-[85vh] flex-col justify-between overflow-hidden border-b border-white/10 px-6 py-12 sm:px-12 md:py-20"
      >
        {/* Subtle dynamic background gradient blob */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: primaryColor }}
          aria-hidden="true"
        />

        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Motion Canvas Portfolio</span>
          </span>
          {profile?.location && (
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
              <span>{profile.location}</span>
            </span>
          )}
        </div>

        <div className="my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <p className="font-mono text-sm uppercase tracking-widest text-indigo-400">
              {profile?.headline || (showEmpty ? "Creative Technologist" : "Engineering & Digital Craft")}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-8xl">
              {profile?.fullName || (showEmpty ? "Your Full Name" : "Creative Engineer")}
            </h1>
            <p className="max-w-2xl text-base text-slate-400 sm:text-lg">
              {profile?.bio ||
                (showEmpty
                  ? "Crafting kinetic, interactive digital experiences with smooth physics and typographic rhythm."
                  : "Designing and developing web experiences at the intersection of precision code and thoughtful interaction design.")}
            </p>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
              <SafeLink
                key={idx}
                href={link.url}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300 transition-all hover:border-indigo-400 hover:text-white"
              >
                <BrandIcon name={link.platform} className="h-3 w-3" />
                <span>{link.label || link.platform}</span>
                <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
              </SafeLink>
            ))}
          </div>

          <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
            <span>Scroll down</span>
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // ABOUT / PHILOSOPHY
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="about" className="border-b border-white/10 px-6 py-16 sm:px-12 md:py-24">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>01 // Overview</span>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              {profile?.avatarUrl ? (
                <img
                  src={normalizeAvatarUrl(profile.avatarUrl)}
                  alt={profile.fullName || "Avatar"}
                  className="h-44 w-44 rounded-2xl border border-white/10 object-cover shadow-2xl"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 font-mono text-xs text-slate-500">
                  <Layers className="h-10 w-10 text-indigo-400/80" />
                </div>
              )}
            </div>

            <div className="space-y-4 md:col-span-2">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Merging engineering discipline with kinetic editorial pacing
              </h2>
              <div className="text-sm leading-relaxed text-slate-400 sm:text-base whitespace-pre-line">
                {profile?.bio ||
                  "Focused on building fluid web interfaces that feel tangible, responsive, and tactile. Every transition and interaction is tuned for maximum engagement."}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // PROJECTS: Horizontal Kinetic Project Deck
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="projects" className="border-b border-white/10 py-16 md:py-24">
        <div className="px-6 sm:px-12 mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-indigo-400">
              <BookOpen className="h-4 w-4" />
              <span>02 // Selected Works</span>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Featured Case Studies
            </h2>
          </div>
          <p className="font-mono text-xs text-slate-500">Horizontal snap scroll →</p>
        </div>

        {projects && projects.length > 0 ? (
          <div
            ref={horizontalScrollRef}
            className="flex gap-6 overflow-x-auto px-6 pb-6 pt-2 scrollbar-none sm:px-12"
          >
            {projects.map((proj, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="group relative flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-white/10 bg-[#121622] p-6 shadow-xl transition-colors hover:border-indigo-500/50 sm:w-[420px]"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs text-indigo-400">
                      Case {String(idx + 1).padStart(2, "0")}
                    </span>
                    {proj.featured && (
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono text-indigo-400 ring-1 ring-indigo-500/30">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300">
                    {proj.title || "Untitled Project"}
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-400 line-clamp-4">
                    {proj.description || "Detailed digital case study showcasing architecture and interface craftsmanship."}
                  </p>

                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono">
                  {proj.repoUrl && (
                    <SafeLink
                      href={proj.repoUrl}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      <BrandIcon name="github" className="h-3.5 w-3.5" />
                      <span>Code</span>
                    </SafeLink>
                  )}
                  {proj.liveUrl && (
                    <SafeLink
                      href={proj.liveUrl}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
                    >
                      <span>Live Demo</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </SafeLink>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          showEmpty && (
            <p className="px-6 sm:px-12 text-sm italic text-slate-500">
              No projects added yet. Populate projects to display the horizontal deck.
            </p>
          )
        )}
      </section>
    ),

    // -------------------------------------------------------------------------
    // SKILLS
    // -------------------------------------------------------------------------
    skills: (
      <section key="skills" id="skills" className="border-b border-white/10 px-6 py-16 sm:px-12 md:py-24">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-indigo-400">
            <Code2 className="h-4 w-4" />
            <span>03 // Technical Spectrum</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Core Technologies & Tooling
          </h2>

          {skills && skills.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {skills.map((skill: PortfolioSkill, idx: number) => {
                const name = typeof skill === "string" ? skill : skill.name;
                const level = typeof skill === "object" ? skill.level : null;
                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#121622] p-4 transition-all hover:border-indigo-400/40"
                  >
                    <span className="font-mono text-xs font-semibold text-white">{name}</span>
                    {level && (
                      <span className="mt-2 text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                        {level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            showEmpty && (
              <p className="text-sm italic text-slate-500">Add technical skills to populate this section.</p>
            )
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------------------------------
    experience: (
      <section key="experience" id="experience" className="border-b border-white/10 px-6 py-16 sm:px-12 md:py-24">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-indigo-400">
            <Briefcase className="h-4 w-4" />
            <span>04 // Career Milestones</span>
          </div>

          {experience && experience.length > 0 ? (
            <div className="divide-y divide-white/10">
              {experience.map((exp, idx) => (
                <div key={idx} className="py-6 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-lg font-bold text-white">{exp.title || "Role"}</h3>
                    <span className="font-mono text-xs text-indigo-400">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-400">{exp.company || "Company"}</p>
                  {exp.description && (
                    <p className="text-xs leading-relaxed text-slate-400 whitespace-pre-line sm:text-sm pt-1">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            showEmpty && (
              <p className="text-sm italic text-slate-500">Add professional experience to display here.</p>
            )
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (
      <section key="education" id="education" className="border-b border-white/10 px-6 py-16 sm:px-12 md:py-20">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-indigo-400">
            <GraduationCap className="h-4 w-4" />
            <span>05 // Credentials</span>
          </div>

          {education && education.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {education.map((edu, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#121622] p-5">
                  <h4 className="font-bold text-white text-sm">{edu.degree || "Degree"}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">{edu.institution}</p>
                  <p className="text-[11px] text-indigo-400 font-mono mt-2">
                    {edu.startDate} – {edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="text-sm italic text-slate-500">No education history added.</p>
          )}
        </div>
      </section>
    ),

    certifications: (
      <section key="certifications" id="certifications" className="border-b border-white/10 px-6 py-16 sm:px-12 md:py-20">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-indigo-400">
            <Award className="h-4 w-4" />
            <span>06 // Certifications</span>
          </div>

          {certifications && certifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {certifications.map((cert, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#121622] p-4">
                  <h4 className="text-xs font-bold text-white">{cert.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{cert.issuer}</p>
                  {cert.url && (
                    <SafeLink href={cert.url} className="mt-2 inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline font-mono">
                      <span>Verify</span>
                      <ExternalLink className="h-3 w-3" />
                    </SafeLink>
                  )}
                </div>
              ))}
            </div>
          ) : (
            showEmpty && <p className="text-sm italic text-slate-500">No certifications recorded.</p>
          )}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // CONTACT
    // -------------------------------------------------------------------------
    contact: (
      <section key="contact" id="contact" className="px-6 py-20 sm:px-12 md:py-32 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="font-mono text-xs uppercase tracking-widest text-indigo-400">Initiate Dialogue</p>
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl">
            Have a project in mind? Let's build together.
          </h2>
          {profile?.email && (
            <div className="pt-4">
              <SafeLink
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-mono text-xs font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
                <ArrowRight className="h-4 w-4" />
              </SafeLink>
            </div>
          )}
        </div>
      </section>
    ),
  };

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-200 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Reading Progress Bar */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-indigo-500"
        style={{ scaleX }}
      />

      {/* Dynamic Sections */}
      {sectionOrder.filter((sec) => !isHidden(sec)).map((sec) => sectionMap[sec] || null)}

      {/* Upstream Attribution */}
      <AttributionFooter
        templateName="Motion Canvas"
        author="Hamish Williams"
        repoUrl="https://github.com/HamishMW/portfolio"
      />

      {/* Back to top */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-indigo-400 shadow-2xl backdrop-blur transition-all hover:bg-black/90 hover:scale-110"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
