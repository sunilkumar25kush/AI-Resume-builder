import { useState, useMemo, useEffect } from "react";
import {
  ArrowUp,
  MapPin,
  ExternalLink,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import type { Portfolio } from "@/types/portfolio";

export interface DoodleTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile" | "thumbnail";
}

interface DoodleSvgProps {
  className?: string;
  style?: React.CSSProperties;
}

/* ==========================================================================
   HAND-DRAWN SVG DOODLES (Organic Ink Scribbles & Annotations)
   ========================================================================== */

function DoodleArrowCurved({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 120 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M10 15 C 45 5, 85 10, 105 45 C 108 52, 106 60, 102 62"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="1 0"
      />
      <path
        d="M92 48 L 103 63 L 115 52"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoodleOvalRing({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 240 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M 20 35 C 15 15, 60 8, 120 8 C 185 8, 228 16, 228 35 C 228 54, 175 62, 115 62 C 55 62, 10 52, 14 33 C 18 18, 70 12, 128 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DoodleWavyUnderline({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 200 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M 5 10 Q 25 3, 45 10 T 85 10 T 125 10 T 165 10 T 195 10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DoodleStar({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M12 2 L13.8 8.8 L20.5 12 L13.8 15.2 L12 22 L10.2 15.2 L3.5 12 L10.2 8.8 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DoodleMusicNotes({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 60 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M15 35 A 6 5 0 1 1 9 30 L 9 10 L 28 6 L 28 26 A 6 5 0 1 1 22 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="45" cy="18" r="4" fill="currentColor" />
      <path d="M49 18 L 49 6 Q 54 8 57 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleGuitar({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M48 8 L54 14 M44 12 L50 18 M46 10 L28 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="40" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="28" cy="32" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="36" r="3" fill="currentColor" />
      <path d="M12 48 L6 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleCookingPot({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M16 28 L48 28 L44 50 C44 54, 20 54, 20 50 Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 28 L52 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 24 C28 22, 36 22, 36 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 16 C22 12, 26 10, 24 6 M32 18 C30 14, 34 12, 32 8 M40 16 C38 12, 42 10, 40 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DoodleCamera({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect x="10" y="20" width="44" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20 L25 14 L39 14 L42 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="36" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="36" r="4" fill="currentColor" />
      <circle cx="46" cy="26" r="2" fill="currentColor" />
    </svg>
  );
}

function DoodlePet({ className = "", style }: DoodleSvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M16 38 C16 28, 28 26, 36 30 C44 26, 52 30, 50 40 C48 48, 38 52, 24 50 C18 48, 16 44, 16 38 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M20 28 L18 18 L26 24 M36 24 L44 18 L42 28" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="27" cy="33" r="1.5" fill="currentColor" />
      <circle cx="35" cy="33" r="1.5" fill="currentColor" />
      <path d="M30 36 L32 37 L34 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 42 C56 40, 58 48, 56 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Realistic SVG QR Code */
function DoodleQrCode({ value }: { value: string }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-stone-300 shadow-sm inline-block">
      <svg
        viewBox="0 0 100 100"
        className="w-24 h-24 sm:w-28 sm:h-28 text-stone-900"
        fill="currentColor"
        aria-label={`QR Code for ${value}`}
      >
        {/* Top-Left Corner Box */}
        <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="13" y="13" width="12" height="12" rx="1" fill="currentColor" />
        {/* Top-Right Corner Box */}
        <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="75" y="13" width="12" height="12" rx="1" fill="currentColor" />
        {/* Bottom-Left Corner Box */}
        <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="13" y="75" width="12" height="12" rx="1" fill="currentColor" />
        {/* Timing Patterns & Data Pixels */}
        <line x1="38" y1="9" x2="62" y2="9" stroke="currentColor" strokeWidth="4" strokeDasharray="5 4" />
        <line x1="9" y1="38" x2="9" y2="62" stroke="currentColor" strokeWidth="4" strokeDasharray="5 4" />
        <rect x="42" y="20" width="7" height="7" />
        <rect x="53" y="20" width="7" height="7" />
        <rect x="42" y="32" width="7" height="7" />
        <rect x="65" y="40" width="7" height="7" />
        <rect x="78" y="40" width="7" height="7" />
        <rect x="42" y="48" width="16" height="7" />
        <rect x="70" y="52" width="7" height="15" />
        <rect x="42" y="65" width="7" height="7" />
        <rect x="55" y="65" width="7" height="7" />
        <rect x="42" y="78" width="12" height="7" />
        <rect x="80" y="78" width="7" height="7" />
      </svg>
    </div>
  );
}

/* ==========================================================================
   DOODLE TEMPLATE MAIN COMPONENT
   ========================================================================== */

export function DoodleTemplate({
  portfolio,
  hiddenSections = [],
}: DoodleTemplateProps) {
  const profile = portfolio.profile;
  const socialLinks = portfolio.socialLinks || [];
  const rawSkills = portfolio.skills || [];
  const education = portfolio.education || [];
  const projects = portfolio.projects || [];
  const design = portfolio.design;

  const themeSetting = design?.theme || "system";
  const primaryColor = design?.primaryColor || "#5A65B8";
  const selectedFont = design?.fontFamily || "Playfair";

  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDarkTheme = themeSetting === "dark" || (themeSetting === "system" && systemPrefersDark);
  const isLightTheme = themeSetting === "light";

  const typeA = useMemo(() => {
    if (isLightTheme) {
      return {
        bg: "bg-[#FAF7F2]",
        text: "text-[#1E1E20]",
        heading: "text-stone-900",
        sub: "text-stone-600",
        border: "border-stone-300",
        cardBg: "bg-white",
        cardBorder: "border-stone-200",
        doodle: primaryColor,
        isDark: false,
      };
    }
    return {
      bg: "bg-[#222223]",
      text: "text-stone-100",
      heading: "text-white",
      sub: "text-stone-400",
      border: "border-stone-800",
      cardBg: "bg-stone-900/80",
      cardBorder: "border-stone-800",
      doodle: primaryColor !== "#5A65B8" ? primaryColor : "#9AA5E2",
      isDark: true,
    };
  }, [isLightTheme, primaryColor]);

  const typeB = useMemo(() => {
    if (isDarkTheme) {
      return {
        bg: "bg-[#1B1B1E]",
        text: "text-stone-200",
        heading: "text-white",
        sub: "text-stone-400",
        border: "border-stone-800",
        cardBg: "bg-[#24242A]",
        cardBorder: "border-stone-700/80",
        doodle: primaryColor !== "#5A65B8" ? primaryColor : "#9AA5E2",
        isDark: true,
      };
    }
    return {
      bg: "bg-[#F4F0E8]",
      text: "text-[#1E1E20]",
      heading: "text-[#1E1E20]",
      sub: "text-stone-600",
      border: "border-stone-300",
      cardBg: "bg-white/70",
      cardBorder: "border-stone-300",
      doodle: primaryColor,
      isDark: false,
    };
  }, [isDarkTheme, primaryColor]);

  const fontStyles = useMemo(() => {
    switch (selectedFont) {
      case "Geist":
        return {
          heading: "'Geist Variable', 'Inter', sans-serif",
          body: "'Geist Variable', 'Inter', sans-serif",
        };
      case "Inter":
        return {
          heading: "'Inter', sans-serif",
          body: "'Inter', sans-serif",
        };
      case "Merriweather":
        return {
          heading: "'Merriweather', Georgia, serif",
          body: "'Plus Jakarta Sans', sans-serif",
        };
      case "Playfair":
      default:
        return {
          heading: "'Playfair Display', 'DM Serif Display', Georgia, serif",
          body: "'Plus Jakarta Sans', sans-serif",
        };
    }
  }, [selectedFont]);

  const fullName = profile?.fullName || "Aaliyah Vance";
  const headline = profile?.headline || "Product & UI/UX Designer";
  const bio =
    profile?.bio ||
    "Hi, I'm a product designer driven by empathy, craft, and playful visual storytelling. With over five years of experience designing mobile ecosystems, accessible systems, and joyful digital products, I bridge complex engineering with warm, human-centered interfaces that make people feel right at home.";
  const avatarUrl = normalizeAvatarUrl(
    profile?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  );
  const email = profile?.email || "hello@aaliyahvance.design";
  const location = profile?.location || "San Francisco, CA";

  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(false), 2400);
  };

  // Safe fallback projects modeled after reference
  const showcaseProjects = useMemo(() => {
    if (projects.length > 0) return projects;
    return [
      {
        title: "Dance",
        description:
          "An immersive dark-mode music and video stream app for choreographers and street dance crews with buttery-smooth 60fps micro-interactions.",
        tags: ["Mobile App", "Dark UI", "Motion", "Figma"],
        liveUrl: "https://example.com/dance",
        repoUrl: "https://github.com",
        imageUrl:
          "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Y care",
        description:
          "Accessible digital wellness and patient companionship mobile platform designed for elderly rehabilitation and daily mindfulness tracking.",
        tags: ["Healthcare", "Accessibility", "Research", "iOS"],
        liveUrl: "https://example.com/ycare",
        repoUrl: "https://github.com",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Redesign Goodreads",
        description:
          "Transforming book discovery through minimalist editorial typography, distraction-free reading logs, and personalized community book clubs.",
        tags: ["Case Study", "Editorial UX", "Design Systems"],
        liveUrl: "https://example.com/goodreads",
        repoUrl: "https://github.com",
        imageUrl:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Shwe",
        description:
          "High-fashion luxury commerce app blending magazine-style editorial layouts with instant 1-tap checkout and curated seasonal capsules.",
        tags: ["E-commerce", "Fashion", "Grid System"],
        liveUrl: "https://example.com/shwe",
        repoUrl: "https://github.com",
        imageUrl:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Inspiration App",
        description:
          "From notebook sketches to high-fidelity tactile UI: a personal ideation notebook app for artists, writers, and creative directors.",
        tags: ["Creative Journal", "Sketchbook", "Mobile"],
        liveUrl: "https://example.com/inspiration",
        repoUrl: "https://github.com",
        imageUrl:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80",
      },
    ];
  }, [projects]);

  const skillNames = useMemo(() => {
    if (rawSkills.length > 0) {
      return rawSkills.map((s) => (typeof s === "string" ? s : s.name));
    }
    return [
      "Figma",
      "UI/UX Design",
      "Wireframing",
      "Prototyping",
      "Design Systems",
      "User Research",
      "Usability Testing",
      "Visual Design",
      "Information Architecture",
      "Interactive Motion",
      "HTML & CSS",
      "React Native",
    ];
  }, [rawSkills]);

  const isHidden = (sec: string) => hiddenSections.includes(sec);

  return (
    <div
      className={`min-h-screen ${typeA.bg} ${typeA.text} transition-colors duration-300 selection:bg-[#6366F1]/30 selection:text-white`}
      style={{ fontFamily: fontStyles.body }}
    >
      {/* ====================================================================
          TOP NAVIGATION BAR
          ==================================================================== */}
      <nav
        className={`border-b ${typeA.border} ${
          typeA.isDark ? "bg-[#222223]/95" : "bg-[#FAF7F2]/95"
        } backdrop-blur-md sticky top-0 z-30 transition-colors`}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between text-xs sm:text-sm font-medium tracking-wide">
          <a
            href="#projects"
            className="hover:opacity-80 transition-opacity py-2 flex items-center gap-1.5"
            style={{ color: typeA.doodle }}
          >
            <span>Work</span>
            <span
              className={`text-[11px] font-mono ${
                typeA.isDark ? "text-stone-400" : "text-stone-600"
              }`}
            >
              ({showcaseProjects.length.toString().padStart(2, "0")})
            </span>
          </a>
          <div
            className={`h-4 w-px ${
              typeA.isDark ? "bg-stone-700/60" : "bg-stone-300"
            }`}
          />
          <a
            href="#education"
            className="hover:opacity-80 transition-opacity py-2"
            style={{ color: typeA.doodle }}
          >
            Education / Skills
          </a>
          <div
            className={`h-4 w-px ${
              typeA.isDark ? "bg-stone-700/60" : "bg-stone-300"
            }`}
          />
          <a
            href="#contact"
            className="hover:opacity-80 transition-opacity py-2"
            style={{ color: typeA.doodle }}
          >
            Contact & Socials
          </a>
        </div>
      </nav>

      {/* ====================================================================
          SECTION 1: HERO
          ==================================================================== */}
      {!isHidden("hero") && (
        <section
          id="hero"
          className={`relative px-6 pt-16 pb-24 text-center overflow-hidden flex flex-col items-center justify-center min-h-[460px] ${typeA.bg} transition-colors`}
        >
          {/* Handwritten Script Callout & Looping Arrow Above Title */}
          <div className="relative mb-3 flex items-center justify-center">
            <span
              className="font-['Caveat',cursive] text-2xl sm:text-3xl rotate-[-4deg] tracking-wide inline-block"
              style={{ color: typeA.doodle }}
            >
              Welcome to my
            </span>
            <div
              className="relative -ml-2 -mt-4"
              style={{ color: typeA.doodle }}
            >
              <DoodleArrowCurved className="w-16 h-10 sm:w-20 sm:h-12 rotate-[12deg]" />
            </div>
          </div>

          {/* Big Serif "Portfolio" with Encircled Numbers */}
          <div className="relative inline-block my-2">
            <h1
              className={`text-6xl sm:text-7xl md:text-8xl tracking-tight ${typeA.heading} font-normal leading-none select-none`}
              style={{ fontFamily: fontStyles.heading }}
            >
              P
              <span className="relative inline-block">
                o
                <span
                  className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-xs font-mono font-bold"
                  style={{ color: typeA.doodle }}
                >
                  19
                </span>
              </span>
              rtf
              <span className="relative inline-block">
                o
                <span
                  className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-xs font-mono font-bold"
                  style={{ color: typeA.doodle }}
                >
                  01
                </span>
              </span>
              li
              <span className="relative inline-block">
                o
                <span
                  className="absolute -top-3 right-0"
                  style={{ color: typeA.doodle }}
                >
                  <DoodleStar className="w-4 h-4" />
                </span>
              </span>
            </h1>
          </div>

          {/* Hand-Drawn Doodle Oval Ring Pill with Headline */}
          <div className="relative mt-5 inline-flex items-center justify-center px-6 py-2.5">
            <DoodleOvalRing style={{ color: typeA.doodle }} />
            <span
              className={`relative z-10 font-['Caveat',cursive] text-2xl sm:text-3xl tracking-wide ${
                typeA.isDark ? "text-stone-200" : "text-stone-800"
              }`}
            >
              {headline}
            </span>
          </div>
        </section>
      )}

      {/* ====================================================================
          SECTION 2: "HELLO," ABOUT
          ==================================================================== */}
      {!isHidden("about") && (
        <section
          id="about"
          className={`${typeB.bg} ${typeB.text} px-6 py-20 border-t ${typeB.border} transition-colors`}
        >
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14 items-center">
            {/* Left: Arched Portrait Photo with Doodle Annotations */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              {/* Handwritten Doodle Annotations */}
              <div
                className="absolute -top-6 -left-2 font-['Caveat',cursive] text-lg sm:text-xl rotate-[-8deg] flex items-center gap-1 z-10"
                style={{ color: typeB.doodle }}
              >
                <MapPin className="w-4 h-4 inline" />
                <span>Based in {location}</span>
              </div>

              <div
                className="absolute -top-8 -right-4 font-['Caveat',cursive] text-lg sm:text-xl rotate-[6deg] flex items-center gap-1 z-10"
                style={{ color: typeB.doodle }}
              >
                <span>{headline.split(" ")[0] || "Designer"}</span>
                <DoodleStar className="w-3.5 h-3.5" />
              </div>

              {/* Arched Portrait Frame */}
              <div className="relative p-2">
                <div
                  className={`w-48 sm:w-56 h-64 sm:h-72 rounded-t-[100px] rounded-b-2xl overflow-hidden border-2 ${
                    typeB.isDark
                      ? "border-stone-700 bg-stone-800"
                      : "border-stone-800 bg-stone-300"
                  } shadow-md relative z-0`}
                >
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Swirling Scribble Rings around photo */}
                <svg
                  viewBox="0 0 240 280"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none"
                  style={{ color: typeB.doodle }}
                  aria-hidden="true"
                >
                  <path
                    d="M 10 140 C -10 60, 60 -10, 150 10 C 230 30, 250 160, 210 230 C 170 290, 40 280, 20 200"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div
                className="mt-4 font-['Caveat',cursive] text-lg sm:text-xl rotate-[-3deg] flex items-center gap-1"
                style={{ color: typeB.doodle }}
              >
                <span>☕ Coffee lover & craft enthusiast</span>
              </div>
            </div>

            {/* Right: "Hello," Bio Text with Wavy Underlines */}
            <div className="md:col-span-7 space-y-4">
              <h2
                className={`text-5xl sm:text-6xl ${typeB.heading} font-normal tracking-tight`}
                style={{ fontFamily: fontStyles.heading }}
              >
                Hello,
              </h2>

              <p
                className={`text-base sm:text-lg ${typeB.sub} leading-relaxed font-normal`}
              >
                {bio}
              </p>

              {/* Hand-Drawn Wavy Underline */}
              <div className="pt-2" style={{ color: typeB.doodle }}>
                <DoodleWavyUnderline className="w-48 h-4" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          SECTION 3: EDUCATION & QR CODE
          ==================================================================== */}
      {!isHidden("education") && (
        <section
          id="education"
          className={`${typeB.bg} ${typeB.text} px-6 py-16 border-t ${typeB.border} transition-colors`}
        >
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Left: Education Milestones */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h2
                  className={`text-4xl sm:text-5xl ${typeB.heading} font-normal tracking-tight`}
                  style={{ fontFamily: fontStyles.heading }}
                >
                  Education
                </h2>
                <p className={`mt-1 text-sm ${typeB.sub}`}>
                  Academic foundations, interactive media studies, and design methodology.
                </p>
              </div>

              <div className="space-y-5">
                {education.length > 0 ? (
                  education.map((edu, idx) => (
                    <div
                      key={idx}
                      className={`border-b ${
                        typeB.isDark ? "border-stone-800" : "border-stone-300/80"
                      } pb-4 last:border-b-0 space-y-1`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <span
                          className={`font-bold text-base sm:text-lg ${typeB.heading}`}
                        >
                          {edu.degree || "Degree in Design & Computing"}
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-mono ${typeB.sub}`}
                        >
                          {edu.startDate} — {edu.endDate || "Present"}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${typeB.sub}`}>
                        {edu.institution || "University / College"}
                      </p>
                      {edu.grade && (
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-mono"
                          style={{
                            backgroundColor: `${primaryColor}18`,
                            color: typeB.doodle,
                          }}
                        >
                          Grade: {edu.grade}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      className={`border-b ${
                        typeB.isDark ? "border-stone-800" : "border-stone-300/80"
                      } pb-4 space-y-1`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <span
                          className={`font-bold text-base sm:text-lg ${typeB.heading}`}
                        >
                          B.S. in Interaction Design & HCI
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-mono ${typeB.sub}`}
                        >
                          2018 — 2022
                        </span>
                      </div>
                      <p className={`text-sm ${typeB.sub}`}>
                        California College of the Arts • San Francisco, CA
                      </p>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-mono"
                        style={{
                          backgroundColor: `${primaryColor}18`,
                          color: typeB.doodle,
                        }}
                      >
                        Summa Cum Laude • GPA 3.92
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <span
                          className={`font-bold text-base sm:text-lg ${typeB.heading}`}
                        >
                          Design Systems & Accessibility Certification
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-mono ${typeB.sub}`}
                        >
                          2023
                        </span>
                      </div>
                      <p className={`text-sm ${typeB.sub}`}>
                        Interaction Design Foundation • Advanced Credential
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: QR Code Card & Curved Arrow */}
            <div
              className={`md:col-span-5 flex flex-col items-center justify-center p-6 ${typeB.cardBg} rounded-2xl border ${typeB.cardBorder} shadow-sm relative`}
            >
              <div className="flex flex-col items-center text-center">
                <DoodleQrCode value={typeof window !== "undefined" ? window.location.href : "https://portfolio.dev"} />

                <div className="mt-3 space-y-1">
                  <div
                    className="font-['Caveat',cursive] text-xl rotate-[-2deg] flex items-center justify-center gap-1.5"
                    style={{ color: typeB.doodle }}
                  >
                    <span>Scan to view full CV / Resume</span>
                    <ExternalLink className="w-4 h-4 inline" />
                  </div>
                  <p
                    className={`text-[11px] font-mono uppercase tracking-widest ${typeB.sub}`}
                  >
                    Available for Select Roles
                  </p>
                </div>
              </div>

              {/* Hand-drawn Arrow pointing to QR Code */}
              <div
                className="absolute -top-4 -right-4 hidden sm:block"
                style={{ color: typeB.doodle }}
              >
                <DoodleArrowCurved className="w-14 h-10 rotate-[45deg]" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          SECTION 4: SKILLS & BOOKS STACK
          ==================================================================== */}
      {!isHidden("skills") && (
        <section
          id="skills"
          className={`${typeB.bg} ${typeB.text} px-6 py-16 border-t ${typeB.border} transition-colors`}
        >
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Left: Skills & Tool Icons Pill */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h2
                  className={`text-4xl sm:text-5xl ${typeB.heading} font-normal tracking-tight`}
                  style={{ fontFamily: fontStyles.heading }}
                >
                  Skills
                </h2>
                <p className={`mt-1 text-sm ${typeB.sub}`}>
                  Tooling, design methodologies, and implementation proficiencies.
                </p>
              </div>

              {/* Pill with Tools and Doodle Tag */}
              <div
                className={`relative inline-flex flex-wrap items-center gap-3 p-3 ${typeB.cardBg} rounded-2xl border-2 ${
                  typeB.isDark ? "border-stone-700" : "border-stone-800"
                } shadow-sm`}
              >
                <div
                  className={`flex items-center gap-2 text-xs font-mono font-bold uppercase ${
                    typeB.isDark ? "text-stone-300" : "text-stone-800"
                  }`}
                >
                  <span>Daily Tools:</span>
                </div>
                <div className="flex items-center gap-2">
                  {["Figma", "Illustrator", "React", "CSS / Motion"].map(
                    (tool, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                          typeB.isDark
                            ? "bg-stone-800 text-stone-200 border-stone-700"
                            : "bg-stone-100 text-stone-900 border-stone-300"
                        }`}
                      >
                        {tool}
                      </span>
                    ),
                  )}
                </div>
                <div
                  className="absolute -top-3.5 -right-3 font-['Caveat',cursive] text-base rotate-[8deg]"
                  style={{ color: typeB.doodle }}
                >
                  <span>✦ daily workflow</span>
                </div>
              </div>

              {/* 2-Column Competencies List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {skillNames.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-sm ${typeB.text}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: typeB.doodle }}
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Stacked Books / Sketchbook Illustration with Orbit Ring */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative p-6">
              <div className="relative w-44 sm:w-52 flex flex-col items-center space-y-1 z-10">
                {/* Book 1 (Top) */}
                <div
                  className={`w-36 h-7 rounded-sm border-2 ${
                    typeB.isDark
                      ? "bg-stone-800 border-stone-700 text-stone-300"
                      : "bg-stone-200 border-stone-800 text-stone-700"
                  } shadow-sm flex items-center justify-between px-3 text-[10px] font-mono`}
                >
                  <span>DESIGN OF EVERYDAY</span>
                </div>
                {/* Book 2 (Middle) */}
                <div
                  className={`w-44 h-8 rounded-sm border-2 ${
                    typeB.isDark
                      ? "bg-stone-750 border-stone-700 text-stone-200"
                      : "bg-stone-100 border-stone-800 text-stone-800"
                  } shadow-sm flex items-center justify-between px-3 text-[10px] font-mono font-bold rotate-[1.5deg]`}
                >
                  <span>REFIDENTIAL SYSTEMS</span>
                </div>
                {/* Book 3 (Bottom) */}
                <div
                  className={`w-48 h-9 rounded-sm border-2 ${
                    typeB.isDark
                      ? "bg-stone-800 border-stone-700 text-stone-200"
                      : "bg-stone-300 border-stone-800 text-stone-800"
                  } shadow-md flex items-center justify-between px-3 text-[10px] font-mono rotate-[-1deg]`}
                >
                  <span>MICRO-INTERACTIONS</span>
                </div>

                {/* Orbit Doodle Ring */}
                <svg
                  viewBox="0 0 240 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute -top-6 -left-6 w-[calc(100%+48px)] h-[calc(100%+48px)] pointer-events-none"
                  style={{ color: typeB.doodle }}
                  aria-hidden="true"
                >
                  <ellipse
                    cx="120"
                    cy="60"
                    rx="110"
                    ry="45"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    transform="rotate(-8 120 60)"
                  />
                </svg>
              </div>

              <div
                className="mt-6 text-center font-['Caveat',cursive] text-lg"
                style={{ color: typeB.doodle }}
              >
                <span>Continuous learning & design research</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          SECTION 5: PROJECTS SHOWCASE OVERVIEW
          ==================================================================== */}
      {!isHidden("projects") && (
        <section
          id="projects"
          className={`${typeA.bg} ${typeA.text} px-6 py-20 border-t ${typeA.border} transition-colors`}
        >
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Header Row with Smiley Doodle and Script Annotation */}
            <div
              className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b ${typeA.border} pb-6`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2
                    className={`text-4xl sm:text-5xl ${typeA.heading} font-normal tracking-tight`}
                    style={{ fontFamily: fontStyles.heading }}
                  >
                    Projects
                  </h2>
                  <span
                    className="font-['Caveat',cursive] text-3xl rotate-[10deg]"
                    style={{ color: typeA.doodle }}
                  >
                    :)
                  </span>
                </div>
                <p className={`mt-1 text-xs sm:text-sm font-mono ${typeA.sub}`}>
                  Selected client engagements, product prototypes, and mobile apps.
                </p>
              </div>

              <div
                className="text-right sm:text-right font-['Caveat',cursive] text-xl sm:text-2xl flex items-center justify-end gap-2"
                style={{ color: typeA.doodle }}
              >
                <span>Case Studies & Systems 2024–2026</span>
                <DoodleStar className="w-4 h-4 inline" />
              </div>
            </div>

            {/* Horizontal Project Mockups Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {showcaseProjects.slice(0, 5).map((proj, idx) => (
                <a
                  key={idx}
                  href={`#project-${idx + 1}`}
                  className={`group block p-3 rounded-xl ${typeA.cardBg} border ${typeA.cardBorder} hover:border-current transition-colors`}
                  style={{ borderColor: undefined }}
                >
                  <div className="aspect-[9/16] rounded-lg overflow-hidden bg-stone-800 relative mb-2.5">
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="text-center">
                    <h3
                      className={`font-bold text-xs sm:text-sm ${
                        typeA.isDark
                          ? "text-stone-200 group-hover:text-white"
                          : "text-stone-800 group-hover:text-black"
                      } truncate`}
                    >
                      {proj.title}
                    </h3>
                    <p className={`text-[10px] font-mono truncate ${typeA.sub}`}>
                      {proj.tags?.[0] || "Interactive"}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div
              className="text-center font-['Caveat',cursive] text-xl"
              style={{ color: typeA.doodle }}
            >
              <span>{"{ Mobile Apps & Digital Experiences }"}</span>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          SECTION 6: CASE STUDY 1 - "DANCE"
          ==================================================================== */}
      <section
        id="project-1"
        className={`${typeA.bg} ${typeA.text} px-6 py-20 border-t ${typeA.border} transition-colors`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Details */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: typeA.doodle }}
              >
                Case Study 01 // Dark Mode & Motion
              </span>
              <h3
                className={`text-4xl sm:text-5xl ${typeA.heading} font-normal tracking-tight mt-1`}
                style={{ fontFamily: fontStyles.heading }}
              >
                {showcaseProjects[0]?.title || "Dance"}
              </h3>
            </div>

            <p className={`text-sm sm:text-base ${typeA.sub} leading-relaxed`}>
              {showcaseProjects[0]?.description ||
                "A next-generation streaming companion crafted for street dancers and urban creators, featuring gesture-driven navigation, variable speed playback, and high-contrast night aesthetics."}
            </p>

            {showcaseProjects[0]?.tags && (
              <div className="flex flex-wrap gap-2">
                {showcaseProjects[0].tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full border text-xs font-mono ${
                      typeA.isDark
                        ? "bg-stone-800 border-stone-700 text-stone-300"
                        : "bg-white border-stone-300 text-stone-700"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Hand-Drawn Oval Doodle Link Button */}
            <div className="pt-2">
              <SafeLink
                href={showcaseProjects[0]?.liveUrl || "#"}
                className={`relative inline-flex items-center gap-2 px-6 py-2.5 ${typeA.text} hover:opacity-80 transition-opacity`}
              >
                <DoodleOvalRing style={{ color: typeA.doodle }} />
                <span
                  className="relative z-10 font-['Caveat',cursive] text-2xl"
                  style={{ color: typeA.doodle }}
                >
                  Explore Case Study ↗
                </span>
              </SafeLink>
            </div>
          </div>

          {/* Right Phone Mockups with Musical Notes Doodles */}
          <div className="md:col-span-6 flex items-center justify-center relative p-6">
            <div className="relative flex items-center justify-center">
              {/* Phone 1 (Back, tilted) */}
              <div className="w-40 sm:w-48 aspect-[9/18] rounded-3xl overflow-hidden border-4 border-stone-700 shadow-2xl bg-black rotate-[-10deg] -mr-12 z-0 relative">
                <img
                  src={showcaseProjects[0]?.imageUrl}
                  alt="App UI Screen"
                  className="w-full h-full object-cover opacity-80"
                  loading="lazy"
                />
              </div>

              {/* Phone 2 (Front, focused) */}
              <div className="w-44 sm:w-52 aspect-[9/18] rounded-3xl overflow-hidden border-4 border-stone-600 shadow-2xl bg-black rotate-[8deg] z-10 relative">
                <img
                  src={showcaseProjects[0]?.imageUrl}
                  alt="App UI Screen"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Music Notes Doodles Floating */}
            <div
              className="absolute top-2 right-4"
              style={{ color: typeA.doodle }}
            >
              <DoodleMusicNotes className="w-12 h-10" />
            </div>
            <div
              className="absolute bottom-4 left-6 font-['Caveat',cursive] text-lg rotate-[-12deg]"
              style={{ color: typeA.doodle }}
            >
              <span>Dark UI & fluid audio</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 7: CASE STUDY 2 - "Y CARE"
          ==================================================================== */}
      <section
        id="project-2"
        className={`${typeB.bg} ${typeB.text} px-6 py-20 border-t ${typeB.border} transition-colors`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left: Phone in Hand Mockup with Speech Bubbles */}
          <div className="md:col-span-6 flex flex-col items-center justify-center relative p-6">
            <div className="relative w-56 sm:w-64 flex flex-col items-center">
              {/* Phone Mockup Frame */}
              <div
                className={`w-44 sm:w-52 aspect-[9/18] rounded-[32px] overflow-hidden border-[6px] ${
                  typeB.isDark ? "border-stone-700" : "border-stone-800"
                } shadow-xl bg-white relative z-10`}
              >
                <img
                  src={showcaseProjects[1]?.imageUrl}
                  alt={showcaseProjects[1]?.title || "Y Care"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Speech Bubble Doodles */}
              <div
                className={`absolute -top-4 -left-6 ${typeB.cardBg} border ${
                  typeB.isDark ? "border-stone-700" : "border-stone-800"
                } rounded-2xl px-3 py-1 shadow-sm font-['Caveat',cursive] text-lg rotate-[-8deg] z-20`}
                style={{ color: typeB.doodle }}
              >
                <span>01 Clean UX</span>
              </div>

              <div
                className={`absolute top-16 -right-6 ${typeB.cardBg} border ${
                  typeB.isDark ? "border-stone-700" : "border-stone-800"
                } rounded-2xl px-3 py-1 shadow-sm font-['Caveat',cursive] text-lg rotate-[6deg] z-20`}
                style={{ color: typeB.doodle }}
              >
                <span>02 +45% Retention</span>
              </div>

              <div
                className={`absolute -bottom-4 -left-2 ${typeB.cardBg} border ${
                  typeB.isDark ? "border-stone-700" : "border-stone-800"
                } rounded-2xl px-3 py-1 shadow-sm font-['Caveat',cursive] text-lg rotate-[4deg] z-20`}
                style={{ color: typeB.doodle }}
              >
                <span>03 Accessible WCAG AAA</span>
              </div>
            </div>
          </div>

          {/* Right: Case Study Narrative */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: typeB.doodle }}
              >
                Case Study 02 // Healthcare & Empathy
              </span>
              <h3
                className={`text-4xl sm:text-5xl ${typeB.heading} font-normal tracking-tight mt-1`}
                style={{ fontFamily: fontStyles.heading }}
              >
                {showcaseProjects[1]?.title || "Y care"}
              </h3>
            </div>

            <p className={`text-sm sm:text-base ${typeB.sub} leading-relaxed`}>
              {showcaseProjects[1]?.description ||
                "A digital rehabilitation companion designed to simplify chronic condition management. Built with high readability type scales, intuitive touch targets, and compassionate micro-feedback."}
            </p>

            {showcaseProjects[1]?.tags && (
              <div className="flex flex-wrap gap-2">
                {showcaseProjects[1].tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full border text-xs font-mono ${
                      typeB.isDark
                        ? "bg-stone-800 border-stone-700 text-stone-300"
                        : "bg-white border-stone-300 text-stone-800"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 flex items-center gap-4">
              <SafeLink
                href={showcaseProjects[1]?.liveUrl || "#"}
                className={`px-5 py-2.5 rounded-xl ${
                  typeB.isDark
                    ? "bg-stone-100 text-stone-900 hover:bg-white"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                } font-medium text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5`}
              >
                <span>Read Full Case Study</span>
                <span>↗</span>
              </SafeLink>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 8: CASE STUDY 3 - "REDESIGN GOODREADS"
          ==================================================================== */}
      <section
        id="project-3"
        className={`${typeA.bg} ${typeA.text} px-6 py-20 border-t ${typeA.border} transition-colors`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Details */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: typeA.doodle }}
              >
                Case Study 03 // Information Architecture
              </span>
              <h3
                className={`text-4xl sm:text-5xl ${typeA.heading} font-normal tracking-tight mt-1`}
                style={{ fontFamily: fontStyles.heading }}
              >
                {showcaseProjects[2]?.title || "Redesign Goodreads"}
              </h3>
            </div>

            <p className={`text-sm sm:text-base ${typeA.sub} leading-relaxed`}>
              {showcaseProjects[2]?.description ||
                "Decluttering the world's most famous reading platform. A ground-up rethink of book tracking, recommendation heuristics, and community reviews prioritizing reader delight."}
            </p>

            <div className="pt-2">
              <SafeLink
                href={showcaseProjects[2]?.liveUrl || "#"}
                className={`relative inline-flex items-center gap-2 px-6 py-2.5 ${typeA.text} hover:opacity-80 transition-opacity`}
              >
                <DoodleOvalRing style={{ color: typeA.doodle }} />
                <span
                  className="relative z-10 font-['Caveat',cursive] text-2xl"
                  style={{ color: typeA.doodle }}
                >
                  View Reading Prototype ↗
                </span>
              </SafeLink>
            </div>
          </div>

          {/* Right Multi-Screen Panels */}
          <div className="md:col-span-6 flex items-center justify-center p-6">
            <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
              <div
                className={`aspect-[9/16] rounded-2xl overflow-hidden border-2 ${
                  typeA.isDark
                    ? "border-stone-700 bg-stone-900"
                    : "border-stone-300 bg-stone-100"
                } shadow-xl`}
              >
                <img
                  src={showcaseProjects[2]?.imageUrl}
                  alt="Shelf View"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className={`aspect-[9/16] rounded-2xl overflow-hidden border-2 ${
                  typeA.isDark
                    ? "border-stone-700 bg-stone-900"
                    : "border-stone-300 bg-stone-100"
                } shadow-xl mt-6`}
              >
                <img
                  src={showcaseProjects[2]?.imageUrl}
                  alt="Book Detail"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 9: CASE STUDY 4 - "SHWE"
          ==================================================================== */}
      <section
        id="project-4"
        className={`${typeB.bg} ${typeB.text} px-6 py-20 border-t ${typeB.border} transition-colors`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Fanning Screens */}
          <div className="md:col-span-6 flex items-center justify-center p-6">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-36 sm:w-44 aspect-[9/16] rounded-2xl overflow-hidden border-2 ${
                  typeB.isDark ? "border-stone-700" : "border-stone-800"
                } shadow-lg bg-white rotate-[-12deg] -mr-8`}
              >
                <img
                  src={showcaseProjects[3]?.imageUrl}
                  alt="Fashion UI"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className={`w-40 sm:w-48 aspect-[9/16] rounded-2xl overflow-hidden border-2 ${
                  typeB.isDark ? "border-stone-700" : "border-stone-800"
                } shadow-2xl bg-white rotate-[6deg] z-10`}
              >
                <img
                  src={showcaseProjects[3]?.imageUrl}
                  alt="Fashion Lookbook"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right Narrative */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: typeB.doodle }}
              >
                Case Study 04 // Luxury E-Commerce
              </span>
              <h3
                className={`text-4xl sm:text-5xl ${typeB.heading} font-normal tracking-tight mt-1`}
                style={{ fontFamily: fontStyles.heading }}
              >
                {showcaseProjects[3]?.title || "Shwe"}
              </h3>
            </div>

            <p className={`text-sm sm:text-base ${typeB.sub} leading-relaxed`}>
              {showcaseProjects[3]?.description ||
                "A premium fashion commerce experience with runway lookbook integrations, micro-transitions, and organic product discovery tailored for modern luxury brands."}
            </p>

            <div className="pt-2">
              <SafeLink
                href={showcaseProjects[3]?.liveUrl || "#"}
                className={`px-5 py-2.5 rounded-xl ${
                  typeB.isDark
                    ? "bg-stone-100 text-stone-900 hover:bg-white"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                } font-medium text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5`}
              >
                <span>View Fashion App</span>
                <span>↗</span>
              </SafeLink>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 10: CASE STUDY 5 - "INSPIRATION APP"
          ==================================================================== */}
      <section
        id="project-5"
        className={`${typeB.bg} ${typeB.text} px-6 py-20 border-t ${typeB.border} transition-colors`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Narrative with Oval Blue Doodle Underline */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: typeB.doodle }}
              >
                Case Study 05 // Creative Ideation
              </span>
              <h3
                className={`text-4xl sm:text-5xl ${typeB.heading} font-normal tracking-tight mt-1`}
                style={{ fontFamily: fontStyles.heading }}
              >
                {showcaseProjects[4]?.title || "Inspiration App"}
              </h3>
            </div>

            <p className={`text-sm sm:text-base ${typeB.sub} leading-relaxed`}>
              {showcaseProjects[4]?.description ||
                "Bridging physical sketchbook journaling with digital workflows. Capture pencil wireframes, organize moodboards, and export interactive component states seamlessly."}
            </p>

            <div className="pt-2" style={{ color: typeB.doodle }}>
              <DoodleWavyUnderline className="w-56 h-4" />
            </div>
          </div>

          {/* Right Open Sketchbook & Phone Screens */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-6 space-y-4">
            {/* Open Sketchbook Graphic */}
            <div
              className={`w-full max-w-xs p-4 rounded-lg border-2 ${
                typeB.isDark
                  ? "border-stone-700 bg-stone-800/90"
                  : "border-stone-800 bg-stone-100"
              } shadow-md relative rotate-[-2deg]`}
            >
              <div
                className={`flex justify-between items-center text-[10px] font-mono ${typeB.sub} border-b ${
                  typeB.isDark ? "border-stone-700" : "border-stone-300"
                } pb-1 mb-2`}
              >
                <span>SKETCHBOOK ENTRY #42</span>
                <span>OCT 2025</span>
              </div>
              <div className="space-y-1.5 opacity-70">
                <div
                  className={`w-full h-2 rounded ${
                    typeB.isDark ? "bg-stone-700" : "bg-stone-300"
                  }`}
                />
                <div
                  className={`w-5/6 h-2 rounded ${
                    typeB.isDark ? "bg-stone-700" : "bg-stone-300"
                  }`}
                />
                <div
                  className={`w-4/6 h-2 rounded ${
                    typeB.isDark ? "bg-stone-700" : "bg-stone-300"
                  }`}
                />
              </div>
              <div
                className="mt-3 flex justify-around"
                style={{ color: typeB.doodle }}
              >
                <DoodleStar className="w-4 h-4" />
                <DoodleMusicNotes className="w-5 h-4" />
                <DoodleCamera className="w-4 h-4" />
              </div>
            </div>

            <div
              className="font-['Caveat',cursive] text-lg rotate-[2deg]"
              style={{ color: typeB.doodle }}
            >
              <span>From paper sketches to interactive prototype</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 11: "FUN FACTS" & PHOTO GRID
          ==================================================================== */}
      <section
        id="fun-facts"
        className={`${typeA.bg} ${typeA.text} px-6 py-20 border-t ${typeA.border} transition-colors`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left: Mobile Phone with 2x2 Photo Grid */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative p-6">
            <div
              className={`w-52 sm:w-60 p-3 rounded-[32px] border-2 border-dashed ${
                typeA.isDark
                  ? "border-stone-700 bg-stone-900"
                  : "border-stone-400 bg-white"
              } shadow-2xl relative rotate-[-4deg]`}
              style={{ borderColor: typeA.doodle }}
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-800">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80"
                    alt="Desk Setup"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-800">
                  <img
                    src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80"
                    alt="Concert & Music"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-800">
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80"
                    alt="Coffee Cup"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-800">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80"
                    alt="Pet Dog"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div
                className={`mt-2 text-center text-[10px] font-mono ${typeA.sub}`}
              >
                @aaliyah.snaps • weekend journal
              </div>
            </div>
          </div>

          {/* Right: Fun Facts with Hand-Drawn Doodle Sketches */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: typeA.doodle }}
              >
                Behind The Canvas
              </span>
              <h2
                className={`text-4xl sm:text-5xl ${typeA.heading} font-normal tracking-tight mt-1`}
                style={{ fontFamily: fontStyles.heading }}
              >
                Fun Facts
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Fact 1: Guitar */}
              <div className="flex items-start gap-3">
                <DoodleGuitar
                  className="w-10 h-10 shrink-0"
                  style={{ color: typeA.doodle }}
                />
                <div>
                  <h4 className={`font-bold text-sm ${typeA.heading}`}>
                    Indie Acoustic
                  </h4>
                  <p
                    className={`text-xs ${typeA.sub} font-['Caveat',cursive] text-lg`}
                  >
                    Playing acoustic fingerstyle guitar & collecting vinyl records.
                  </p>
                </div>
              </div>

              {/* Fact 2: Cooking */}
              <div className="flex items-start gap-3">
                <DoodleCookingPot
                  className="w-10 h-10 shrink-0"
                  style={{ color: typeA.doodle }}
                />
                <div>
                  <h4 className={`font-bold text-sm ${typeA.heading}`}>
                    Home Chef
                  </h4>
                  <p
                    className={`text-xs ${typeA.sub} font-['Caveat',cursive] text-lg`}
                  >
                    Passionate about handmade pasta & sourdough baking experiments.
                  </p>
                </div>
              </div>

              {/* Fact 3: Camera */}
              <div className="flex items-start gap-3">
                <DoodleCamera
                  className="w-10 h-10 shrink-0"
                  style={{ color: typeA.doodle }}
                />
                <div>
                  <h4 className={`font-bold text-sm ${typeA.heading}`}>
                    35mm Film
                  </h4>
                  <p
                    className={`text-xs ${typeA.sub} font-['Caveat',cursive] text-lg`}
                  >
                    Documenting street architecture with a mechanical Olympus OM-1.
                  </p>
                </div>
              </div>

              {/* Fact 4: Rescue Pet */}
              <div className="flex items-start gap-3">
                <DoodlePet
                  className="w-10 h-10 shrink-0"
                  style={{ color: typeA.doodle }}
                />
                <div>
                  <h4 className={`font-bold text-sm ${typeA.heading}`}>
                    Animal Lover
                  </h4>
                  <p
                    className={`text-xs ${typeA.sub} font-['Caveat',cursive] text-lg`}
                  >
                    Proud pet parent to a rescue golden retriever named Miso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 12: "THANK YOU" FOOTER
          ==================================================================== */}
      <footer
        id="contact"
        className={`${typeB.bg} ${typeB.text} border-t ${typeB.border} transition-colors`}
      >
        {/* Quick Nav Header Row */}
        <div className={`border-b ${typeB.border}`}>
          <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between text-xs sm:text-sm font-medium">
            <a
              href="#hero"
              className="hover:opacity-80 transition-opacity"
              style={{ color: typeB.doodle }}
            >
              01 // Top
            </a>
            <div
              className={`h-4 w-px ${
                typeB.isDark ? "bg-stone-700" : "bg-stone-300"
              }`}
            />
            <a
              href="#projects"
              className="hover:opacity-80 transition-opacity"
              style={{ color: typeB.doodle }}
            >
              02 // Work ({showcaseProjects.length.toString().padStart(2, "0")})
            </a>
            <div
              className={`h-4 w-px ${
                typeB.isDark ? "bg-stone-700" : "bg-stone-300"
              }`}
            />
            <a
              href="#education"
              className="hover:opacity-80 transition-opacity"
              style={{ color: typeB.doodle }}
            >
              03 // Credentials
            </a>
          </div>
        </div>

        {/* Main Footer Body */}
        <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left: Avatar & "Thank you" */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className={`w-12 h-12 rounded-full object-cover border-2 ${
                    typeB.isDark ? "border-stone-700" : "border-stone-800"
                  }`}
                  loading="lazy"
                />
                <div
                  className="absolute -top-1 -right-1"
                  style={{ color: typeB.doodle }}
                >
                  <DoodleStar className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h3 className={`font-bold text-sm ${typeB.heading}`}>
                  {fullName}
                </h3>
                <p className={`text-xs ${typeB.sub} font-mono`}>{headline}</p>
              </div>
            </div>

            <h2
              className={`text-5xl sm:text-6xl ${typeB.heading} font-normal tracking-tight`}
              style={{ fontFamily: fontStyles.heading }}
            >
              Thank you
            </h2>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${typeB.heading} hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  <Mail className="w-4 h-4" style={{ color: typeB.doodle }} />
                  <span>{email}</span>
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className={`w-3.5 h-3.5 ${typeB.sub}`} />
                  )}
                </button>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socialLinks.map((link, i) => (
                    <SafeLink
                      key={i}
                      href={link.url}
                      className={`px-3 py-1 rounded-full border text-xs font-mono transition-colors inline-flex items-center gap-1.5 ${
                        typeB.isDark
                          ? "bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-500"
                          : "bg-white border-stone-300 text-stone-700 hover:border-stone-800"
                      }`}
                    >
                      <BrandIcon name={link.platform} size={12} />
                      <span>{link.label || link.platform}</span>
                    </SafeLink>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Handwritten Blue Ink Letter */}
          <div
            className={`md:col-span-6 p-6 rounded-2xl ${typeB.cardBg} border ${typeB.cardBorder} shadow-sm relative`}
          >
            <p
              className="font-['Caveat',cursive] text-xl sm:text-2xl leading-relaxed"
              style={{ color: typeB.doodle }}
            >
              &ldquo;Thank you for taking the time to explore my design sketchbook and case studies! I&apos;m always excited to collaborate on human-centered products, design systems, and ambitious ideas. Let&apos;s build something meaningful together.&rdquo;
            </p>

            <div
              className={`mt-4 pt-4 border-t ${
                typeB.isDark ? "border-stone-700/80" : "border-stone-200"
              } flex items-center justify-between text-xs font-mono ${typeB.sub}`}
            >
              <span>
                © {new Date().getFullYear()} {fullName}
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`hover:opacity-80 inline-flex items-center gap-1 cursor-pointer font-bold ${typeB.heading}`}
              >
                <span>Top</span>
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
