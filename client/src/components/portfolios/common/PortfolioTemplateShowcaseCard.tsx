/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Bookmark, Crown, Heart, Sparkles } from "lucide-react";
import { PortfolioRenderer } from "@/components/portfolios/PortfolioRenderer";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import { useAuthStore } from "@/stores/auth";
import { usePortfoliosStore } from "@/stores/portfolios";
import type { Portfolio, PortfolioDesignSettings } from "@/types";

export interface ShowcaseTemplateItem {
  id: PortfolioDesignSettings["template"];
  name: string;
  tier: "Premium" | "Pro" | "Free";
  category: "creative" | "technical" | "minimal";
  tags: [string, string, string];
  defaultLikes: number;
  primaryColor: string;
  theme: "light" | "dark";
  description: string;
}

export const SHOWCASE_TEMPLATES: ShowcaseTemplateItem[] = [
  {
    id: "editorial",
    name: "Kinetic Editorial",
    tier: "Premium",
    category: "creative",
    tags: ["Creative", "Portfolio", "Interactive"],
    defaultLikes: 64,
    primaryColor: "#1d4ed8",
    theme: "light",
    description: "Interactive 3D swinging lanyard badge, vector TechText wordmark, 3D paper-fold headings & GSAP drawer.",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    tier: "Premium",
    category: "creative",
    tags: ["Creative", "Portfolio", "Static"],
    defaultLikes: 42,
    primaryColor: "#e3141f",
    theme: "light",
    description: "Crisp architectural grid with connected expertise tree, crimson accents, and featured work.",
  },
  {
    id: "poster",
    name: "Poster",
    tier: "Premium",
    category: "creative",
    tags: ["Creative", "Portfolio", "Static"],
    defaultLikes: 31,
    primaryColor: "#e11d2a",
    theme: "light",
    description: "Brutalist display typography with giant watermark and staggered vibrant gradient project cards.",
  },
  {
    id: "minimal",
    name: "One-Page Résumé",
    tier: "Free",
    category: "minimal",
    tags: ["Recruiter", "Portfolio", "Static"],
    defaultLikes: 18,
    primaryColor: "#2563eb",
    theme: "light",
    description: "Clean single-sheet executive résumé layout with structured metrics and instant print clarity.",
  },
  {
    id: "devport",
    name: "DevPort Cosmic",
    tier: "Pro",
    category: "technical",
    tags: ["Developer", "Portfolio", "Interactive"],
    defaultLikes: 39,
    primaryColor: "#06b6d4",
    theme: "dark",
    description: "Cosmic dark aesthetics with glowing orbital avatar halo, smooth scroll, and interactive tech stack.",
  },
  {
    id: "creative",
    name: "Modern 3D",
    tier: "Pro",
    category: "creative",
    tags: ["Creative", "Portfolio", "Interactive"],
    defaultLikes: 29,
    primaryColor: "#8b5cf6",
    theme: "dark",
    description: "Midnight indigo canvas with electric purple radial glow, glassmorphic cards, and 3D spotlight.",
  },
  {
    id: "developer",
    name: "Terminal CLI",
    tier: "Free",
    category: "technical",
    tags: ["Developer", "Portfolio", "Static"],
    defaultLikes: 24,
    primaryColor: "#10b981",
    theme: "dark",
    description: "Command-line terminal header, syntax-highlighted blocks, and live repository cards.",
  },
];

