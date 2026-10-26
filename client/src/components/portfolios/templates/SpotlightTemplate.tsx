import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  ArrowUp,
  MapPin,
  Award,
  ExternalLink,
  ChevronRight,
  FolderGit2,
} from "lucide-react";

import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type {
  Portfolio,
  PortfolioSkill,
  PortfolioSocialLink,
  PortfolioExperience,
  PortfolioEducation,
  PortfolioProject,
  PortfolioCertification,
} from "@/types/portfolio";

export interface SpotlightTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

// GitSkins exact language dot colors
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
  Dockerfile: "#384d54",
};

// Font family map supporting the typography customization settings
const FONT_FAMILY_MAP: Record<string, string> = {
  Inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  Roboto: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
  Merriweather: "'Merriweather', Georgia, serif",
  Playfair: "'Playfair Display', Georgia, serif",
  JetBrains: "'JetBrains Mono', 'Fira Code', monospace",
};

// Helper to adjust color shade for gradients and contrast
function adjustBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex.length === 3 ? cleanHex.split("").map((c) => c + c).join("") : cleanHex, 16);
  if (isNaN(num)) return hex;
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

export function SpotlightTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = [
    "hero",
    "about",
    "expertise",
    "skills",
    "projects",
    "experience",
    "education",
    "certifications",
    "contact",
  ],
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

  // ---------------------------------------------------------------------------
  // 1. DYNAMIC CUSTOMIZATION: ACCENT COLOR, THEME, AND TYPOGRAPHY
  // ---------------------------------------------------------------------------
  const accentColor = design?.primaryColor || "#e3141f";
  const accentDeep = useMemo(() => adjustBrightness(accentColor, -30), [accentColor]);
  const accentDark = useMemo(() => adjustBrightness(accentColor, -20), [accentColor]);

  // Template-specific customization
  const templateSettings = design?.templateSettings || {};
  const showGlowHalo = templateSettings.glowHalo !== false;
  const showExpertiseTree = templateSettings.expertiseTree !== false;

  // Theme mode handling (light / dark / system)
  const themeSetting = design?.theme || "system";
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (themeSetting === "dark") {
      setIsDarkMode(true);
    } else if (themeSetting === "light") {
      setIsDarkMode(false);
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [themeSetting]);

  // Semantic color tokens responding to theme
  const colors = useMemo(() => {
    return isDarkMode
      ? {
        paper: "#0c0c0e",
        sectionWhite: "#141418",
        cardBg: "#1c1c22",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        ink: "#f4f4f6",
        inkMuted: "#a1a1aa",
        border: "rgba(255, 255, 255, 0.08)",
        navBg: "rgba(18, 18, 22, 0.92)",
        navInk: "#ffffff",
        waveFill: "#0c0c0e",
        pillBg: "#27272f",
      }
      : {
        paper: "#ffffff",
        sectionWhite: "#ffffff",
        cardBg: "#ffffff",
        cardBorder: "rgba(0, 0, 0, 0.08)",
        ink: "#121212",
        inkMuted: "#555555",
        border: "rgba(0, 0, 0, 0.08)",
        navBg: "rgba(255, 255, 255, 0.92)",
        navInk: "#121212",
        waveFill: "#ffffff",
        pillBg: "#f1f1f3",
      };
  }, [isDarkMode]);

  // Typography font family
  const selectedFontKey = design?.fontFamily || "Inter";
  const activeFontFamily = FONT_FAMILY_MAP[selectedFontKey] || FONT_FAMILY_MAP.Inter;

  // Navigation scroll state
  const [isNavSolid, setIsNavSolid] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Responsive breakpoint tracking (lg = 1024px) for hero layout
  const [isLgScreen, setIsLgScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(min-width: 1024px)");
      const updateLg = () => setIsLgScreen(mediaQuery.matches);
      updateLg();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", updateLg);
        return () => mediaQuery.removeEventListener("change", updateLg);
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(updateLg);
        return () => (mediaQuery as any).removeListener(updateLg);
      }
    }

    const handleResize = () => setIsLgScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById("top");
      if (heroEl) {
        const { top: heroTop, bottom: heroBottom } = heroEl.getBoundingClientRect();
        const navHeight = 70;
        // Transparent only while hero overlaps navigation bar; solid when entirely above or below
        const isHeroOverlappingNav = heroTop < navHeight && heroBottom > 0;
        setIsNavSolid(!isHeroOverlappingNav);
      } else {
        setIsNavSolid(window.scrollY > 400);
      }
      setShowScrollTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const isHidden = (sec: string) => hiddenSections.includes(sec);

  // ---------------------------------------------------------------------------
  // 2. CANDIDATE PROFILE DATA EXTRACTION
  // ---------------------------------------------------------------------------
  const fullName = profile?.fullName || (showEmpty ? "sunil kumar" : "developer");
  const firstName = fullName.split(/\s+/).filter((w: string) => !/^the$/i.test(w))[0] || fullName;
  const headline = profile?.headline || (showEmpty ? "HTML and JavaScript developer" : "Full Stack Developer");
  const contactEmail = profile?.email || "";
  // Extract GitHub handle and avatar
  const githubLink = socialLinks.find(
    (l: PortfolioSocialLink) =>
      l.platform?.toLowerCase().includes("github") || l.url?.toLowerCase().includes("github.com")
  );
  const githubHandle = githubLink?.url
    ? githubLink.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/.*$/, "")
    : (showEmpty ? "sunilkumar25kush" : null);

  // Fallback to candidate's github avatar if none uploaded
  const avatarUrl = profile?.avatarUrl
    ? normalizeAvatarUrl(profile.avatarUrl)
    : (githubHandle
      ? `https://avatars.githubusercontent.com/${githubHandle}`
      : (showEmpty ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" : null));

  // Smart headline split for clean multi-line display (exact match to screenshot 1)
  const headlineLines = useMemo(() => {
    const text = headline.trim();
    const words = text.split(/\s+/);
    if (words.length <= 1) return { line1: words[0] || "developer", line2: "" };
    if (words.length === 2) return { line1: words[0], line2: words[1] };
    const lastWord = words[words.length - 1];
    const rest = words.slice(0, words.length - 1).join(" ");
    return { line1: rest, line2: lastWord };
  }, [headline]);

  // All extracted skills as strings
  const skillNames = useMemo(() => {
    const list = skills.map((s: PortfolioSkill) => (typeof s === "string" ? s : s.name)).filter(Boolean);
    if (list.length > 0) return list;
    return showEmpty ? ["HTML", "JavaScript", "TypeScript", "CSS", "Python", "Dockerfile"] : [];
  }, [skills, showEmpty]);

  // Realistic sample projects matching candidate's public repos from screenshots
  const displayProjects = useMemo(() => {
    if (projects.length > 0) {
      return projects.map((p: PortfolioProject) => ({
        title: p.title,
        description: p.description,
        tags: p.tags || ["JavaScript"],
        repoUrl: p.repoUrl || (githubHandle ? `https://github.com/${githubHandle}/${p.title.toLowerCase().replace(/\s+/g, "-")}` : undefined),
        liveUrl: p.liveUrl,
        imageUrl: p.imageUrl,
        featured: p.featured ?? true,
      }));
    }
    if (!showEmpty) return [];
    return [
      {
        title: "NOTE-PROJECT",
        description: "Full-stack collaborative notes platform with instant Markdown sync and rich text formatting.",
        tags: ["HTML", "JavaScript"],
        repoUrl: `https://github.com/${githubHandle || "developer"}/NOTE-PROJECT`,
        liveUrl: undefined as string | undefined,
        imageUrl: undefined as string | undefined,
        featured: true,
      },
      {
        title: "AI-Interviewer",
        description: "Intelligent conversational interview platform simulating technical candidate evaluations.",
        tags: ["JavaScript", "React"],
        repoUrl: `https://github.com/${githubHandle || "developer"}/AI-Interviewer`,
        liveUrl: undefined as string | undefined,
        featured: true,
      },
      {
        title: "AI-Resume-builder",
        description: "Next-gen intelligent career document and portfolio generator with ATS optimization.",
        tags: ["TypeScript", "React"],
        repoUrl: `https://github.com/${githubHandle || "developer"}/AI-Resume-builder`,
        liveUrl: undefined as string | undefined,
        featured: true,
      },
      {
        title: "AI-CONTENT-GENERATOR",
        description: "Multi-modal AI content synthesizer for automated technical articles, docs, and assets.",
        tags: ["CSS", "JavaScript"],
        repoUrl: `https://github.com/${githubHandle || "developer"}/AI-CONTENT-GENERATOR`,
        liveUrl: undefined as string | undefined,
        featured: true,
      },
    ];
  }, [projects, showEmpty, githubHandle]);

  // ---------------------------------------------------------------------------
  // 3. EXPERTISE CARDS: 4 CONNECTED NODES (MATCHING SCREENSHOT 3)
  // ---------------------------------------------------------------------------
  const expertiseNodes = useMemo(() => {
    const topSkills = skillNames.slice(0, 4);
    const defaults = ["HTML", "JavaScript", "TypeScript", "CSS"];
    const merged = topSkills.length >= 4 ? topSkills : [...topSkills, ...defaults.slice(topSkills.length)];

    return merged.slice(0, 4).map((skillName, idx) => {
      const match = displayProjects.find(
        (p) =>
          p.tags?.some((t) => t.toLowerCase() === skillName.toLowerCase()) ||
          p.description?.toLowerCase().includes(skillName.toLowerCase())
      );
      const projectName = match?.title || displayProjects[idx % displayProjects.length]?.title || "Featured-Project";
      const count = idx === 1 ? 2 : 1;

      return {
        num: `0${idx + 1}`,
        skill: skillName,
        desc: `${count} featured project${count > 1 ? "s" : ""}, including ${projectName}.`,
        isHot: idx === 1, // Card 02 is bold hot accent color
      };
    });
  }, [skillNames, displayProjects]);

  // ---------------------------------------------------------------------------
  // 4. TECHNICAL STACK CATEGORIZED GROUPS (MATCHING SCREENSHOT 4)
  // ---------------------------------------------------------------------------
  const techGroups = useMemo(() => {
    const all = skillNames;
    const focus = all.slice(0, 6);

    const frontendKeywords = ["html", "css", "javascript", "typescript", "react", "vue", "svelte", "tailwind", "next"];
    const backendKeywords = ["node", "python", "go", "java", "c#", "express", "sql", "mongo", "api", "ai"];
    const toolingKeywords = ["docker", "dockerfile", "git", "github", "linux", "vite", "webpack", "aws", "ci/cd"];

    const frontend = all.filter((s) => frontendKeywords.some((k) => s.toLowerCase().includes(k)));
    const backend = all.filter((s) => backendKeywords.some((k) => s.toLowerCase().includes(k)));
    const tooling = all.filter((s) => toolingKeywords.some((k) => s.toLowerCase().includes(k)));

    return [
      {
        title: "What I focus on",
        items: focus.length > 0 ? focus : ["HTML", "JavaScript", "TypeScript", "CSS", "Python", "Dockerfile"],
      },
      {
        title: "Frontend",
        items: frontend.length > 0 ? frontend : ["HTML", "JavaScript", "TypeScript", "CSS"],
      },
      {
        title: "Data & AI",
        items: backend.length > 0 ? backend : ["Python"],
      },
      {
        title: "Tooling & infra",
        items: tooling.length > 0 ? tooling : ["Dockerfile"],
      },
    ];
  }, [skillNames]);

  // ---------------------------------------------------------------------------
  // 5. SECTION MAP
  // ---------------------------------------------------------------------------
  const sectionMap: Record<string, ReactNode> = {
    // -------------------------------------------------------------------------
    // HERO: Exact Match to Screenshot 1
    // -------------------------------------------------------------------------
    hero: (
      <section
        key="hero"
        id="top"
        className="spotlight-hero relative text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentDeep} 100%)`,
          minHeight: "100svh",
        }}
      >
        {/* Main grid: left text, right portrait — both visible in one viewport */}
        <div
          className="max-w-[1180px] w-full mx-auto px-5 sm:px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10"
          style={{ minHeight: "100svh", paddingTop: "80px", paddingBottom: "90px", alignItems: "center" }}
        >
          {/* Left: Text */}
          <div className="flex flex-col justify-center gap-5">
            <h1 className="font-extrabold text-[clamp(36px,6.5vw,84px)] leading-[1.03] tracking-[-0.035em]">
              <span className="block text-white">Hi, I&apos;m {firstName.toLowerCase()}</span>
              {headlineLines.line1 && (
                <span className="block text-white mt-1">{headlineLines.line1}</span>
              )}
              {headlineLines.line2 && (
                <span className="block text-white">{headlineLines.line2}</span>
              )}
            </h1>

            <p className="max-w-[460px] text-white/90 text-base sm:text-lg leading-[1.65]">
              {profile?.bio || `Explore ${fullName.toLowerCase()}'s public projects and open-source work.`}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#work"
                className="inline-flex items-center justify-center min-h-[46px] px-7 rounded-full bg-white font-semibold text-sm hover:scale-105 transition-all shadow-md"
                style={{ color: accentColor }}
              >
                View my work
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center min-h-[46px] px-7 rounded-full border-[1.5px] border-white text-white font-semibold text-sm hover:bg-white/10 hover:scale-105 transition-all"
              >
                Contact me
              </a>
            </div>
          </div>

          {/* Right: Portrait — right-aligned, fully visible */}
          <div className="flex items-center justify-center lg:justify-end">
            <div
              className={`relative rounded-[24px] sm:rounded-[32px] border-[6px] sm:border-[10px] border-white overflow-hidden bg-white/10 ${
                showGlowHalo ? "shadow-[0_30px_70px_-20px_rgba(0,0,0,0.45)]" : "shadow-md"
              }`}
              style={{
                width: "min(300px, 44vw)",
                aspectRatio: "4/5",
                marginTop: isLgScreen ? "-330px" : undefined,
                right: isLgScreen ? "80px" : undefined,
                boxShadow: showGlowHalo
                  ? `0 30px 70px -20px rgba(0,0,0,0.45), 0 0 50px ${accentColor}40`
                  : undefined,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/20 text-white/50 font-['Anton'] text-5xl">
                  {firstName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <svg
          className="absolute bottom-[-1px] left-0 right-0 w-full h-[60px] sm:h-[90px] block pointer-events-none z-[4]"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill={colors.waveFill}
            d="M0,60 C240,10 420,10 720,48 C1020,86 1200,86 1440,40 L1440,92 L0,92 Z"
          />
        </svg>
      </section>
    ),

    // -------------------------------------------------------------------------
    // ABOUT: Exact Match to Screenshot 2 (Hanging Sway Tablet + Bio & Pills)
    // -------------------------------------------------------------------------
    about: (
      <section
        key="about"
        id="about"
        className="relative py-24 sm:py-32 px-5 sm:px-8 transition-colors duration-300"
        style={{ backgroundColor: colors.paper, color: colors.ink }}
      >
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
          {/* Left: Hanging Swaying Tablet */}
          <div className="hanging-container relative justify-self-center pt-[60px] select-none">
            {/* Cord & Anchor Nail */}
            <div
              className="absolute left-1/2 top-0 w-[2px] h-[68px] -translate-x-1/2"
              style={{
                background: isDarkMode
                  ? "linear-gradient(to bottom, #888, #444)"
                  : "linear-gradient(to bottom, #bbb, #777)",
              }}
            />
            <div
              className="absolute left-1/2 -top-1 w-3 h-3 rounded-full -translate-x-1/2 shadow-xs"
              style={{ backgroundColor: isDarkMode ? "#666" : "#444" }}
            />

            {/* Tablet with Candidate Photo & Sway Motion */}
            <div
              className="hanging-tablet w-[min(330px,78vw)] aspect-[4/5] p-3 rounded-[32px] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.5)] rotate-[-4deg]"
              style={{
                backgroundColor: isDarkMode ? "#18181b" : "#111111",
                transformOrigin: "50% 0",
                animation: "sway 6s ease-in-out infinite",
                willChange: "transform",
              }}
            >
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-black flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="font-['Anton'] text-6xl text-white/40">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Pill Badge, Title, Bio, Tech Pills & Stats */}
          <div className="space-y-6">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              HELLO!
            </span>

            <h2 className="font-extrabold text-[clamp(34px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em]">
              <span style={{ color: colors.ink }}>A little </span>
              <span style={{ color: accentColor }}>about me</span>
            </h2>

            <p className="text-base sm:text-lg leading-[1.7]" style={{ color: colors.inkMuted }}>
              {profile?.bio || `Explore ${fullName.toLowerCase()}'s public projects and open-source work.`}
            </p>

            {/* Language/Tech Badges with Dots */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {skillNames.slice(0, 8).map((skillName: string, idx: number) => {
                const dotColor = LANG_COLORS[skillName] || accentColor;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs transition-transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.ink,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span>{skillName}</span>
                  </span>
                );
              })}
            </div>

            {/* Location row */}
            {profile?.location && (
              <div
                className="flex items-center gap-6 pt-4 text-sm font-medium"
                style={{ color: colors.inkMuted }}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" style={{ color: accentColor }} />
                  <span>{profile.location}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERTISE: Exact Match to Screenshot 3 (Connected Nodes + Dashed Line)
    // -------------------------------------------------------------------------
    expertise: (
      <section
        key="expertise"
        id="expertise"
        className="relative py-24 sm:py-32 px-5 sm:px-8 transition-colors duration-300 overflow-hidden"
        style={{
          backgroundColor: colors.sectionWhite,
          color: colors.ink,
        }}
      >
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-center">
          {/* Left Title & Description */}
          <div className="space-y-4">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              MY EXPERTISE
            </span>

            <h2 className="font-extrabold text-[clamp(34px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em]">
              <span style={{ color: colors.ink }}>Building modern digital solutions with </span>
              <span style={{ color: accentColor }}>code</span>
            </h2>

            <p className="text-base sm:text-lg leading-[1.6]" style={{ color: colors.inkMuted }}>
              {displayProjects.length > 0
                ? `What ${firstName.toLowerCase()} spends their time on, across ${displayProjects.length} featured project${displayProjects.length === 1 ? "" : "s"}.`
                : `What ${firstName.toLowerCase()} spends their time on, across engineering and open-source projects.`}
            </p>
          </div>

          {/* Right: The 4 Connected Nodes with Dashed Connecting Line */}
          <div className="relative min-h-0 lg:min-h-[460px] flex items-center justify-center p-2 w-full">
            {/* SVG Connecting Dashed Curve - hidden on mobile/tablet to avoid distortion */}
            {showExpertiseTree && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible hidden lg:block"
                aria-hidden="true"
              >
                <path
                  d="M 120 90 C 260 70, 200 240, 290 230 C 340 240, 310 370, 140 370"
                  fill="none"
                  stroke={accentColor}
                  strokeOpacity="0.55"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  style={{ willChange: "stroke-dashoffset" }}
                  className="animate-[dash_18s_linear_infinite]"
                />
              </svg>
            )}

            {/* 4 Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-[540px]">
              {expertiseNodes.map((node) => {
                if (node.isHot) {
                  // Hot Accent Card (Card 02)
                  return (
                    <div
                      key={node.num}
                      className="p-6 rounded-[24px] text-white shadow-xl transition-all hover:scale-105"
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 20px 40px -15px ${accentColor}66`,
                      }}
                    >
                      <span className="block text-xs font-mono font-semibold opacity-85 mb-2">
                        {node.num}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight mb-2">
                        {node.skill}
                      </h3>
                      <p className="text-xs text-white/90 leading-relaxed">
                        {node.desc}
                      </p>
                    </div>
                  );
                }

                // Standard Clean Card (Card 01, 03, 04)
                return (
                  <div
                    key={node.num}
                    className="p-6 rounded-[24px] shadow-sm transition-all hover:shadow-md hover:scale-102"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.ink,
                    }}
                  >
                    <span className="block text-xs font-mono font-semibold mb-2" style={{ color: colors.inkMuted }}>
                      {node.num}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight mb-2" style={{ color: colors.ink }}>
                      {node.skill}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: colors.inkMuted }}>
                      {node.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // TECHNICAL STACK: Exact Match to Screenshot 4 (4 Cards Grid + Pills)
    // -------------------------------------------------------------------------
    skills: (
      <section
        key="skills"
        id="skills"
        className="relative py-24 sm:py-32 px-5 sm:px-8 transition-colors duration-300"
        style={{ backgroundColor: colors.paper, color: colors.ink }}
      >
        <div className="max-w-[1180px] mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              TECHNICAL STACK
            </span>

            <h2 className="font-extrabold text-[clamp(34px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em]">
              <span style={{ color: colors.ink }}>Technologies I </span>
              <span style={{ color: accentColor }}>work with</span>
            </h2>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techGroups.map((group, idx) => (
              <div
                key={idx}
                className="p-6 rounded-[24px] shadow-sm transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.ink,
                }}
              >
                <h3 className="text-base font-bold tracking-tight mb-4" style={{ color: colors.ink }}>
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: colors.pillBg,
                        color: colors.ink,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Next Section Indicator Pill (as seen at bottom of screenshot 4) */}
          <div className="pt-6">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              FEATURED WORK
            </span>
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // FEATURED WORK / PROJECTS
    // -------------------------------------------------------------------------
    projects: (
      <section
        key="projects"
        id="work"
        className="relative py-20 sm:py-28 px-5 sm:px-8 transition-colors duration-300"
        style={{ backgroundColor: colors.sectionWhite, color: colors.ink }}
      >
        <div className="max-w-[1180px] mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-0.035em]">
                <span style={{ color: colors.ink }}>Featured </span>
                <span style={{ color: accentColor }}>Projects</span>
              </h2>
              <p className="text-base mt-2" style={{ color: colors.inkMuted }}>
                Production-grade applications, developer tooling, and open-source repositories.
              </p>
            </div>

            {githubHandle && (
              <SafeLink
                href={`https://github.com/${githubHandle}?tab=repositories`}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: accentColor }}
              >
                <span>View all GitHub repos</span>
                <ChevronRight className="h-4 w-4" />
              </SafeLink>
            )}
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {displayProjects.map((project, idx) => {
              const primaryTag = project.tags?.[0] || "Code";
              const tagColor = LANG_COLORS[primaryTag] || accentColor;

              return (
                <div
                  key={idx}
                  className="group relative p-7 sm:p-8 rounded-[28px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div className="space-y-4">
                    {/* Project Screenshot / Thumbnail (if available) */}
                    {project.imageUrl && (
                      <div className="w-full h-44 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 relative">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold" style={{ color: colors.inkMuted }}>
                        0{idx + 1} / 0{displayProjects.length}
                      </span>
                      <div className="flex items-center gap-2">
                        {project.repoUrl && (
                          <SafeLink
                            href={project.repoUrl}
                            className="p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            style={{ color: colors.ink }}
                            title="GitHub Repository"
                          >
                            <FolderGit2 className="h-4 w-4" />
                          </SafeLink>
                        )}
                        {project.liveUrl && (
                          <SafeLink
                            href={project.liveUrl}
                            className="p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            style={{ color: accentColor }}
                            title="Live Demo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </SafeLink>
                        )}
                      </div>
                    </div>

                    <h3
                      className="text-2xl font-bold tracking-tight transition-colors group-hover:text-[var(--hover-color)]"
                      style={{ color: colors.ink, ["--hover-color" as string]: accentColor }}
                    >
                      {project.title}
                    </h3>

                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: colors.inkMuted }}>
                      {project.description}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between pt-6 mt-6 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.ink }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tagColor }} />
                      <span>{primaryTag}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------------------------------
    experience: (
      <section
        key="experience"
        id="experience"
        className="relative py-20 sm:py-28 px-5 sm:px-8 transition-colors duration-300"
        style={{ backgroundColor: colors.paper, color: colors.ink }}
      >
        <div className="max-w-[900px] mx-auto space-y-12">
          <div>
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              CAREER JOURNEY
            </span>
            <h2 className="font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-0.035em]">
              <span style={{ color: colors.ink }}>Work </span>
              <span style={{ color: accentColor }}>Experience</span>
            </h2>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-10 border-l-2" style={{ borderColor: `${accentColor}40` }}>
            {experience.map((exp: PortfolioExperience, idx: number) => (
              <div key={idx} className="relative group">
                <span
                  className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform group-hover:scale-125"
                  style={{ backgroundColor: accentColor }}
                />

                <div
                  className="p-6 rounded-[22px] shadow-sm transition-all"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="text-xl font-bold tracking-tight" style={{ color: colors.ink }}>
                      {exp.title}
                    </h3>
                    <span className="text-xs font-mono font-semibold" style={{ color: accentColor }}>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>

                  <p className="text-sm font-semibold mb-3" style={{ color: colors.inkMuted }}>
                    {exp.company} {exp.location ? `· ${exp.location}` : ""}
                  </p>

                  {exp.description && (
                    <p className="text-sm leading-relaxed mb-3" style={{ color: colors.inkMuted }}>
                      {exp.description}
                    </p>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 text-xs sm:text-sm" style={{ color: colors.inkMuted }}>
                      {exp.highlights.map((h: string, hIdx: number) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span style={{ color: accentColor }}>▸</span>
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
    ),

    // -------------------------------------------------------------------------
    // EDUCATION & CERTIFICATIONS
    // -------------------------------------------------------------------------
    education: (
      <section
        key="education"
        id="education"
        className="relative py-20 px-5 sm:px-8 transition-colors duration-300"
        style={{ backgroundColor: colors.sectionWhite, color: colors.ink }}
      >
        <div className="max-w-[900px] mx-auto space-y-8">
          <h2 className="font-extrabold text-[clamp(28px,3.5vw,44px)] leading-[1.08] tracking-[-0.035em]">
            <span style={{ color: colors.ink }}>Education &amp; </span>
            <span style={{ color: accentColor }}>Background</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {education.map((edu: PortfolioEducation, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-[22px] shadow-sm"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <span className="text-xs font-mono font-semibold" style={{ color: accentColor }}>
                  {edu.startDate} - {edu.endDate || "Present"}
                </span>
                <h3 className="text-lg font-bold tracking-tight mt-1" style={{ color: colors.ink }}>
                  {edu.degree}
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.inkMuted }}>
                  {edu.institution} {edu.fieldOfStudy ? `· ${edu.fieldOfStudy}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    certifications: (
      <section
        key="certifications"
        id="certifications"
        className="relative py-16 px-5 sm:px-8 transition-colors duration-300"
        style={{ backgroundColor: colors.paper, color: colors.ink }}
      >
        <div className="max-w-[900px] mx-auto space-y-6">
          <h2 className="font-extrabold text-[clamp(24px,3vw,38px)]">
            <span style={{ color: colors.ink }}>Certifications &amp; </span>
            <span style={{ color: accentColor }}>Honors</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certifications.map((c: PortfolioCertification, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-2xl flex items-center gap-4 shadow-xs"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <Award className="h-6 w-6 flex-shrink-0" style={{ color: accentColor }} />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: colors.ink }}>
                    {c.name}
                  </h3>
                  <p className="text-xs" style={{ color: colors.inkMuted }}>
                    {c.issuer} {c.issueDate ? `· ${c.issueDate}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // CONTACT: Exact Match to Screenshot 5 (Giant Watermark + Overlapping Red Card)
    // -------------------------------------------------------------------------
    contact: (
      <section
        key="contact"
        id="contact"
        className="relative min-h-[85vh] sm:min-h-[90vh] py-20 sm:py-36 px-4 sm:px-8 overflow-hidden flex flex-col justify-center items-center select-none"
        style={{ backgroundColor: "#09090b" }}
      >
        {/* Giant Watermark Text (CONTACT on top, Name below) */}
        <div className="absolute inset-0 flex flex-col justify-between items-center pointer-events-none py-6 sm:py-8 z-0 overflow-hidden select-none">
          <span className="font-['Anton'] text-[clamp(44px,14vw,220px)] text-white tracking-tight leading-none opacity-95 text-center px-2">
            CONTACT
          </span>
          <span className="font-['Anton'] text-[clamp(44px,14vw,220px)] text-white tracking-tight leading-none opacity-95 text-center px-2">
            {firstName.toLowerCase()}
          </span>
        </div>

        {/* Center Floating Accent Card */}
        <div
          className="relative z-10 w-full max-w-[620px] p-6 sm:p-12 rounded-[24px] sm:rounded-[36px] text-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)]"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentDark} 100%)`,
          }}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Discuss an opportunity
          </h2>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6 sm:mb-8">
            Open to new roles, collaborations and interesting problems.
          </p>

          {/* Direct Action Pills */}
          <div className="space-y-3">
            {(() => {
              const linkedinLink = socialLinks.find(
                (l: PortfolioSocialLink) =>
                  l.platform?.toLowerCase().includes("linkedin") || l.url?.toLowerCase().includes("linkedin.com")
              );
              const contactUrl = linkedinLink?.url || (contactEmail ? `mailto:${contactEmail}` : (githubHandle ? `https://github.com/${githubHandle}` : "#top"));
              const contactLabel = linkedinLink ? (linkedinLink.label || "LinkedIn") : (contactEmail ? "Email" : "GitHub");

              return (
                <SafeLink
                  href={contactUrl}
                  target={contactUrl.startsWith("mailto:") || contactUrl.startsWith("#") ? undefined : "_blank"}
                  rel="noopener"
                  className="flex items-center justify-between w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/25 hover:bg-black/40 text-white font-semibold text-sm sm:text-base transition-all duration-200 group shadow-md hover:shadow-xl hover:scale-[1.01] border border-white/10 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label={`Connect via ${contactLabel}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span>{contactLabel}</span>
                  </div>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-200 font-bold text-white/90">→</span>
                </SafeLink>
              );
            })()}
          </div>
        </div>
      </section>
    ),
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER TEMPLATE WITH STICKY FROSTED NAV & GLOBAL STYLES
  // ---------------------------------------------------------------------------
  return (
    <div
      className="spotlight-root relative w-full min-h-screen transition-colors duration-300 overflow-x-hidden"
      style={{
        fontFamily: activeFontFamily,
        backgroundColor: colors.paper,
        color: colors.ink,
      }}
    >
      {/* Dynamic Keyframe & Typography Styles */}
      <style>{`
        @keyframes sway {
          0%, 100% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(4deg);
          }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>

      {/* Sticky Navigation Bar */}
      <nav
        aria-label="Primary portfolio navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isNavSolid ? "py-3 shadow-md backdrop-blur-md" : "py-5 sm:py-6"
          }`}
        style={{
          backgroundColor: isNavSolid ? colors.navBg : "transparent",
          borderBottom: isNavSolid ? `1px solid ${colors.border}` : "none",
        }}
      >
        {/* Navbar: logo | centered links | hire-me button */}
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <a
            href="#top"
            className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center"
            style={{ color: isNavSolid ? colors.navInk : "#ffffff" }}
          >
            <span>{firstName.toLowerCase()}</span>
            <span style={{ color: accentColor }}>.</span>
          </a>

          {/* Centered nav links */}
          <div className="hidden sm:flex items-center justify-center gap-6 sm:gap-8 text-sm font-semibold">
            {["about", "expertise", "work", "contact"].map((link) => (
              <a
                key={link}
                href={`#${link}`}
                className="capitalize transition-opacity hover:opacity-100"
                style={{ color: isNavSolid ? colors.inkMuted : "rgba(255,255,255,0.85)" }}
              >
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </a>
            ))}
          </div>

          {/* Hire me button */}
          <a
            href="#contact"
            className="px-5 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all hover:scale-105 shadow-sm whitespace-nowrap"
            style={{
              backgroundColor: isNavSolid
                ? isDarkMode
                  ? "#ffffff"
                  : "#111111"
                : "#ffffff",
              color: isNavSolid
                ? isDarkMode
                  ? "#111111"
                  : "#ffffff"
                : "#111111",
            }}
          >
            Hire me
          </a>
        </div>
      </nav>

      {/* Ordered Section Rendering */}
      <main className="w-full">
        {sectionOrder
          .filter((sec) => !isHidden(sec))
          .map((sec) => (
            <div key={sec}>{sectionMap[sec] || null}</div>
          ))}
      </main>

      {/* Semantic Footer */}
      <footer className="w-full py-8 text-center text-xs opacity-60 font-['Inter']">
        © {new Date().getFullYear()} {fullName}. All rights reserved.
      </footer>

      {/* Back to Top Floating Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full text-white shadow-lg transition-all hover:scale-110"
          style={{ backgroundColor: accentColor }}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
