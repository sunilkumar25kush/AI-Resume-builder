import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  ArrowUp,
  MapPin,
  Award,
} from "lucide-react";

import { AttributionFooter } from "@/components/portfolios/common/AttributionFooter";
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

// GitSkins exact technology accent colors for the corner radial glow
const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#663399",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  React: "#61dafb",
  "Node.js": "#339933",
  Tailwind: "#38bdf8",
  TailwindCSS: "#38bdf8",
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
  const projects = useMemo(() => portfolio.projects || [], [portfolio.projects]);
  const certifications = portfolio.certifications || [];

  const accentColor = design?.primaryColor || "#e11d2a";
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Derive candidate names & handles
  const fullName = profile?.fullName || (showEmpty ? "Sunil Kumar" : "Developer");
  const firstName = fullName.split(/\s+/).filter((w: string) => !/^the$/i.test(w))[0] || fullName;
  const headline = profile?.headline || (showEmpty ? "JavaScript Developer" : "Software Developer");
  const avatarUrl = profile?.avatarUrl ? normalizeAvatarUrl(profile.avatarUrl) : null;
  const contactEmail = profile?.email || "";

  // Extract GitHub handle if present in social links
  const githubLink = socialLinks.find((l: PortfolioSocialLink) =>
    l.platform?.toLowerCase().includes("github") || l.url?.toLowerCase().includes("github.com")
  );
  const githubHandle = githubLink?.url
    ? githubLink.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/.*$/, "")
    : "sunilkumar25kush";

  // Skills for typewriter in hero
  const skillNames = useMemo(() => {
    const list = skills.map((s: PortfolioSkill) => (typeof s === "string" ? s : s.name)).filter(Boolean);
    return list.length ? list.slice(0, 4) : ["HTML", "JavaScript", "TypeScript", "CSS"];
  }, [skills]);

  // Typewriter Skills State matching GitSkins exactly
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

  // Typewriter animation: types each skill character by character with blinking caret
  useEffect(() => {
    if (activeSkillIdx >= skillNames.length) return;

    const currentTarget = skillNames[activeSkillIdx];
    if (currentCharIdx < currentTarget.length) {
      const timer = setTimeout(() => {
        setCurrentCharIdx((prev) => prev + 1);
      }, 38);
      return () => clearTimeout(timer);
    } else {
      const pauseTimer = setTimeout(() => {
        setTypedSkills((prev) => [
          ...prev,
          { text: currentTarget, done: true },
        ]);
        setActiveSkillIdx((prev) => prev + 1);
        setCurrentCharIdx(0);
      }, 220);
      return () => clearTimeout(pauseTimer);
    }
  }, [activeSkillIdx, currentCharIdx, skillNames]);

  // Fallback demo projects matching GitSkins layout if projects are empty
  const displayProjects: PortfolioProject[] = useMemo(() => {
    if (projects.length > 0) return projects;
    return [
      {
        title: "AI RESUME BUILDER",
        description: "Intelligent career document and portfolio generator with multi-template rendering.",
        tags: ["TypeScript", "React"],
        repoUrl: `https://github.com/${githubHandle}/AI-Resume-builder`,
        featured: true,
      },
      {
        title: "PRACTICE",
        description: "Algorithmic data structures, web systems design, and code sandbox experiments.",
        tags: ["JavaScript", "HTML"],
        repoUrl: `https://github.com/${githubHandle}/practice`,
        featured: false,
      },
      {
        title: "PORTFOLIO01",
        description: "Interactive personal web showcase with custom styling and animations.",
        tags: ["CSS", "HTML"],
        repoUrl: `https://github.com/${githubHandle}/portfolio01`,
        featured: false,
      },
      {
        title: "SKYWATCH",
        description: "Real-time atmospheric telemetry and meteorological visualization dashboard.",
        tags: ["TypeScript", "React"],
        repoUrl: `https://github.com/${githubHandle}/SkyWatch`,
        featured: false,
      },
    ];
  }, [projects, githubHandle]);

  // Card tilts matching GitSkins poster
  const cardTilts = [-1.2, 1, -0.6, 1.4];

  // Section builders
  const sectionMap: Record<string, ReactNode> = {
    // -------------------------------------------------------------------------
    // HERO: Exact GitSkins Poster Hero
    // -------------------------------------------------------------------------
    hero: (
      <header key="hero" id="hero" className="poster-hero relative min-h-[100svh] overflow-hidden select-none">
        {/* Giant Centered Gradient Outline Word */}
        <div className="absolute left-1/2 top-[5svh] -translate-x-1/2 z-0 pointer-events-none w-full text-center">
          <p className="poster-word text-[19vw] leading-[0.82] uppercase tracking-tight">
            PORTFOLIO
          </p>
        </div>

        {/* Framed Print Portrait in Center Leaning -3deg */}
        <div className="poster-portrait-framed absolute left-1/2 bottom-[14svh] -translate-x-1/2 z-10 pointer-events-none flex items-center justify-center">
          <div className="relative rotate-[-3deg] w-[min(28vw,360px)] min-w-[220px] transition-transform duration-500 hover:rotate-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full aspect-[4/5] object-cover bg-white border-[10px] sm:border-[12px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] filter contrast-105"
              />
            ) : (
              /* Cyberpunk / Grid manga sketch art portrait fallback matching the screenshot */
              <div className="w-full aspect-[4/5] bg-[#fff] border-[10px] sm:border-[12px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] flex flex-col items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(#151515_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                <div className="relative z-10 text-center px-4">
                  <span className="font-['Anton'] text-7xl sm:text-8xl text-[#151515] tracking-tighter">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#e11d2a] font-bold mt-2">
                    ✦ DEVELOPER PRINT
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left: Hello, I'm + FIRST NAME in giant Anton Red */}
        <div className="poster-intro absolute left-[clamp(20px,5vw,80px)] bottom-[clamp(28px,7svh,80px)] z-20">
          <p className="m-0 mb-1 font-['Inter'] font-semibold text-[clamp(16px,1.6vw,24px)] text-[#151515]">
            Hello, I&apos;m
          </p>
          <h1 className="m-0 font-['Anton'] font-normal text-[clamp(64px,10vw,170px)] leading-[0.86] text-[#e11d2a] uppercase tracking-normal">
            {firstName}
          </h1>
        </div>

        {/* Bottom Right: ROLE in Bold Red + Live Typewriter Skills */}
        <div className="poster-role absolute right-[clamp(20px,5vw,80px)] bottom-[clamp(28px,9svh,110px)] z-20 max-w-[min(34ch,32vw)] text-left">
          <h2 className="m-0 mb-3 font-['Inter'] font-extrabold text-[clamp(20px,2.2vw,34px)] tracking-[-0.01em] text-[#e11d2a] uppercase leading-[1.05]">
            {headline}
          </h2>
          <ul className="m-0 p-0 list-none grid gap-1.5 font-['Inter']">
            {typedSkills.map((sk, idx) => (
              <li key={idx} className="flex gap-2.5 items-baseline text-[clamp(14px,1.15vw,18px)] text-[#4b4b4b]">
                <span className="text-[#151515] text-[0.9em]">✦</span>
                <span className="font-medium text-[#151515]">{sk.text}</span>
              </li>
            ))}
            {activeSkillIdx < skillNames.length && (
              <li className="flex gap-2.5 items-baseline text-[clamp(14px,1.15vw,18px)] text-[#4b4b4b]">
                <span className="text-[#151515] text-[0.9em]">✦</span>
                <span className="font-medium text-[#151515]">
                  {skillNames[activeSkillIdx].slice(0, currentCharIdx)}
                </span>
                <span className="inline-block w-[1.5px] h-[1em] ml-0.5 bg-[#151515] animate-[blink_1s_steps(2)_infinite]" />
              </li>
            )}
          </ul>
        </div>
      </header>
    ),

    // -------------------------------------------------------------------------
    // MARQUEE BAND: Exact Red Ticker with Contributions, Languages, Repos
    // -------------------------------------------------------------------------
    marquee: (
      <div key="marquee" className="poster-band relative z-20 overflow-hidden bg-[#e11d2a] text-white py-[18px] select-none shadow-md">
        <div className="poster-track flex items-center gap-12 w-max font-['Anton'] text-[clamp(28px,3.4vw,52px)] uppercase whitespace-nowrap animate-[marquee_35s_linear_infinite]">
          <span>CONTRIBUTIONS <b>260</b></span>
          <span className="opacity-90">✦</span>
          <span>HTML</span>
          <span className="opacity-90">✦</span>
          <span>JAVASCRIPT</span>
          <span className="opacity-90">✦</span>
          <span>TYPESCRIPT</span>
          <span className="opacity-90">✦</span>
          <span>CSS</span>
          <span className="opacity-90">✦</span>
          <span>REPOS <b>{displayProjects.length}</b></span>
          <span className="opacity-90">✦</span>
          <span>STARS <b>12</b></span>
          <span className="opacity-90">✦</span>
          <span>CONTRIBUTIONS <b>260</b></span>
          <span className="opacity-90">✦</span>
          <span>HTML</span>
          <span className="opacity-90">✦</span>
          <span>JAVASCRIPT</span>
          <span className="opacity-90">✦</span>
          <span>TYPESCRIPT</span>
          <span className="opacity-90">✦</span>
          <span>CSS</span>
          <span className="opacity-90">✦</span>
          <span>REPOS <b>{displayProjects.length}</b></span>
          <span className="opacity-90">✦</span>
          <span>STARS <b>12</b></span>
          <span className="opacity-90">✦</span>
        </div>
      </div>
    ),

    // -------------------------------------------------------------------------
    // SELECTED WORK: Staggered Tall Cards (9:14) with Initials Watermark & Glowing Colors
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="work" className="poster-work relative py-[clamp(80px,10vw,140px)] overflow-hidden">
        {/* Giant Ghost "PORTFOLIO" in Background */}
        <div className="absolute left-1/2 top-10 -translate-x-1/2 z-0 pointer-events-none select-none opacity-10">
          <p className="poster-word text-[19vw] leading-none uppercase tracking-tight">
            PORTFOLIO
          </p>
        </div>

        {/* Head: SELECTED WORK + Subtitle */}
        <div className="relative z-10 px-[clamp(20px,5vw,80px)] flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h3 className="m-0 font-['Anton'] font-normal text-[clamp(48px,7vw,110px)] leading-[0.9] text-[#151515] uppercase">
            SELECTED <em className="text-[#e11d2a] not-italic">WORK</em>
          </h3>
          <p className="m-0 max-w-[38ch] text-[#4b4b4b] text-sm sm:text-base leading-[1.55] font-['Inter']">
            Projects pulled straight from github.com/{githubHandle}, built in public.
          </p>
        </div>

        {/* Cards Grid: 4 columns on desktop, 2 on tablet, staggered */}
        <div className="poster-cards relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[clamp(14px,1.6vw,24px)] px-[clamp(20px,5vw,80px)]">
          {displayProjects.map((proj: PortfolioProject, idx: number) => {
            const rawLang = proj.tags?.[0] || "JavaScript";
            const techKey = Object.keys(LANG_COLORS).find(
              (k) => k.toLowerCase() === rawLang.toLowerCase()
            ) || "JavaScript";
            const langColor = LANG_COLORS[techKey] || "#e11d2a";
            const tilt = cardTilts[idx % 4];
            const isStaggered = (idx % 4 === 1) || (idx % 4 === 3);
            const targetUrl = proj.liveUrl || proj.repoUrl || `https://github.com/${githubHandle}/${encodeURIComponent(proj.title)}`;
            const initials = (proj.title || "PR").slice(0, 2).toUpperCase();

            return (
              <SafeLink
                key={idx}
                href={targetUrl}
                target="_blank"
                rel="noopener"
                className={`poster-card group relative flex flex-col justify-between aspect-[9/14] p-[22px] rounded-[18px] overflow-hidden text-white bg-[#151515] shadow-[0_30px_50px_-30px_rgba(0,0,0,0.6)] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 hover:rotate-0 hover:shadow-[0_40px_70px_-25px_rgba(0,0,0,0.7)] ${
                  isStaggered ? "lg:mt-16" : ""
                }`}
                style={{
                  transform: `rotate(${tilt}deg)`,
                }}
              >
                {/* Glowing Corner Radial Gradient */}
                <span
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(120% 70% at 20% 0%, ${langColor} 0%, transparent 60%), linear-gradient(160deg, #1b1b1b, #0e0e0e)`,
                  }}
                />

                {/* Ghost Initials Watermark in Card Background */}
                <span
                  className="absolute right-[-6%] bottom-[-8%] z-0 font-['Anton'] text-[220px] leading-none text-white/[0.06] uppercase select-none pointer-events-none group-hover:text-white/[0.09] transition-colors"
                >
                  {initials}
                </span>

                {/* Card Top: Number 01, 02 */}
                <div className="relative z-10">
                  <span className="font-['Anton'] text-[22px] opacity-60 group-hover:opacity-100 transition-opacity">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Card Bottom: Title, Description, Language Meta with dot & star */}
                <div className="relative z-10 space-y-2.5">
                  <h4 className="m-0 font-['Anton'] font-normal text-[clamp(28px,2.4vw,40px)] leading-[0.95] uppercase text-white overflow-wrap-anywhere group-hover:text-[#e11d2a] transition-colors">
                    {proj.title}
                  </h4>
                  <p className="m-0 text-[14px] leading-[1.5] text-white/75 line-clamp-4 font-['Inter']">
                    {proj.description || "No description yet."}
                  </p>
                  <div className="flex items-center gap-3.5 text-[13px] font-semibold text-white/85 font-['Inter'] pt-1">
                    <span className="flex items-center">
                      <i
                        className="inline-block w-[9px] h-[9px] mr-1.5 rounded-full"
                        style={{ backgroundColor: langColor }}
                      />
                      <span>{rawLang}</span>
                    </span>
                    <span>★ 0</span>
                  </div>
                </div>
              </SafeLink>
            );
          })}
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // ABOUT: Exact GitSkins About Layout (Left: ABOUT ME, Right: Bio, Chips, Link)
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="about" className="poster-about px-[clamp(20px,5vw,80px)] pb-[clamp(80px,10vw,140px)] grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[clamp(28px,5vw,80px)] items-start">
        {/* Left: ABOUT ME */}
        <div>
          <h3 className="m-0 font-['Anton'] font-normal text-[clamp(48px,6vw,96px)] leading-[0.9] uppercase text-[#151515]">
            ABOUT <em className="text-[#e11d2a] not-italic">ME</em>
          </h3>
        </div>

        {/* Right: Bio + Chips + GitHub link */}
        <div>
          <p className="m-0 mb-6 font-['Inter'] text-[clamp(18px,1.7vw,26px)] leading-[1.5] text-[#151515]">
            {profile?.bio || "I build things on GitHub. Here's a look at what I've been working on."}
          </p>

          {/* Skill Capsule Chips */}
          <div className="poster-chips flex flex-wrap gap-2 mb-6">
            {(skills.length > 0 ? skills.slice(0, 10) : [
              { name: "HTML" },
              { name: "JavaScript" },
              { name: "TypeScript" },
              { name: "CSS" },
              { name: "Python" },
            ]).map((s: PortfolioSkill, sIdx: number) => {
              const name = typeof s === "string" ? s : s.name;
              return (
                <span
                  key={sIdx}
                  className="px-3.5 py-2 border-[1.5px] border-[#151515] rounded-full font-['Inter'] font-semibold text-sm text-[#151515] bg-transparent hover:bg-[#151515] hover:text-[#efece6] transition-colors"
                >
                  {name}
                </span>
              );
            })}
          </div>

          {/* Quick Facts / Links */}
          <div className="poster-facts flex flex-wrap gap-4 text-sm font-['Inter'] text-[#4b4b4b]">
            {profile?.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#e11d2a]" />
                <span>{profile.location}</span>
              </span>
            )}
            <SafeLink
              href={`https://github.com/${githubHandle}`}
              target="_blank"
              rel="noopener"
              className="text-[#151515] font-semibold underline underline-offset-4 hover:text-[#e11d2a] transition-colors"
            >
              github.com/{githubHandle}
            </SafeLink>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE: Timeline Adapted in Poster Style
    // -------------------------------------------------------------------------
    experience: experience.length > 0 ? (
      <section key="experience" id="experience" className="px-[clamp(20px,5vw,80px)] pb-[clamp(80px,10vw,140px)] border-t border-black/10 pt-16">
        <h3 className="m-0 font-['Anton'] font-normal text-[clamp(48px,6vw,96px)] leading-[0.9] uppercase text-[#151515] mb-12">
          WORK <em className="text-[#e11d2a] not-italic">EXPERIENCE</em>
        </h3>
        <div className="divide-y divide-black/10">
          {experience.map((exp: PortfolioExperience, eIdx: number) => (
            <div key={eIdx} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-4">
                <span className="font-mono text-xs font-bold text-[#e11d2a] uppercase">
                  {exp.startDate || "2021"} — {exp.endDate || (exp.current ? "PRESENT" : "PRESENT")}
                </span>
                <h4 className="font-['Anton'] text-3xl uppercase text-[#151515] mt-1">
                  {exp.company}
                </h4>
              </div>
              <div className="md:col-span-8 space-y-2 font-['Inter']">
                <h5 className="font-extrabold text-xl text-[#151515] uppercase">
                  {exp.title}
                </h5>
                {exp.description && (
                  <p className="text-[#4b4b4b] text-base leading-relaxed">{exp.description}</p>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="space-y-1 pt-2 list-none p-0">
                    {exp.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex gap-2 text-sm text-[#151515]">
                        <span className="text-[#e11d2a]">✦</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (education.length > 0 || certifications.length > 0) ? (
      <section key="education" id="education" className="px-[clamp(20px,5vw,80px)] pb-[clamp(80px,10vw,140px)] border-t border-black/10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {education.length > 0 && (
            <div>
              <h3 className="m-0 font-['Anton'] text-[clamp(40px,5vw,72px)] uppercase text-[#151515] mb-8">
                EDUCATION
              </h3>
              <div className="space-y-6">
                {education.map((edu: PortfolioEducation, idx: number) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border border-black/10 shadow-sm space-y-1.5 font-['Inter']">
                    <span className="font-mono text-xs font-bold text-[#e11d2a]">
                      {edu.startDate} — {edu.endDate || "PRESENT"}
                    </span>
                    <h4 className="font-['Anton'] text-2xl uppercase text-[#151515]">
                      {edu.degree}
                    </h4>
                    <p className="font-semibold text-sm text-[#4b4b4b]">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h3 className="m-0 font-['Anton'] text-[clamp(40px,5vw,72px)] uppercase text-[#151515] mb-8">
                CERTIFICATIONS
              </h3>
              <div className="space-y-6">
                {certifications.map((cert: PortfolioCertification, idx: number) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border border-black/10 shadow-sm flex items-center justify-between gap-4 font-['Inter']">
                    <div>
                      <h4 className="font-['Anton'] text-2xl uppercase text-[#151515]">
                        {cert.name}
                      </h4>
                      {cert.issuer && <p className="font-semibold text-sm text-[#4b4b4b]">{cert.issuer}</p>}
                    </div>
                    <Award className="h-7 w-7 text-[#e11d2a] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    ) : null,

    // -------------------------------------------------------------------------
    // CTA: Exact GitSkins "Ready to Build Something?"
    // -------------------------------------------------------------------------
    contact: (
      <section key="contact" id="contact" className="poster-cta relative min-h-[92svh] overflow-hidden select-none">
        {/* Giant Centered Word: READY TO */}
        <div className="absolute left-1/2 top-[6svh] -translate-x-1/2 z-0 pointer-events-none w-full text-center">
          <p className="poster-word text-[19vw] leading-[0.82] uppercase tracking-tight">
            READY TO
          </p>
        </div>

        {/* Leaning Framed Portrait: +3deg in center */}
        <div className="poster-portrait-framed absolute left-1/2 bottom-[14svh] -translate-x-1/2 z-10 pointer-events-none flex items-center justify-center">
          <div className="relative rotate-[3deg] w-[min(28vw,360px)] min-w-[220px]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full aspect-[4/5] object-cover bg-white border-[10px] sm:border-[12px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] filter contrast-105"
              />
            ) : (
              <div className="w-full aspect-[4/5] bg-[#fff] border-[10px] sm:border-[12px] border-white rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] flex flex-col items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(#151515_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                <div className="relative z-10 text-center px-4">
                  <span className="font-['Anton'] text-7xl sm:text-8xl text-[#151515] tracking-tighter">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#e11d2a] font-bold mt-2">
                    ✦ READY TO BUILD
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left: BUILD SOMETHING? in giant black Anton font */}
        <div className="absolute left-[clamp(20px,5vw,80px)] bottom-[clamp(36px,10svh,110px)] z-20">
          <h3 className="m-0 font-['Anton'] font-normal text-[clamp(48px,7.5vw,128px)] leading-[0.9] text-[#151515] uppercase">
            BUILD SOMETHING?
          </h3>
        </div>

        {/* Bottom Right: Red Pill Button "Get in touch →" */}
        <div className="absolute right-[clamp(20px,5vw,80px)] bottom-[clamp(44px,11svh,120px)] z-20">
          <SafeLink
            href={contactEmail ? `mailto:${contactEmail}` : `https://github.com/${githubHandle}`}
            target={contactEmail ? undefined : "_blank"}
            rel="noopener"
            className="poster-go inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#e11d2a] text-white font-['Inter'] font-extrabold text-[17px] shadow-[0_16px_30px_-14px_#e11d2a] hover:-translate-y-1 transition-transform"
          >
            <span>Get in touch</span>
            <span aria-hidden="true">→</span>
          </SafeLink>
        </div>
      </section>
    ),
  };

  return (
    <div className="poster-template relative bg-[#efece6] text-[#151515] min-h-screen font-['Inter'] overflow-x-hidden">
      {/* Scoped CSS matching GitSkins exactly */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700;800&display=swap');

        .poster-template {
          --accent: ${accentColor};
          --accent-soft: color-mix(in srgb, var(--accent) 16%, transparent);
          --paper: #efece6;
          --ink: #151515;
          --ink-2: #4b4b4b;
          --display: 'Anton', 'Bebas Neue', Impact, sans-serif;
          --body: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Paper Noise Texture Overlay */
        .poster-template::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.35;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* The Giant Word */
        .poster-word {
          margin: 0;
          font-family: var(--display);
          font-weight: 400;
          text-transform: uppercase;
          line-height: .82;
          padding-top: .14em;
          margin-top: -.14em;
          letter-spacing: -.01em;
          white-space: nowrap;
          user-select: none;
          color: transparent;
          -webkit-text-stroke: 2px var(--accent);
          background: linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 55%, transparent) 45%, color-mix(in srgb, var(--accent) 6%, transparent) 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        /* Marquee Animation */
        @keyframes marquee {
          to { transform: translateX(-50%); }
        }

        /* Cursor Blink */
        @keyframes blink {
          50% { opacity: 0; }
        }

        @media (max-width: 860px) {
          .poster-hero { min-height: auto; padding-bottom: 40px; }
          .poster-hero .poster-word { position: relative; left: auto; top: auto; transform: none; display: block; margin-top: 28px; }
          .poster-portrait-framed { position: relative !important; left: auto !important; bottom: auto !important; margin: -16vw auto 0 !important; transform: none !important; width: 72vw !important; }
          .poster-intro, .poster-role { position: relative !important; left: auto !important; right: auto !important; bottom: auto !important; padding: 0 20px !important; }
          .poster-intro { margin-top: 24px; }
          .poster-role { margin-top: 20px; max-width: none !important; }
          .poster-cards { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .poster-card:nth-child(2n) { margin-top: 36px !important; }
          .poster-cta { min-height: auto; padding-bottom: 50px; }
          .poster-cta .poster-word { position: relative; left: auto; top: auto; transform: none; display: block; margin-top: 40px; }
        }
      `}</style>

      {/* Main Content Sections */}
      <main className="relative z-10">
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;

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

      {/* Footer matching GitSkins exactly */}
      <footer className="relative z-10 py-[22px] px-[clamp(20px,5vw,80px)] flex justify-between gap-4 text-[13px] text-[#4b4b4b] border-t border-black/[0.08] font-['Inter']">
        <span>© {new Date().getFullYear()} {fullName}</span>
        <div className="flex items-center gap-4">
          <AttributionFooter
            author="GitSkins"
            templateName="Poster Brutalist"
            originalUrl="https://www.gitskins.com/portfolio-templates/poster/"
          />
        </div>
      </footer>

      {/* Back to Top */}
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
