import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowUp,
  ExternalLink,
  FolderGit2,
  Mail,
  Phone,
  MapPin,
  Star,
  Sparkles,
  Award,
} from "lucide-react";
import type {
  Portfolio,
  PortfolioExperience,
  PortfolioEducation,
  PortfolioProject,
  PortfolioSkill,
  PortfolioSocialLink,
} from "@/types/portfolio";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import { TechIcon } from "@/components/portfolios/common/TechIcon";

export interface EditorialTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

function SafeLink({
  href,
  children,
  className = "",
  style = {},
  title,
  target = "_blank",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  target?: string;
}) {
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  return (
    <a
      href={href}
      target={isExternal ? target : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={className}
      style={style}
      title={title}
    >
      {children}
    </a>
  );
}

export function EditorialTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = [
    "hero",
    "about",
    "experience",
    "education",
    "projects",
    "skills",
    "testimonials",
    "contact",
  ],
  hiddenSections = [],
}: EditorialTemplateProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeExpIdx, setActiveExpIdx] = useState(0);

  const profile = portfolio?.profile;
  const skills = portfolio?.skills || [];
  const experience = portfolio?.experience || [];
  const education = portfolio?.education || [];
  const projects = portfolio?.projects || [];
  const socialLinks = portfolio?.socialLinks || [];
  const design = portfolio?.design;

  // Color scheme: Signature Crimson Red & Warm Creamy Linen Paper
  const primaryColor =
    !design?.primaryColor || design.primaryColor === "#2563eb"
      ? "#8B151B"
      : design.primaryColor;
  const isDarkMode = design?.theme === "dark";

  const colors = useMemo(() => {
    if (isDarkMode) {
      return {
        paper: "#140A0C",
        paperCard: "#1D1013",
        paperBorder: "rgba(255, 255, 255, 0.08)",
        ink: "#FAF5EF",
        inkMuted: "#B8AAA8",
        crimsonBg: primaryColor,
        crimsonText: "#FFFFFF",
        cardBg: "#221316",
        badgeBg: "rgba(255, 255, 255, 0.06)",
        badgeText: "#FAF5EF",
      };
    }
    return {
      paper: "#FAF5EF",
      paperCard: "#FFFFFF",
      paperBorder: "rgba(139, 21, 27, 0.12)",
      ink: "#1C1818",
      inkMuted: "#6B5E5E",
      crimsonBg: primaryColor,
      crimsonText: "#FFFFFF",
      cardBg: "#FAF5EF",
      badgeBg: "rgba(139, 21, 27, 0.08)",
      badgeText: primaryColor,
    };
  }, [isDarkMode, primaryColor]);

  // Candidate Details
  const fullName = profile?.fullName || (showEmpty ? "Joanne Alexander" : "Creative Developer");
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Creative";
  const lastName = nameParts.slice(1).join(" ") || "ALEXANDER";
  const headline = profile?.headline || (showEmpty ? "Creative Strategist & Designer" : "Full Stack Software Engineer");
  const avatarUrl = profile?.avatarUrl ? normalizeAvatarUrl(profile.avatarUrl) : null;
  const bio =
    profile?.bio ||
    (showEmpty
      ? "I'm a creative professional passionate about transforming ideas into intuitive, highly aesthetic, and visually compelling digital experiences."
      : "Accomplished developer architecting modern web experiences, high-throughput systems, and design-led digital products.");
  const email = profile?.email || (showEmpty ? "hello@reallygreatsite.com" : "");
  const phone = profile?.phone || (showEmpty ? "+123-456-7890" : "");
  const location = profile?.location || (showEmpty ? "New York, USA" : "");

  // Fallback Skills (deduplicated, high-profile technologies)
  const displaySkills: PortfolioSkill[] = useMemo(() => {
    if (skills && skills.length > 0) return skills;
    return [
      { name: "React", category: "Languages & Frontend", level: "expert" },
      { name: "TypeScript", category: "Languages & Frontend", level: "expert" },
      { name: "JavaScript", category: "Languages & Frontend", level: "expert" },
      { name: "Node.js", category: "Backend & Systems", level: "advanced" },
      { name: "Express.js", category: "Backend & Systems", level: "advanced" },
      { name: "MongoDB", category: "Databases & Cloud", level: "advanced" },
      { name: "PostgreSQL", category: "Databases & Cloud", level: "advanced" },
      { name: "Tailwind CSS", category: "Languages & Frontend", level: "expert" },
      { name: "Docker", category: "DevOps & Tools", level: "intermediate" },
    ];
  }, [skills]);

  // Fallback Experience
  const displayExp: PortfolioExperience[] = useMemo(() => {
    if (experience && experience.length > 0) return experience;
    return [
      {
        company: "Studio Vanguard",
        title: "Lead Creative Strategist",
        startDate: "2023",
        current: true,
        description: "Directing multi-disciplinary squads shipping brand systems, digital flagships, and accessible product experiences across global markets.",
        highlights: [
          "500+ Digital Screens Designed and validated with end users",
          "Scaled multiple brand transformations from startup to enterprise",
          "Engineered end-to-end design systems reducing time-to-market by 40%",
          "Championed user-centered design frameworks across cross-functional squads",
        ],
      },
      {
        company: "InnoTech Collective",
        title: "Senior Product Designer",
        startDate: "2021",
        endDate: "2023",
        description: "Led core UI/UX redesigns and component token architecture for cloud enterprise platforms.",
        highlights: [
          "Boosted user task completion rates by 28% via streamlined interaction flows",
          "Mentored 10+ junior designers in design system maintenance and rapid prototyping",
        ],
      },
    ];
  }, [experience]);

  // Fallback Education
  const displayEdu: PortfolioEducation[] = useMemo(() => {
    if (education && education.length > 0) return education;
    return [
      {
        institution: "Metropolitan Institute of Technology",
        degree: "Bachelor of Information Systems",
        fieldOfStudy: "Human Computer Interaction",
        startDate: "2021",
        endDate: "2025",
        description: "Built a solid foundation in technology systems thinking, architecture, and human-centered digital product development.",
      },
      {
        institution: "Interaction Design Foundation",
        degree: "UX Design Professional Certificate",
        startDate: "2023",
        endDate: "2023",
        description: "Completed rigorous training in UX design and user research methodologies.",
      },
      {
        institution: "Civic Academy of Arts",
        degree: "Senior High School Diploma",
        startDate: "2019",
        endDate: "2021",
        description: "Graduated with honors in visual arts, media communications, and digital foundations.",
      },
    ];
  }, [education]);

  // Fallback Projects (3 Individual Showcases matching Slides 6, 7, 8)
  const displayProjects: PortfolioProject[] = useMemo(() => {
    if (projects && projects.length > 0) return projects;
    return [
      {
        title: "Interactive Web Experiences",
        description: "My first project marked the beginning of my design journey, where I explored kinetic typography, problem-solving, and digital product design.",
        tags: ["Creative Direction", "Typography", "WebGL", "React"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      },
      {
        title: "AI Resume & Portfolio Engine",
        description: "A milestone project that introduced me to the fundamentals of systems design, automated tokenization, and creative algorithmic thinking.",
        tags: ["Systems Design", "TypeScript", "Tailwind CSS", "Next.js"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80",
      },
      {
        title: "Realtime Distributed Judge",
        description: "The project that introduced me to high-concurrency systems, real-world design challenges, and performant developer interfaces.",
        tags: ["Full Stack", "Docker", "Go", "Redis"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      },
    ];
  }, [projects]);

  // Client Testimonials matching Slide 9
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "VP of Product",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      stars: 5,
      quote: "Professional, creative, and remarkably easy to work with. Highly recommended for any high-stakes digital initiative.",
    },
    {
      name: "Michael Chen",
      role: "Engineering Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      stars: 5,
      quote: "A talented designer and developer who consistently delivers high-quality work on tight deadlines with zero drama.",
    },
    {
      name: "David Wilson",
      role: "Design Lead",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      stars: 5,
      quote: "The user experience improved significantly after the redesign. Incredible attention to typography, spacing, and micro-interactions.",
    },
    {
      name: "Sophia Lee",
      role: "Founder & CEO",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      stars: 5,
      quote: "Reliable, efficient, and always focused on creating authentic value for users. Our conversion metrics jumped 35%.",
    },
  ];

  // Scroll progress (works inside nested scroll containers like the editor preview)
  useEffect(() => {
    const handleScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const total = Math.max(rect.height - viewH, 1);
      const progressed = Math.min(Math.max(-rect.top / total, 0), 1);
      setScrollProgress(progressed);
      setShowScrollTop(-rect.top > 400);
    };
    handleScroll();
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Scroll-reveal for slides + active section tracking for the floating nav
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const slides = Array.from(root.querySelectorAll<HTMLElement>(".editorial-slide"));

    if (typeof IntersectionObserver === "undefined") {
      slides.forEach((s) => s.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).id || (entry.target.closest("[id]") as HTMLElement | null)?.id;
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.5 },
    );

    slides.forEach((s) => {
      revealObserver.observe(s);
      activeObserver.observe(s);
    });

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [sectionOrder, hiddenSections, displayProjects.length]);

  // Cursor-follow spotlight + parallax variables on the hovered slide
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const slide = (e.target as HTMLElement).closest<HTMLElement>(".editorial-slide");
    if (!slide) return;
    const rect = slide.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    slide.style.setProperty("--mx", `${x}px`);
    slide.style.setProperty("--my", `${y}px`);
    slide.style.setProperty("--px", `${(x / rect.width - 0.5).toFixed(3)}`);
    slide.style.setProperty("--py", `${(y / rect.height - 0.5).toFixed(3)}`);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const isHidden = (sec: string) => hiddenSections.includes(sec);

  // ---------------------------------------------------------------------------
  // SECTION MAP (Every slide implemented with pixel-accurate layout)
  // ---------------------------------------------------------------------------
  const sectionMap: Record<string, React.ReactNode> = {
    // -------------------------------------------------------------------------
    // SLIDE 01: HERO COVER (Deep Crimson, Script "Creative", Giant "PORTFOLIO", Portrait)
    // -------------------------------------------------------------------------
    hero: (
      <section
        key="hero"
        id="hero"
        className="editorial-slide ed-crimson ed-hero relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 sm:p-12 text-white select-none transition-all duration-300"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Subtle Linen Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.06)_0px,rgba(0,0,0,0.06)_1px,transparent_1px,transparent_4px)] pointer-events-none" />
        {/* Animated light sweep + drifting glow orbs */}
        <div className="ed-sheen absolute inset-0 pointer-events-none" />
        <div className="ed-orb ed-orb-a absolute pointer-events-none" />
        <div className="ed-orb ed-orb-b absolute pointer-events-none" />

        {/* Top Eyebrow: Script "Creative" */}
        <div className="relative z-10 w-full text-center pt-2">
          <span className="font-['Caveat',cursive] text-3xl sm:text-4xl lg:text-5xl tracking-wide opacity-95 text-[#FAF5EF]">
            Creative
          </span>
        </div>

        {/* Center: Giant Condensed "PORTFOLIO" with overlapping Cutout Portrait */}
        <div className="relative z-10 my-auto w-full flex items-center justify-center">
          {/* Giant Word — staggered letter reveal + counter-parallax */}
          <h1
            aria-label="Portfolio"
            className="ed-hero-title font-['Bebas_Neue','Anton',sans-serif] text-[clamp(68px,17vw,220px)] leading-[0.84] uppercase tracking-normal text-white text-center w-full select-none"
          >
            {"PORTFOLIO".split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="ed-letter"
                style={{ animationDelay: `${120 + i * 70}ms` }}
              >
                {ch}
              </span>
            ))}
          </h1>

          {/* Overlapping Cutout Portrait in Center */}
          <div className="ed-hero-portrait absolute inset-x-0 bottom-[-15%] sm:bottom-[-20%] flex justify-center pointer-events-none z-20">
            <div className="ed-float relative w-[min(54vw,280px)] sm:w-[min(32vw,360px)] aspect-[3/4] flex items-end justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full rounded-t-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
                  <span className="font-['Bebas_Neue',sans-serif] text-7xl text-white">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-['Caveat',cursive] text-2xl text-white/80 mt-2">
                    {headline}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Name Left, Headline Right, Quick Jump */}
        <div className="relative z-20 w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/20 text-xs sm:text-sm font-['Plus_Jakarta_Sans',sans-serif]">
          <span className="font-medium tracking-widest uppercase text-white/90">
            {fullName}
          </span>
          <div className="flex items-center gap-3">
            <a
              href="#about"
              className="px-4 py-1.5 rounded-full bg-white text-neutral-900 font-bold hover:bg-neutral-100 transition-transform active:scale-95 text-xs shadow-md"
              style={{ color: primaryColor }}
            >
              Explore Deck ↓
            </a>
          </div>
          <span className="font-medium tracking-widest uppercase text-white/90 text-right">
            {headline}
          </span>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SLIDE 02: ABOUT ME (Creamy Linen, Slide 02, Left Cutout, Right Joanne ALEXANDER & Core Expertise)
    // -------------------------------------------------------------------------
    about: (
      <section
        key="about"
        id="about"
        className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.paperBorder,
          color: colors.ink,
        }}
      >
        {/* Top Header Row: ABOUT ME + Slide Index 02 */}
        <div className="flex items-start justify-between w-full">
          <h2
            className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0"
            style={{ color: primaryColor }}
          >
            ABOUT ME
          </h2>
          <span className="font-mono text-xs sm:text-sm font-semibold opacity-60">
            02
          </span>
        </div>

        {/* Main Content: Left Portrait | Right Info & Expertise */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center my-auto">
          {/* Left Column: Portrait */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-[min(65vw,260px)] sm:w-[min(26vw,300px)] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-neutral-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover filter contrast-105"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="font-['Bebas_Neue',sans-serif] text-6xl">
                    {firstName.slice(0, 1)}
                  </span>
                  <span className="font-['Caveat',cursive] text-xl mt-1">Portrait</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Name & Expertise */}
          <div className="md:col-span-7 space-y-4 sm:space-y-5 text-left">
            <div>
              <p
                className="font-['Caveat',cursive] font-bold text-3xl sm:text-4xl m-0 leading-none"
                style={{ color: primaryColor }}
              >
                {firstName}
              </p>
              <h3
                className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(36px,5.5vw,72px)] leading-[0.9] uppercase tracking-normal m-0 mt-1"
                style={{ color: primaryColor }}
              >
                {lastName}
              </h3>
            </div>

            <p
              className="text-sm sm:text-base leading-relaxed font-normal max-w-[48ch]"
              style={{ color: colors.inkMuted }}
            >
              {bio}
            </p>

            {/* Core Expertise Bullet List with Red Dots */}
            <div className="pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider mb-2.5 text-[#1C1818] dark:text-[#FAF5EF]">
                Core Expertise:
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm font-medium">
                {displaySkills.slice(0, 4).map((sk, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span>{typeof sk === "string" ? sk : sk.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Location & Social Pill */}
        <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-black/10 dark:border-white/10 font-mono">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color: primaryColor }} />
            <span>{location || "Available Worldwide"}</span>
          </span>
          <span className="opacity-60">{headline}</span>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SLIDE 03: MY EXPERIENCES (Creamy Linen, Slide 03, Left Text & Bullets, Right Framed Work Photo)
    // -------------------------------------------------------------------------
    experience: (
      <section
        key="experience"
        id="experience"
        className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.paperBorder,
          color: colors.ink,
        }}
      >
        {/* Top Header: My EXPERIENCES + Slide 03 */}
        <div className="flex items-start justify-between w-full">
          <div>
            <p
              className="font-['Caveat',cursive] font-bold text-2xl sm:text-3xl m-0 leading-none"
              style={{ color: primaryColor }}
            >
              My
            </p>
            <h2
              className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0"
              style={{ color: primaryColor }}
            >
              EXPERIENCES
            </h2>
          </div>
          <span className="font-mono text-xs sm:text-sm font-semibold opacity-60">
            03
          </span>
        </div>

        {/* Content: Left Info & Bullets | Right Workplace / Portrait Photo */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center my-auto">
          {/* Left Column: Role Details & Quantitative Highlights */}
          <div className="md:col-span-7 space-y-4 text-left">
            {displayExp.length > 1 && (
              <div className="flex gap-2 pb-1 overflow-x-auto">
                {displayExp.map((exp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveExpIdx(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
                      activeExpIdx === idx
                        ? "text-white shadow-xs"
                        : "bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400"
                    }`}
                    style={activeExpIdx === idx ? { backgroundColor: primaryColor } : {}}
                  >
                    {exp.company}
                  </button>
                ))}
              </div>
            )}

            {displayExp[activeExpIdx] && (
              <>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                    {displayExp[activeExpIdx].title}
                  </h3>
                  <p className="font-mono text-xs font-medium opacity-75">
                    {displayExp[activeExpIdx].company} • {displayExp[activeExpIdx].startDate} —{" "}
                    {displayExp[activeExpIdx].current ? "Present" : displayExp[activeExpIdx].endDate}
                  </p>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                  {displayExp[activeExpIdx].description}
                </p>

                {displayExp[activeExpIdx].highlights && (
                  <ul className="space-y-1.5 text-xs sm:text-sm font-medium pt-1">
                    {displayExp[activeExpIdx].highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0 mt-1.5"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Right Column: Editorial Framed Image */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-[min(65vw,260px)] sm:w-[min(26vw,300px)] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-neutral-900">
              <img
                src={
                  avatarUrl ||
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                }
                alt={fullName}
                className="w-full h-full object-cover filter contrast-105 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-mono flex items-center justify-between">
                <span>Production Experience</span>
                <span className="font-bold" style={{ color: "#F59E0B" }}>★ Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-black/10 dark:border-white/10 font-mono">
          <span>End-to-End Delivery Experience</span>
          <span className="opacity-60">Selected Work History</span>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SLIDE 04: MY EDUCATION (Creamy Linen, Slide 04, Cutout on Crimson Arch, Right Timeline Capsules)
    // -------------------------------------------------------------------------
    education: (
      <section
        key="education"
        id="education"
        className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.paperBorder,
          color: colors.ink,
        }}
      >
        {/* Top Header: My EDUCATION + Slide 04 */}
        <div className="flex items-start justify-between w-full">
          <div>
            <p
              className="font-['Caveat',cursive] font-bold text-2xl sm:text-3xl m-0 leading-none"
              style={{ color: primaryColor }}
            >
              My
            </p>
            <h2
              className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0"
              style={{ color: primaryColor }}
            >
              EDUCATION
            </h2>
          </div>
          <span className="font-mono text-xs sm:text-sm font-semibold opacity-60">
            04
          </span>
        </div>

        {/* Center: Cutout Portrait Over Crimson Geometric Arch | Right Timeline Capsules */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center my-auto">
          {/* Left/Center Column: Signature Red Geometric Arch with Portrait Cutout */}
          <div className="md:col-span-5 flex items-end justify-center relative pt-8">
            {/* The Crimson Arch (Half-Circle) Backdrop exactly like Slide 04 */}
            <div
              className="w-48 sm:w-60 h-44 sm:h-52 rounded-t-full shadow-lg relative flex items-end justify-center overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover object-top filter contrast-105"
                />
              ) : (
                <div className="text-white text-center pb-4">
                  <Award className="h-12 w-12 mx-auto opacity-90 mb-1" />
                  <span className="font-['Bebas_Neue',sans-serif] text-2xl tracking-wider">ACADEMIC</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timeline Badges in Rounded Capsules */}
          <div className="md:col-span-7 space-y-4 sm:space-y-5 text-left">
            {displayEdu.map((edu, idx) => (
              <div key={idx} className="space-y-1">
                {/* Year Capsule Badge matching Slide 04: ( 2021 - 2025 ) */}
                <div className="inline-block">
                  <span
                    className="font-mono text-[11px] font-bold px-3 py-0.5 rounded-full border tracking-wider"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                      backgroundColor: "rgba(139, 21, 27, 0.05)",
                    }}
                  >
                    ( {edu.startDate || "2021"} — {edu.endDate || "Present"} )
                  </span>
                </div>

                {/* Degree Title in Bold Crimson Red */}
                <h3
                  className="font-bold text-sm sm:text-base leading-snug m-0"
                  style={{ color: primaryColor }}
                >
                  {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                </h3>

                {/* Institution & Description */}
                <p className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200 m-0">
                  {edu.institution}
                </p>
                {edu.description && (
                  <p
                    className="text-xs leading-relaxed max-w-[48ch]"
                    style={{ color: colors.inkMuted }}
                  >
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-black/10 dark:border-white/10 font-mono">
          <span>Continuous Learning & Certification</span>
          <span className="opacity-60">Academic Credentials</span>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SLIDE 05: SAMPLE PROJECTS DIVIDER (Deep Crimson, Script "Sample", Giant White "PROJECTS", Tilted Polaroids)
    // -------------------------------------------------------------------------
    projects: (
      <div key="projects" id="projects" className="space-y-12 w-full">
        {/* Cover Slide (Slide 05) */}
        <section
          className="editorial-slide relative w-full aspect-[16/10] min-h-[540px] max-h-[780px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 sm:p-12 text-white select-none transition-all duration-300"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Subtle Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/35 pointer-events-none" />

          {/* Top Script Eyebrow */}
          <div className="relative z-10 w-full text-left">
            <span className="font-['Caveat',cursive] text-3xl sm:text-4xl text-[#FAF5EF]">
              Sample
            </span>
          </div>

          {/* Center Giant Word: PROJECTS + Floating Polaroids */}
          <div className="relative z-10 my-auto w-full flex items-center justify-center">
            {/* Tilted Floating Polaroid 1 on Left */}
            <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 -rotate-12 polaroid-card z-20 cursor-pointer animate-[editorialSway_6s_ease-in-out_infinite]">
              <div className="p-2 pb-5 bg-white rounded-md shadow-2xl w-44">
                <img
                  src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80"
                  alt="Snapshot 1"
                  className="w-full aspect-[4/3] object-cover rounded-xs"
                />
                <p className="font-['Caveat',cursive] text-xs text-neutral-800 text-center mt-2 m-0 font-bold">
                  Prototype Design
                </p>
              </div>
            </div>

            {/* Giant Title */}
            <h2 className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(64px,16vw,200px)] leading-[0.85] uppercase tracking-normal text-white text-center select-none">
              PROJECTS
            </h2>

            {/* Tilted Floating Polaroid 2 on Right */}
            <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 rotate-12 polaroid-card z-20 cursor-pointer animate-[editorialSwayReverse_7s_ease-in-out_infinite]">
              <div className="p-2 pb-5 bg-white rounded-md shadow-2xl w-44">
                <img
                  src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400&auto=format&fit=crop&q=80"
                  alt="Snapshot 2"
                  className="w-full aspect-[4/3] object-cover rounded-xs"
                />
                <p className="font-['Caveat',cursive] text-xs text-neutral-800 text-center mt-2 m-0 font-bold">
                  Design Systems
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="relative z-10 w-full flex items-center justify-between text-xs sm:text-sm font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/20 pt-4">
            <span className="uppercase tracking-widest text-white/90 font-mono">
              Selected Showcase
            </span>
            <span className="font-mono text-white/90">
              {displayProjects.length} Key Projects
            </span>
          </div>
        </section>

        {/* Slide 06: First PROJECT (Split Left Info, Right 2x2 Image Collage) */}
        {displayProjects[0] && (
          <section
            className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
            style={{
              backgroundColor: colors.paper,
              borderColor: colors.paperBorder,
              color: colors.ink,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full">
              {/* Left Column: Script "First" + Giant red "PROJECT" + Info & Links */}
              <div className="md:col-span-5 space-y-4 text-left">
                <div>
                  <p
                    className="font-['Caveat',cursive] font-bold text-3xl sm:text-4xl m-0 leading-none"
                    style={{ color: primaryColor }}
                  >
                    First
                  </p>
                  <h3
                    className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,6.5vw,84px)] leading-[0.88] uppercase tracking-normal m-0"
                    style={{ color: primaryColor }}
                  >
                    PROJECT
                  </h3>
                </div>

                <h4 className="font-bold text-lg text-[#1C1818] dark:text-[#FAF5EF]">
                  {displayProjects[0].title}
                </h4>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                  {displayProjects[0].description}
                </p>

                {/* Tags */}
                {displayProjects[0].tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {displayProjects[0].tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border"
                        style={{
                          backgroundColor: colors.badgeBg,
                          borderColor: colors.paperBorder,
                          color: primaryColor,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Links */}
                <div className="flex items-center gap-3 pt-3">
                  {displayProjects[0].liveUrl && (
                    <SafeLink
                      href={displayProjects[0].liveUrl}
                      className="px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </SafeLink>
                  )}
                  {displayProjects[0].repoUrl && (
                    <SafeLink
                      href={displayProjects[0].repoUrl}
                      className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                      <FolderGit2 className="h-3.5 w-3.5" />
                      <span>Code Repo</span>
                    </SafeLink>
                  )}
                </div>
              </div>

              {/* Right Column: 2x2 Collage Grid matching Slide 06 */}
              <div className="md:col-span-7 grid grid-cols-2 gap-3 h-[min(65vw,420px)] sm:h-[400px]">
                <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <img
                    src={
                      displayProjects[0].imageUrl ||
                      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80"
                    }
                    alt="Mockup 1"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&auto=format&fit=crop&q=80"
                    alt="Mockup 2"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1542744094-3a31727560fa?w=600&auto=format&fit=crop&q=80"
                    alt="Mockup 3"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white bg-neutral-900 flex items-center justify-center p-4 text-center">
                  <div className="text-white space-y-1">
                    <Sparkles className="h-6 w-6 mx-auto text-amber-400" />
                    <p className="font-['Bebas_Neue',sans-serif] text-xl tracking-wider">FEATURED</p>
                    <p className="text-[11px] font-mono opacity-70">Design Sprint 01</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 07: Second PROJECT (Top 3 Image Cards, Bottom Script "Second" + "PROJECT" & Text) */}
        {displayProjects[1] && (
          <section
            className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
            style={{
              backgroundColor: colors.paper,
              borderColor: colors.paperBorder,
              color: colors.ink,
            }}
          >
            {/* Top: 3 Side-by-Side Image Cards matching Slide 07 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full h-[220px] sm:h-[260px]">
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src={
                    displayProjects[1].imageUrl ||
                    "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&auto=format&fit=crop&q=80"
                  }
                  alt="P2 - 1"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"
                  alt="P2 - 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
                  alt="P2 - 3"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Bottom: Script "Second" + "PROJECT" Left | Description & Links Right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-6 border-t border-black/10 dark:border-white/10">
              <div className="md:col-span-5 text-left">
                <p
                  className="font-['Caveat',cursive] font-bold text-3xl sm:text-4xl m-0 leading-none"
                  style={{ color: primaryColor }}
                >
                  Second
                </p>
                <h3
                  className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,6.5vw,84px)] leading-[0.88] uppercase tracking-normal m-0"
                  style={{ color: primaryColor }}
                >
                  PROJECT
                </h3>
                <h4 className="font-bold text-base text-[#1C1818] dark:text-[#FAF5EF] mt-1">
                  {displayProjects[1].title}
                </h4>
              </div>

              <div className="md:col-span-7 space-y-3 text-left">
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                  {displayProjects[1].description}
                </p>
                <div className="flex items-center gap-3">
                  {displayProjects[1].liveUrl && (
                    <SafeLink
                      href={displayProjects[1].liveUrl}
                      className="px-4 py-1.5 rounded-full text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>Explore Live</span>
                      <ExternalLink className="h-3 w-3" />
                    </SafeLink>
                  )}
                  {displayProjects[1].repoUrl && (
                    <SafeLink
                      href={displayProjects[1].repoUrl}
                      className="px-4 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                      <FolderGit2 className="h-3 w-3" />
                      <span>Source</span>
                    </SafeLink>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 08: Third PROJECT & Additional Repos */}
        {displayProjects[2] && (
          <section
            className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
            style={{
              backgroundColor: colors.paper,
              borderColor: colors.paperBorder,
              color: colors.ink,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
              {/* Left Column: Texture / Collage */}
              <div className="md:col-span-4 rounded-2xl overflow-hidden shadow-lg border-2 border-white h-[320px]">
                <img
                  src="https://images.unsplash.com/photo-1542744094-3a31727560fa?w=600&auto=format&fit=crop&q=80"
                  alt="Process Collage"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Center Column: Script "Third" + "PROJECT" */}
              <div className="md:col-span-4 text-center space-y-3 px-2">
                <p
                  className="font-['Caveat',cursive] font-bold text-3xl sm:text-4xl m-0 leading-none"
                  style={{ color: primaryColor }}
                >
                  Third
                </p>
                <h3
                  className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,6.5vw,84px)] leading-[0.88] uppercase tracking-normal m-0"
                  style={{ color: primaryColor }}
                >
                  PROJECT
                </h3>
                <h4 className="font-bold text-base text-[#1C1818] dark:text-[#FAF5EF]">
                  {displayProjects[2].title}
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                  {displayProjects[2].description}
                </p>
                {displayProjects[2].liveUrl && (
                  <SafeLink
                    href={displayProjects[2].liveUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-semibold text-xs shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>View Project</span>
                    <ExternalLink className="h-3 w-3" />
                  </SafeLink>
                )}
              </div>

              {/* Right Column: Stacked Image Cards */}
              <div className="md:col-span-4 space-y-3">
                <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white h-[155px]">
                  <img
                    src={
                      displayProjects[2].imageUrl ||
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"
                    }
                    alt="P3 - 1"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white h-[155px]">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80"
                    alt="P3 - 2"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    ),

    // -------------------------------------------------------------------------
    // CERTIFICATIONS: Editorial Verified Credentials Slide
    // -------------------------------------------------------------------------
    certifications: (
      <section
        key="certifications"
        id="certifications"
        className="editorial-slide relative w-full aspect-[16/10] min-h-[540px] max-h-[780px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.paperBorder,
          color: colors.ink,
        }}
      >
        <div className="flex items-start justify-between w-full">
          <div>
            <p className="font-['Caveat',cursive] text-2xl sm:text-3xl text-neutral-800 dark:text-neutral-200 m-0 leading-none">
              Verified
            </p>
            <h2
              className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0"
              style={{ color: primaryColor }}
            >
              CERTIFICATIONS
            </h2>
          </div>
          <span className="font-mono text-xs sm:text-sm font-semibold opacity-60">
            07
          </span>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-auto">
          {(portfolio?.certifications || []).length > 0 ? (
            portfolio.certifications!.map((cert, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border shadow-xs transition-transform hover:-translate-y-1 space-y-2"
                style={{
                  backgroundColor: colors.paperCard,
                  borderColor: colors.paperBorder,
                }}
              >
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 shrink-0" style={{ color: primaryColor }} />
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2">
                    {cert.name}
                  </span>
                </div>
                <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  {cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ""}
                </p>
                {cert.url && (
                  <SafeLink
                    href={cert.url}
                    className="inline-flex items-center gap-1 text-xs font-semibold hover:underline pt-1"
                    style={{ color: primaryColor }}
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="h-3 w-3" />
                  </SafeLink>
                )}
              </div>
            ))
          ) : (
            <div
              className="p-5 rounded-2xl border shadow-xs space-y-2"
              style={{
                backgroundColor: colors.paperCard,
                borderColor: colors.paperBorder,
              }}
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 shrink-0" style={{ color: primaryColor }} />
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  AWS Certified Solutions Architect
                </span>
              </div>
              <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                Amazon Web Services • 2023
              </p>
            </div>
          )}
        </div>

        <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-black/10 dark:border-white/10 font-mono">
          <span>Official Industry Credentials</span>
          <span className="opacity-60">Verified Standards</span>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SKILLS SECTION: Editorial Pill Badges & Level Bars
    // -------------------------------------------------------------------------
    skills: (
      <section
        key="skills"
        id="skills"
        className="editorial-slide relative w-full aspect-[16/10] min-h-[540px] max-h-[780px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.paperBorder,
          color: colors.ink,
        }}
      >
        <div className="flex items-start justify-between w-full">
          <div>
            <p
              className="font-['Caveat',cursive] font-bold text-2xl sm:text-3xl m-0 leading-none"
              style={{ color: primaryColor }}
            >
              Specialized
            </p>
            <h2
              className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0"
              style={{ color: primaryColor }}
            >
              TECHNICAL SKILLS
            </h2>
          </div>
          <span className="font-mono text-xs sm:text-sm font-semibold opacity-60">
            08
          </span>
        </div>

        {/* Skills Grid with Tech Brand SVGs and High-Contrast Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-auto">
          {displaySkills.map((sk, idx) => (
            <div
              key={idx}
              className="skill-card p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between"
              style={{
                backgroundColor: colors.paperCard,
                borderColor: colors.paperBorder,
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(139, 21, 27, 0.06)",
                      borderColor: "rgba(139, 21, 27, 0.15)",
                      color: primaryColor,
                    }}
                  >
                    <TechIcon name={typeof sk === "string" ? sk : sk.name} size={16} />
                  </div>
                  <span className="font-bold text-sm sm:text-base truncate text-[#1C1818] dark:text-[#FAF5EF]">
                    {typeof sk === "string" ? sk : sk.name}
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 border"
                  style={{
                    backgroundColor: "rgba(139, 21, 27, 0.06)",
                    borderColor: "rgba(139, 21, 27, 0.12)",
                    color: primaryColor,
                  }}
                >
                  {typeof sk === "string" ? "Skill" : sk.category || "Skill"}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    backgroundColor: primaryColor,
                    width:
                      typeof sk !== "string" && sk.level === "expert"
                        ? "95%"
                        : typeof sk !== "string" && sk.level === "advanced"
                        ? "86%"
                        : "74%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-black/10 dark:border-white/10 font-mono">
          <span>Continuous Skill Validation</span>
          <span className="opacity-60">{displaySkills.length} Technologies Mastered</span>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SLIDE 09: OUR CLIENT SAY (Slide 09, 4 Crimson Cards with 5 Stars & Quotes)
    // -------------------------------------------------------------------------
    testimonials: (
      <section
        key="testimonials"
        id="testimonials"
        className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.paperBorder,
          color: colors.ink,
        }}
      >
        {/* Top Header: Our CLIENT SAY + Slide 09 */}
        <div className="flex items-start justify-between w-full">
          <div>
            <p
              className="font-['Caveat',cursive] font-bold text-2xl sm:text-3xl m-0 leading-none"
              style={{ color: primaryColor }}
            >
              Our
            </p>
            <h2
              className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0"
              style={{ color: primaryColor }}
            >
              CLIENT SAY
            </h2>
          </div>
          <span className="font-mono text-xs sm:text-sm font-semibold opacity-60">
            09
          </span>
        </div>

        {/* 4 Crimson Red Testimonial Cards matching Slide 09 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl shadow-xl flex flex-col justify-between text-white space-y-3 transition-transform hover:-translate-y-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              {/* Reviewer Header: Avatar & Name */}
              <div className="flex items-center gap-2.5">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/40"
                />
                <div className="text-left overflow-hidden">
                  <h4 className="font-bold text-xs truncate leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-white/70 truncate m-0">{item.role}</p>
                </div>
              </div>

              {/* 5 Stars */}
              <div className="flex text-amber-300 gap-0.5 text-xs">
                {Array.from({ length: item.stars }).map((_, sIdx) => (
                  <Star key={sIdx} className="h-3 w-3 fill-amber-300 text-amber-300" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-xs leading-relaxed italic text-white/90 line-clamp-4 text-left">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-black/10 dark:border-white/10 font-mono">
          <span>Client Testimonials & Feedback</span>
          <span className="opacity-60">100% Satisfaction Rate</span>
        </div>
      </section>
    ),

    // -------------------------------------------------------------------------
    // SLIDE 10: THANK YOU / LET'S CONNECT (Deep Crimson, Portrait Left, Giant THANK YOU Right, Contact Pills)
    // -------------------------------------------------------------------------
    contact: (
      <section
        key="contact"
        id="contact"
        className="editorial-slide relative w-full aspect-[16/10] min-h-[580px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between text-white select-none transition-all duration-300"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/35 pointer-events-none" />

        {/* Center: Cutout Portrait Left | Giant THANK YOU & Contact Pills Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto relative z-10 w-full">
          {/* Left Column: Portrait Cutout matching Slide 10 */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-[min(65vw,260px)] sm:w-[min(26vw,320px)] aspect-[3/4] flex items-end justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center p-6 shadow-2xl">
                  <span className="font-['Bebas_Neue',sans-serif] text-7xl text-white">
                    {firstName.slice(0, 1)}
                  </span>
                  <span className="font-['Caveat',cursive] text-2xl text-white/80 mt-2">
                    Let&apos;s Connect
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Script "let's Connect" + Giant "THANK YOU" + Contact Pills */}
          <div className="md:col-span-7 space-y-4 sm:space-y-6 text-left">
            <div>
              <p className="font-['Caveat',cursive] text-3xl sm:text-4xl text-[#FAF5EF] m-0 leading-none">
                let&apos;s Connect
              </p>
              <h2 className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(56px,10vw,130px)] leading-[0.85] uppercase tracking-normal m-0 text-white">
                THANK YOU
              </h2>
            </div>

            {/* Contact Pills matching Slide 10 */}
            <div className="space-y-2.5 max-w-md">
              {phone && (
                <SafeLink
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs sm:text-sm font-mono transition-all backdrop-blur-md shadow-lg"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{phone}</span>
                </SafeLink>
              )}

              {email && (
                <SafeLink
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs sm:text-sm font-mono transition-all backdrop-blur-md shadow-lg"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{email}</span>
                </SafeLink>
              )}
            </div>

            {/* Social Link Pills */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                  <SafeLink
                    key={idx}
                    href={link.url}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-neutral-900 text-xs font-mono font-medium border border-white/20 transition-all shadow-xs"
                  >
                    {link.platform || "Link"}
                  </SafeLink>
                ))}
              </div>
            )}

            <p className="text-xs sm:text-sm font-['Caveat',cursive] text-white/80 pt-1 text-lg">
              Let&apos;s create something meaningful together.
            </p>
          </div>
        </div>

        {/* Bottom Footer Credits */}
        <div className="relative z-10 w-full flex items-center justify-between text-xs border-t border-white/20 pt-3 font-mono opacity-80">
          <span>© {new Date().getFullYear()} {fullName}. All rights reserved.</span>
          <span>Editorial Portfolio Edition</span>
        </div>
      </section>
    ),
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handlePointerMove}
      className="editorial-root relative w-full min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-10 space-y-10 sm:space-y-16"
      style={{
        backgroundColor: colors.paper,
        color: colors.ink,
      }}
    >
      {/* Import Google Fonts and Keyframe Animation Engine */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .editorial-slide {
          opacity: 0;
          transform: translateY(30px) scale(0.985);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }

        .editorial-slide.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        @keyframes editorialSway {
          0%, 100% {
            transform: translateY(-50%) rotate(-12deg) translateY(0);
          }
          50% {
            transform: translateY(-50%) rotate(-10deg) translateY(-8px);
          }
        }

        @keyframes editorialSwayReverse {
          0%, 100% {
            transform: translateY(-50%) rotate(12deg) translateY(0);
          }
          50% {
            transform: translateY(-50%) rotate(10deg) translateY(-8px);
          }
        }

        .polaroid-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }

        .polaroid-card:hover {
          transform: translateY(-50%) rotate(0deg) scale(1.06) !important;
          box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.45);
          z-index: 30;
        }

        .skill-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .skill-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px -8px rgba(139, 21, 27, 0.18);
          border-color: rgba(139, 21, 27, 0.4) !important;
        }
      `}</style>

      {/* Floating Presentation Deck Navigation Bar with Bulletproof Contrast */}
      <header className="sticky top-4 z-40 max-w-4xl mx-auto rounded-full px-5 py-2.5 bg-[#1C1818]/95 backdrop-blur-xl border border-white/15 text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
        {/* Subtle reading progress meter across the bottom of the floating header */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 pointer-events-none">
          <div
            className="h-full transition-all duration-150 ease-out"
            style={{
              width: `${Math.round(scrollProgress * 100)}%`,
              backgroundColor: primaryColor,
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-['Caveat',cursive] text-2xl font-bold text-[#F59E0B]">
            {firstName}
          </span>
          <span className="font-['Bebas_Neue',sans-serif] tracking-widest text-xs opacity-75 text-white">
            DECK
          </span>
        </div>

        {/* Quick Section Anchors */}
        <nav className="hidden sm:flex items-center gap-5 text-xs font-mono uppercase tracking-wider text-[#FAF5EF]/80">
          {["hero", "about", "experience", "education", "projects", "skills", "testimonials", "contact"]
            .filter((sec) => !isHidden(sec))
            .map((sec) => (
              <a
                key={sec}
                href={`#${sec}`}
                className={`transition-colors capitalize ${
                  activeSection === sec
                    ? "text-[#F59E0B] font-bold underline underline-offset-4"
                    : "hover:text-white"
                }`}
              >
                {sec}
              </a>
            ))}
        </nav>

        {email && (
          <SafeLink
            href={`mailto:${email}`}
            className="px-4 py-1.5 rounded-full text-xs font-semibold shadow-md hover:scale-105 active:scale-95 transition-all font-mono"
            style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
          >
            Connect
          </SafeLink>
        )}
      </header>

      {/* Render Dynamic Sections Based on User's Customized sectionOrder & hiddenSections */}
      <main className="max-w-6xl mx-auto space-y-10 sm:space-y-16">
        {sectionOrder
          .filter((sec) => !isHidden(sec))
          .map((sec) => {
            if (sectionMap[sec]) {
              return <React.Fragment key={sec}>{sectionMap[sec]}</React.Fragment>;
            }
            return (
              <section
                key={sec}
                id={sec}
                className="editorial-slide relative w-full aspect-[16/10] min-h-[500px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
                style={{
                  backgroundColor: colors.paper,
                  borderColor: colors.paperBorder,
                  color: colors.ink,
                }}
              >
                <div>
                  <p className="font-['Caveat',cursive] text-2xl sm:text-3xl text-neutral-800 dark:text-neutral-200 m-0 leading-none">
                    Custom
                  </p>
                  <h2
                    className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0 capitalize"
                    style={{ color: primaryColor }}
                  >
                    {sec.replace(/[-_]/g, " ")}
                  </h2>
                </div>
                <div className="my-auto p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: colors.inkMuted }}>
                    Editorial section for {sec.replace(/[-_]/g, " ")}. Customize your content anytime in the portfolio editor.
                  </p>
                </div>
                <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-black/10 dark:border-white/10 font-mono">
                  <span className="capitalize">{sec.replace(/[-_]/g, " ")}</span>
                  <span className="opacity-60">Custom Section</span>
                </div>
              </section>
            );
          })}
      </main>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
