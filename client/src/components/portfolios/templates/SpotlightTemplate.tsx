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

export interface SpotlightTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

// GitSkins exact language colors
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
};

export function SpotlightTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "expertise", "skills", "projects", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: SpotlightTemplateProps) {
  const profile = portfolio.profile;
  const design = portfolio.design;
  const socialLinks = portfolio.socialLinks || [];
  const skills = useMemo(() => portfolio.skills || [], [portfolio.skills]);
  const experience = portfolio.experience || [];
  const education = portfolio.education || [];
  const projects = useMemo(() => portfolio.projects || [], [portfolio.projects]);
  const certifications = portfolio.certifications || [];

  const accentColor = design?.primaryColor || "#e3141f";
  const [isNavSolid, setIsNavSolid] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Derive candidate info
  const fullName = profile?.fullName || (showEmpty ? "Sunil Kumar" : "Developer");
  const firstName = fullName.split(/\s+/).filter((w: string) => !/^the$/i.test(w))[0] || fullName;
  const headline = profile?.headline || (showEmpty ? "JavaScript Developer" : "Software Developer");
  const avatarUrl = profile?.avatarUrl ? normalizeAvatarUrl(profile.avatarUrl) : null;
  const contactEmail = profile?.email || "";

  // Extract GitHub handle if present
  const githubLink = socialLinks.find((l: PortfolioSocialLink) =>
    l.platform?.toLowerCase().includes("github") || l.url?.toLowerCase().includes("github.com")
  );
  const githubHandle = githubLink?.url
    ? githubLink.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/.*$/, "")
    : "sunilkumar25kush";

  useEffect(() => {
    const handleScroll = () => {
      setIsNavSolid(window.scrollY > 120);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const isHidden = (sec: string) => hiddenSections.includes(sec);

  // Technology categorizations matching GitSkins GROUPS
  const techGroups = useMemo(() => {
    const skillList = skills.map((s: PortfolioSkill) => (typeof s === "string" ? s : s.name)).filter(Boolean);
    const groups: { title: string; items: string[] }[] = [];

    const focus = skillList.slice(0, 6);
    if (focus.length > 0) {
      groups.push({ title: "What I focus on", items: focus });
    }

    const frontend = skillList.filter((s) => /react|vue|angular|svelte|html|css|tailwind|javascript|typescript|next/i.test(s));
    if (frontend.length > 0) {
      groups.push({ title: "Frontend", items: frontend });
    }

    const backend = skillList.filter((s) => /node|express|python|django|fastapi|java|spring|go|rust|c\+\+|sql|postgres|mongo|graphql/i.test(s));
    if (backend.length > 0) {
      groups.push({ title: "Backend & systems", items: backend });
    }

    const tooling = skillList.filter((s) => /docker|kubernetes|aws|git|linux|ci\/cd|vite|webpack|jest/i.test(s));
    if (tooling.length > 0) {
      groups.push({ title: "Tooling & infra", items: tooling });
    }

    if (groups.length === 0) {
      groups.push(
        { title: "What I focus on", items: ["JavaScript", "TypeScript", "React", "Node.js"] },
        { title: "Frontend", items: ["HTML", "CSS", "TailwindCSS", "Vite"] },
        { title: "Backend & systems", items: ["RESTful APIs", "MongoDB", "Express", "PostgreSQL"] },
        { title: "Tooling & infra", items: ["Git", "Docker", "Linux", "CI/CD"] }
      );
    }

    return groups;
  }, [skills]);

  // Fallback demo projects matching GitSkins if projects list is empty
  const displayProjects: PortfolioProject[] = useMemo(() => {
    if (projects.length > 0) return projects;
    return [
      {
        title: "AI Resume Builder",
        description: "Intelligent career document and portfolio generator with multi-template rendering.",
        tags: ["TypeScript", "React"],
        repoUrl: `https://github.com/${githubHandle}/AI-Resume-builder`,
        featured: true,
      },
      {
        title: "Practice",
        description: "Algorithmic data structures, web systems design, and code sandbox experiments.",
        tags: ["JavaScript", "HTML"],
        repoUrl: `https://github.com/${githubHandle}/practice`,
        featured: false,
      },
      {
        title: "Portfolio01",
        description: "Interactive personal web showcase with custom styling and animations.",
        tags: ["CSS", "HTML"],
        repoUrl: `https://github.com/${githubHandle}/portfolio01`,
        featured: false,
      },
      {
        title: "SkyWatch",
        description: "Real-time atmospheric telemetry and meteorological visualization dashboard.",
        tags: ["TypeScript", "React"],
        repoUrl: `https://github.com/${githubHandle}/SkyWatch`,
        featured: false,
      },
    ];
  }, [projects, githubHandle]);

  // Section builders
  const sectionMap: Record<string, ReactNode> = {
    // -------------------------------------------------------------------------
    // HERO: Crimson Spotlight Gradient + Framed Portrait Stage + SVG Wave
    // -------------------------------------------------------------------------
    hero: (
      <section key="hero" id="top" className="spotlight-hero relative min-h-screen text-white overflow-hidden flex flex-col justify-between pt-24 sm:pt-28 pb-0">
        <div className="wrap max-w-[1180px] w-full mx-auto px-5 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] items-center gap-8 min-h-[calc(100vh-140px)]">
          {/* Left Hero Copy */}
          <div className="space-y-6 pt-8 pb-12 lg:py-0">
            <h1 className="font-['Inter'] font-extrabold text-[clamp(44px,6.4vw,92px)] leading-[0.98] tracking-[-0.035em]">
              <span className="block text-white">Hi, I&apos;m {firstName}</span>
              <span className="block text-[0.62em] font-bold text-white/95 tracking-[-0.03em] mt-3 uppercase">
                {headline}
              </span>
            </h1>

            <p className="max-w-[480px] text-white/90 text-base sm:text-lg leading-[1.6] font-['Inter']">
              {profile?.bio || `I build things on GitHub. Here's a look at what I've been working on.`}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2 font-['Inter']">
              <a
                href="#work"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full bg-white text-[#e3141f] font-semibold text-sm sm:text-base hover:-translate-y-0.5 transition-transform shadow-lg"
              >
                View my work
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full border-[1.5px] border-white/75 text-white font-semibold text-sm sm:text-base hover:-translate-y-0.5 transition-transform"
              >
                Contact me
              </a>
            </div>
          </div>

          {/* Right Hero Stage: Leaning / Framed Avatar Portrait */}
          <div className="spotlight-stage relative flex items-end justify-center justify-self-center lg:justify-self-end w-full max-w-[500px] h-[400px] sm:h-[540px] lg:h-[620px] mb-[-40px] sm:mb-[-80px]">
            <div className="relative w-[min(340px,78vw)] aspect-[4/5] rounded-[28px] border-[8px] border-white/95 shadow-[0_40px_80px_-30px_rgba(40,0,0,0.6)] overflow-hidden bg-white/10 backdrop-blur-sm">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover object-center filter contrast-105"
                />
              ) : (
                <div className="w-full h-full bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
                  <span className="font-['Anton'] text-7xl sm:text-8xl text-white tracking-tight">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#e3141f] font-bold mt-2">
                    ✦ SPOTLIGHT
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Smooth SVG Wave Curve */}
        <div className="relative z-10 w-full overflow-hidden leading-none">
          <svg
            className="w-full h-[60px] sm:h-[90px] block"
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              fill="#f6f5f3"
              d="M0,60 C240,10 420,10 720,48 C1020,86 1200,86 1440,40 L1440,90 L0,90 Z"
            />
          </svg>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // ABOUT: Hanging Swinging Tablet + Bio & Tech Badges (#hello)
    // -------------------------------------------------------------------------
    about: (
      <section key="about" id="hello" className="relative py-24 sm:py-32 px-5 sm:px-8 bg-[#f6f5f3] text-[#121212]">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
          {/* Left: Hanging Swaying Tablet */}
          <div className="hanging-container relative justify-self-center pt-[70px] select-none">
            {/* Cord & Anchor Nail */}
            <div className="absolute left-1/2 top-0 w-[2px] h-[78px] bg-gradient-to-b from-[#999] to-[#555] -translate-x-1/2" />
            <div className="absolute left-1/2 -top-1.5 w-3.5 h-3.5 rounded-full bg-[#444] -translate-x-1/2 shadow-sm" />

            {/* Tablet with Candidate Photo */}
            <div className="hanging-tablet w-[min(340px,78vw)] aspect-[4/5] p-3.5 rounded-[30px] bg-[#151515] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] rotate-[-4deg]">
              <div className="w-full h-full rounded-[18px] overflow-hidden bg-[#e3141f] flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover object-top" />
                ) : (
                  <span className="font-['Anton'] text-7xl text-white tracking-tight">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Eyebrow, Heading, Bio, Badges, Facts */}
          <div className="space-y-6">
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#e3141f]/10 text-[#e3141f] text-xs font-bold tracking-widest uppercase font-['Inter']">
              Hello!
            </span>

            <h2 className="font-['Inter'] font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.04] tracking-[-0.035em] text-[#121212]">
              A little <em className="text-[#e3141f] not-italic">about me</em>
            </h2>

            <p className="text-[#555] text-base sm:text-lg leading-[1.7] font-['Inter']">
              {profile?.bio || `${firstName} builds modern digital software and systems in public on GitHub.`}
            </p>

            {/* Language/Tech Badges with Dots */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.slice(0, 8).map((skill: PortfolioSkill, idx: number) => {
                const name = typeof skill === "string" ? skill : skill.name;
                const color = LANG_COLORS[name] || "#e3141f";
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-black/10 font-semibold text-xs text-[#121212] shadow-sm"
                  >
                    <i className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span>{name}</span>
                  </span>
                );
              })}
            </div>

            {/* Facts Grid */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-black/10 text-sm font-['Inter'] text-[#555]">
              {profile?.location && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-4 w-4 text-[#e3141f]" />
                  <span>{profile.location}</span>
                </span>
              )}
              <span className="font-medium">
                ★ 12 public stars
              </span>
              <span className="font-medium">
                {displayProjects.length} repositories
              </span>
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERTISE: The Connected Web of Nodes (#expertise)
    // -------------------------------------------------------------------------
    expertise: (
      <section key="expertise" id="expertise" className="relative py-24 sm:py-32 px-5 sm:px-8 bg-white text-[#121212] border-y border-black/10 overflow-hidden">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          {/* Left Title & Description */}
          <div className="space-y-4">
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#e3141f]/10 text-[#e3141f] text-xs font-bold tracking-widest uppercase font-['Inter']">
              My expertise
            </span>
            <h2 className="font-['Inter'] font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.04] tracking-[-0.035em] text-[#121212]">
              Building modern digital solutions with <em className="text-[#e3141f] not-italic">code</em>
            </h2>
            <p className="text-[#555] text-base sm:text-lg leading-[1.6] font-['Inter']">
              What {firstName} spends time engineering across public repositories, cloud platforms, and web applications.
            </p>
          </div>

          {/* Right: The Floating Web of Nodes */}
          <div className="relative min-h-[460px] flex items-center justify-center">
            {/* SVG Curved Dashed Connecting Line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M 60 80 C 220 70, 160 220, 240 240 C 300 250, 280 380, 120 370"
                fill="none"
                stroke="rgba(227, 20, 31, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
                className="animate-[dash_18s_linear_infinite]"
              />
            </svg>

            {/* 4 Floating Expertise Nodes */}
            <div className="w-full h-full relative min-h-[440px]">
              {/* Node 1: Top Left */}
              <div className="spotlight-node absolute left-[4%] top-[4%] w-[210px] p-4 rounded-[18px] bg-white border border-black/10 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] animate-[float_7s_ease-in-out_infinite]">
                <small className="block text-[11px] font-bold tracking-widest text-[#555] uppercase">01</small>
                <b className="block text-[17px] text-[#121212] tracking-tight my-1">
                  {skills[0] ? (typeof skills[0] === "string" ? skills[0] : skills[0].name) : "Frontend Systems"}
                </b>
                <p className="m-0 text-xs text-[#555] leading-relaxed">Where most of my daily commits and architecture land.</p>
              </div>

              {/* Node 2: Top Right (HOT Node in Vibrant Red) */}
              <div className="spotlight-node absolute right-[4%] top-[10%] w-[220px] p-4 rounded-[18px] bg-[#e3141f] text-white shadow-[0_30px_60px_-20px_rgba(227,20,31,0.5)] animate-[float_7s_ease-in-out_infinite] [animation-delay:-1.8s]">
                <small className="block text-[11px] font-bold tracking-widest text-white/80 uppercase">02 // PRIMARY</small>
                <b className="block text-[17px] text-white tracking-tight my-1">
                  {skills[1] ? (typeof skills[1] === "string" ? skills[1] : skills[1].name) : "TypeScript & React"}
                </b>
                <p className="m-0 text-xs text-white/90 leading-relaxed">Something I keep mastering, refining, and deploying.</p>
              </div>

              {/* Node 3: Bottom Left */}
              <div className="spotlight-node absolute left-[10%] bottom-[8%] w-[210px] p-4 rounded-[18px] bg-white border border-black/10 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] animate-[float_7s_ease-in-out_infinite] [animation-delay:-3.6s]">
                <small className="block text-[11px] font-bold tracking-widest text-[#555] uppercase">03</small>
                <b className="block text-[17px] text-[#121212] tracking-tight my-1">
                  {skills[2] ? (typeof skills[2] === "string" ? skills[2] : skills[2].name) : "Backend APIs"}
                </b>
                <p className="m-0 text-xs text-[#555] leading-relaxed">High throughput services, database pipelines, and scale.</p>
              </div>

              {/* Node 4: Bottom Right */}
              <div className="spotlight-node absolute right-[8%] bottom-[4%] w-[210px] p-4 rounded-[18px] bg-white border border-black/10 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] animate-[float_7s_ease-in-out_infinite] [animation-delay:-5.2s]">
                <small className="block text-[11px] font-bold tracking-widest text-[#555] uppercase">04</small>
                <b className="block text-[17px] text-[#121212] tracking-tight my-1">
                  {skills[3] ? (typeof skills[3] === "string" ? skills[3] : skills[3].name) : "Cloud & Tooling"}
                </b>
                <p className="m-0 text-xs text-[#555] leading-relaxed">Automated deployments, containers, and testing workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // TECHNICAL STACK: Grouped Categorized Cards (#tech)
    // -------------------------------------------------------------------------
    skills: (
      <section key="skills" id="tech" className="relative py-20 sm:py-28 px-5 sm:px-8 bg-[#f6f5f3] text-[#121212]">
        <div className="max-w-[1180px] mx-auto space-y-10">
          <div>
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#e3141f]/10 text-[#e3141f] text-xs font-bold tracking-widest uppercase font-['Inter']">
              Technical stack
            </span>
            <h2 className="font-['Inter'] font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.04] tracking-[-0.035em] text-[#121212] mt-2">
              Technologies I <em className="text-[#e3141f] not-italic">work with</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {techGroups.map((group, gIdx) => (
              <div
                key={gIdx}
                className="p-6 rounded-[18px] bg-white border border-black/10 shadow-sm space-y-4"
              >
                <h3 className="m-0 font-['Inter'] font-bold text-base text-[#121212]">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, iIdx) => (
                    <span
                      key={iIdx}
                      className="px-3 py-1.5 rounded-full bg-[#f6f5f3] font-['Inter'] font-semibold text-xs text-[#121212]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // FEATURED WORK: Clean White Cards with Language Dot (#work)
    // -------------------------------------------------------------------------
    projects: (
      <section key="projects" id="work" className="relative py-20 sm:py-28 px-5 sm:px-8 bg-[#f6f5f3] text-[#121212]">
        <div className="max-w-[1180px] mx-auto space-y-10">
          <div>
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#e3141f]/10 text-[#e3141f] text-xs font-bold tracking-widest uppercase font-['Inter']">
              Featured work
            </span>
            <h2 className="font-['Inter'] font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.04] tracking-[-0.035em] text-[#121212] mt-2">
              Projects that define my <em className="text-[#e3141f] not-italic">journey</em>
            </h2>
            <p className="text-[#555] text-sm sm:text-base mt-2">
              Pulled straight from github.com/{githubHandle}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((proj: PortfolioProject, idx: number) => {
              const rawLang = proj.tags?.[0] || "JavaScript";
              const langColor = LANG_COLORS[rawLang] || "#e3141f";
              const targetUrl = proj.liveUrl || proj.repoUrl || `https://github.com/${githubHandle}/${encodeURIComponent(proj.title)}`;

              return (
                <SafeLink
                  key={idx}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener"
                  className="group flex flex-col justify-between min-h-[220px] p-6 rounded-[20px] bg-white border border-black/10 hover:border-[#e3141f]/40 hover:-translate-y-1 hover:shadow-[0_30px_60px_-36px_rgba(0,0,0,0.4)] transition-all duration-300"
                >
                  <div className="space-y-2.5">
                    <span className="font-['Inter'] font-extrabold text-xs text-[#e3141f] tracking-widest">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-['Inter'] font-bold text-xl text-[#121212] tracking-tight group-hover:text-[#e3141f] transition-colors capitalize">
                      {proj.title}
                    </h3>
                    <p className="text-[#555] text-sm leading-[1.55] line-clamp-3">
                      {proj.description || "Production system design and full-stack software application."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] text-xs font-semibold text-[#555]">
                    <span className="flex items-center gap-1.5">
                      <i className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
                      <span>{rawLang}</span>
                    </span>
                    <span>★ 0</span>
                  </div>
                </SafeLink>
              );
            })}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------------------------------
    experience: experience.length > 0 ? (
      <section key="experience" id="experience" className="py-20 sm:py-28 px-5 sm:px-8 bg-white text-[#121212] border-t border-black/10">
        <div className="max-w-[1180px] mx-auto space-y-10">
          <div>
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#e3141f]/10 text-[#e3141f] text-xs font-bold tracking-widest uppercase font-['Inter']">
              Career history
            </span>
            <h2 className="font-['Inter'] font-extrabold text-[clamp(32px,4vw,52px)] text-[#121212] mt-2">
              Work <em className="text-[#e3141f] not-italic">experience</em>
            </h2>
          </div>

          <div className="divide-y divide-black/10">
            {experience.map((exp: PortfolioExperience, eIdx: number) => (
              <div key={eIdx} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <div className="md:col-span-4">
                  <span className="font-mono text-xs font-bold text-[#e3141f] uppercase">
                    {exp.startDate || "2021"} — {exp.endDate || (exp.current ? "PRESENT" : "PRESENT")}
                  </span>
                  <h4 className="font-['Inter'] font-bold text-2xl text-[#121212] mt-1">
                    {exp.company}
                  </h4>
                  {exp.location && <p className="text-xs text-[#555] uppercase mt-0.5">{exp.location}</p>}
                </div>
                <div className="md:col-span-8 space-y-2">
                  <h5 className="font-extrabold text-xl text-[#121212]">{exp.title}</h5>
                  {exp.description && <p className="text-[#555] text-base leading-relaxed">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (education.length > 0 || certifications.length > 0) ? (
      <section key="education" id="education" className="py-20 sm:py-28 px-5 sm:px-8 bg-[#f6f5f3] text-[#121212] border-t border-black/10">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {education.length > 0 && (
            <div>
              <h3 className="font-['Inter'] font-extrabold text-3xl text-[#121212] mb-6">
                Education
              </h3>
              <div className="space-y-4">
                {education.map((edu: PortfolioEducation, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm space-y-1">
                    <span className="font-mono text-xs font-bold text-[#e3141f]">
                      {edu.startDate} — {edu.endDate || "PRESENT"}
                    </span>
                    <h4 className="font-bold text-lg text-[#121212]">{edu.degree}</h4>
                    <p className="text-sm text-[#555]">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h3 className="font-['Inter'] font-extrabold text-3xl text-[#121212] mb-6">
                Certifications
              </h3>
              <div className="space-y-4">
                {certifications.map((cert: PortfolioCertification, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-[#121212]">{cert.name}</h4>
                      {cert.issuer && <p className="text-sm text-[#555]">{cert.issuer}</p>}
                    </div>
                    <Award className="h-6 w-6 text-[#e3141f] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    ) : null,

    // -------------------------------------------------------------------------
    // CONTACT: Obsidian Dark Background + Giant "CONTACT" + Overlapping Red Card
    // -------------------------------------------------------------------------
    contact: (
      <section key="contact" id="contact" className="spotlight-contact relative pt-28 pb-16 bg-[#0d0d0d] text-white overflow-hidden">
        {/* Giant Centered "Contact" in Anton font */}
        <p className="m-0 font-['Anton'] font-normal text-[clamp(90px,21vw,330px)] leading-[0.8] tracking-[-0.01em] uppercase text-white whitespace-nowrap text-center select-none pointer-events-none opacity-95">
          Contact
        </p>

        {/* Floating Red Accent Card Overlapping the Big Word */}
        <div className="relative z-10 w-[min(620px,100%-40px)] mx-auto mt-[-0.32em] p-8 sm:p-10 rounded-[26px] bg-[#e3141f] shadow-[0_40px_90px_-40px_rgba(227,20,31,0.7)] text-white space-y-6">
          <div>
            <h3 className="m-0 font-['Inter'] font-extrabold text-2xl sm:text-3xl tracking-tight">
              Let&apos;s build something
            </h3>
            <p className="mt-2 text-white/90 text-sm sm:text-base leading-[1.55]">
              Open to new engineering roles, collaborations and interesting technical problems.
            </p>
          </div>

          <div className="grid gap-2.5 font-['Inter'] font-semibold text-sm sm:text-base">
            {contactEmail && (
              <SafeLink
                href={`mailto:${contactEmail}`}
                className="flex items-center justify-between p-4 rounded-[14px] bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span>Email: {contactEmail}</span>
                <span aria-hidden="true">→</span>
              </SafeLink>
            )}
            <SafeLink
              href={`https://github.com/${githubHandle}`}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between p-4 rounded-[14px] bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span>GitHub: @{githubHandle}</span>
              <span aria-hidden="true">→</span>
            </SafeLink>
            {socialLinks.map((sl: PortfolioSocialLink, idx: number) => (
              <SafeLink
                key={idx}
                href={sl.url}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between p-4 rounded-[14px] bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span>{sl.label || sl.platform}</span>
                <span aria-hidden="true">→</span>
              </SafeLink>
            ))}
          </div>
        </div>
      </section>
    ),
  };

  return (
    <div className="spotlight-template relative bg-[#f6f5f3] text-[#121212] min-h-screen font-['Inter'] overflow-x-hidden">
      {/* Scoped CSS matching GitSkins Spotlight */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap');

        .spotlight-template {
          --accent: ${accentColor};
          --accent-deep: color-mix(in srgb, var(--accent) 78%, #000);
          --paper: #f6f5f3;
          --ink: #121212;
          --ink-2: #555;
          --line: rgba(18, 18, 18, .1);
          --display: 'Anton', Impact, sans-serif;
          --body: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Hanging Tablet Sway Animation */
        @keyframes sway {
          0%, 100% { transform: rotate(1.5deg); }
          50% { transform: rotate(-1.5deg); }
        }
        .hanging-container {
          transform-origin: 50% 0;
          animation: sway 6s ease-in-out infinite;
        }

        /* SVG Line Dash Animation */
        @keyframes dash {
          to { stroke-dashoffset: -240; }
        }

        /* Floating Nodes Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Fixed Sticky Header Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isNavSolid
            ? "bg-white/95 text-[#121212] backdrop-blur-md shadow-sm border-b border-black/10"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="font-['Inter'] font-extrabold text-lg sm:text-xl tracking-tight text-inherit">
            {firstName}
            <b className={isNavSolid ? "text-[#e3141f]" : "text-white/80"}>.</b>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#hello" className="opacity-80 hover:opacity-100 transition-opacity">About</a>
            <a href="#expertise" className="opacity-80 hover:opacity-100 transition-opacity">Expertise</a>
            <a href="#work" className="opacity-80 hover:opacity-100 transition-opacity">Work</a>
            <a href="#contact" className="opacity-80 hover:opacity-100 transition-opacity">Contact</a>
          </nav>

          <a
            href="#contact"
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              isNavSolid
                ? "bg-[#121212] text-white hover:bg-[#e3141f]"
                : "bg-white text-[#e3141f] hover:bg-white/90"
            }`}
          >
            Hire me
          </a>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="relative z-10">
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;
          return sectionMap[sectionKey] || null;
        })}
      </main>

      {/* Footer matching GitSkins Spotlight */}
      <footer className="relative z-10 bg-[#0d0d0d] text-white py-16 px-5 sm:px-8 border-t border-white/10">
        <div className="max-w-[1180px] mx-auto space-y-8">
          <p className="m-0 font-['Anton'] font-normal text-[clamp(80px,18vw,280px)] leading-[0.8] tracking-[-0.05em] uppercase text-center text-white/90 select-none">
            {firstName.toLowerCase()}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-white/60 font-['Inter']">
            <span>© {new Date().getFullYear()} {fullName}</span>
            <AttributionFooter
              author="GitSkins"
              templateName="Spotlight"
              originalUrl="https://www.gitskins.com/portfolio-templates/spotlight/"
            />
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#121212] text-[#f6f5f3] shadow-2xl hover:bg-[#e3141f] hover:text-white transition-all transform hover:-translate-y-1"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
