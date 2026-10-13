import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Briefcase,
  Camera,
  Code2,
  ExternalLink,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface ModernCreativeTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function ModernCreativeTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder: _sectionOrder = ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: ModernCreativeTemplateProps) {
  const { profile, socialLinks = [], skills = [], experience = [], education = [], projects = [] } =
    portfolio;

  const [activeSection, setActiveSection] = useState("hero");

  const fullName = profile?.fullName || (showEmpty ? "John Doe" : "");
  const headline = profile?.headline || (showEmpty ? "Data Analyst & Creative Engineer" : "");
  const bio =
    profile?.bio ||
    (showEmpty
      ? "Data Analyst with 4+ years of experience transforming raw data into actionable insights. Skilled in SQL, Python, and data visualization."
      : "");
  const avatarUrl = normalizeAvatarUrl(profile?.avatarUrl);

  const firstName = fullName ? fullName.split(" ")[0] : "John";
  const initials = (fullName || "JD")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Experience calculation for floating stat badge
  const experienceYears = useMemo(() => {
    if (experience.length === 0) return "4+";
    const yrs = Math.max(1, experience.length * 1.5);
    return `${Math.round(yrs)}+`;
  }, [experience]);

  // Smooth scroll handler with header offset
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 76;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
    setActiveSection(id);
  };

  // Active section spy on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      const sections = ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(s);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHidden = (sec: string) => hiddenSections.includes(sec);

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-neutral-100 selection:bg-purple-500/30 selection:text-white font-sans antialiased overflow-x-hidden scroll-smooth">
      {/* Subtle deep indigo/violet radial ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[10%] right-[10%] h-[550px] w-[550px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-[40%] left-[-5%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[170px]" />
        <div className="absolute bottom-[5%] right-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Clean Modern Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/85 border-b border-white/5 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo / Brand Name */}
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="text-lg font-bold tracking-tight text-white hover:text-purple-400 transition-colors"
          >
            {firstName || "Portfolio"}
          </button>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
            {[
              { id: "hero", label: "Home" },
              { id: "about", label: "About", condition: !!bio || showEmpty },
              { id: "skills", label: "Skills", condition: skills.length > 0 || showEmpty },
              { id: "projects", label: "Projects", condition: projects.length > 0 || showEmpty },
              { id: "experience", label: "Experience", condition: experience.length > 0 || showEmpty },
              { id: "education", label: "Education", condition: education.length > 0 || showEmpty },
              { id: "contact", label: "Contact", condition: true },
            ]
              .filter((item) => item.condition !== false)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`transition-colors ${
                    activeSection === item.id
                      ? "text-white font-semibold"
                      : "hover:text-neutral-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </nav>

          {/* Hire Me CTA Button */}
          <div>
            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Hire Me
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-24 py-12 sm:py-20">
        {/* ============================================================== */}
        {/* 1. HERO SECTION (Matching John Doe Reference)                  */}
        {/* ============================================================== */}
        <section id="hero" className="pt-6 sm:pt-12 pb-8 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Welcome Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-purple-500/25 bg-purple-500/10 text-purple-300">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Welcome to my portfolio</span>
              </div>

              {/* Headline with Glowing Purple Name */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                  <span>Hi, I&apos;m </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                    {fullName || "John Doe"}
                  </span>
                </h1>
                {headline && (
                  <p className="text-sm sm:text-base font-medium text-purple-300 font-mono">
                    {headline}
                  </p>
                )}
              </div>

              {/* Bio / Description */}
              {bio && (
                <p className="text-base sm:text-lg text-neutral-300/90 leading-relaxed max-w-xl font-normal">
                  {bio}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollTo("contact")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get In Touch</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollTo("projects")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-[1.02]"
                >
                  <span>View My Work</span>
                </button>
              </div>

              {/* Connect Row */}
              <div className="pt-4 flex items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                  CONNECT
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                      <SafeLink
                        key={`${link.platform}-${idx}`}
                        href={link.url}
                        className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                        title={link.label || link.platform}
                      >
                        <BrandIcon name={link.platform} size={15} />
                      </SafeLink>
                    ))
                  ) : (
                    <>
                      <SafeLink
                        href="https://github.com"
                        className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-all"
                        title="GitHub"
                      >
                        <BrandIcon name="github" size={15} />
                      </SafeLink>
                      <SafeLink
                        href="https://linkedin.com"
                        className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-all"
                        title="LinkedIn"
                      >
                        <BrandIcon name="linkedin" size={15} />
                      </SafeLink>
                      {profile?.email && (
                        <SafeLink
                          href={`mailto:${profile.email}`}
                          className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-all"
                          title="Email"
                        >
                          <Mail className="h-4 w-4" />
                        </SafeLink>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: 3D Avatar Frame with Camera badge & Floating Experience Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative w-[300px] sm:w-[380px] h-[340px] sm:h-[400px] flex items-center justify-center">
                {/* Indigo ambient aura */}
                <div className="absolute inset-2 rounded-full bg-indigo-600/20 blur-3xl" />

                {/* Circular Spotlight Container */}
                <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-b from-indigo-500/20 to-transparent border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.25)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#111827] flex items-center justify-center relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName || "Portfolio Avatar"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-purple-400">
                        <span className="text-5xl font-extrabold font-mono">{initials}</span>
                        <span className="text-xs text-neutral-400 mt-2">Avatar</span>
                      </div>
                    )}
                  </div>

                  {/* Camera icon badge (matching reference image) */}
                  <div className="absolute bottom-2 right-4 z-20 h-9 w-9 rounded-full bg-white text-neutral-900 shadow-xl flex items-center justify-center border-2 border-[#0b0f19]">
                    <Camera className="h-4 w-4 text-neutral-800" />
                  </div>
                </div>

                {/* Floating Stat Card: 4+ Years Experience (Bottom Left) */}
                <div className="absolute bottom-2 left-0 sm:-left-4 z-20 px-4 py-2.5 rounded-2xl border border-white/15 bg-white/95 text-neutral-900 shadow-2xl backdrop-blur-md flex items-center gap-3">
                  <div className="text-2xl font-extrabold text-purple-600 font-mono leading-none">
                    {experienceYears}
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-600 leading-tight">
                    <p>Years</p>
                    <p>Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. ABOUT SECTION                                               */}
        {/* ============================================================== */}
        {!isHidden("about") && (bio || showEmpty) && (
          <section id="about" className="scroll-mt-20">
            <div className="p-6 sm:p-10 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-purple-400">
                  About Me
                </h2>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">
                Transforming complexity into elegant, actionable solutions
              </h3>
              <p className="text-base text-neutral-300 leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 3. SKILLS SECTION                                              */}
        {/* ============================================================== */}
        {!isHidden("skills") && (skills.length > 0 || showEmpty) && (
          <section id="skills" className="scroll-mt-20 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400">
                  Expertise
                </h2>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Skills & Technologies
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(skills.length > 0
                ? skills
                : [
                    { name: "Python", category: "Languages" },
                    { name: "SQL", category: "Database" },
                    { name: "Tableau", category: "Analytics" },
                    { name: "PowerBI", category: "Analytics" },
                    { name: "React", category: "Frontend" },
                    { name: "TypeScript", category: "Languages" },
                  ]
              ).map((skill: PortfolioSkill, idx: number) => (
                <div
                  key={`${skill.name}-${idx}`}
                  className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-white">{skill.name}</span>
                  {skill.category && (
                    <span className="text-[10px] text-purple-300 font-mono">
                      {skill.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 4. PROJECTS SECTION                                            */}
        {/* ============================================================== */}
        {!isHidden("projects") && (projects.length > 0 || showEmpty) && (
          <section id="projects" className="scroll-mt-20 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-purple-400">
                  Featured Work
                </h2>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Projects & Case Studies
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(projects.length > 0
                ? projects
                : [
                    {
                      title: "Data Intelligence Dashboard",
                      description: "Interactive real-time metrics dashboard aggregating multi-source analytics.",
                      tags: ["Python", "SQL", "Tableau"],
                    },
                    {
                      title: "Predictive Analytics Model",
                      description: "Machine learning classification model predicting customer retention trends.",
                      tags: ["Python", "Pandas", "Scikit-Learn"],
                    },
                  ]
              ).map((proj, idx) => (
                <div
                  key={`${proj.title}-${idx}`}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-white">{proj.title}</h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">{proj.description}</p>
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {(proj.liveUrl || proj.repoUrl) && (
                    <div className="pt-6 flex items-center gap-4">
                      {proj.liveUrl && (
                        <SafeLink
                          href={proj.liveUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </SafeLink>
                      )}
                      {proj.repoUrl && (
                        <SafeLink
                          href={proj.repoUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                        >
                          <BrandIcon name="github" size={14} />
                          <span>Code Repository</span>
                        </SafeLink>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 5. EXPERIENCE SECTION                                          */}
        {/* ============================================================== */}
        {!isHidden("experience") && (experience.length > 0 || showEmpty) && (
          <section id="experience" className="scroll-mt-20 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400">
                  Career Path
                </h2>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Professional Experience
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={`${exp.company}-${idx}`}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">{exp.title}</h4>
                    <p className="text-sm font-semibold text-purple-400">{exp.company}</p>
                    {exp.description && (
                      <p className="text-sm text-neutral-300 leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs font-mono text-neutral-400 shrink-0">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate || "Present"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 6. CONTACT SECTION                                             */}
        {/* ============================================================== */}
        <section id="contact" className="scroll-mt-20 pb-12">
          <div className="p-8 sm:p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-transparent backdrop-blur-xl text-center space-y-6">
            <h3 className="text-3xl sm:text-4xl font-bold text-white">
              Let&apos;s build something great together
            </h3>
            <p className="text-neutral-300 max-w-lg mx-auto text-sm sm:text-base">
              Available for full-time roles, freelance opportunities, and collaborative initiatives.
            </p>
            <div className="pt-2 flex justify-center">
              <SafeLink
                href={`mailto:${profile?.email || "hello@example.com"}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all hover:scale-105"
              >
                <Mail className="h-4 w-4" />
                <span>Get In Touch</span>
              </SafeLink>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 relative z-10 bg-[#0b0f19]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>© {new Date().getFullYear()} {fullName || "Portfolio"}. All rights reserved.</span>
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="inline-flex items-center gap-1.5 text-purple-400 hover:text-white transition-colors"
          >
            <span>^top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