const SHOWCASE_DEMO_PORTFOLIO: Portfolio = {
  _id: "showcase-demo",
  userId: "showcase-demo",
  title: "The Octocat — Portfolio",
  slug: "the-octocat",
  status: "published",
  profile: {
    fullName: "The Octocat",
    headline: "Principal Systems & Creative Engineer",
    bio: "Building modern digital solutions, distributed cloud architectures, and interactive design systems at scale.",
    email: "octocat@github.com",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com" },
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com" },
    { platform: "twitter", label: "Twitter", url: "https://twitter.com" },
  ],
  skills: [
    { name: "TypeScript", category: "Frontend", level: "expert" },
    { name: "React", category: "Frontend", level: "expert" },
    { name: "Next.js", category: "Frontend", level: "expert" },
    { name: "Node.js", category: "Backend", level: "advanced" },
    { name: "Go", category: "Backend", level: "advanced" },
    { name: "PostgreSQL", category: "Database", level: "advanced" },
    { name: "Docker", category: "DevOps", level: "advanced" },
    { name: "Tailwind CSS", category: "Frontend", level: "expert" },
  ],
  experience: [
    {
      title: "Principal Creative Technologist",
      company: "Studio Octo",
      location: "San Francisco, CA",
      startDate: "2023",
      endDate: "Present",
      current: true,
      description: "Leading architecture and interactive web experiences across cloud-native products and design systems.",
      highlights: [
        "Architected real-time collaborative canvas serving 250k+ monthly creators",
        "Reduced bundle load times by 48% through code-splitting and edge caching",
      ],
    },
    {
      title: "Senior Full-Stack Engineer",
      company: "Vercel & Open Source",
      location: "Remote",
      startDate: "2021",
      endDate: "2023",
      current: false,
      description: "Developed high-throughput APIs, developer tooling, and accessible component libraries.",
      highlights: [
        "Shipped 30+ production UI primitives with 100% WCAG AA compliance",
        "Scaled distributed build pipelines processing 1M+ deployments weekly",
      ],
    },
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "B.S. in Computer Science",
      fieldOfStudy: "Human-Computer Interaction & Systems",
      startDate: "2017",
      endDate: "2021",
    },
  ],
  projects: [
    {
      title: "Spoon-Knife Distributed Engine",
      description: "High-concurrency distributed workflow engine with real-time telemetry and visual node orchestration.",
      tags: ["TypeScript", "React", "Go", "Docker"],
      repoUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Hello-World Design System",
      description: "Multi-brand token engine and interactive WebGL component playground built for modern product teams.",
      tags: ["React", "Three.js", "Tailwind CSS", "GSAP"],
      repoUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Book-Pages Neural Search",
      description: "Semantic vector search and instant documentation indexing powered by edge workers.",
      tags: ["Next.js", "PostgreSQL", "Redis", "AI"],
      repoUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2024",
      url: "https://aws.amazon.com",
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

const DESKTOP_VIEWPORT_WIDTH = 1280;
const DESKTOP_VIEWPORT_HEIGHT = 800;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Computes the list of section stop offsets (in unscaled 1280x800 scroll coordinates)
 * so the preview stops cleanly on each section for 2-3 seconds to showcase its animations.
 */
function getSectionWaypoints(scroller: HTMLElement, currentScale: number): number[] {
  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  if (maxScroll <= 20) return [0];

  const safeScale = currentScale > 0.05 ? currentScale : 0.28;
  const scrollerRect = scroller.getBoundingClientRect();
  const candidates = Array.from(
    scroller.querySelectorAll<HTMLElement>(".editorial-slide, section"),
  );

  const rawOffsets: number[] = [0];
  for (const sec of candidates) {
    const rect = sec.getBoundingClientRect();
    const unscaledTop = scroller.scrollTop + (rect.top - scrollerRect.top) / safeScale;
    const clamped = Math.max(0, Math.min(maxScroll, Math.round(unscaledTop - 24)));
    rawOffsets.push(clamped);
  }

  rawOffsets.sort((a, b) => a - b);

  // Deduplicate waypoints that are too close together (< 260px apart)
  const filtered: number[] = [0];
  for (const offset of rawOffsets) {
    if (offset - filtered[filtered.length - 1] >= 260) {
      filtered.push(offset);
    }
  }

  // If a template has very few <section> tags (e.g., single-sheet resume), step by viewport chunks
  if (filtered.length <= 2 && maxScroll > 350) {
    const stepped: number[] = [0];
    const stepSize = 620;
    for (let pos = stepSize; pos < maxScroll; pos += stepSize) {
      stepped.push(pos);
    }
    if (maxScroll - stepped[stepped.length - 1] > 180) {
      stepped.push(maxScroll);
    } else {
      stepped[stepped.length - 1] = maxScroll;
    }
    return stepped;
  }

  if (maxScroll - filtered[filtered.length - 1] > 220) {
    filtered.push(maxScroll);
  }

  return filtered;
}

function LiveScrollableTemplateViewport({
  template,
}: {
  template: ShowcaseTemplateItem;
}) {
  const user = useAuthStore((state) => state.user);
  const userPortfolios = usePortfoliosStore((state) => state.items);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(0.28);
  const [scale, setScale] = useState(0.28);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const userWheelPauseUntilRef = useRef(0);

  // Measure card screen width to compute exact desktop scale factor
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        const nextScale = w / DESKTOP_VIEWPORT_WIDTH;
        scaleRef.current = nextScale;
        setScale(nextScale);
      }
    };
    updateScale();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateScale);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  // Track visibility so offscreen cards pause their section-by-section tour
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      setHasEnteredView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredView(true);
        }
      },
      { rootMargin: "60px 0px", threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Section-by-section stepped scroll: smooth glide between sections with zero layout thrashing
  useEffect(() => {
    if (!isVisible || !hasEnteredView) return;
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    let rafId = 0;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let currentSectionIndex = 0;
    let isCancelled = false;
    let cachedWaypoints: number[] = [];

    const updateWaypoints = () => {
      if (scroller && !isCancelled) {
        cachedWaypoints = getSectionWaypoints(scroller, scaleRef.current);
      }
    };
    const initialTimer = setTimeout(updateWaypoints, 350);

    const SCROLL_DURATION_MS = 950;

    const startGlide = () => {
      if (isCancelled || !scroller) return;
      if (performance.now() < userWheelPauseUntilRef.current) {
        scheduleNextPause(1500);
        return;
      }

      if (cachedWaypoints.length <= 1) {
        updateWaypoints();
      }

      if (cachedWaypoints.length > 1) {
        currentSectionIndex = (currentSectionIndex + 1) % cachedWaypoints.length;
        const startScrollTop = scroller.scrollTop;
        const targetScrollTop = cachedWaypoints[currentSectionIndex];
        const startTime = performance.now();

        const animateScroll = (now: number) => {
          if (isCancelled || !scroller) return;
          if (now < userWheelPauseUntilRef.current) {
            scheduleNextPause(2000);
            return;
          }

          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / SCROLL_DURATION_MS);
          const eased = easeInOutCubic(t);
          scroller.scrollTop = startScrollTop + (targetScrollTop - startScrollTop) * eased;

          if (t < 1) {
            rafId = requestAnimationFrame(animateScroll);
          } else {
            scroller.scrollTop = targetScrollTop;
            const pauseDuration = Math.round(1400 + Math.random() * 1600);
            scheduleNextPause(pauseDuration);
          }
        };

        rafId = requestAnimationFrame(animateScroll);
      } else {
        scheduleNextPause(2500);
      }
    };

    const scheduleNextPause = (delayMs: number) => {
      if (isCancelled) return;
      timerId = setTimeout(startGlide, delayMs);
    };

    // Begin tour after initial settling pause
    scheduleNextPause(1600);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimer);
      clearTimeout(timerId);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible, hasEnteredView]);

  const previewPortfolio = useMemo<Portfolio>(() => {
    const portfolioWithAvatar = userPortfolios.find((p) => p.profile?.avatarUrl);
    const resolvedFullName =
      user?.name?.trim() ||
      userPortfolios[0]?.profile?.fullName?.trim() ||
      SHOWCASE_DEMO_PORTFOLIO.profile.fullName;
    const rawAvatar =
      user?.avatar ||
      portfolioWithAvatar?.profile?.avatarUrl ||
      SHOWCASE_DEMO_PORTFOLIO.profile.avatarUrl;
    const resolvedAvatarUrl = rawAvatar
      ? normalizeAvatarUrl(rawAvatar)
      : SHOWCASE_DEMO_PORTFOLIO.profile.avatarUrl;
    const resolvedHeadline =
      user?.targetJobTitle?.trim() ||
      userPortfolios[0]?.profile?.headline?.trim() ||
      SHOWCASE_DEMO_PORTFOLIO.profile.headline;

    return {
      ...SHOWCASE_DEMO_PORTFOLIO,
      title: `${resolvedFullName} — Portfolio`,
      profile: {
        ...SHOWCASE_DEMO_PORTFOLIO.profile,
        fullName: resolvedFullName,
        avatarUrl: resolvedAvatarUrl,
        headline: resolvedHeadline,
        email: user?.email || SHOWCASE_DEMO_PORTFOLIO.profile.email,
        phone: user?.phone || SHOWCASE_DEMO_PORTFOLIO.profile.phone,
        location: user?.location || SHOWCASE_DEMO_PORTFOLIO.profile.location,
      },
      design: {
        ...SHOWCASE_DEMO_PORTFOLIO.design,
        template: template.id,
        theme: template.theme,
        primaryColor: template.primaryColor,
      },
    };
  }, [template.id, template.theme, template.primaryColor, user, userPortfolios]);

  return (
    <div
      ref={frameRef}
      onWheel={() => {
        // Pause auto-tour briefly when user manually scrolls the live portfolio with mousewheel/touchpad
        userWheelPauseUntilRef.current = performance.now() + 3000;
      }}
      className="relative h-full w-full overflow-hidden bg-neutral-950"
    >
      {!hasEnteredView ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-900/60 p-6 text-neutral-500 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-neutral-800" />
          <div className="h-3.5 w-28 rounded-md bg-neutral-800" />
          <div className="h-2.5 w-40 rounded-md bg-neutral-800/60" />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          style={{
            width: `${DESKTOP_VIEWPORT_WIDTH}px`,
            height: `${DESKTOP_VIEWPORT_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="overflow-y-auto overflow-x-hidden select-none [&::-webkit-scrollbar]:hidden"
        >
          <PortfolioRenderer
            portfolio={previewPortfolio}
            overrideTemplate={template.id}
            showEmpty={true}
            previewMode="thumbnail"
          />
        </div>
      )}
    </div>
  );
}

export interface PortfolioTemplateShowcaseCardProps {
  template: ShowcaseTemplateItem;
  liked: boolean;
  likeCount: number;
  bookmarked: boolean;
  onToggleLike: (id: PortfolioDesignSettings["template"]) => void;
  onToggleBookmark: (id: PortfolioDesignSettings["template"]) => void;
  onUseTemplate: (id: PortfolioDesignSettings["template"]) => void;
}

export const PortfolioTemplateShowcaseCard: React.FC<PortfolioTemplateShowcaseCardProps> = ({
  template,
  liked,
  likeCount,
  bookmarked,
  onToggleLike,
  onToggleBookmark,
  onUseTemplate,
}) => {
  const isPremium = template.tier === "Premium";

  return (
    <div className="group flex flex-col gap-3 [content-visibility:auto] [contain-intrinsic-size:0_450px]">
      {/* GitSkins-style Frame: Black border ONLY on top and bottom (py-3 px-0), edge-to-edge horizontally */}
      <div className="relative aspect-[16/10] w-full rounded-[22px] bg-[#0c0c0e] py-3 px-0 shadow-md border border-black/15 dark:border-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl overflow-hidden">
        <LiveScrollableTemplateViewport template={template} />

        {/* Floating "Preview experience" Pill Button on Bottom-Right */}
        <Link
          to={`/portfolio-templates/${template.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-5 right-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-neutral-700/85 hover:bg-neutral-950 text-white backdrop-blur-md px-4 py-2 text-xs font-medium shadow-lg ring-1 ring-white/15 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <span>Preview experience</span>
        </Link>
      </div>

      {/* Metadata Below Frame (Exact GitSkins structure) */}
      <div className="flex flex-col gap-2.5 px-0.5">
        {/* Title Row: Arrow + Template Name + Premium/Pro/Free Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => onUseTemplate(template.id)}
              className="text-base font-medium tracking-tight text-foreground hover:text-primary transition-colors truncate text-left cursor-pointer"
            >
              {template.name}
            </button>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium shrink-0 ${
                isPremium
                  ? "bg-amber-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-400 font-semibold"
                  : "bg-muted/80 border border-border/60 text-muted-foreground"
              }`}
            >
              {isPremium && <Crown className="h-3 w-3 text-amber-500" aria-hidden />}
              {template.tier}
            </span>
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted/45 border border-border/50 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom Actions Row: Like Counter, Bookmark, and Use Template CTA */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleLike(template.id)}
              aria-label={`Like ${template.name}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                liked
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} aria-hidden />
              <span>{likeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(template.id)}
              aria-label={`Bookmark ${template.name}`}
              className={`inline-flex items-center justify-center rounded-full border p-1.5 text-xs transition-colors cursor-pointer ${
                bookmarked
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current" : ""}`} aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onUseTemplate(template.id)}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 px-3 py-1 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            <span>Use template</span>
          </button>
        </div>
      </div>
    </div>
  );
};
