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
  const { profile, socialLinks = [], skills = [], experience = [], projects = [] } =
    portfolio;

  const primaryColor = portfolio?.design?.primaryColor || "#9333ea";
  const theme = portfolio?.design?.theme || "system";
  const isLight =
    theme === "light" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: light)").matches &&
      !window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  const [activeSection, setActiveSection] = useState("hero");

  const fullName = profile?.fullName || (showEmpty ? "John Doe" : "");
  const headline = profile?.headline || (showEmpty ? "Data Analyst & Creative Engineer" : "");
  const bio =
    profile?.bio ||
    (showEmpty
      ? "Data Analyst with 4+ years of experience transforming raw data into actionable insights. Skilled in SQL, Python, and data visualization."
      : "");
  const avatarUrl = normalizeAvatarUrl(profile?.avatarUrl, 288);

  const firstName = fullName ? fullName.split(" ")[0] : "John";
  const initials = (fullName || "JD")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Dynamic styling tokens
  const primaryGradient = `linear-gradient(90deg, ${primaryColor}, #6366f1)`;
  const haloGradient = `linear-gradient(135deg, ${primaryColor}, #6366f1, #ec4899)`;

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
    <div
      className={`relative min-h-screen transition-colors duration-300 selection:bg-purple-500/30 selection:text-white antialiased overflow-x-hidden scroll-smooth ${
        isLight ? "bg-[#f8fafc] text-neutral-900" : "bg-[#0b0f19] text-neutral-100"
      }`}
    >
      {/* Subtle deep radial ambient lighting */}
      <div className={`pointer-events-none fixed inset-0 overflow-hidden z-0 transition-opacity duration-300 ${isLight ? "opacity-20" : "opacity-100"}`}>
        <div
          className="absolute top-[10%] right-[10%] h-[550px] w-[550px] rounded-full blur-[150px]"
          style={{ backgroundColor: `${primaryColor}22` }}
        />
        <div className="absolute top-[40%] left-[-5%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[170px]" />
        <div className="absolute bottom-[5%] right-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Clean Modern Top Navbar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-200 ${
          isLight
            ? "bg-white/85 border-neutral-200/80 shadow-xs text-neutral-800"
            : "bg-[#0b0f19]/85 border-white/5 text-neutral-100"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo / Brand Name */}
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="text-lg font-bold tracking-tight transition-colors"
            style={{ color: primaryColor }}
          >
            {firstName || "Portfolio"}
          </button>

          {/* Nav Items */}
          <nav
            className={`hidden md:flex items-center gap-6 text-sm ${
              isLight ? "text-neutral-600" : "text-neutral-400"
            }`}
          >
            {[
              { id: "hero", label: "Home" },
              { id: "about", label: "About", condition: !!bio || showEmpty },
              { id: "skills", label: "Skills", condition: skills.length > 0 || showEmpty },
              { id: "projects", label: "Projects", condition: projects.length > 0 || showEmpty },
              { id: "experience", label: "Experience", condition: experience.length > 0 || showEmpty },
              { id: "contact", label: "Contact", condition: true },
            ]
              .filter((item) => item.condition !== false)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  style={activeSection === item.id ? { color: primaryColor, fontWeight: 600 } : {}}
                  className={`transition-colors ${
                    activeSection === item.id
                      ? "font-semibold"
                      : isLight
                        ? "hover:text-neutral-900"
                        : "hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </nav>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => scrollTo("contact")}
            style={{
              background: primaryGradient,
              boxShadow: `0 0 20px ${primaryColor}45`,
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Hire Me</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-24 py-8 sm:py-16">
        {/* ============================================================== */}
        {/* 1. HERO SECTION                                                */}
        {/* ============================================================== */}
        <section id="hero" className="pt-8 sm:pt-12 pb-10 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Welcome Badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border"
                style={{
                  borderColor: `${primaryColor}40`,
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Welcome to my portfolio</span>
              </div>

              {/* Headline with Glowing Name */}
              <div className="space-y-2">
                <h1
                  className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] ${
                    isLight ? "text-neutral-900" : "text-white"
                  }`}
                >
                  <span>Hi, I&apos;m </span>
                  <span
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${primaryColor}, #818cf8, #f472b6)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {fullName || "John Doe"}
                  </span>
                </h1>
                {headline && (
                  <p className="text-sm sm:text-base font-medium font-mono" style={{ color: primaryColor }}>
                    {headline}
                  </p>
                )}
              </div>

              {/* Bio / Description */}
              {bio && (
                <p
                  className={`text-base sm:text-lg leading-relaxed max-w-xl font-normal ${
                    isLight ? "text-neutral-600" : "text-neutral-300/90"
                  }`}
                >
                  {bio}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollTo("contact")}
                  style={{
                    background: primaryGradient,
                    boxShadow: `0 0 25px ${primaryColor}45`,
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get In Touch</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollTo("projects")}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-all hover:scale-[1.02] ${
                    isLight
                      ? "border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 shadow-xs"
                      : "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <span>View My Work</span>
                </button>
              </div>

              {/* Connect Row */}
              <div className="pt-4 flex items-center gap-3">
                <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>
                  CONNECT
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                      <SafeLink
                        key={`${link.platform}-${idx}`}
                        href={link.url}
                        className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all hover:scale-110 ${
                          isLight
                            ? "border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 shadow-xs"
                            : "border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
                        }`}
                        title={link.label || link.platform}
                      >
                        <BrandIcon name={link.platform} size={15} />
                      </SafeLink>
                    ))
                  ) : (
                    <>
                      <SafeLink
                        href="https://github.com"
                        className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${
                          isLight ? "border-neutral-300 bg-white text-neutral-700" : "border-white/10 bg-white/5 text-neutral-300"
                        }`}
                        title="GitHub"
                      >
                        <BrandIcon name="github" size={15} />
                      </SafeLink>
                      <SafeLink
                        href="https://linkedin.com"
                        className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${
                          isLight ? "border-neutral-300 bg-white text-neutral-700" : "border-white/10 bg-white/5 text-neutral-300"
                        }`}
                        title="LinkedIn"
                      >
                        <BrandIcon name="linkedin" size={15} />
                      </SafeLink>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: 3D Avatar Frame with Camera badge & Floating Experience Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative w-[300px] sm:w-[380px] h-[340px] sm:h-[400px] flex items-center justify-center">
                {/* Ambient aura */}
                <div
                  className="absolute inset-2 rounded-full blur-3xl opacity-20"
                  style={{ backgroundColor: primaryColor }}
                />

                {/* Circular Spotlight Container */}
                <div
                  className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 border flex items-center justify-center shadow-2xl"
                  style={{
                    background: haloGradient,
                    borderColor: `${primaryColor}55`,
                    boxShadow: `0 0 50px ${primaryColor}50`,
                  }}
                >
                  <div
                    className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center relative ${
                      isLight ? "bg-white" : "bg-[#111827]"
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName || "Portfolio Avatar"}
                        width={288}
                        height={288}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center ${
                          isLight ? "bg-neutral-100 text-neutral-800" : "bg-[#1e293b] text-white"
                        }`}
                      >
                        <span className="text-5xl font-extrabold font-mono" style={{ color: primaryColor }}>
                          {initials}
                        </span>
                        <span className="text-xs text-neutral-400 mt-2">Avatar</span>
                      </div>
                    )}
                  </div>

                  {/* Camera icon badge */}
                  <div
                    className={`absolute bottom-2 right-4 z-20 h-9 w-9 rounded-full bg-white shadow-xl flex items-center justify-center border-2 ${
                      isLight ? "border-neutral-200 text-neutral-800" : "border-[#0b0f19] text-neutral-900"
                    }`}
                  >
                    <Camera className="h-4 w-4" style={{ color: primaryColor }} />
                  </div>
                </div>

                {/* Floating Stat Card: 4+ Years Experience (Bottom Left) */}
                <div
                  className={`absolute bottom-2 left-0 sm:-left-4 z-20 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center gap-3 ${
                    isLight ? "bg-white border-neutral-200 text-neutral-900 shadow-lg" : "bg-white/95 border-white/15 text-neutral-900"
                  }`}
                >
                  <div className="text-2xl font-extrabold font-mono leading-none" style={{ color: primaryColor }}>
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
            <div
              className={`p-6 sm:p-10 rounded-2xl border backdrop-blur-xl shadow-xl ${
                isLight ? "bg-white border-neutral-200 shadow-sm text-neutral-900" : "bg-white/[0.02] border-white/10 text-neutral-100"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                  About Me
                </h2>
              </div>
              <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-6 ${isLight ? "text-neutral-900" : "text-white"}`}>
                Transforming complexity into elegant, actionable solutions
              </h3>
              <p className={`text-base leading-relaxed whitespace-pre-line ${isLight ? "text-neutral-700" : "text-neutral-300"}`}>
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
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                  Expertise
                </h2>
                <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-neutral-900" : "text-white"}`}>
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
                    { name: "React", category: "Frontend" },
                  ]
              ).map((skill: PortfolioSkill, idx: number) => (
                <div
                  key={`${skill.name}-${idx}`}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isLight
                      ? "bg-white border-neutral-200 hover:border-neutral-400 shadow-xs"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>{skill.name}</span>
                  {skill.category && (
                    <span className="text-[10px] font-mono font-medium" style={{ color: primaryColor }}>
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
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                  Featured Work
                </h2>
                <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Projects & Case Studies
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={`${proj.title}-${idx}`}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isLight
                      ? "bg-white border-neutral-200 hover:border-neutral-400 shadow-sm hover:shadow-md"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="space-y-3">
                    <h4 className={`text-lg font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>{proj.title}</h4>
                    <p className={`text-sm leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>{proj.description}</p>
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              borderColor: `${primaryColor}30`,
                              color: primaryColor,
                            }}
                            className="px-2.5 py-0.5 rounded-full text-xs font-mono border"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {(proj.liveUrl || proj.repoUrl) && (
                    <div className={`pt-6 flex items-center gap-4 border-t mt-4 ${isLight ? "border-neutral-200" : "border-white/10"}`}>
                      {proj.liveUrl && (
                        <SafeLink
                          href={proj.liveUrl}
                          style={{ color: primaryColor }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline transition-colors"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </SafeLink>
                      )}
                      {proj.repoUrl && (
                        <SafeLink
                          href={proj.repoUrl}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            isLight ? "text-neutral-600 hover:text-neutral-900" : "text-neutral-400 hover:text-white"
                          }`}
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
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                  Career Path
                </h2>
                <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Professional Experience
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={`${exp.company}-${idx}`}
                  className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isLight
                      ? "bg-white border-neutral-200 shadow-sm text-neutral-900"
                      : "bg-white/[0.02] border-white/10 text-neutral-100"
                  }`}
                >
                  <div className="space-y-1.5">
                    <h4 className={`text-base font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>{exp.title}</h4>
                    <p className="text-sm font-semibold font-mono" style={{ color: primaryColor }}>{exp.company}</p>
                    {exp.description && (
                      <p className={`text-sm leading-relaxed pt-1 ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className={`text-xs font-mono shrink-0 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
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
          <div
            className={`p-8 sm:p-12 rounded-3xl border backdrop-blur-xl text-center space-y-6 ${
              isLight ? "bg-white border-neutral-200 text-neutral-900 shadow-sm" : "border-white/10 bg-white/[0.03] text-white"
            }`}
          >
            <h3 className={`text-3xl sm:text-4xl font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              Let&apos;s build something great together
            </h3>
            <p className={`max-w-lg mx-auto text-sm sm:text-base ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>
              Available for full-time roles, freelance opportunities, and collaborative initiatives.
            </p>
            <div className="pt-2 flex justify-center">
              <SafeLink
                href={`mailto:${profile?.email || "hello@example.com"}`}
                style={{
                  background: primaryGradient,
                  boxShadow: `0 0 25px ${primaryColor}45`,
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-105"
              >
                <Mail className="h-4 w-4" />
                <span>Get In Touch</span>
              </SafeLink>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-8 relative z-10 ${
          isLight ? "bg-white border-neutral-200 text-neutral-500" : "bg-[#0b0f19] border-white/10 text-neutral-400"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono">
          <span>© {new Date().getFullYear()} {fullName || "Portfolio"}. All rights reserved.</span>
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            style={{ color: primaryColor }}
            className="inline-flex items-center gap-1.5 hover:underline transition-colors"
          >
            <span>^top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
