import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  Check,
  Crown,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Loader2,
  MousePointerClick,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useInView } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import sampleResume from "@/templates/sampleResume.json";
import type { Portfolio, PortfolioTemplateId } from "@/types/portfolio";

// Code-split real renderers so initial page bundle remains ultra-lightweight (Zero TBT penalty)
const PortfolioRenderer = lazy(() =>
  import("@/components/portfolios/PortfolioRenderer").then((m) => ({ default: m.PortfolioRenderer }))
);
const ResumePreview = lazy(() =>
  import("@/components/resumes/ResumePreview").then((m) => ({ default: m.ResumePreview }))
);

interface TemplateCard {
  id: string;
  name: string;
  category: "portfolio" | "resume";
  badge: string;
  isPremium?: boolean;
  desc: string;
  previewUrl: string;
  accentColor: string;
  accent: string;
  portfolioTemplateId?: PortfolioTemplateId;
  primaryColor?: string;
  theme?: "light" | "dark";
  resumeId?: string;
}

// Exactly matches the real portfolio data for Sunil Kumar with 4 real projects
const DEMO_PORTFOLIO: Portfolio = {
  _id: "demo",
  userId: "demo",
  title: "sunil kumar — Portfolio",
  slug: "sunilkumar25kush",
  status: "published",
  profile: {
    fullName: "sunil kumar",
    headline: "HTML and JavaScript developer",
    bio: "Explore sunil kumar's public projects and open-source work.",
    email: "sunilkumar@example.com",
    location: "India",
    avatarUrl: "https://avatars.githubusercontent.com/sunilkumar25kush",
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com/sunilkumar25kush" },
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/sunil-kumar-9042aa373/?isSelfProfile=true" },
  ],
  skills: [
    { name: "JavaScript", category: "Frontend", level: "advanced" },
    { name: "HTML5", category: "Frontend", level: "expert" },
    { name: "CSS3", category: "Frontend", level: "advanced" },
    { name: "React", category: "Frontend", level: "intermediate" },
    { name: "TypeScript", category: "Frontend", level: "intermediate" },
    { name: "Git", category: "Tooling", level: "advanced" },
  ],
  experience: [
    {
      title: "Frontend Developer",
      company: "Independent & Open Source",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      current: true,
      description: "Building modern responsive web experiences, interactive 3D portfolios, and UI components.",
      highlights: [
        "Crafted high-performance portfolio templates matching world-class standards",
        "Engineered smooth SVG bezier web diagrams and responsive layouts",
      ],
    },
  ],
  education: [
    {
      institution: "University",
      degree: "Bachelor of Technology",
      fieldOfStudy: "Computer Science",
      startDate: "2021",
      endDate: "2025",
    },
  ],
  projects: [
    {
      title: "AI-Resume-builder",
      description: "Full-stack AI resume and portfolio engine with ATS keyword optimization and dynamic templates.",
      tags: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
      repoUrl: "https://github.com/sunilkumar25kush/AI-Resume-builder",
      liveUrl: "https://github.com/sunilkumar25kush/AI-Resume-builder",
      featured: true,
    },
    {
      title: "Interactive Web Experiences",
      description: "Collection of kinetic typography, brutalist poster layouts, and canvas animations.",
      tags: ["JavaScript", "CSS3", "WebGL"],
      repoUrl: "https://github.com/sunilkumar25kush",
      liveUrl: "https://github.com/sunilkumar25kush",
      featured: true,
    },
    {
      title: "AI-Interviewer",
      description: "Automated technical mock interview platform with real-time feedback and speech recognition.",
      tags: ["Python", "FastAPI", "Next.js", "WebRTC"],
      repoUrl: "https://github.com/sunilkumar25kush/AI-Interviewer",
      liveUrl: "https://github.com/sunilkumar25kush",
      featured: true,
    },
    {
      title: "Realtime Code Judge",
      description: "Isolated Docker container execution sandbox evaluating untrusted code submissions across multiple languages.",
      tags: ["Go", "Docker", "Redis", "React"],
      repoUrl: "https://github.com/sunilkumar25kush/code-judge",
      liveUrl: "https://github.com/sunilkumar25kush",
      featured: true,
    },
  ],
  design: {
    template: "spotlight",
    theme: "light",
    primaryColor: "#e3141f",
    fontFamily: "Inter",
  },
  publication: {
    isPublic: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const templates: TemplateCard[] = [
  // 6 Developer Portfolios
  {
    id: "spotlight",
    name: "Spotlight Obsidian",
    category: "portfolio",
    badge: "PREMIUM ★",
    isPremium: true,
    desc: "Obsidian & crimson aesthetic with avatar halo, dynamic typewriter, connected expertise tree, and featured project spotlight.",
    previewUrl: "/portfolio-templates/spotlight",
    accentColor: "#e3141f",
    accent: "Crimson Halo",
    portfolioTemplateId: "spotlight",
    primaryColor: "#e3141f",
    theme: "light",
  },
  {
    id: "poster",
    name: "Poster Brutalist",
    category: "portfolio",
    badge: "PREMIUM ★",
    isPremium: true,
    desc: "High-contrast brutalist monochrome typography, giant watermark, infinite marquee ticker band, and 3D tilted print poster.",
    previewUrl: "/portfolio-templates/poster",
    accentColor: "#e3141f",
    accent: "Brutalist Print",
    portfolioTemplateId: "poster",
    primaryColor: "#e3141f",
    theme: "light",
  },
  {
    id: "devport",
    name: "DevPort Cosmic",
    category: "portfolio",
    badge: "Featured",
    desc: "Deep space aesthetic with orbital avatar frames, interactive code terminal, and tech stack skill rings.",
    previewUrl: "/portfolio-templates/devport",
    accentColor: "#06B6D4",
    accent: "Cyan Terminal",
    portfolioTemplateId: "devport",
    primaryColor: "#06B6D4",
    theme: "dark",
  },
  {
    id: "creative",
    name: "Modern 3D Interactive",
    category: "portfolio",
    badge: "Interactive",
    desc: "Clean glassmorphic cards with smooth entrance motion, floating metric badges, and interactive contact modal.",
    previewUrl: "/portfolio-templates/creative",
    accentColor: "#8B5CF6",
    accent: "Violet Glow",
    portfolioTemplateId: "creative",
    primaryColor: "#8B5CF6",
    theme: "dark",
  },
  {
    id: "minimal",
    name: "Clean Minimalist",
    category: "portfolio",
    badge: "Fastest Load",
    desc: "Editorial layout with high density information architecture, clean typography, and zero layout clutter.",
    previewUrl: "/portfolio-templates/minimal",
    accentColor: "#10B981",
    accent: "Emerald Pure",
    portfolioTemplateId: "minimal",
    primaryColor: "#10B981",
    theme: "light",
  },
  {
    id: "developer",
    name: "Engineering Terminal",
    category: "portfolio",
    badge: "Developer",
    desc: "Command line interface styling with monospace data tables, commit heatmaps, and repository cards.",
    previewUrl: "/portfolio-templates/developer",
    accentColor: "#F59E0B",
    accent: "Terminal Amber",
    portfolioTemplateId: "developer",
    primaryColor: "#F59E0B",
    theme: "dark",
  },

  // 6 Real Resume Templates (Exact matches to TemplatePicker T3, T1, T4, T8, T2, T5)
  {
    id: "classic-ats-executive",
    name: "Classic ATS Executive",
    category: "resume",
    badge: "T3",
    desc: "Monochrome serif with small-caps name, 3-column skills bullet grid, 1.5px divider, and maximum ATS safety.",
    previewUrl: "/wizard?template=classic-ats-executive",
    accentColor: "#000000",
    accent: "T3 • Classic ATS",
    resumeId: "classic-ats-executive",
  },
  {
    id: "classic-rose-serif",
    name: "Classic Rose Serif",
    category: "resume",
    badge: "T1",
    desc: "Centered serif typography with crimson accent (#C2185B), justified summary, and full-width wrapped skills line.",
    previewUrl: "/wizard?template=classic-rose-serif",
    accentColor: "#C2185B",
    accent: "T1 • Rose Crimson",
    resumeId: "classic-rose-serif",
  },
  {
    id: "photo-header-split-timeline",
    name: "Photo Header, Split Timeline",
    category: "resume",
    badge: "T4",
    desc: "140x140 photo header, Montserrat name, and 2-column split experience (Left date/company, Right role/bullets).",
    previewUrl: "/wizard?template=photo-header-split-timeline",
    accentColor: "#222222",
    accent: "T4 • Photo Header",
    resumeId: "photo-header-split-timeline",
  },
  {
    id: "compact-fresher-ats",
    name: "Compact Fresher ATS",
    category: "resume",
    badge: "T8",
    desc: "Arial, black & white, ultra-compact; education and projects placed before experience, one-line skills rows.",
    previewUrl: "/wizard?template=compact-fresher-ats",
    accentColor: "#000000",
    accent: "T8 • Compact Fresher",
    resumeId: "compact-fresher-ats",
  },
  {
    id: "navy-sidebar-timeline",
    name: "Navy Sidebar Timeline",
    category: "resume",
    badge: "T2",
    desc: "Two-column layout (33/67) with dark navy sidebar (#2B3450), 140px photo, white badges, and work timeline.",
    previewUrl: "/wizard?template=navy-sidebar-timeline",
    accentColor: "#2B3450",
    accent: "T2 • Navy Sidebar",
    resumeId: "navy-sidebar-timeline",
  },
  {
    id: "elegant-serif-gold",
    name: "Elegant Serif Gold",
    category: "resume",
    badge: "T10",
    desc: "Centered Playfair Display name, gold divider (#B08D57), headings with side lines (— Experience —), Lora body.",
    previewUrl: "/wizard?template=elegant-serif-gold",
    accentColor: "#B08D57",
    accent: "T10 • Elegant Gold",
    resumeId: "elegant-serif-gold",
  },
];

export function LandingShowcase() {
  const [tab, setTab] = useState<"portfolio" | "resume">("portfolio");
  const [activeId, setActiveId] = useState<string>("spotlight");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "200px 0px" });

  const filtered = templates.filter((t) => t.category === tab);
  const activeTemplate = templates.find((t) => t.id === activeId && t.category === tab) || filtered[0];

  // When switching tabs, select the first template of that category and reset interaction
  const handleTabChange = (newTab: "portfolio" | "resume") => {
    setTab(newTab);
    setIsInteracting(false);
    const firstOfTab = templates.find((t) => t.category === newTab);
    if (firstOfTab) {
      setActiveId(firstOfTab.id);
    }
    // Reset scroll to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Performance optimized auto-cycle: Only runs when in viewport and not interacting
  useEffect(() => {
    if (!isInView || isPaused || isInteracting) return;

    const interval = setInterval(() => {
      setActiveId((currentId) => {
        const currentFiltered = templates.filter((t) => t.category === tab);
        const currentIndex = currentFiltered.findIndex((t) => t.id === currentId);
        const nextIndex = (currentIndex + 1) % currentFiltered.length;
        return currentFiltered[nextIndex].id;
      });
      // Reset scroll when template automatically changes
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isInView, isPaused, isInteracting, tab]);

  // Reset scroll position when switching templates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeId]);

  // Pressing Escape exits interactive mode to let user scroll main landing page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isInteracting) {
        setIsInteracting(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInteracting]);

  // Smooth scroll to a section inside the portfolio preview
  const handleScrollToSection = (sectionId: string) => {
    setIsPaused(true);
    if (!scrollContainerRef.current) return;
    const target = scrollContainerRef.current.querySelector(`#${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Construct active preview portfolio
  const activePortfolioPayload: Portfolio = {
    ...DEMO_PORTFOLIO,
    design: {
      ...DEMO_PORTFOLIO.design,
      template: (activeTemplate.portfolioTemplateId || "spotlight") as PortfolioTemplateId,
      theme: activeTemplate.theme || "light",
      primaryColor: activeTemplate.primaryColor || "#e3141f",
      fontFamily: "Inter",
    },
  };

  return (
    <section
      id="templates"
      ref={containerRef}
      className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20"
    >
      {/* Section Header */}
      <div className="max-w-[680px] mx-auto text-center mb-10 sm:mb-14">
        <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold block mb-3">
          Design System & Live Showcase
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground [text-wrap:balance]">
          Live preview gallery with full developer templates
        </h2>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground [text-wrap:pretty]">
          Explore running previews of our 6 developer portfolio websites and 6 ATS resume designs.
          Click into the preview frame to interact, test links, or jump between sections.
        </p>

        {/* Category Switcher Tabs */}
        <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border/80">
          <button
            type="button"
            onClick={() => handleTabChange("portfolio")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === "portfolio"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-4 w-4 text-primary" />
            <span>Developer Portfolios (6)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("resume")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === "resume"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4 text-primary" />
            <span>Resume Templates (6)</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Preview Frame (Theater Device Window) */}
      <div
        className="mb-12 rounded-3xl border border-border/90 bg-card dark:bg-[#151515] p-3 sm:p-5 shadow-2xl relative overflow-hidden ring-1 ring-border/50"
      >
        {/* Device Window Chrome Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 px-1 border-b border-border/70 text-xs">
          {/* Window Buttons & Address Pill */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-3 w-3 rounded-full bg-red-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/80 border border-border/60 text-muted-foreground font-mono text-[11px] truncate max-w-[220px] sm:max-w-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">
                {tab === "portfolio"
                  ? `resumebuddy.app/p/${activeTemplate.id}`
                  : `resumebuddy.app/r/${activeTemplate.resumeId}`}
              </span>
            </div>

            <Badge variant="outline" className="hidden lg:inline-flex text-[10px] font-mono uppercase tracking-wider py-0.5 px-2">
              {tab === "portfolio" ? "Portfolio Preview" : `Resume ${activeTemplate.badge} Preview`}
            </Badge>
          </div>

          {/* Quick Info & Action Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] font-mono font-medium text-foreground hidden md:inline">
              Viewing: <strong className="text-primary">{activeTemplate.name}</strong>
            </span>

            {activeTemplate.isPremium && (
              <Badge className="bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-mono text-[11px] px-2 py-0.5">
                <Crown className="h-3 w-3" />
                <span>PREMIUM ★</span>
              </Badge>
            )}

            {/* Resume-only 100% Zoom Indicator */}
            {tab === "resume" && (
              <Badge variant="outline" className="text-[11px] font-mono py-0.5 px-2.5 bg-muted/50 border-border/80 text-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                <span>100% Crisp Zoom</span>
              </Badge>
            )}

            {/* Auto Cycle Pause / Play */}
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? "Resume auto cycle" : "Pause auto cycle"}
              className="px-2.5 py-1 rounded-lg border border-border bg-background dark:bg-[#1E1E1E] text-muted-foreground hover:text-foreground text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              <span>{isPaused ? "Play" : "Pause"}</span>
            </button>

            {/* Primary Action Button */}
            <Button
              asChild
              size="sm"
              className="h-7 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-xs"
            >
              <a
                href={activeTemplate.previewUrl}
                target={activeTemplate.category === "portfolio" ? "_blank" : undefined}
                rel={activeTemplate.category === "portfolio" ? "noopener noreferrer" : undefined}
                className="flex items-center gap-1.5"
              >
                <span>{tab === "portfolio" ? "Open Full Site" : "Use Template"}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Sub-bar: Portfolio Section Jump Navigation & Scroll Protection Status */}
        <div className="py-2 px-3 bg-muted/40 border-b border-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-mono">
          {tab === "portfolio" ? (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1 mr-1">
                <Sparkles className="h-3 w-3" /> Jump:
              </span>
              {["about", "projects", "skills", "experience", "contact"].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleScrollToSection(sec)}
                  className="px-2 py-0.5 rounded-md bg-background/80 hover:bg-background border border-border/60 text-foreground text-[11px] font-medium transition-colors cursor-pointer capitalize shadow-2xs hover:border-primary/40 shrink-0"
                >
                  {sec}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="px-2 py-0.5 rounded-md bg-muted hover:bg-background text-muted-foreground hover:text-foreground text-[11px] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                title="Scroll back to top"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Top</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: activeTemplate.accentColor }} />
              <span>Full A4 ATS Template • {activeTemplate.name} ({activeTemplate.badge}) • 100% Zoom</span>
            </div>
          )}

          {/* Interactive State Feedback Indicator */}
          <div className="flex items-center gap-2">
            {isInteracting ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Inner Scroll Active (Esc to lock)</span>
              </span>
            ) : (
              <span className="text-muted-foreground hidden sm:inline text-[11px]">
                Page scroll protected • Click window to scroll inside
              </span>
            )}
          </div>
        </div>

        {/* Live Theater Display Area (Scroll Protected & Isolated) */}
        <div
          ref={scrollContainerRef}
          onClick={() => {
            if (!isInteracting) {
              setIsInteracting(true);
              setIsPaused(true);
            }
          }}
          className={`mt-3 relative w-full h-[540px] sm:h-[620px] rounded-2xl bg-background border border-border/80 scrollbar-thin scroll-smooth [contain:paint] transform-gpu transition-all ${
            isInteracting ? "overflow-y-auto" : "overflow-hidden cursor-pointer"
          }`}
        >
          {/* Scroll Protection Overlay (Appears when not in active interact mode) */}
          {!isInteracting && (
            <div
              className="absolute inset-0 z-30 flex items-end justify-center pb-6 sm:pb-8 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity pointer-events-auto"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInteracting(true);
                  setIsPaused(true);
                }}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-xl flex items-center gap-2.5 hover:opacity-95 active:scale-95 transition-all cursor-pointer ring-4 ring-primary/20"
              >
                <MousePointerClick className="h-4 w-4 animate-bounce" />
                <span>Click to scroll & explore 100% zoom preview</span>
              </button>
            </div>
          )}

          {/* Floating Exit Button when inner scroll is active */}
          {isInteracting && (
            <div className="sticky bottom-4 right-4 z-30 flex justify-end px-4 pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInteracting(false);
                }}
                className="pointer-events-auto px-4 py-2 rounded-xl bg-background/95 dark:bg-[#1E1E1E]/95 border border-border shadow-xl backdrop-blur-md text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>Done (Resume page scroll)</span>
              </button>
            </div>
          )}

          {/* Template Content */}
          {tab === "portfolio" ? (
            <Suspense fallback={<PreviewLoadingState />}>
              <PortfolioRenderer
                portfolio={activePortfolioPayload}
                showEmpty={true}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<PreviewLoadingState />}>
              <div className="w-full min-h-full flex justify-center items-start p-4 sm:p-8 bg-muted/20">
                <div className="w-full max-w-[794px] shadow-2xl rounded-sm overflow-hidden bg-white">
                  <ResumePreview
                    data={sampleResume}
                    template={activeTemplate.resumeId}
                    scale={1}
                  />
                </div>
              </div>
            </Suspense>
          )}
        </div>

        {/* Template Selector Rail (Clickable Pills) */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono text-muted-foreground shrink-0 mr-1">
            Active Template:
          </span>
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveId(item.id);
                setIsPaused(true);
                setIsInteracting(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTemplate.id === item.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs ring-2 ring-primary/30"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              <span className="font-mono text-[10px] font-bold px-1 rounded bg-muted/80 text-foreground">
                {item.badge}
              </span>
              <span>{item.name}</span>
              {item.isPremium && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-black">
                  PREMIUM
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 6 Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => {
              setActiveId(tpl.id);
              setIsPaused(true);
              setIsInteracting(false);
              window.scrollTo({
                top: (containerRef.current?.offsetTop || 400) + 80,
                behavior: "smooth",
              });
            }}
            className={`rounded-3xl border bg-card dark:bg-[#151515] p-6 flex flex-col justify-between gap-5 transition-all shadow-xs cursor-pointer group ${
              activeTemplate.id === tpl.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-border/80 hover:border-primary/40"
            }`}
          >
            <div className="space-y-3.5">
              {/* Solid Accent Indicator Bar & Badge */}
              <div className="flex items-center justify-between">
                <div
                  className="h-1.5 w-12 rounded-full"
                  style={{ backgroundColor: tpl.accentColor }}
                />
                {tpl.isPremium ? (
                  <Badge className="bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30 font-mono text-[10px] px-2 py-0.5 flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    <span>PREMIUM ★</span>
                  </Badge>
                ) : (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/60">
                    {tpl.badge}
                  </span>
                )}
              </div>

              <div className="pt-1">
                <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <span>{tpl.name}</span>
                  {activeTemplate.id === tpl.id && (
                    <span className="text-[10px] font-mono font-normal text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                      Active
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed [text-wrap:pretty]">
                  {tpl.desc}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full inline-block"
                  style={{ backgroundColor: tpl.accentColor }}
                />
                <span>{tpl.accent}</span>
              </span>

              <a
                href={tpl.previewUrl}
                target={tpl.category === "portfolio" ? "_blank" : undefined}
                rel={tpl.category === "portfolio" ? "noopener noreferrer" : undefined}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/25 shadow-2xs transition-all active:scale-95"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{tpl.category === "portfolio" ? "Live Preview" : "Use Template"}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviewLoadingState() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-xs font-mono">Compiling live template preview...</span>
    </div>
  );
}
