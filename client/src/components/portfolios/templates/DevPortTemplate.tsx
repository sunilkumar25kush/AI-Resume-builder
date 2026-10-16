import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Award,
  Briefcase,
  Check,
  Code2,
  ExternalLink,
  FileCode,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink } from "@/types/portfolio";

export interface DevPortTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

/** Pre-curated badge color themes inspired by the DevPort design reference */
const TECH_PILL_COLORS = [
  "border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20",
  "border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20",
  "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
  "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
  "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
  "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20",
  "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
];

export function DevPortTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder: _sectionOrder = ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: DevPortTemplateProps) {
  const { profile, socialLinks = [], skills = [], experience = [], education = [], projects = [], certifications = [] } =
    portfolio;

  const primaryColor = portfolio?.design?.primaryColor || "#06b6d4";
  const theme = portfolio?.design?.theme || "system";
  const isLight =
    theme === "light" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: light)").matches &&
      !window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  const [activeSection, setActiveSection] = useState("hero");

  const fullName = profile?.fullName || (showEmpty ? "Alex Morgan" : "");
  const headline = profile?.headline || (showEmpty ? "Full Stack Engineer & Creative Developer" : "");
  const bio = profile?.bio || (showEmpty ? "Crafting high-performance web experiences and scalable cloud applications with modern architecture." : "");
  const avatarUrl = normalizeAvatarUrl(profile?.avatarUrl, 224);
  const initials = (fullName || "DV")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Dynamic styling tokens derived from user's chosen accent color
  const accentGradient = `linear-gradient(135deg, ${primaryColor}, #a855f7, #ec4899)`;
  const primaryButtonBg = `linear-gradient(90deg, ${primaryColor}, #a855f7)`;
  const primaryGlowShadow = `0 0 25px ${primaryColor}55`;
  const primaryTextShadow = `0 0 24px ${primaryColor}66`;

  // Roles for animated glowing typewriter effect
  const roles = useMemo(() => {
    if (!headline) return ["Creative Developer", "Tech Enthusiast", "Full Stack Engineer"];
    const parts = headline.split(/[,|•&/]/).map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [headline];
  }, [headline]);

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Smooth typewriter loop
  useEffect(() => {
    const currentFullRole = roles[currentRoleIndex % roles.length];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentFullRole.slice(0, displayText.length + 1));
        if (displayText.length + 1 >= currentFullRole.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayText(currentFullRole.slice(0, displayText.length - 1));
        if (displayText.length <= 0) {
          setIsDeleting(false);
          setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentRoleIndex, roles]);

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

  // Active section observer on scroll
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

  // Derived statistics for floating glass cards
  const projectCount = projects.length > 0 ? `${projects.length}+` : "20+";
  const experienceYears = useMemo(() => {
    if (experience.length === 0) return "4+";
    const yrs = Math.max(1, experience.length * 1.5);
    return `${Math.round(yrs)}+`;
  }, [experience]);

  // Top skills for hero pill badges and code snippet
  const topSkills = skills.slice(0, 6);
  const codeSnippetSkills = (skills.length > 0 ? skills.slice(0, 3).map((s) => `"${s.name}"`) : ['"React"', '"Node"', '"TypeScript"']).join(", ");

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 selection:bg-cyan-500/30 selection:text-white antialiased overflow-x-hidden scroll-smooth ${
        isLight ? "bg-[#f8fafc] text-neutral-900" : "bg-[#090a16] text-neutral-100"
      }`}
    >
      {/* Ambient Cosmic Glow Backdrops */}
      <div className={`pointer-events-none fixed inset-0 overflow-hidden z-0 transition-opacity duration-300 ${isLight ? "opacity-20" : "opacity-100"}`}>
        <div
          className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-[130px]"
          style={{ backgroundColor: `${primaryColor}22` }}
        />
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-[60%] left-[-10%] h-[550px] w-[550px] rounded-full bg-pink-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Floating Glassmorphic Top Navigation Bar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-200 ${
          isLight
            ? "bg-white/85 border-neutral-200/80 shadow-xs text-neutral-800"
            : "bg-[#090a16]/85 border-white/10 text-neutral-100"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-3 group text-left transition-transform hover:scale-[1.02]"
          >
            <div
              className="h-10 w-10 rounded-xl p-0.5 shadow-md transition-shadow"
              style={{ background: accentGradient, boxShadow: `0 0 15px ${primaryColor}40` }}
            >
              <div
                className={`h-full w-full rounded-[10px] flex items-center justify-center font-bold text-sm tracking-wider font-mono ${
                  isLight ? "bg-white text-neutral-900" : "bg-[#090a16] text-white"
                }`}
              >
                <span
                  style={{
                    backgroundImage: accentGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {initials}
                </span>
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-sm tracking-tight transition-colors flex items-center gap-1.5 ${
                  isLight ? "text-neutral-900 group-hover:text-blue-600" : "text-white group-hover:text-cyan-400"
                }`}
              >
                <span>{fullName || "DevPort"}</span>
              </div>
              <p className={`text-[11px] font-mono truncate max-w-[160px] sm:max-w-[200px] ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                {headline || "Developer & Designer"}
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav
            className={`hidden md:flex items-center gap-1.5 p-1 rounded-full border backdrop-blur-md text-xs font-medium ${
              isLight
                ? "bg-neutral-100/80 border-neutral-200 text-neutral-600"
                : "bg-white/5 border-white/10 text-neutral-300"
            }`}
          >
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
                  style={
                    activeSection === item.id
                      ? {
                          background: primaryButtonBg,
                          color: "#ffffff",
                          boxShadow: `0 0 15px ${primaryColor}40`,
                        }
                      : {}
                  }
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                    activeSection === item.id
                      ? "font-semibold text-white shadow-xs"
                      : isLight
                        ? "hover:text-neutral-900 hover:bg-neutral-200/60"
                        : "hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </nav>

          {/* Hire Me CTA Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollTo("contact")}
              style={{
                background: primaryButtonBg,
                boxShadow: `0 0 20px ${primaryColor}45`,
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Hire Me</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-24 py-8 sm:py-16">
        {/* ============================================================== */}
        {/* 1. HERO SECTION                                                */}
        {/* ============================================================== */}
        <section id="hero" className="pt-8 sm:pt-14 pb-12 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Bio & Tech Pills */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Status Pill Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md shadow-xs ${
                  isLight
                    ? "border-neutral-300 bg-white text-neutral-700"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: primaryColor }}
                  />
                </span>
                <span>Available for opportunities & freelance work</span>
              </div>

              {/* Hey there greeting & Big Name */}
              <div className="space-y-2">
                <p className={`text-sm sm:text-base font-mono uppercase tracking-widest ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                  Hey there! I&apos;m
                </p>
                <h1
                  className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] ${
                    isLight ? "text-neutral-900" : "text-white"
                  }`}
                >
                  {fullName || "Andrew Ryan"}
                </h1>
              </div>

              {/* Glowing Typewriter Role */}
              <div
                className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center flex-wrap gap-2 ${
                  isLight ? "text-neutral-800" : "text-white"
                }`}
              >
                <span>I&apos;m a</span>
                <span
                  style={{
                    color: primaryColor,
                    textShadow: primaryTextShadow,
                  }}
                  className="font-extrabold transition-colors duration-200"
                >
                  {displayText}
                </span>
                <span
                  className="inline-block w-0.5 h-6 sm:h-8 animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Bio Summary */}
              {bio && (
                <p
                  className={`text-sm sm:text-base leading-relaxed max-w-xl font-light ${
                    isLight ? "text-neutral-600" : "text-neutral-300/90"
                  }`}
                >
                  {bio}
                </p>
              )}

              {/* Colorful Technology Pills */}
              {topSkills.length > 0 && (
                <div className="pt-2">
                  <p className={`text-xs font-mono mb-2.5 uppercase tracking-wider ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                    Core Technologies
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {topSkills.map((skill: PortfolioSkill, idx: number) => {
                      const colorClass = TECH_PILL_COLORS[idx % TECH_PILL_COLORS.length];
                      return (
                        <span
                          key={skill.name}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all ${colorClass}`}
                        >
                          {skill.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Primary Call To Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollTo("projects")}
                  style={{
                    background: primaryButtonBg,
                    boxShadow: primaryGlowShadow,
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>View My Work</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollTo("contact")}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border backdrop-blur-md transition-all hover:scale-[1.02] ${
                    isLight
                      ? "border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 shadow-xs"
                      : "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>Let&apos;s Talk</span>
                </button>

                {profile?.location && (
                  <div className={`hidden sm:inline-flex items-center gap-1.5 text-xs pl-2 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                    <MapPin className="h-3.5 w-3.5 text-pink-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Social Connections Row */}
              {socialLinks.length > 0 && (
                <div className="pt-3 flex items-center gap-3">
                  <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>
                    Connect:
                  </span>
                  <div className="flex items-center gap-2">
                    {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
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
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Orbital Avatar Frame + Floating Code Terminal + Floating Stats */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative w-[300px] sm:w-[360px] h-[340px] sm:h-[400px] flex items-center justify-center">
                {/* Background Rotating Aura Glow */}
                <div
                  className="absolute inset-4 rounded-full opacity-25 blur-2xl animate-pulse"
                  style={{ background: accentGradient }}
                />

                {/* Central Circular Avatar Frame */}
                <div
                  className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 transition-shadow"
                  style={{
                    background: accentGradient,
                    boxShadow: `0 0 40px ${primaryColor}66`,
                  }}
                >
                  <div
                    className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center ${
                      isLight ? "bg-white border-neutral-100" : "bg-neutral-900 border-[#090a16]"
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName || "Portfolio Avatar"}
                        width={224}
                        height={224}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center font-mono font-bold text-4xl ${
                          isLight ? "bg-neutral-100 text-neutral-700" : "bg-neutral-800 text-white"
                        }`}
                      >
                        <span style={{ color: primaryColor }}>{initials}</span>
                        <span className="text-[10px] text-neutral-400 font-sans mt-1">Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Orbital Floating Badges */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full text-white flex items-center justify-center shadow-lg border-2 animate-bounce"
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: isLight ? "#ffffff" : "#090a16",
                    }}
                  >
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div
                    className="absolute top-1/3 -right-2 h-7 w-7 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: isLight ? "#ffffff" : "#090a16" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: isLight ? "#ffffff" : "#090a16" }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div
                    className="absolute top-1/3 -left-2 h-7 w-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: isLight ? "#ffffff" : "#090a16" }}
                  >
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Floating Glassmorphic Code Card (Top Right) */}
                <div
                  className={`absolute -top-4 -right-2 sm:-right-6 z-20 w-48 sm:w-56 p-3 rounded-xl border backdrop-blur-xl shadow-2xl text-[10px] font-mono leading-relaxed hidden xs:block ${
                    isLight
                      ? "bg-neutral-900/95 border-neutral-700 text-neutral-200"
                      : "bg-neutral-900/90 border-white/15 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-neutral-400 ml-1">developer.js</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-pink-400">const <span className="text-white">developer</span> = &#123;</p>
                    <p className="pl-2">
                      name: <span style={{ color: primaryColor }}>&quot;{fullName ? fullName.split(" ")[0] : "Dev"}&quot;</span>,
                    </p>
                    <p className="pl-2 truncate">skills: <span className="text-amber-300">[{codeSnippetSkills}]</span>,</p>
                    <p className="pl-2">hardWorker: <span className="text-emerald-400">true</span></p>
                    <p className="text-pink-400">&#125;;</p>
                  </div>
                </div>

                {/* Floating Stat Card 1: Projects Count (Bottom Left) */}
                <div
                  className={`absolute -bottom-4 -left-2 sm:-left-4 z-20 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2.5 ${
                    isLight
                      ? "bg-white border-neutral-200 shadow-md text-neutral-900"
                      : "bg-neutral-900/85 border-white/15 text-white"
                  }`}
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold font-mono leading-none">
                      {projectCount}
                    </div>
                    <div className={`text-[10px] ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                      Projects Done
                    </div>
                  </div>
                </div>

                {/* Floating Stat Card 2: Experience Years (Bottom Right) */}
                <div
                  className={`absolute -bottom-4 -right-2 sm:-right-4 z-20 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2.5 ${
                    isLight
                      ? "bg-white border-neutral-200 shadow-md text-neutral-900"
                      : "bg-neutral-900/85 border-white/15 text-white"
                  }`}
                >
                  <div className="h-9 w-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold font-mono leading-none">
                      {experienceYears}
                    </div>
                    <div className={`text-[10px] ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                      Experience
                    </div>
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
              className={`p-6 sm:p-10 rounded-2xl border backdrop-blur-xl shadow-xl relative overflow-hidden ${
                isLight ? "bg-white border-neutral-200/90 text-neutral-900" : "bg-white/[0.03] border-white/10 text-neutral-100"
              }`}
            >
              <div
                className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: `${primaryColor}15` }}
              />

              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                  // 01. About Me
                </h2>
              </div>

              <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-6 ${isLight ? "text-neutral-900" : "text-white"}`}>
                Passionate about turning vision into high-impact software
              </h3>

              <div className={`max-w-none text-base leading-relaxed space-y-4 font-light ${isLight ? "text-neutral-700" : "text-neutral-300/90"}`}>
                <p className="whitespace-pre-line">{bio}</p>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 3. SKILLS SECTION                                              */}
        {/* ============================================================== */}
        {!isHidden("skills") && (skills.length > 0 || showEmpty) && (
          <section id="skills" className="scroll-mt-20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <Code2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                    // 02. Skills & Tech Stack
                  </h2>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Tools, Frameworks & Core Competencies
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {skills.map((skill, idx) => (
                <div
                  key={`${skill.name}-${idx}`}
                  className={`p-3.5 rounded-xl border backdrop-blur-md transition-all duration-200 group ${
                    isLight
                      ? "bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-xs"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`font-semibold text-sm truncate transition-colors ${
                        isLight ? "text-neutral-800" : "text-white group-hover:text-cyan-300"
                      }`}
                    >
                      {skill.name}
                    </span>
                    <span className={`text-[10px] font-mono uppercase ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                      {skill.category || "Skill"}
                    </span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? "bg-neutral-200" : "bg-white/10"}`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        background: primaryButtonBg,
                        width:
                          skill.level === "expert"
                            ? "95%"
                            : skill.level === "advanced"
                              ? "85%"
                              : skill.level === "intermediate"
                                ? "70%"
                                : "55%",
                      }}
                    />
                  </div>
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <FileCode className="h-4 w-4" />
                  </div>
                  <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                    // 03. Featured Engineering Projects
                  </h2>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Selected Work & Interactive Case Studies
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={`${proj.title}-${idx}`}
                  className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${
                    isLight
                      ? "bg-white border-neutral-200 hover:border-neutral-400 shadow-sm hover:shadow-md"
                      : "bg-white/[0.03] border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: primaryColor }}>
                          // {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h4 className={`text-xl font-bold transition-colors ${isLight ? "text-neutral-900" : "text-white"}`}>
                          {proj.title}
                        </h4>
                      </div>
                      {proj.featured && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className={`text-sm leading-relaxed font-light ${isLight ? "text-neutral-600" : "text-neutral-300/90"}`}>
                      {proj.description}
                    </p>

                    {/* Tags */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono border ${
                              isLight
                                ? "bg-neutral-100 border-neutral-200 text-neutral-700"
                                : "bg-white/5 border-white/10 text-neutral-300"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className={`pt-6 mt-4 border-t flex items-center justify-between ${isLight ? "border-neutral-200" : "border-white/10"}`}>
                    <div className="flex items-center gap-3">
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
                  </div>
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
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Briefcase className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                // 04. Career Experience
              </h2>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-neutral-900" : "text-white"}`}>
              Professional Timeline & Contributions
            </h3>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={`${exp.title}-${exp.company}-${idx}`}
                  className={`p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all ${
                    isLight
                      ? "bg-white border-neutral-200 shadow-sm text-neutral-900"
                      : "bg-white/[0.03] border-white/10 text-neutral-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className={`text-lg font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
                        {exp.title}
                      </h4>
                      <p className="text-sm font-mono" style={{ color: primaryColor }}>
                        {exp.company} {exp.location ? `• ${exp.location}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded-md border self-start sm:self-auto ${
                        isLight ? "bg-neutral-100 border-neutral-200 text-neutral-600" : "bg-white/5 border-white/10 text-neutral-400"
                      }`}
                    >
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>

                  {exp.description && (
                    <p className={`text-sm leading-relaxed font-light mb-3 ${isLight ? "text-neutral-700" : "text-neutral-300/90"}`}>
                      {exp.description}
                    </p>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className={`space-y-1.5 text-xs pl-4 list-disc font-light ${isLight ? "text-neutral-600 marker:text-blue-600" : "text-neutral-400 marker:text-cyan-400"}`}>
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 6. EDUCATION & CERTIFICATIONS                                  */}
        {/* ============================================================== */}
        {(!isHidden("education") || !isHidden("certifications")) &&
          (education.length > 0 || certifications.length > 0 || showEmpty) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Education */}
              {!isHidden("education") && (education.length > 0 || showEmpty) && (
                <section id="education" className="scroll-mt-20 space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" style={{ color: primaryColor }} />
                    <h3 className={`text-xl font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>Education</h3>
                  </div>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div
                        key={`${edu.institution}-${idx}`}
                        className={`p-4 rounded-xl border backdrop-blur-md ${
                          isLight ? "bg-white border-neutral-200 text-neutral-900 shadow-xs" : "bg-white/[0.03] border-white/10 text-neutral-100"
                        }`}
                      >
                        <h4 className={`font-semibold text-sm ${isLight ? "text-neutral-900" : "text-white"}`}>
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                        </h4>
                        <p className="text-xs font-mono mt-0.5" style={{ color: primaryColor }}>{edu.institution}</p>
                        <p className={`text-[11px] mt-1 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                          {edu.startDate} — {edu.endDate || "Present"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {!isHidden("certifications") && (certifications.length > 0 || showEmpty) && (
                <section id="certifications" className="scroll-mt-20 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-pink-500" />
                    <h3 className={`text-xl font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>Certifications</h3>
                  </div>
                  <div className="space-y-3">
                    {certifications.map((cert, idx) => (
                      <div
                        key={`${cert.name}-${idx}`}
                        className={`p-4 rounded-xl border backdrop-blur-md ${
                          isLight ? "bg-white border-neutral-200 text-neutral-900 shadow-xs" : "bg-white/[0.03] border-white/10 text-neutral-100"
                        }`}
                      >
                        <h4 className={`font-semibold text-sm ${isLight ? "text-neutral-900" : "text-white"}`}>{cert.name}</h4>
                        <p className="text-xs text-pink-500 font-mono mt-0.5">{cert.issuer}</p>
                        {cert.issueDate && (
                          <p className={`text-[11px] mt-1 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>Issued {cert.issueDate}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

        {/* ============================================================== */}
        {/* 7. CONTACT SECTION                                             */}
        {/* ============================================================== */}
        <section id="contact" className="scroll-mt-20">
          <div
            className={`p-8 sm:p-12 rounded-3xl border backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center space-y-6 ${
              isLight
                ? "bg-white border-neutral-200 text-neutral-900"
                : "border-white/15 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent text-white"
            }`}
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Get In Touch</span>
            </div>

            <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto ${isLight ? "text-neutral-900" : "text-white"}`}>
              Let&apos;s build something extraordinary together
            </h2>

            <p className={`text-sm sm:text-base max-w-xl mx-auto font-light ${isLight ? "text-neutral-600" : "text-neutral-300/80"}`}>
              Interested in collaborating, hiring for full-time or freelance roles, or just want to say hi? Reach out anytime!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {profile?.email && (
                <SafeLink
                  href={`mailto:${profile.email}`}
                  style={{
                    background: primaryButtonBg,
                    boxShadow: primaryGlowShadow,
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-105 active:scale-95"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send an Email</span>
                </SafeLink>
              )}

              {profile?.phone && (
                <SafeLink
                  href={`tel:${profile.phone}`}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border backdrop-blur-md transition-all ${
                    isLight ? "border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-800" : "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span>{profile.phone}</span>
                </SafeLink>
              )}
            </div>

            {/* Social Icons inside Contact */}
            {socialLinks.length > 0 && (
              <div className={`pt-6 border-t flex items-center justify-center gap-3 ${isLight ? "border-neutral-200" : "border-white/10"}`}>
                {socialLinks.map((link, idx) => (
                  <SafeLink
                    key={`${link.platform}-${idx}`}
                    href={link.url}
                    className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all hover:scale-110 ${
                      isLight
                        ? "border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        : "border-white/10 bg-white/5 hover:bg-white/20 text-neutral-300 hover:text-white"
                    }`}
                    title={link.label || link.platform}
                  >
                    <BrandIcon name={link.platform} size={18} />
                  </SafeLink>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Bottom-Right Chat Bubble Button */}
      <button
        type="button"
        onClick={() => scrollTo("contact")}
        style={{
          background: primaryButtonBg,
          boxShadow: primaryGlowShadow,
        }}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Contact Me"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* Cosmic Footer */}
      <footer
        className={`border-t py-10 relative z-10 backdrop-blur-md ${
          isLight ? "bg-white/90 border-neutral-200 text-neutral-600" : "bg-[#090a16]/90 border-white/10 text-neutral-400"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
            <span>Built with modern web standards & DevPort</span>
          </div>

          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} {fullName || "Developer"}. All rights reserved.</span>
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
        </div>
      </footer>
    </div>
  );
}
