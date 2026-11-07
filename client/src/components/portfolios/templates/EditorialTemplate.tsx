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
import { normalizeSkills } from "@/components/portfolios/adapters/resumePortfolioAdapter";
import TechText from "./TechText";
import FoldText from "./FoldText";
import StaggeredMenu from "./StaggeredMenu";

const Lanyard = React.lazy(() => import("./Lanyard"));

export interface EditorialTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}

function SafeProjectImage({
  src,
  alt,
  className = "",
  fallbackText = "Project Showcase",
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-800 text-white flex flex-col items-center justify-center p-4 text-center select-none ${className}`}>
        <FolderGit2 className="h-7 w-7 text-white/50 mb-1.5" />
        <span className="font-['Bebas_Neue',sans-serif] text-sm tracking-wider opacity-90">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}

function NumberedProjectFrame({
  src,
  alt,
  slotNumber,
  slotLabel,
  primaryColor,
  className = "",
}: {
  src?: string;
  alt: string;
  slotNumber: string;
  slotLabel: string;
  primaryColor: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-neutral-900 ${className}`}
    >
      <SafeProjectImage
        src={src}
        alt={alt}
        fallbackText={`Photo ${slotNumber} • ${slotLabel}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* High-contrast numbered badge so users know exact image placement */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/25 text-white shadow-lg pointer-events-none">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: primaryColor }}
        />
        <span className="font-mono text-[11px] font-bold tracking-wider">
          {slotNumber}
        </span>
      </div>
      {/* Subtle bottom slot caption */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-3 py-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white/95 flex items-center justify-between text-[10px] font-mono pointer-events-none">
        <span className="truncate font-semibold">{slotLabel}</span>
        <span className="opacity-80 shrink-0 ml-2">Slot {slotNumber}</span>
      </div>
    </div>
  );
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
  const [isMenuOnLightBg, setIsMenuOnLightBg] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeExpIdx, setActiveExpIdx] = useState(0);

  const profile = portfolio?.profile;
  const skills = portfolio?.skills;
  const experience = portfolio?.experience;
  const education = portfolio?.education;
  const projects = portfolio?.projects;
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
        paper: "#120F17",
        paperCard: "#1D1518",
        paperBorder: "rgba(255, 255, 255, 0.12)",
        ink: "#FFFFFF",
        inkMuted: "#CBD5E1",
        crimsonBg: primaryColor,
        crimsonText: "#FFFFFF",
        cardBg: "#1F1417",
        badgeBg: "rgba(255, 255, 255, 0.08)",
        badgeText: "#FFFFFF",
      };
    }
    return {
      paper: "#FDFBF7",
      paperCard: "#FFFFFF",
      paperBorder: "rgba(15, 23, 42, 0.12)",
      ink: "#0F172A",
      inkMuted: "#334155",
      crimsonBg: primaryColor,
      crimsonText: "#FFFFFF",
      cardBg: "#FFFFFF",
      badgeBg: "rgba(15, 23, 42, 0.05)",
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
    const cleaned = normalizeSkills(skills);
    if (cleaned && cleaned.length > 0) return cleaned;
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

  // Scroll tracking (works inside nested scroll containers like the editor preview)
  useEffect(() => {
    const handleScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      setShowScrollTop(-rect.top > 400);

      if (isDarkMode) {
        setIsMenuOnLightBg(false);
        return;
      }

      const toggleBtn = root.querySelector<HTMLElement>(".sm-toggle");
      const btnRect = toggleBtn?.getBoundingClientRect();
      const probeY = btnRect && btnRect.height > 0 ? btnRect.top + btnRect.height / 2 : 36;
      const slides = root.querySelectorAll<HTMLElement>(".editorial-slide");
      let overColoredSlide = false;

      for (const slide of Array.from(slides)) {
        const sRect = slide.getBoundingClientRect();
        if (sRect.top <= probeY && sRect.bottom >= probeY) {
          if (slide.classList.contains("text-white") || slide.classList.contains("ed-crimson")) {
            overColoredSlide = true;
          }
          break;
        }
      }

      setIsMenuOnLightBg(!overColoredSlide);
    };
    handleScroll();
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
    };
  }, [isDarkMode]);

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

    slides.forEach((s) => {
      revealObserver.observe(s);
    });

    return () => {
      revealObserver.disconnect();
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
    // SLIDE 01: HERO COVER (Deep Crimson Red, Joanne Alexander Layout)
    // -------------------------------------------------------------------------
    hero: (
      <section
        key="hero"
        id="hero"
        className="editorial-slide ed-crimson ed-hero relative w-full aspect-[16/10] min-h-[640px] sm:min-h-[680px] max-h-[860px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-10 flex flex-col justify-between text-white select-none transition-all duration-300"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Subtle Linen Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.06)_0px,rgba(0,0,0,0.06)_1px,transparent_1px,transparent_4px)] pointer-events-none" />
        {/* Animated light sweep + drifting glow orbs */}
        <div className="ed-sheen absolute inset-0 pointer-events-none" />
        <div className="ed-orb ed-orb-a absolute pointer-events-none" />
        <div className="ed-orb ed-orb-b absolute pointer-events-none" />

        {/* Hanging 3D Lanyard emerging directly from the top edge of the Hero background */}
        <div
          className="absolute inset-x-0 top-0 z-30"
          style={{ width: "100%", height: "600px" }}
        >
          <React.Suspense fallback={null}>
            <Lanyard
              frontImage={
                avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
              }
              backImage={
                avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
              }
              strapImage="/band.png"
              strapLength={0.62}
            />
          </React.Suspense>
        </div>

        {/* Center Background: Giant Condensed "PORTFOLIO" with React Bits TechText behind the swinging Lanyard */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-2 sm:px-4">
          <div style={{ width: "100%", height: "480px", position: "relative" }}>
            <TechText
              text="PORTFOLIO"
              fontFamily="'Bebas Neue', 'Anton', sans-serif"
              fontWeight={600}
              fontSize={210}
              letterSpacing={0}
              color="#FFFFFF"
              accentColor="#FFFFFF"
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={15}
              intro="none"
              introDuration={2}
              clickKick
              guides={false}
            />
          </div>
        </div>

        {/* Bottom Bar: Name Left, Headline Right, Quick Jump */}
        <div className="relative z-40 mt-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/20 text-xs sm:text-sm font-['Plus_Jakarta_Sans',sans-serif]">
          <span className="font-bold tracking-widest uppercase text-white/95">
            {fullName}
          </span>
          <div className="flex items-center gap-3">
            <a
              href="#about"
              className="px-5 py-2 rounded-full bg-white text-neutral-900 font-bold hover:bg-neutral-100 transition-all hover:scale-105 active:scale-95 text-xs shadow-lg"
              style={{ color: primaryColor }}
            >
              Explore Deck ↓
            </a>
          </div>
          <span className="font-bold tracking-widest uppercase text-white/95 text-right">
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
            <FoldText
              text="ABOUT ME"
              foldStyle="paper"
              splitBy="char"
              hinge="top"
              trigger="scroll"
              foldAngle={92}
              duration={0.65}
              stagger={0.045}
              staggerFrom="start"
              ease="power3.out"
              loopDelay={1.4}
              hoverRefold={true}
              refoldRadius={140}
              refoldAngle={45}
              perspective={700}
              creaseShading={0.55}
              fontSize="clamp(44px, 7vw, 92px)"
              fontWeight={700}
              color={primaryColor}
            />
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
                <FoldText
                  text={lastName.toUpperCase()}
                  foldStyle="paper"
                  splitBy="char"
                  hinge="top"
                  trigger="scroll"
                  foldAngle={92}
                  duration={0.65}
                  stagger={0.045}
                  staggerFrom="start"
                  ease="power3.out"
                  loopDelay={1.4}
                  hoverRefold={true}
                  refoldRadius={140}
                  refoldAngle={45}
                  perspective={700}
                  creaseShading={0.55}
                  fontSize="clamp(36px, 5.5vw, 72px)"
                  fontWeight={700}
                  color={primaryColor}
                />
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
              <h4
                className="font-bold text-xs uppercase tracking-wider mb-2.5"
                style={{ color: colors.ink }}
              >
                Core Expertise:
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm font-medium" style={{ color: colors.ink }}>
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
        <div
          className="w-full flex items-center justify-between text-xs pt-3 border-t font-mono"
          style={{ borderColor: colors.paperBorder, color: colors.inkMuted }}
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color: primaryColor }} />
            <span>{location || "Available Worldwide"}</span>
          </span>
          <span className="font-semibold">{headline}</span>
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
              <FoldText
                text="EXPERIENCES"
                foldStyle="paper"
                splitBy="char"
                hinge="top"
                trigger="scroll"
                foldAngle={92}
                duration={0.65}
                stagger={0.045}
                staggerFrom="start"
                ease="power3.out"
                loopDelay={1.4}
                hoverRefold={true}
                refoldRadius={140}
                refoldAngle={45}
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(44px, 7vw, 92px)"
                fontWeight={700}
                color={primaryColor}
              />
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
                    className="px-3.5 py-1 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer border"
                    style={
                      activeExpIdx === idx
                        ? {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            color: "#FFFFFF",
                          }
                        : {
                            backgroundColor: colors.badgeBg,
                            borderColor: colors.paperBorder,
                            color: colors.ink,
                          }
                    }
                  >
                    {exp.company}
                  </button>
                ))}
              </div>
            )}

            {displayExp[activeExpIdx] && (
              <>
                <div>
                  <h3
                    className="font-bold text-lg sm:text-xl"
                    style={{ color: colors.ink }}
                  >
                    {displayExp[activeExpIdx].title}
                  </h3>
                  <p
                    className="font-mono text-xs font-semibold mt-0.5"
                    style={{ color: colors.inkMuted }}
                  >
                    {displayExp[activeExpIdx].company} • {displayExp[activeExpIdx].startDate} —{" "}
                    {displayExp[activeExpIdx].current ? "Present" : displayExp[activeExpIdx].endDate}
                  </p>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                  {displayExp[activeExpIdx].description}
                </p>

                {displayExp[activeExpIdx].highlights && (
                  <ul className="space-y-1.5 text-xs sm:text-sm font-medium pt-1" style={{ color: colors.ink }}>
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
        <div
          className="w-full flex items-center justify-between text-xs pt-3 border-t font-mono"
          style={{ borderColor: colors.paperBorder, color: colors.inkMuted }}
        >
          <span>End-to-End Delivery Experience</span>
          <span className="opacity-80">Selected Work History</span>
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
              <FoldText
                text="EDUCATION"
                foldStyle="paper"
                splitBy="char"
                hinge="top"
                trigger="scroll"
                foldAngle={92}
                duration={0.65}
                stagger={0.045}
                staggerFrom="start"
                ease="power3.out"
                loopDelay={1.4}
                hoverRefold={true}
                refoldRadius={140}
                refoldAngle={45}
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(44px, 7vw, 92px)"
                fontWeight={700}
                color={primaryColor}
              />
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
                      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.04)",
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

                {/* Institution & Description with 100% High Contrast */}
                <p
                  className="font-mono text-xs sm:text-sm font-bold tracking-wide m-0"
                  style={{ color: colors.ink }}
                >
                  {edu.institution}
                </p>
                {edu.description && (
                  <p
                    className="text-xs sm:text-sm leading-relaxed max-w-[50ch] mt-1 font-medium"
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
        <div
          className="w-full flex items-center justify-between text-xs pt-3 border-t font-mono"
          style={{ borderColor: colors.paperBorder, color: colors.inkMuted }}
        >
          <span>Continuous Learning & Certification</span>
          <span className="font-semibold">Academic Credentials</span>
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
          className="editorial-slide relative w-full min-h-[480px] sm:min-h-[540px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 sm:p-12 text-white select-none transition-all duration-300"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Subtle Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/35 pointer-events-none" />

          {/* Top Script Eyebrow & Numbered Photo Guide Pill */}
          <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-3">
            <span className="font-['Caveat',cursive] font-bold text-3xl sm:text-4xl text-[#FAF5EF]">
              Featured Showcase
            </span>
            <span className="px-3.5 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/25 font-mono text-[11px] font-semibold tracking-wider text-white">
              PHOTO SLOTS #01 – #04
            </span>
          </div>

          {/* Center Layout: Balanced Polaroids + Giant Word PROJECTS */}
          <div className="relative z-10 my-auto py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Polaroid (#01 — Project 1 Primary Cover) */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="-rotate-6 polaroid-card z-20 cursor-pointer animate-[editorialSway_6s_ease-in-out_infinite]">
                <div className="relative p-2.5 pb-4 bg-white rounded-xl shadow-2xl w-48 sm:w-52 border border-black/10">
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-neutral-900">
                    <SafeProjectImage
                      src={
                        displayProjects[0]?.imageUrl ||
                        displayProjects[0]?.images?.[0] ||
                        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={displayProjects[0]?.title || "Project #01"}
                      fallbackText="Project #01 Cover"
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      #01
                    </span>
                  </div>
                  <p
                    className="font-['Caveat',cursive] text-sm text-center mt-2 m-0 font-bold truncate px-1"
                    style={{ color: "#0F172A" }}
                  >
                    {displayProjects[0]?.title || "Prototype Design"}
                  </p>
                </div>
              </div>
            </div>

            {/* Center Giant Title */}
            <div className="lg:col-span-6 text-center space-y-2">
              <h2 className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(64px,13vw,168px)] leading-[0.85] uppercase tracking-normal text-white text-center select-none m-0">
                <FoldText
                  text="PROJECTS"
                  foldStyle="paper"
                  splitBy="char"
                  hinge="top"
                  trigger="scroll"
                  foldAngle={92}
                  duration={0.65}
                  stagger={0.045}
                  staggerFrom="start"
                  ease="power3.out"
                  loopDelay={1.4}
                  hoverRefold={true}
                  refoldRadius={140}
                  refoldAngle={45}
                  perspective={700}
                  creaseShading={0.55}
                  fontSize="clamp(64px, 13vw, 168px)"
                  fontWeight={700}
                  color="#FFFFFF"
                />
              </h2>
              <p className="font-mono text-xs sm:text-sm text-white/90 max-w-md mx-auto">
                Each numbered badge (#01 – #04) maps directly to your uploaded project photos.
              </p>
            </div>

            {/* Right Polaroid (#02 — Project 2 Primary Cover or Project 1 Slot #02) */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="rotate-6 polaroid-card z-20 cursor-pointer animate-[editorialSwayReverse_7s_ease-in-out_infinite]">
                <div className="relative p-2.5 pb-4 bg-white rounded-xl shadow-2xl w-48 sm:w-52 border border-black/10">
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-neutral-900">
                    <SafeProjectImage
                      src={
                        displayProjects[1]?.imageUrl ||
                        displayProjects[0]?.images?.[0] ||
                        "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={displayProjects[1]?.title || "Project #02"}
                      fallbackText="Project #02 Cover"
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      #02
                    </span>
                  </div>
                  <p
                    className="font-['Caveat',cursive] text-sm text-center mt-2 m-0 font-bold truncate px-1"
                    style={{ color: "#0F172A" }}
                  >
                    {displayProjects[1]?.title || "Design Systems"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="relative z-10 w-full flex items-center justify-between text-xs sm:text-sm font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/25 pt-4">
            <span className="uppercase tracking-widest text-white font-mono font-semibold">
              Selected Showcase
            </span>
            <span className="font-mono text-white font-semibold">
              {displayProjects.length} Key {displayProjects.length === 1 ? "Project" : "Projects"}
            </span>
          </div>
        </section>

        {/* Slide 06: First PROJECT (Split Left Info, Right Numbered 2x2 Image Collage #01-#04) */}
        {displayProjects[0] && (
          <section
            className="editorial-slide relative w-full min-h-[540px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
            style={{
              backgroundColor: colors.paper,
              borderColor: colors.paperBorder,
              color: colors.ink,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
              {/* Left Column: Script "First" + Giant "PROJECT" + Info & Links */}
              <div className="md:col-span-5 space-y-4 text-left">
                <div className="flex items-center justify-between">
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
                      <FoldText
                        text="PROJECT"
                        foldStyle="paper"
                        splitBy="char"
                        hinge="top"
                        trigger="scroll"
                        foldAngle={92}
                        duration={0.65}
                        stagger={0.045}
                        staggerFrom="start"
                        ease="power3.out"
                        loopDelay={1.4}
                        hoverRefold={true}
                        refoldRadius={140}
                        refoldAngle={45}
                        perspective={700}
                        creaseShading={0.55}
                        fontSize="clamp(44px, 6.5vw, 84px)"
                        fontWeight={700}
                        color={primaryColor}
                      />
                    </h3>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full font-mono text-xs font-bold border"
                    style={{
                      backgroundColor: colors.badgeBg,
                      borderColor: colors.paperBorder,
                      color: primaryColor,
                    }}
                  >
                    PROJECT 01
                  </span>
                </div>

                <h4 className="font-bold text-lg sm:text-xl" style={{ color: colors.ink }}>
                  {displayProjects[0].title}
                </h4>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                  {displayProjects[0].description}
                </p>

                {/* Tags */}
                {displayProjects[0].tags && displayProjects[0].tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {displayProjects[0].tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border"
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
                <div className="flex flex-wrap items-center gap-3 pt-3">
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
                      className="px-4 py-2 rounded-xl border font-semibold text-xs flex items-center gap-1.5 hover:opacity-80 transition-all"
                      style={{
                        borderColor: colors.paperBorder,
                        backgroundColor: colors.paperCard,
                        color: colors.ink,
                      }}
                    >
                      <FolderGit2 className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                      <span>Code Repo</span>
                    </SafeLink>
                  )}
                </div>
              </div>

              {/* Right Column: Numbered 2x2 Collage Grid (#01, #02, #03, #04) */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:h-[410px]">
                <NumberedProjectFrame
                  src={
                    displayProjects[0].imageUrl ||
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={`${displayProjects[0].title} - Photo #01`}
                  slotNumber="#01"
                  slotLabel="Primary Cover"
                  primaryColor={primaryColor}
                  className="h-48 sm:h-full"
                />
                <NumberedProjectFrame
                  src={
                    displayProjects[0].images?.[0] ||
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={`${displayProjects[0].title} - Photo #02`}
                  slotNumber="#02"
                  slotLabel="Secondary Frame"
                  primaryColor={primaryColor}
                  className="h-48 sm:h-full"
                />
                <NumberedProjectFrame
                  src={
                    displayProjects[0].images?.[1] ||
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={`${displayProjects[0].title} - Photo #03`}
                  slotNumber="#03"
                  slotLabel="Detail Frame"
                  primaryColor={primaryColor}
                  className="h-48 sm:h-full"
                />
                {displayProjects[0].images?.[2] ? (
                  <NumberedProjectFrame
                    src={displayProjects[0].images[2]}
                    alt={`${displayProjects[0].title} - Photo #04`}
                    slotNumber="#04"
                    slotLabel="Bento Highlight"
                    primaryColor={primaryColor}
                    className="h-48 sm:h-full"
                  />
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-neutral-900 flex flex-col items-center justify-center p-5 text-center h-48 sm:h-full">
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-lg">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="font-mono text-[11px] font-bold tracking-wider">#04</span>
                    </div>
                    <div className="text-white space-y-1.5">
                      <Sparkles className="h-6 w-6 mx-auto text-amber-400" />
                      <p className="font-['Bebas_Neue',sans-serif] text-2xl tracking-wider m-0 text-white">
                        FEATURED
                      </p>
                      <p className="text-xs font-mono text-white/85 m-0 truncate max-w-[180px]">
                        {displayProjects[0].title || "Design Sprint 01"}
                      </p>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 px-3 py-1.5 bg-black/60 text-white/90 flex items-center justify-between text-[10px] font-mono">
                      <span>Bento Highlight</span>
                      <span>Slot #04</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Slide 07: Second PROJECT (Top 3 Numbered Image Cards #01-#03, Bottom Script "Second" + "PROJECT" & Text) */}
        {displayProjects[1] && (
          <section
            className="editorial-slide relative w-full min-h-[540px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between gap-6 border select-none transition-all duration-300"
            style={{
              backgroundColor: colors.paper,
              borderColor: colors.paperBorder,
              color: colors.ink,
            }}
          >
            {/* Top: 3 Side-by-Side Numbered Image Cards (#01, #02, #03) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <NumberedProjectFrame
                src={
                  displayProjects[1].imageUrl ||
                  "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&auto=format&fit=crop&q=80"
                }
                alt={`${displayProjects[1].title} - Photo #01`}
                slotNumber="#01"
                slotLabel="Primary Cover"
                primaryColor={primaryColor}
                className="h-52 sm:h-[260px]"
              />
              <NumberedProjectFrame
                src={
                  displayProjects[1].images?.[0] ||
                  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"
                }
                alt={`${displayProjects[1].title} - Photo #02`}
                slotNumber="#02"
                slotLabel="Secondary Frame"
                primaryColor={primaryColor}
                className="h-52 sm:h-[260px]"
              />
              <NumberedProjectFrame
                src={
                  displayProjects[1].images?.[1] ||
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
                }
                alt={`${displayProjects[1].title} - Photo #03`}
                slotNumber="#03"
                slotLabel="Detail Frame"
                primaryColor={primaryColor}
                className="h-52 sm:h-[260px]"
              />
            </div>

            {/* Bottom: Script "Second" + "PROJECT" Left | Description & Links Right */}
            <div
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-6 border-t"
              style={{ borderColor: colors.paperBorder }}
            >
              <div className="md:col-span-5 text-left">
                <div className="flex items-center gap-3">
                  <div>
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
                      <FoldText
                        text="PROJECT"
                        foldStyle="paper"
                        splitBy="char"
                        hinge="top"
                        trigger="scroll"
                        foldAngle={92}
                        duration={0.65}
                        stagger={0.045}
                        staggerFrom="start"
                        ease="power3.out"
                        loopDelay={1.4}
                        hoverRefold={true}
                        refoldRadius={140}
                        refoldAngle={45}
                        perspective={700}
                        creaseShading={0.55}
                        fontSize="clamp(44px, 6.5vw, 84px)"
                        fontWeight={700}
                        color={primaryColor}
                      />
                    </h3>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full font-mono text-xs font-bold border"
                    style={{
                      backgroundColor: colors.badgeBg,
                      borderColor: colors.paperBorder,
                      color: primaryColor,
                    }}
                  >
                    PROJECT 02
                  </span>
                </div>
                <h4 className="font-bold text-base sm:text-lg mt-1.5" style={{ color: colors.ink }}>
                  {displayProjects[1].title}
                </h4>
              </div>

              <div className="md:col-span-7 space-y-3 text-left">
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                  {displayProjects[1].description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {displayProjects[1].liveUrl && (
                    <SafeLink
                      href={displayProjects[1].liveUrl}
                      className="px-4 py-2 rounded-full text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>Explore Live</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </SafeLink>
                  )}
                  {displayProjects[1].repoUrl && (
                    <SafeLink
                      href={displayProjects[1].repoUrl}
                      className="px-4 py-2 rounded-full border font-semibold text-xs flex items-center gap-1.5 hover:opacity-80 transition-all"
                      style={{
                        borderColor: colors.paperBorder,
                        backgroundColor: colors.paperCard,
                        color: colors.ink,
                      }}
                    >
                      <FolderGit2 className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                      <span>Source</span>
                    </SafeLink>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 08: Third PROJECT & Additional Projects */}
        {displayProjects.slice(2).map((proj, extraIdx) => {
          const projectNumber = extraIdx + 3;
          const ordinalLabels = ["Third", "Fourth", "Fifth", "Sixth"];
          const scriptLabel = ordinalLabels[extraIdx] || `Project #0${projectNumber}`;
          return (
            <section
              key={`proj-${projectNumber}`}
              className="editorial-slide relative w-full min-h-[540px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between border select-none transition-all duration-300"
              style={{
                backgroundColor: colors.paper,
                borderColor: colors.paperBorder,
                color: colors.ink,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
                {/* Left Column: Primary Cover (#01) */}
                <div className="md:col-span-4">
                  <NumberedProjectFrame
                    src={
                      proj.imageUrl ||
                      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80"
                    }
                    alt={`${proj.title} - Photo #01`}
                    slotNumber="#01"
                    slotLabel="Primary Cover"
                    primaryColor={primaryColor}
                    className="h-64 sm:h-[330px]"
                  />
                </div>

                {/* Center Column: Script + PROJECT + Description */}
                <div className="md:col-span-4 text-center space-y-3 px-2">
                  <span
                    className="inline-block px-3 py-0.5 rounded-full font-mono text-[11px] font-bold border"
                    style={{
                      backgroundColor: colors.badgeBg,
                      borderColor: colors.paperBorder,
                      color: primaryColor,
                    }}
                  >
                    PROJECT 0{projectNumber}
                  </span>
                  <p
                    className="font-['Caveat',cursive] font-bold text-3xl sm:text-4xl m-0 leading-none"
                    style={{ color: primaryColor }}
                  >
                    {scriptLabel}
                  </p>
                  <h3
                    className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,6.5vw,84px)] leading-[0.88] uppercase tracking-normal m-0"
                    style={{ color: primaryColor }}
                  >
                    <FoldText
                      text="PROJECT"
                      foldStyle="paper"
                      splitBy="char"
                      hinge="top"
                      trigger="scroll"
                      foldAngle={92}
                      duration={0.65}
                      stagger={0.045}
                      staggerFrom="start"
                      ease="power3.out"
                      loopDelay={1.4}
                      hoverRefold={true}
                      refoldRadius={140}
                      refoldAngle={45}
                      perspective={700}
                      creaseShading={0.55}
                      fontSize="clamp(44px, 6.5vw, 84px)"
                      fontWeight={700}
                      color={primaryColor}
                    />
                  </h3>
                  <h4 className="font-bold text-base sm:text-lg" style={{ color: colors.ink }}>
                    {proj.title}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.inkMuted }}>
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    {proj.liveUrl && (
                      <SafeLink
                        href={proj.liveUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white font-semibold text-xs shadow-md hover:opacity-90 transition-all"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span>View Project</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </SafeLink>
                    )}
                    {proj.repoUrl && (
                      <SafeLink
                        href={proj.repoUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border font-semibold text-xs hover:opacity-80 transition-all"
                        style={{
                          borderColor: colors.paperBorder,
                          backgroundColor: colors.paperCard,
                          color: colors.ink,
                        }}
                      >
                        <FolderGit2 className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                        <span>Source</span>
                      </SafeLink>
                    )}
                  </div>
                </div>

                {/* Right Column: Stacked Numbered Image Cards (#02 & #03) */}
                <div className="md:col-span-4 space-y-3">
                  <NumberedProjectFrame
                    src={
                      proj.images?.[0] ||
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"
                    }
                    alt={`${proj.title} - Photo #02`}
                    slotNumber="#02"
                    slotLabel="Secondary Frame"
                    primaryColor={primaryColor}
                    className="h-[158px]"
                  />
                  <NumberedProjectFrame
                    src={
                      proj.images?.[1] ||
                      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80"
                    }
                    alt={`${proj.title} - Photo #03`}
                    slotNumber="#03"
                    slotLabel="Detail Frame"
                    primaryColor={primaryColor}
                    className="h-[158px]"
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    ),

    // -------------------------------------------------------------------------
    // CERTIFICATIONS: Editorial Verified Credentials Slide (High-Contrast & Balanced Layout)
    // -------------------------------------------------------------------------
    certifications: (
      <section
        key="certifications"
        id="certifications"
        className="editorial-slide relative w-full rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between gap-8 border select-none transition-all duration-300"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.paperBorder,
          color: colors.ink,
        }}
      >
        {/* Header Row with High-Contrast Script & Display Typography */}
        <div className="flex items-start justify-between w-full">
          <div>
            <p
              className="font-['Caveat',cursive] font-bold text-2xl sm:text-3xl m-0 leading-none"
              style={{ color: primaryColor }}
            >
              Verified
            </p>
            <h2
              className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0"
              style={{ color: primaryColor }}
            >
              <FoldText
                text="CERTIFICATIONS"
                foldStyle="paper"
                splitBy="char"
                hinge="top"
                trigger="scroll"
                foldAngle={92}
                duration={0.65}
                stagger={0.045}
                staggerFrom="start"
                ease="power3.out"
                loopDelay={1.4}
                hoverRefold={true}
                refoldRadius={140}
                refoldAngle={45}
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(44px, 7vw, 92px)"
                fontWeight={700}
                color={primaryColor}
              />
            </h2>
          </div>
          <span
            className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded-full border"
            style={{
              backgroundColor: colors.badgeBg,
              borderColor: colors.paperBorder,
              color: colors.ink,
            }}
          >
            07
          </span>
        </div>

        {/* Certifications Grid with High-Contrast Text & Balanced Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-auto">
          {((portfolio?.certifications || []).length > 0
            ? portfolio.certifications!
            : [
                {
                  name: "AWS Certified Solutions Architect",
                  issuer: "Amazon Web Services",
                  issueDate: "2023",
                  url: "",
                },
              ]
          ).map((cert, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border shadow-sm transition-transform hover:-translate-y-1 flex flex-col justify-between gap-4"
              style={{
                backgroundColor: colors.paperCard,
                borderColor: colors.paperBorder,
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: primaryColor,
                      color: "#FFFFFF",
                    }}
                  >
                    <Award className="h-5 w-5" />
                  </div>
                  <span
                    className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: colors.badgeBg,
                      borderColor: colors.paperBorder,
                      color: primaryColor,
                    }}
                  >
                    CREDENTIAL #0{idx + 1}
                  </span>
                </div>

                <h3
                  className="font-bold text-base sm:text-lg leading-snug m-0"
                  style={{ color: colors.ink }}
                >
                  {cert.name}
                </h3>

                <p
                  className="font-mono text-xs sm:text-sm font-semibold m-0"
                  style={{ color: colors.inkMuted }}
                >
                  {cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ""}
                </p>
              </div>

              {cert.url ? (
                <SafeLink
                  href={cert.url}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline pt-2 border-t"
                  style={{
                    color: primaryColor,
                    borderColor: colors.paperBorder,
                  }}
                >
                  <span>Verify Official Credential</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </SafeLink>
              ) : (
                <div
                  className="pt-2 border-t flex items-center justify-between text-[11px] font-mono font-semibold"
                  style={{
                    borderColor: colors.paperBorder,
                    color: colors.inkMuted,
                  }}
                >
                  <span>Status: Active</span>
                  <span style={{ color: primaryColor }}>✓ Verified</span>
                </div>
              )}
            </div>
          ))}

          {/* Editorial Summary Card so 1-2 Certifications Fill the Row Cleanly */}
          {(portfolio?.certifications || []).length <= 2 && (
            <div
              className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-4"
              style={{
                backgroundColor: primaryColor,
                borderColor: primaryColor,
                color: "#FFFFFF",
              }}
            >
              <div className="space-y-2">
                <span className="inline-block font-mono text-[11px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  Industry Validated
                </span>
                <h3 className="font-['Bebas_Neue',sans-serif] text-3xl tracking-wide m-0 text-white">
                  CONTINUOUS EXCELLENCE
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed m-0">
                  Backed by verified technical certifications, hands-on architecture assessments, and modern engineering standards.
                </p>
              </div>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-mono text-white/90">
                <span>Accredited Standards</span>
                <span>100% Verified</span>
              </div>
            </div>
          )}
        </div>

        <div
          className="w-full flex items-center justify-between text-xs pt-3 border-t font-mono"
          style={{ borderColor: colors.paperBorder, color: colors.inkMuted }}
        >
          <span>Official Industry Credentials</span>
          <span className="font-semibold">Verified Standards</span>
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
              <FoldText
                text="TECHNICAL SKILLS"
                foldStyle="paper"
                splitBy="char"
                hinge="top"
                trigger="scroll"
                foldAngle={92}
                duration={0.65}
                stagger={0.045}
                staggerFrom="start"
                ease="power3.out"
                loopDelay={1.4}
                hoverRefold={true}
                refoldRadius={140}
                refoldAngle={45}
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(44px, 7vw, 92px)"
                fontWeight={700}
                color={primaryColor}
              />
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
                      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)",
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.1)",
                    }}
                  >
                    <TechIcon name={typeof sk === "string" ? sk : sk.name} size={18} />
                  </div>
                  <span
                    className="font-bold text-sm sm:text-base truncate"
                    style={{ color: colors.ink }}
                  >
                    {typeof sk === "string" ? sk : sk.name}
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 border"
                  style={{
                    backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)",
                    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.12)",
                    color: colors.inkMuted,
                  }}
                >
                  {typeof sk === "string" ? "Skill" : sk.category || "Skill"}
                </span>
              </div>
              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)" }}
              >
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

        <div
          className="w-full flex items-center justify-between text-xs pt-3 border-t font-mono"
          style={{ borderColor: colors.paperBorder, color: colors.inkMuted }}
        >
          <span>Continuous Skill Validation</span>
          <span className="opacity-80">{displaySkills.length} Technologies Mastered</span>
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
              <FoldText
                text="CLIENT SAY"
                foldStyle="paper"
                splitBy="char"
                hinge="top"
                trigger="scroll"
                foldAngle={92}
                duration={0.65}
                stagger={0.045}
                staggerFrom="start"
                ease="power3.out"
                loopDelay={1.4}
                hoverRefold={true}
                refoldRadius={140}
                refoldAngle={45}
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(44px, 7vw, 92px)"
                fontWeight={700}
                color={primaryColor}
              />
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
        <div
          className="w-full flex items-center justify-between text-xs pt-3 border-t font-mono"
          style={{ borderColor: colors.paperBorder, color: colors.inkMuted }}
        >
          <span>Client Testimonials & Feedback</span>
          <span className="opacity-80">100% Satisfaction Rate</span>
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
                <FoldText
                  text="THANK YOU"
                  foldStyle="paper"
                  splitBy="char"
                  hinge="top"
                  trigger="scroll"
                  foldAngle={92}
                  duration={0.65}
                  stagger={0.045}
                  staggerFrom="start"
                  ease="power3.out"
                  loopDelay={1.4}
                  hoverRefold={true}
                  refoldRadius={140}
                  refoldAngle={45}
                  perspective={700}
                  creaseShading={0.55}
                  fontSize="clamp(56px, 10vw, 130px)"
                  fontWeight={700}
                  color="#FFFFFF"
                />
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
      className="editorial-root relative w-full min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-10"
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
            transform: rotate(-6deg) translateY(0);
          }
          50% {
            transform: rotate(-4deg) translateY(-8px);
          }
        }

        @keyframes editorialSwayReverse {
          0%, 100% {
            transform: rotate(6deg) translateY(0);
          }
          50% {
            transform: rotate(4deg) translateY(-8px);
          }
        }

        .polaroid-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }

        .polaroid-card:hover {
          transform: rotate(0deg) scale(1.06) !important;
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

      {/* React Bits StaggeredMenu (no navbar bar behind it) */}
      <div className="sticky top-0 z-50 h-0 max-w-6xl mx-auto">
        <StaggeredMenu
          position="left"
          items={sectionOrder
            .filter((sec) => !isHidden(sec))
            .map((sec) => ({
              label: sec.charAt(0).toUpperCase() + sec.slice(1).replace(/[-_]/g, " "),
              ariaLabel: `Go to ${sec} section`,
              link: `#${sec}`,
            }))}
          socialItems={
            socialLinks.length > 0
              ? socialLinks.map((s: PortfolioSocialLink) => ({
                  label: s.platform || "Link",
                  link: s.url,
                }))
              : email
              ? [{ label: "Email", link: `mailto:${email}` }]
              : []
          }
          displaySocials={socialLinks.length > 0 || Boolean(email)}
          displayItemNumbering={true}
          menuButtonColor={isMenuOnLightBg ? "#0F172A" : "#ffffff"}
          openMenuButtonColor={isMenuOnLightBg ? "#0F172A" : "#ffffff"}
          changeMenuColorOnOpen={true}
          colors={["#141418", primaryColor]}
          accentColor={primaryColor}
        />
      </div>

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
                className="editorial-slide relative w-full min-h-[420px] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between gap-6 border select-none transition-all duration-300"
                style={{
                  backgroundColor: colors.paper,
                  borderColor: colors.paperBorder,
                  color: colors.ink,
                }}
              >
                <div>
                  <p
                    className="font-['Caveat',cursive] font-bold text-2xl sm:text-3xl m-0 leading-none"
                    style={{ color: primaryColor }}
                  >
                    Custom
                  </p>
                  <h2
                    className="font-['Bebas_Neue','Anton',sans-serif] text-[clamp(44px,7vw,92px)] leading-[0.88] uppercase tracking-normal m-0 capitalize"
                    style={{ color: primaryColor }}
                  >
                    <FoldText
                      text={sec.replace(/[-_]/g, " ").toUpperCase()}
                      foldStyle="paper"
                      splitBy="char"
                      hinge="top"
                      trigger="scroll"
                      foldAngle={92}
                      duration={0.65}
                      stagger={0.045}
                      staggerFrom="start"
                      ease="power3.out"
                      loopDelay={1.4}
                      hoverRefold={true}
                      refoldRadius={140}
                      refoldAngle={45}
                      perspective={700}
                      creaseShading={0.55}
                      fontSize="clamp(44px, 7vw, 92px)"
                      fontWeight={700}
                      color={primaryColor}
                    />
                  </h2>
                </div>
                <div
                  className="my-auto p-6 rounded-2xl border"
                  style={{
                    backgroundColor: colors.paperCard,
                    borderColor: colors.paperBorder,
                  }}
                >
                  <p className="text-sm sm:text-base leading-relaxed m-0" style={{ color: colors.inkMuted }}>
                    Editorial section for {sec.replace(/[-_]/g, " ")}. Customize your content anytime in the portfolio editor.
                  </p>
                </div>
                <div
                  className="w-full flex items-center justify-between text-xs pt-3 border-t font-mono"
                  style={{ borderColor: colors.paperBorder, color: colors.inkMuted }}
                >
                  <span className="capitalize">{sec.replace(/[-_]/g, " ")}</span>
                  <span className="font-semibold">Custom Section</span>
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
