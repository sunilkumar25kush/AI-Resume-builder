import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  MapPin,
  Mail,
  Award,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { Portfolio, PortfolioSkill, PortfolioSocialLink, PortfolioExperience, PortfolioEducation, PortfolioProject, PortfolioCertification } from "@/types/portfolio";

export interface PosterTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

// Language / Technology Accent Color Palette
const TECH_COLORS: Record<string, string> = {
  javascript: "#f1e05a",
  typescript: "#3178c6",
  react: "#61dafb",
  "node.js": "#339933",
  node: "#339933",
  python: "#3572A5",
  go: "#00ADD8",
  rust: "#dea584",
  html: "#e34c26",
  css: "#663399",
  tailwind: "#38bdf8",
  tailwindcss: "#38bdf8",
  docker: "#2496ed",
  graphql: "#e535ab",
  postgresql: "#4169e1",
  mongodb: "#47a248",
  vue: "#41b883",
  svelte: "#ff3e00",
  java: "#b07219",
  ruby: "#701516",
  "c++": "#f34b7d",
  swift: "#F05138",
};

export function PosterTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "projects", "about", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: PosterTemplateProps) {
  const profile = portfolio.profile;
  const design = portfolio.design;
  const socialLinks = portfolio.socialLinks || [];
  const skills = useMemo(() => portfolio.skills || [], [portfolio.skills]);
  const experience = portfolio.experience || [];
  const education = portfolio.education || [];
  const projects = portfolio.projects || [];
  const certifications = portfolio.certifications || [];

  const accentColor = design?.primaryColor || "#e11d2a";
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Typewriter Skills State
  const skillNames = useMemo(() => {
    const list = skills.map((s: PortfolioSkill) => (typeof s === "string" ? s : s.name)).filter(Boolean);
    return list.length ? list.slice(0, 5) : ["Frontend Architecture", "React & TypeScript", "Cloud Infrastructure", "Full Stack Systems"];
  }, [skills]);

  const [typedSkills, setTypedSkills] = useState<{ text: string; done: boolean }[]>([]);
  const [activeSkillIdx, setActiveSkillIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const isHidden = (sec: string) => hiddenSections.includes(sec);

  // Typewriter effect matching GitSkins poster
  useEffect(() => {
    if (activeSkillIdx >= skillNames.length) return;

    const currentTarget = skillNames[activeSkillIdx];
    if (currentCharIdx < currentTarget.length) {
      const timer = setTimeout(() => {
        setCurrentCharIdx((prev) => prev + 1);
      }, 42);
      return () => clearTimeout(timer);
    } else {
      // Completed current skill
      const pauseTimer = setTimeout(() => {
        setTypedSkills((prev) => [
          ...prev,
          { text: currentTarget, done: true },
        ]);
        setActiveSkillIdx((prev) => prev + 1);
        setCurrentCharIdx(0);
      }, 250);
      return () => clearTimeout(pauseTimer);
    }
  }, [activeSkillIdx, currentCharIdx, skillNames]);

  const fullName = profile?.fullName || (showEmpty ? "CREATIVE ENGINEER" : "FULL STACK DEVELOPER");
  const firstName = fullName.split(/\s+/).filter((w: string) => !/^the$/i.test(w))[0] || fullName;
  const headline = profile?.headline || (showEmpty ? "Software Craftsman" : "Full Stack Systems & Web Engineer");
  const avatarUrl = profile?.avatarUrl ? normalizeAvatarUrl(profile.avatarUrl) : null;
  const contactEmail = profile?.email || "";

  // Project cards tilt angles from GitSkins poster
  const cardTilts = [-1.2, 1, -0.6, 1.4];

  // Section builders
  const sectionMap: Record<string, ReactNode> = {
    // -------------------------------------------------------------------------
    // HERO: Giant Outline Word + Framed Print Portrait + Typewriter Skills
    // -------------------------------------------------------------------------
    hero: (
      <header key="hero" id="hero" className="poster-hero relative min-h-[92vh] sm:min-h-screen overflow-hidden flex flex-col justify-between py-12 px-6 sm:px-12 md:px-20">
        {/* Giant Viewport-wide Outline Word */}
        <div className="poster-word-container absolute left-1/2 top-[4vh] sm:top-[6vh] -translate-x-1/2 z-0 pointer-events-none select-none">
          <p className="poster-word text-[18vw] leading-none uppercase tracking-tight">
            PORTFOLIO
          </p>
        </div>

        {/* Framed Print Portrait / Cutout Leaning into Word */}
        <div className="absolute left-1/2 top-[16vh] sm:top-[12vh] -translate-x-1/2 z-10 pointer-events-none flex items-center justify-center">
          <div className="poster-portrait-framed relative rotate-[-3deg] w-[240px] sm:w-[320px] md:w-[380px] transition-transform duration-500 hover:rotate-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full aspect-[4/5] object-cover bg-white p-2.5 sm:p-3 border-[10px] sm:border-[12px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] filter contrast-105"
              />
            ) : (
              <div className="w-full aspect-[4/5] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] text-white p-6 border-[10px] sm:border-[12px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] flex flex-col justify-between">
                <span className="font-['Anton'] text-2xl tracking-widest text-[#e11d2a]">✦ PRINT</span>
                <div className="text-center">
                  <span className="font-['Anton'] text-7xl sm:text-8xl tracking-tight text-white/90">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="font-mono text-xs uppercase tracking-widest opacity-60 text-right">01 // DEV</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Bar / Location */}
        <div className="relative z-20 flex items-center justify-between font-mono text-xs font-bold tracking-widest uppercase">
          <span className="inline-flex items-center gap-1.5 bg-[#151515] text-[#efece6] px-3 py-1 rounded-sm">
            <span>ORIGINAL GISTSKINS POSTER</span>
          </span>
          {profile?.location && (
            <span className="inline-flex items-center gap-1 text-[#4b4b4b]">
              <MapPin className="h-3.5 w-3.5 text-[#e11d2a]" />
              <span>{profile.location}</span>
            </span>
          )}
        </div>

        {/* Bottom Hero Split: Intro Left, Role & Typewriter Right */}
        <div className="relative z-20 mt-auto pt-[45vh] sm:pt-[40vh] grid grid-cols-1 md:grid-cols-2 gap-8 items-end justify-between">
          {/* Left: Intro & First Name */}
          <div className="space-y-1">
            <p className="font-semibold text-lg sm:text-2xl text-[#151515] tracking-tight">
              Hello, I&apos;m
            </p>
            <h1 className="font-['Anton'] text-6xl sm:text-8xl md:text-9xl uppercase tracking-tight text-[#e11d2a] leading-[0.88]">
              {firstName}
            </h1>
            <p className="font-['Inter'] text-sm sm:text-base font-semibold text-[#4b4b4b] pt-1">
              {fullName}
            </p>
          </div>

          {/* Right: Role & Live Typewriter Skills */}
          <div className="md:text-right space-y-3 max-w-md md:ml-auto">
            <h2 className="font-['Inter'] font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-[#e11d2a]">
              {headline}
            </h2>
            <ul className="space-y-1.5 font-['Inter'] text-sm sm:text-base text-[#4b4b4b] inline-block text-left md:text-right">
              {typedSkills.map((sk, idx) => (
                <li key={idx} className="flex items-center gap-2 md:justify-end">
                  <span className="text-[#e11d2a] text-xs">✦</span>
                  <span className="font-medium text-[#151515]">{sk.text}</span>
                </li>
              ))}
              {activeSkillIdx < skillNames.length && (
                <li className="flex items-center gap-2 md:justify-end">
                  <span className="text-[#e11d2a] text-xs">✦</span>
                  <span className="font-medium text-[#151515]">
                    {skillNames[activeSkillIdx].slice(0, currentCharIdx)}
                  </span>
                  <span className="inline-block w-[2px] h-4 bg-[#151515] animate-[pulse_0.8s_steps(2)_infinite]" />
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>
    ),

    // -------------------------------------------------------------------------
    // STATS BAND (Infinite Red Marquee Strip)
    // -------------------------------------------------------------------------
    marquee: (
      <div key="marquee" className="poster-band relative z-20 overflow-hidden bg-[#e11d2a] text-white py-4 shadow-md select-none">
        <div className="poster-track flex items-center gap-10 whitespace-nowrap font-['Anton'] text-2xl sm:text-4xl uppercase tracking-wider animate-[posterMarquee_35s_linear_infinite]">
          <span><b>REPOS</b> {projects.length || "12+"}</span>
          <span className="opacity-80">✦</span>
          <span><b>SKILLS</b> {skills.length || "16"}</span>
          <span className="opacity-80">✦</span>
          <span><b>EXPERIENCE</b> {experience.length || "5+"} ROLES</span>
          <span className="opacity-80">✦</span>
          {skills.slice(0, 6).map((s: PortfolioSkill, i: number) => (
            <span key={i} className="flex items-center gap-10">
              <span>{typeof s === "string" ? s : s.name}</span>
              <span className="opacity-80">✦</span>
            </span>
          ))}
          {/* Duplicate loop for infinite seamless scroll */}
          <span><b>REPOS</b> {projects.length || "12+"}</span>
          <span className="opacity-80">✦</span>
          <span><b>SKILLS</b> {skills.length || "16"}</span>
          <span className="opacity-80">✦</span>
          <span><b>EXPERIENCE</b> {experience.length || "5+"} ROLES</span>
          <span className="opacity-80">✦</span>
          {skills.slice(0, 6).map((s: PortfolioSkill, i: number) => (
            <span key={`dup-${i}`} className="flex items-center gap-10">
              <span>{typeof s === "string" ? s : s.name}</span>
              <span className="opacity-80">✦</span>
            </span>
          ))}
        </div>
      </div>
    ),

    // -------------------------------------------------------------------------
    // PROJECTS: Staggered Tall Cards (9:14 Ratio) with Monogram Watermarks
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="projects" className="relative py-24 sm:py-32 px-6 sm:px-12 md:px-20 overflow-hidden">
        {/* Ghost Background Word */}
        <div className="absolute left-1/2 top-10 -translate-x-1/2 z-0 pointer-events-none opacity-10 select-none">
          <p className="poster-word text-[18vw] leading-none uppercase tracking-tight">
            WORK
          </p>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Head */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-6 border-b-2 border-[#151515]/10">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#e11d2a] uppercase">SELECTED ARCHIVE</span>
              <h3 className="font-['Anton'] text-5xl sm:text-7xl md:text-8xl uppercase tracking-tight text-[#151515] leading-[0.9] mt-2">
                Selected <em className="text-[#e11d2a] not-italic">work</em>
              </h3>
            </div>
            <p className="text-[#4b4b4b] max-w-md text-sm sm:text-base leading-relaxed">
              Curated software engineering projects, system designs, and production applications built in public.
            </p>
          </div>

          {/* Staggered 4-Column Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
            {projects.map((proj: PortfolioProject, idx: number) => {
              const primaryTech = proj.tags?.[0]?.toLowerCase() || "javascript";
              const techColor = TECH_COLORS[primaryTech] || "#e11d2a";
              const tilt = cardTilts[idx % cardTilts.length];
              const isEvenColumn = (idx % 4 === 1) || (idx % 4 === 3);
              const targetUrl = proj.liveUrl || proj.repoUrl || "#";

              return (
                <SafeLink
                  key={idx}
                  href={targetUrl}
                  className={`poster-card group relative flex flex-col justify-between aspect-[9/14] p-6 rounded-[18px] overflow-hidden text-white bg-[#151515] shadow-[0_30px_50px_-30px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-3 hover:rotate-0 hover:shadow-[0_40px_70px_-25px_rgba(0,0,0,0.7)] ${
                    isEvenColumn ? "lg:mt-16" : ""
                  }`}
                  style={{
                    transform: `rotate(${tilt}deg)`,
                  }}
                >
                  {/* Glowing Corner Radial Gradient */}
                  <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-80 transition-opacity group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(120% 70% at 20% 0%, ${techColor} 0%, transparent 60%), linear-gradient(160deg, #1f1f1f, #0d0d0d)`,
                    }}
                  />

                  {/* Monogram Watermark Background Initials */}
                  <span className="absolute -right-3 -bottom-6 font-['Anton'] text-[180px] leading-none text-white/[0.05] uppercase select-none pointer-events-none group-hover:text-white/[0.09] transition-colors">
                    {(proj.title || "PR").slice(0, 2)}
                  </span>

                  {/* Card Content Top: Number & Tech Indicator */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-['Anton'] text-xl text-white/50 group-hover:text-white/80 transition-colors">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: techColor }} />
                      <span className="capitalize">{primaryTech}</span>
                    </div>
                  </div>

                  {/* Card Content Bottom: Title, Description, Meta */}
                  <div className="relative z-10 space-y-3 pt-6">
                    <h4 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight group-hover:text-[#e11d2a] transition-colors">
                      {proj.title}
                    </h4>
                    <p className="text-white/70 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {proj.description || "Production system design and full-stack software application."}
                    </p>

                    {/* Tag Pills */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between font-mono text-xs font-bold text-white/60 group-hover:text-white transition-colors">
                      <span>VIEW PROJECT</span>
                      <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </SafeLink>
              );
            })}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // ABOUT: Editorial Two-Column with Pill Chips and Personal Facts
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="about" className="relative py-20 sm:py-28 px-6 sm:px-12 md:px-20 border-t-2 border-[#151515]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-xs font-bold tracking-widest text-[#e11d2a] uppercase">BIOGRAPHY // 02</span>
            <h3 className="font-['Anton'] text-5xl sm:text-7xl uppercase tracking-tight text-[#151515] leading-[0.9]">
              About <em className="text-[#e11d2a] not-italic">me</em>
            </h3>
            {profile?.location && (
              <p className="font-mono text-xs uppercase tracking-wider text-[#4b4b4b] pt-2">
                BASED IN {profile.location.toUpperCase()}
              </p>
            )}
          </div>

          {/* Right Column: Bio, Skills Chips, Facts */}
          <div className="lg:col-span-7 space-y-8">
            <p className="font-['Inter'] text-xl sm:text-2xl lg:text-3xl font-medium text-[#151515] leading-snug">
              {profile?.bio ||
                "Full-stack software craftsman dedicated to high-density execution, scalable backend architecture, and fluid interactive frontend interfaces."}
            </p>

            {/* Pill Skill Chips */}
            <div className="space-y-3 pt-2">
              <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#4b4b4b]">
                CORE CAPABILITIES & TOOLS:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill: PortfolioSkill, sIdx: number) => {
                  const name = typeof skill === "string" ? skill : skill.name;
                  return (
                    <span
                      key={sIdx}
                      className="px-4 py-2 border-[1.5px] border-[#151515] rounded-full font-['Inter'] font-semibold text-sm text-[#151515] hover:bg-[#151515] hover:text-[#efece6] transition-colors cursor-default"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Facts Grid */}
            <div className="pt-4 flex flex-wrap gap-6 font-['Inter'] text-sm sm:text-base text-[#4b4b4b] border-t border-[#151515]/10 pt-6">
              {profile?.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#e11d2a]" />
                  <span>{profile.location}</span>
                </span>
              )}
              {profile?.email && (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#e11d2a]" />
                  <span>{profile.email}</span>
                </span>
              )}
              {socialLinks.map((sl: PortfolioSocialLink, idx: number) => (
                <SafeLink
                  key={idx}
                  href={sl.url}
                  className="flex items-center gap-1.5 font-semibold text-[#151515] hover:text-[#e11d2a] underline underline-offset-4"
                >
                  <BrandIcon name={sl.platform} size={15} />
                  <span>{sl.label || sl.platform}</span>
                </SafeLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE: Poster Editorial Timeline
    // -------------------------------------------------------------------------
    experience: experience.length > 0 ? (
      <section key="experience" id="experience" className="relative py-20 sm:py-28 px-6 sm:px-12 md:px-20 border-t-2 border-[#151515]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#e11d2a] uppercase">TRACK RECORD // 03</span>
              <h3 className="font-['Anton'] text-5xl sm:text-7xl uppercase tracking-tight text-[#151515] leading-[0.9] mt-2">
                Work <em className="text-[#e11d2a] not-italic">experience</em>
              </h3>
            </div>
            <span className="font-mono text-xs font-bold uppercase text-[#4b4b4b]">
              {experience.length} POSITIONS HELD
            </span>
          </div>

          <div className="divide-y-2 divide-[#151515]/10">
            {experience.map((exp: PortfolioExperience, eIdx: number) => (
              <div key={eIdx} className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline group hover:bg-[#151515]/[0.02] transition-colors rounded-lg px-2">
                <div className="md:col-span-4 space-y-1">
                  <span className="font-mono text-xs font-bold text-[#e11d2a] uppercase">
                    {exp.startDate || "2020"} — {exp.endDate || (exp.current ? "PRESENT" : "PRESENT")}
                  </span>
                  <h4 className="font-['Anton'] text-3xl sm:text-4xl uppercase text-[#151515] group-hover:text-[#e11d2a] transition-colors">
                    {exp.company}
                  </h4>
                  {exp.location && (
                    <p className="font-mono text-xs text-[#4b4b4b] uppercase">{exp.location}</p>
                  )}
                </div>

                <div className="md:col-span-8 space-y-3">
                  <h5 className="font-['Inter'] font-extrabold text-xl sm:text-2xl text-[#151515] uppercase tracking-tight">
                    {exp.title}
                  </h5>
                  {exp.description && (
                    <p className="text-[#4b4b4b] text-base leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 pt-2">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#151515]">
                          <span className="text-[#e11d2a] font-bold mt-1">✦</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS: Editorial Cards
    // -------------------------------------------------------------------------
    education: (education.length > 0 || certifications.length > 0) ? (
      <section key="education" id="education" className="relative py-20 sm:py-28 px-6 sm:px-12 md:px-20 border-t-2 border-[#151515]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-8">
              <div>
                <span className="font-mono text-xs font-bold tracking-widest text-[#e11d2a] uppercase">ACADEMIA // 04</span>
                <h3 className="font-['Anton'] text-4xl sm:text-6xl uppercase tracking-tight text-[#151515] leading-[0.9] mt-2">
                  Education
                </h3>
              </div>
              <div className="space-y-6">
                {education.map((edu: PortfolioEducation, idx: number) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border-2 border-[#151515] shadow-[4px_4px_0px_#151515] space-y-2">
                    <span className="font-mono text-xs font-bold text-[#e11d2a]">
                      {edu.startDate} — {edu.endDate || "PRESENT"}
                    </span>
                    <h4 className="font-['Anton'] text-2xl uppercase text-[#151515]">
                      {edu.degree}
                    </h4>
                    <p className="font-semibold text-sm text-[#4b4b4b]">{edu.institution}</p>
                    {edu.fieldOfStudy && <p className="text-xs text-[#4b4b4b]">{edu.fieldOfStudy}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="space-y-8">
              <div>
                <span className="font-mono text-xs font-bold tracking-widest text-[#e11d2a] uppercase">CREDENTIALS // 05</span>
                <h3 className="font-['Anton'] text-4xl sm:text-6xl uppercase tracking-tight text-[#151515] leading-[0.9] mt-2">
                  Certifications
                </h3>
              </div>
              <div className="space-y-6">
                {certifications.map((cert: PortfolioCertification, idx: number) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border-2 border-[#151515] shadow-[4px_4px_0px_#151515] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-['Anton'] text-2xl uppercase text-[#151515]">
                        {cert.name}
                      </h4>
                      {cert.issuer && <p className="font-semibold text-sm text-[#4b4b4b]">{cert.issuer}</p>}
                      {cert.issueDate && <p className="font-mono text-xs text-[#e11d2a]">{cert.issueDate}</p>}
                    </div>
                    <Award className="h-8 w-8 text-[#e11d2a] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    ) : null,

    // -------------------------------------------------------------------------
    // CTA & CONTACT: "Ready to Build Something?"
    // -------------------------------------------------------------------------
    contact: (
      <section key="contact" id="contact" className="poster-cta relative min-h-[85vh] overflow-hidden flex flex-col justify-between py-16 px-6 sm:px-12 md:px-20 border-t-2 border-[#151515]/10">
        {/* Giant Background Word */}
        <div className="poster-word-container absolute left-1/2 top-[5vh] -translate-x-1/2 z-0 pointer-events-none select-none">
          <p className="poster-word text-[17vw] leading-none uppercase tracking-tight">
            READY TO
          </p>
        </div>

        {/* Leaning Framed Portrait */}
        <div className="absolute left-1/2 top-[12vh] -translate-x-1/2 z-10 pointer-events-none flex items-center justify-center">
          <div className="poster-portrait-framed relative rotate-[3deg] w-[200px] sm:w-[280px] md:w-[320px]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full aspect-[4/5] object-cover bg-white p-2.5 sm:p-3 border-[10px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] filter contrast-105"
              />
            ) : (
              <div className="w-full aspect-[4/5] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] text-white p-6 border-[10px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] flex flex-col justify-between">
                <span className="font-['Anton'] text-xl tracking-widest text-[#e11d2a]">✦ READY</span>
                <span className="font-['Anton'] text-6xl text-center text-white/90">
                  {firstName.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-mono text-xs opacity-60 text-right">CONTACT</span>
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div />

        {/* Bottom CTA Action Row */}
        <div className="relative z-20 pt-[40vh] flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h3 className="font-['Anton'] text-6xl sm:text-8xl md:text-9xl uppercase tracking-tight text-[#151515] leading-[0.88] max-w-xl">
            Build <br className="hidden sm:inline" />
            <em className="text-[#e11d2a] not-italic">something?</em>
          </h3>

          <div className="space-y-4 md:text-right">
            <SafeLink
              href={contactEmail ? `mailto:${contactEmail}` : (socialLinks[0]?.url || "#")}
              className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-[#e11d2a] text-white font-['Inter'] font-extrabold text-lg sm:text-xl shadow-[0_16px_30px_-14px_#e11d2a] hover:-translate-y-1.5 transition-transform"
            >
              <span>Get in touch</span>
              <span className="text-xl">→</span>
            </SafeLink>
            {contactEmail && (
              <p className="font-mono text-xs font-bold text-[#4b4b4b]">
                DIRECT: {contactEmail}
              </p>
            )}
          </div>
        </div>
      </section>
    ),
  };

  return (
    <div className="poster-skin bg-[#efece6] text-[#151515] min-h-screen relative font-['Inter']">
      {/* External Anton Google Font Import & Scoped Poster CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700;800&display=swap');

        .poster-skin {
          --accent: ${accentColor};
          --accent-soft: color-mix(in srgb, var(--accent) 16%, transparent);
          --paper: #efece6;
          --ink: #151515;
          --ink-2: #4b4b4b;
        }

        /* SVG Noise Grain Overlay */
        .poster-skin::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.35;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Giant Outline Word */
        .poster-word {
          font-family: 'Anton', Impact, sans-serif;
          font-weight: 400;
          color: transparent;
          -webkit-text-stroke: 2px var(--accent);
          background: linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 55%, transparent) 45%, color-mix(in srgb, var(--accent) 6%, transparent) 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        /* Infinite Marquee Animation */
        @keyframes posterMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Main Content Sections in sectionOrder */}
      <main className="relative z-10">
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;

          // Special insertion: inject marquee right after hero
          if (sectionKey === "hero") {
            return (
              <div key="hero-with-marquee">
                {sectionMap.hero}
                {sectionMap.marquee}
              </div>
            );
          }

          return sectionMap[sectionKey] || null;
        })}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 sm:px-12 md:px-20 border-t border-[#151515]/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#4b4b4b]">
        <span>© {new Date().getFullYear()} {fullName}. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <AttributionFooter
            author="GitSkins"
            templateName="Poster Brutalist"
            originalUrl="https://www.gitskins.com/portfolio-templates/poster/"
          />
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#151515] text-[#efece6] shadow-xl hover:bg-[#e11d2a] hover:text-white transition-all transform hover:-translate-y-1"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
