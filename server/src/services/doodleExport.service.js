/**
 * Doodle Scrapbook Portfolio Template Static HTML, CSS & JS Generators and Source JSX.
 * Faithfully reproduces the hand-drawn sketchbook aesthetic with alternating slate and parchment sections.
 */

export function getFullDoodleTemplateJsx() {
  return `import React, { useState, useMemo } from "react";
import { ArrowUp, MapPin, ExternalLink, Mail, Copy, Check } from "lucide-react";
import { BrandIcon } from "../common/BrandIcon.jsx";
import { SafeLink } from "../common/SafeLink.jsx";
import { normalizeAvatarUrl } from "../common/urlUtils.js";

function DoodleArrowCurved({ className = "" }) {
  return (
    <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M10 15 C 45 5, 85 10, 105 45 C 108 52, 106 60, 102 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M92 48 L 103 63 L 115 52" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoodleOvalRing({ className = "" }) {
  return (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={\`absolute inset-0 w-full h-full pointer-events-none \${className}\`} aria-hidden="true">
      <path d="M 20 35 C 15 15, 60 8, 120 8 C 185 8, 228 16, 228 35 C 228 54, 175 62, 115 62 C 55 62, 10 52, 14 33 C 18 18, 70 12, 128 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleWavyUnderline({ className = "" }) {
  return (
    <svg viewBox="0 0 200 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M 5 10 Q 25 3, 45 10 T 85 10 T 125 10 T 165 10 T 195 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleStar({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M12 2 L13.8 8.8 L20.5 12 L13.8 15.2 L12 22 L10.2 15.2 L3.5 12 L10.2 8.8 Z" fill="currentColor" />
    </svg>
  );
}

function DoodleMusicNotes({ className = "" }) {
  return (
    <svg viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M15 35 A 6 5 0 1 1 9 30 L 9 10 L 28 6 L 28 26 A 6 5 0 1 1 22 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="45" cy="18" r="4" fill="currentColor" />
      <path d="M49 18 L 49 6 Q 54 8 57 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleGuitar({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M48 8 L54 14 M44 12 L50 18 M46 10 L28 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="40" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="28" cy="32" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="36" r="3" fill="currentColor" />
      <path d="M12 48 L6 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleCookingPot({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M16 28 L48 28 L44 50 C44 54, 20 54, 20 50 Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 28 L52 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 24 C28 22, 36 22, 36 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 16 C22 12, 26 10, 24 6 M32 18 C30 14, 34 12, 32 8 M40 16 C38 12, 42 10, 40 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DoodleCamera({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="10" y="20" width="44" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20 L25 14 L39 14 L42 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="36" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="36" r="4" fill="currentColor" />
      <circle cx="46" cy="26" r="2" fill="currentColor" />
    </svg>
  );
}

function DoodlePet({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M16 38 C16 28, 28 26, 36 30 C44 26, 52 30, 50 40 C48 48, 38 52, 24 50 C18 48, 16 44, 16 38 Z" stroke="currentColor" strokeWidth="2" />
      <path d="M20 28 L18 18 L26 24 M36 24 L44 18 L42 28" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="27" cy="33" r="1.5" fill="currentColor" />
      <circle cx="35" cy="33" r="1.5" fill="currentColor" />
      <path d="M30 36 L32 37 L34 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 42 C56 40, 58 48, 56 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleQrCode({ value = "https://portfolio.dev" }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-stone-300 shadow-sm inline-block">
      <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 text-stone-900" fill="currentColor">
        <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="13" y="13" width="12" height="12" rx="1" fill="currentColor" />
        <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="75" y="13" width="12" height="12" rx="1" fill="currentColor" />
        <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="13" y="75" width="12" height="12" rx="1" fill="currentColor" />
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

export function DoodleTemplate({ portfolio = {}, showEmpty = false, hiddenSections = [] }) {
  const profile = portfolio.profile || {};
  const socialLinks = portfolio.socialLinks || [];
  const rawSkills = portfolio.skills || [];
  const education = portfolio.education || [];
  const projects = portfolio.projects || [];

  const fullName = profile.fullName || "Aaliyah Vance";
  const headline = profile.headline || "Product & UI/UX Designer";
  const bio = profile.bio || "Hi, I'm a product designer driven by empathy, craft, and playful visual storytelling. With over five years of experience designing mobile ecosystems, accessible systems, and joyful digital products, I bridge complex engineering with warm, human-centered interfaces that make people feel right at home.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80");
  const email = profile.email || "hello@aaliyahvance.design";
  const location = profile.location || "San Francisco, CA";

  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2400);
  };

  const showcaseProjects = useMemo(() => {
    if (projects.length > 0) return projects;
    return [
      {
        title: "Dance",
        description: "An immersive dark-mode music and video stream app for choreographers and street dance crews with buttery-smooth 60fps micro-interactions.",
        tags: ["Mobile App", "Dark UI", "Motion", "Figma"],
        liveUrl: "https://example.com/dance",
        imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Y care",
        description: "Accessible digital wellness and patient companionship mobile platform designed for elderly rehabilitation and daily mindfulness tracking.",
        tags: ["Healthcare", "Accessibility", "Research", "iOS"],
        liveUrl: "https://example.com/ycare",
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Redesign Goodreads",
        description: "Transforming book discovery through minimalist editorial typography, distraction-free reading logs, and personalized community book clubs.",
        tags: ["Case Study", "Editorial UX", "Design Systems"],
        liveUrl: "https://example.com/goodreads",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Shwe",
        description: "High-fashion luxury commerce app blending magazine-style editorial layouts with instant 1-tap checkout and curated seasonal capsules.",
        tags: ["E-commerce", "Fashion", "Grid System"],
        liveUrl: "https://example.com/shwe",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
      },
      {
        title: "Inspiration App",
        description: "From notebook sketches to high-fidelity tactile UI: a personal ideation notebook app for artists, writers, and creative directors.",
        tags: ["Creative Journal", "Sketchbook", "Mobile"],
        liveUrl: "https://example.com/inspiration",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80",
      },
    ];
  }, [projects]);

  const skillNames = useMemo(() => {
    if (rawSkills.length > 0) return rawSkills.map((s) => (typeof s === "string" ? s : s.name));
    return ["Figma", "UI/UX Design", "Wireframing", "Prototyping", "Design Systems", "User Research", "Usability Testing", "Visual Design", "Information Architecture", "HTML & CSS"];
  }, [rawSkills]);

  return (
    <div className="min-h-screen bg-[#222223] text-stone-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#6366F1]/30 selection:text-white">
      {/* Top Nav */}
      <nav className="border-b border-stone-800/80 bg-[#222223]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between text-xs sm:text-sm font-medium tracking-wide">
          <a href="#projects" className="hover:text-[#9AA5E2] transition-colors py-2 flex items-center gap-1.5">
            <span>Work</span>
            <span className="text-[11px] text-stone-400 font-mono">({showcaseProjects.length.toString().padStart(2, "0")})</span>
          </a>
          <div className="h-4 w-px bg-stone-700/60" />
          <a href="#education" className="hover:text-[#9AA5E2] transition-colors py-2">Education / Skills</a>
          <div className="h-4 w-px bg-stone-700/60" />
          <a href="#contact" className="hover:text-[#9AA5E2] transition-colors py-2">Contact & Socials</a>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative px-6 pt-16 pb-24 text-center overflow-hidden flex flex-col items-center justify-center min-h-[460px]">
        <div className="relative mb-3 flex items-center justify-center">
          <span className="font-['Caveat',cursive] text-2xl sm:text-3xl text-[#9AA5E2] rotate-[-4deg] tracking-wide inline-block">Welcome to my</span>
          <div className="relative -ml-2 -mt-4 text-[#9AA5E2]">
            <DoodleArrowCurved className="w-16 h-10 sm:w-20 sm:h-12 rotate-[12deg]" />
          </div>
        </div>

        <div className="relative inline-block my-2">
          <h1 className="font-['Playfair_Display',Georgia,serif] text-6xl sm:text-7xl md:text-8xl tracking-tight text-white font-normal leading-none select-none">
            P<span className="relative inline-block">o<span className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-xs font-mono text-[#9AA5E2] font-bold">19</span></span>rtf<span className="relative inline-block">o<span className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-xs font-mono text-[#9AA5E2] font-bold">01</span></span>li<span className="relative inline-block">o<span className="absolute -top-3 right-0 text-[#9AA5E2]"><DoodleStar className="w-4 h-4" /></span></span>
          </h1>
        </div>

        <div className="relative mt-5 inline-flex items-center justify-center px-6 py-2.5">
          <DoodleOvalRing className="text-[#9AA5E2]" />
          <span className="relative z-10 font-['Caveat',cursive] text-2xl sm:text-3xl text-stone-200 tracking-wide">{headline}</span>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-[#F4F0E8] text-[#1E1E20] px-6 py-20 border-t border-stone-300">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="absolute -top-6 -left-2 text-[#5A65B8] font-['Caveat',cursive] text-lg sm:text-xl rotate-[-8deg] flex items-center gap-1 z-10">
              <MapPin className="w-4 h-4 inline" /><span>Based in {location}</span>
            </div>
            <div className="absolute -top-8 -right-4 text-[#5A65B8] font-['Caveat',cursive] text-lg sm:text-xl rotate-[6deg] flex items-center gap-1 z-10">
              <span>{headline.split(" ")[0]}</span><DoodleStar className="w-3.5 h-3.5" />
            </div>
            <div className="relative p-2">
              <div className="w-48 sm:w-56 h-64 sm:h-72 rounded-t-[100px] rounded-b-2xl overflow-hidden border-2 border-stone-800 shadow-md bg-stone-300">
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
            <div className="mt-4 text-[#5A65B8] font-['Caveat',cursive] text-lg sm:text-xl rotate-[-3deg]">
              <span>☕ Coffee lover & craft enthusiast</span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <h2 className="font-['Playfair_Display',Georgia,serif] text-5xl sm:text-6xl text-[#1E1E20] font-normal tracking-tight">Hello,</h2>
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">{bio}</p>
            <div className="pt-2 text-[#5A65B8]"><DoodleWavyUnderline className="w-48 h-4" /></div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className="bg-[#F4F0E8] text-[#1E1E20] px-6 py-16 border-t border-stone-300">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-7 space-y-6">
            <div>
              <h2 className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl text-[#1E1E20] font-normal tracking-tight">Education</h2>
              <p className="mt-1 text-sm text-stone-600">Academic foundations and design methodology.</p>
            </div>
            <div className="space-y-5">
              {education.length > 0 ? (
                education.map((edu, idx) => (
                  <div key={idx} className="border-b border-stone-300/80 pb-4 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <span className="font-bold text-base sm:text-lg text-[#1E1E20]">{edu.degree || "Degree"}</span>
                      <span className="text-xs sm:text-sm font-mono text-stone-500">{edu.startDate} — {edu.endDate || "Present"}</span>
                    </div>
                    <p className="text-sm font-medium text-stone-700">{edu.institution}</p>
                  </div>
                ))
              ) : (
                <div className="border-b border-stone-300/80 pb-4 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-bold text-base sm:text-lg text-[#1E1E20]">B.S. in Interaction Design & HCI</span>
                    <span className="text-xs sm:text-sm font-mono text-stone-500">2018 — 2022</span>
                  </div>
                  <p className="text-sm text-stone-700">California College of the Arts • San Francisco, CA</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-white/70 rounded-2xl border border-stone-300 shadow-sm relative">
            <DoodleQrCode value="https://portfolio.dev" />
            <div className="mt-3 text-center">
              <div className="font-['Caveat',cursive] text-xl text-[#5A65B8]">Scan to view full CV / Resume ↗</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="bg-[#F4F0E8] text-[#1E1E20] px-6 py-16 border-t border-stone-300">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <h2 className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl text-[#1E1E20] font-normal tracking-tight">Skills</h2>
              <p className="mt-1 text-sm text-stone-600">Tooling, design methodologies, and implementation proficiencies.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {skillNames.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-stone-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5A65B8]" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6">
            <div className="w-44 sm:w-52 flex flex-col items-center space-y-1">
              <div className="w-36 h-7 rounded-sm bg-stone-200 border-2 border-stone-800 shadow-sm flex items-center justify-between px-3 text-[10px] font-mono text-stone-700">DESIGN SYSTEMS</div>
              <div className="w-44 h-8 rounded-sm bg-stone-100 border-2 border-stone-800 shadow-sm flex items-center justify-between px-3 text-[10px] font-mono text-stone-800 font-bold rotate-[1.5deg]">USER RESEARCH</div>
              <div className="w-48 h-9 rounded-sm bg-stone-300 border-2 border-stone-800 shadow-md flex items-center justify-between px-3 text-[10px] font-mono text-stone-800 rotate-[-1deg]">INTERACTION MOTION</div>
            </div>
            <div className="mt-6 text-center text-[#5A65B8] font-['Caveat',cursive] text-lg">Continuous learning & design research</div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="bg-[#222223] text-stone-100 px-6 py-20 border-t border-stone-800">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl text-white font-normal tracking-tight">Projects</h2>
                <span className="font-['Caveat',cursive] text-3xl text-[#9AA5E2] rotate-[10deg]">:)</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-stone-400 font-mono">Selected client engagements, product prototypes, and mobile apps.</p>
            </div>
            <div className="font-['Caveat',cursive] text-xl sm:text-2xl text-[#9AA5E2]">Case Studies & Systems 2024–2026 ✦</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {showcaseProjects.slice(0, 5).map((proj, idx) => (
              <div key={idx} className="group block p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                <div className="aspect-[9/16] rounded-lg overflow-hidden bg-stone-800 relative mb-2.5">
                  <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">0{idx + 1}</span>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xs sm:text-sm text-stone-200 truncate">{proj.title}</h3>
                  <p className="text-[10px] font-mono text-stone-500 truncate">{proj.tags?.[0] || "Interactive"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study 1: Dance */}
      <section className="bg-[#222223] text-stone-100 px-6 py-20 border-t border-stone-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 space-y-5">
            <span className="text-xs font-mono text-[#9AA5E2] uppercase tracking-widest">Case Study 01 // Dark Mode & Motion</span>
            <h3 className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl text-white font-normal tracking-tight">{showcaseProjects[0]?.title || "Dance"}</h3>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">{showcaseProjects[0]?.description}</p>
            <div className="pt-2">
              <SafeLink href={showcaseProjects[0]?.liveUrl || "#"} className="relative inline-flex items-center gap-2 px-6 py-2.5 text-stone-100">
                <DoodleOvalRing className="text-[#9AA5E2]" />
                <span className="relative z-10 font-['Caveat',cursive] text-2xl text-[#9AA5E2]">Explore Case Study ↗</span>
              </SafeLink>
            </div>
          </div>
          <div className="md:col-span-6 flex items-center justify-center relative p-6">
            <div className="w-44 sm:w-52 aspect-[9/18] rounded-3xl overflow-hidden border-4 border-stone-600 shadow-2xl bg-black">
              <img src={showcaseProjects[0]?.imageUrl} alt="Dance Screen" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute top-2 right-4 text-[#9AA5E2]"><DoodleMusicNotes className="w-12 h-10" /></div>
          </div>
        </div>
      </section>

      {/* Case Study 2: Y care */}
      <section className="bg-[#F4F0E8] text-[#1E1E20] px-6 py-20 border-t border-stone-300">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 flex flex-col items-center justify-center p-6 relative">
            <div className="w-44 sm:w-52 aspect-[9/18] rounded-[32px] overflow-hidden border-[6px] border-stone-800 shadow-xl bg-white">
              <img src={showcaseProjects[1]?.imageUrl} alt="Y Care Screen" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="md:col-span-6 space-y-5">
            <span className="text-xs font-mono text-[#5A65B8] uppercase tracking-widest">Case Study 02 // Healthcare</span>
            <h3 className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl text-[#1E1E20] font-normal tracking-tight">{showcaseProjects[1]?.title || "Y care"}</h3>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">{showcaseProjects[1]?.description}</p>
            <div className="pt-2">
              <SafeLink href={showcaseProjects[1]?.liveUrl || "#"} className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-xs sm:text-sm inline-flex items-center gap-1.5">
                <span>Read Full Case Study</span><span>↗</span>
              </SafeLink>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="bg-[#222223] text-stone-100 px-6 py-20 border-t border-stone-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6">
            <div className="w-52 sm:w-60 p-3 rounded-[32px] border-2 border-dashed border-[#9AA5E2] bg-stone-900 shadow-2xl">
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-800">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80" alt="Desk" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-800">
                  <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80" alt="Coffee" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="mt-2 text-center text-[10px] font-mono text-stone-400">@aaliyah.snaps • weekend journal</div>
            </div>
          </div>
          <div className="md:col-span-7 space-y-6">
            <h2 className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl text-white font-normal tracking-tight">Fun Facts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <DoodleGuitar className="w-10 h-10 text-[#9AA5E2] shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-stone-200">Indie Acoustic</h4>
                  <p className="text-xs text-stone-400 font-['Caveat',cursive] text-lg">Playing acoustic guitar & collecting records.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DoodleCookingPot className="w-10 h-10 text-[#9AA5E2] shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-stone-200">Home Chef</h4>
                  <p className="text-xs text-stone-400 font-['Caveat',cursive] text-lg">Handmade pasta & sourdough baking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#F4F0E8] text-[#1E1E20] border-t border-stone-300">
        <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <img src={avatarUrl} alt={fullName} className="w-12 h-12 rounded-full object-cover border-2 border-stone-800" />
              <div>
                <h3 className="font-bold text-sm text-[#1E1E20]">{fullName}</h3>
                <p className="text-xs text-stone-600 font-mono">{headline}</p>
              </div>
            </div>
            <h2 className="font-['Playfair_Display',Georgia,serif] text-5xl sm:text-6xl text-[#1E1E20] font-normal tracking-tight">Thank you</h2>
            <button type="button" onClick={handleCopyEmail} className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 cursor-pointer">
              <Mail className="w-4 h-4 text-[#5A65B8]" />
              <span>{email}</span>
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            </button>
          </div>
          <div className="md:col-span-6 p-6 rounded-2xl bg-white/60 border border-stone-300 shadow-sm">
            <p className="font-['Caveat',cursive] text-xl sm:text-2xl text-[#5A65B8] leading-relaxed">
              &ldquo;Thank you for taking the time to explore my design sketchbook and case studies! Let&apos;s build something meaningful together.&rdquo;
            </p>
            <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between text-xs font-mono text-stone-500">
              <span>© {new Date().getFullYear()} {fullName}</span>
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer font-bold">
                <span>Top</span><ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;
}

export function generateDoodleStaticHtml(data, helpers) {
  const { escapeHtml = (s) => s, sanitizeUrl = (s) => s, GOOGLE_FONTS_LINK_TAG = "" } = helpers || {};
  const profile = data.profile || {};
  const socialLinks = data.socialLinks || [];
  const rawSkills = data.skills || [];
  const education = data.education || [];
  const projects = data.projects || [];

  const fullName = profile.fullName || "Aaliyah Vance";
  const headline = profile.headline || "Product & UI/UX Designer";
  const bio = profile.bio || "Hi, I'm a product designer driven by empathy, craft, and playful visual storytelling. With over five years of experience designing mobile ecosystems, accessible systems, and joyful digital products, I bridge complex engineering with warm, human-centered interfaces that make people feel right at home.";
  const avatarUrl = profile.avatarUrl ? sanitizeUrl(profile.avatarUrl) : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
  const email = profile.email || "hello@aaliyahvance.design";
  const location = profile.location || "San Francisco, CA";
  const seoTitle = escapeHtml(data.publication?.seoTitle || data.title || `${fullName} - Portfolio`);
  const seoDesc = escapeHtml(data.publication?.seoDescription || headline);

  const skillNames = rawSkills.length > 0
    ? rawSkills.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean)
    : ["Figma", "UI/UX Design", "Wireframing", "Prototyping", "Design Systems", "User Research", "Usability Testing", "Visual Design", "HTML & CSS"];

  const showcaseProjects = projects.length > 0 ? projects : [
    {
      title: "Dance",
      description: "An immersive dark-mode music and video stream app for choreographers and street dance crews with buttery-smooth 60fps micro-interactions.",
      tags: ["Mobile App", "Dark UI", "Motion"],
      liveUrl: "#",
      imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: "Y care",
      description: "Accessible digital wellness and patient companionship mobile platform designed for elderly rehabilitation and daily mindfulness tracking.",
      tags: ["Healthcare", "Accessibility", "Research"],
      liveUrl: "#",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: "Redesign Goodreads",
      description: "Transforming book discovery through minimalist editorial typography, distraction-free reading logs, and personalized community book clubs.",
      tags: ["Case Study", "Editorial UX", "Design Systems"],
      liveUrl: "#",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
    },
  ];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="./assets/style.css" />
</head>
<body class="doodle-body">
  <!-- Nav -->
  <nav class="doodle-nav">
    <div class="nav-container">
      <a href="#projects" class="nav-link">Work (${showcaseProjects.length.toString().padStart(2, "0")})</a>
      <div class="nav-divider"></div>
      <a href="#education" class="nav-link">Education / Skills</a>
      <div class="nav-divider"></div>
      <a href="#contact" class="nav-link">Contact & Socials</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <section id="hero" class="hero-doodle">
    <div class="hero-callout">
      <span class="script-welcome">Welcome to my</span>
      <svg class="doodle-arrow" viewBox="0 0 120 70" fill="none"><path d="M10 15 C 45 5, 85 10, 105 45 C 108 52, 106 60, 102 62" stroke="#9AA5E2" stroke-width="2.2" stroke-linecap="round"/><path d="M92 48 L 103 63 L 115 52" stroke="#9AA5E2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>

    <h1 class="hero-title">
      P<span class="encircled-o">o<span class="o-num">19</span></span>rtf<span class="encircled-o">o<span class="o-num">01</span></span>li<span class="encircled-o">o<span class="star-badge">✦</span></span>
    </h1>

    <div class="doodle-pill-headline">
      <svg class="oval-ring-svg" viewBox="0 0 240 70" fill="none"><path d="M 20 35 C 15 15, 60 8, 120 8 C 185 8, 228 16, 228 35 C 228 54, 175 62, 115 62 C 55 62, 10 52, 14 33 C 18 18, 70 12, 128 12" stroke="#9AA5E2" stroke-width="2" stroke-linecap="round"/></svg>
      <span class="headline-text">${escapeHtml(headline)}</span>
    </div>
  </section>

  <!-- Hello Section -->
  <section id="about" class="section-parchment">
    <div class="content-container grid-about">
      <div class="about-portrait-col">
        <div class="annotation-pin">📍 Based in ${escapeHtml(location)}</div>
        <div class="annotation-role">${escapeHtml(headline.split(" ")[0])} ✦</div>
        <div class="arched-photo-frame">
          <img src="${avatarUrl}" alt="${escapeHtml(fullName)}" class="portrait-img" />
        </div>
        <div class="annotation-coffee">☕ Coffee lover & craft enthusiast</div>
      </div>

      <div class="about-text-col">
        <h2 class="serif-h2">Hello,</h2>
        <p class="body-p">${escapeHtml(bio)}</p>
        <div class="wavy-underline">
          <svg viewBox="0 0 200 18" fill="none"><path d="M 5 10 Q 25 3, 45 10 T 85 10 T 125 10 T 165 10 T 195 10" stroke="#5A65B8" stroke-width="2.2" stroke-linecap="round"/></svg>
        </div>
      </div>
    </div>
  </section>

  <!-- Education Section -->
  <section id="education" class="section-parchment">
    <div class="content-container grid-two-col">
      <div class="edu-list-col">
        <h2 class="serif-h2">Education</h2>
        <p class="sub-desc">Academic foundations and design methodology.</p>
        <div class="edu-items">
          ${education.length > 0 ? education.map((edu) => `
            <div class="edu-row">
              <div class="edu-top"><span class="edu-degree">${escapeHtml(edu.degree || "Degree")}</span><span class="edu-date">${escapeHtml(edu.startDate)} — ${escapeHtml(edu.endDate || "Present")}</span></div>
              <p class="edu-school">${escapeHtml(edu.institution)}</p>
            </div>
          `).join("") : `
            <div class="edu-row">
              <div class="edu-top"><span class="edu-degree">B.S. in Interaction Design & HCI</span><span class="edu-date">2018 — 2022</span></div>
              <p class="edu-school">California College of the Arts • San Francisco, CA</p>
            </div>
          `}
        </div>
      </div>

      <div class="qr-col">
        <div class="qr-card">
          <div class="qr-box">
            <svg viewBox="0 0 100 100" class="qr-svg" fill="currentColor">
              <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="5" />
              <rect x="13" y="13" width="12" height="12" rx="1" />
              <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="5" />
              <rect x="75" y="13" width="12" height="12" rx="1" />
              <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="5" />
              <rect x="13" y="75" width="12" height="12" rx="1" />
              <line x1="38" y1="9" x2="62" y2="9" stroke="currentColor" stroke-width="4" stroke-dasharray="5 4" />
              <line x1="9" y1="38" x2="9" y2="62" stroke="currentColor" stroke-width="4" stroke-dasharray="5 4" />
              <rect x="42" y="20" width="7" height="7" /><rect x="53" y="20" width="7" height="7" />
              <rect x="42" y="32" width="7" height="7" /><rect x="65" y="40" width="7" height="7" />
              <rect x="78" y="40" width="7" height="7" /><rect x="42" y="48" width="16" height="7" />
              <rect x="70" y="52" width="7" height="15" /><rect x="42" y="65" width="7" height="7" />
              <rect x="55" y="65" width="7" height="7" /><rect x="42" y="78" width="12" height="7" />
            </svg>
          </div>
          <div class="qr-caption">Scan to view full CV / Resume ↗</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Skills Section -->
  <section id="skills" class="section-parchment">
    <div class="content-container grid-two-col">
      <div>
        <h2 class="serif-h2">Skills</h2>
        <p class="sub-desc">Tooling, design methodologies, and implementation proficiencies.</p>
        <div class="skills-bullet-grid">
          ${skillNames.map((s) => `<div class="skill-item"><span class="bullet-dot"></span><span>${escapeHtml(s)}</span></div>`).join("")}
        </div>
      </div>
      <div class="book-stack-col">
        <div class="book-stack">
          <div class="book-spine book-1">DESIGN SYSTEMS</div>
          <div class="book-spine book-2">USER RESEARCH</div>
          <div class="book-spine book-3">INTERACTION MOTION</div>
        </div>
        <div class="book-caption">Continuous learning & design research ✦</div>
      </div>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="section-slate">
    <div class="content-container">
      <div class="projects-head-row">
        <div>
          <div class="projects-title-flex">
            <h2 class="serif-h2 text-white">Projects</h2>
            <span class="smiley-doodle">:)</span>
          </div>
          <p class="projects-sub">Selected client engagements, product prototypes, and mobile apps.</p>
        </div>
        <div class="script-tag">Case Studies & Systems 2024–2026 ✦</div>
      </div>

      <div class="projects-grid-strip">
        ${showcaseProjects.map((proj, idx) => `
          <div class="project-mini-card">
            <div class="mini-img-frame">
              <img src="${sanitizeUrl(proj.imageUrl || "")}" alt="${escapeHtml(proj.title)}" class="mini-img" />
              <span class="mini-num">0${idx + 1}</span>
            </div>
            <h3 class="mini-title">${escapeHtml(proj.title)}</h3>
            <p class="mini-tag">${escapeHtml(proj.tags?.[0] || "Interactive")}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- Case Study 1: Dance -->
  <section class="section-slate">
    <div class="content-container grid-two-col">
      <div>
        <span class="case-label">Case Study 01 // Dark Mode & Motion</span>
        <h3 class="case-h3 text-white">${escapeHtml(showcaseProjects[0]?.title || "Dance")}</h3>
        <p class="case-desc text-stone-300">${escapeHtml(showcaseProjects[0]?.description || "")}</p>
        <div class="doodle-btn-wrap">
          <a href="${sanitizeUrl(showcaseProjects[0]?.liveUrl || "#")}" class="btn-doodle-oval">Explore Case Study ↗</a>
        </div>
      </div>
      <div class="mockup-dance-wrap">
        <div class="phone-frame phone-dance">
          <img src="${sanitizeUrl(showcaseProjects[0]?.imageUrl || "")}" alt="Dance App UI" class="phone-screen" />
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer id="contact" class="section-parchment footer-doodle">
    <div class="content-container grid-two-col">
      <div>
        <div class="footer-avatar-row">
          <img src="${avatarUrl}" alt="${escapeHtml(fullName)}" class="footer-avatar" />
          <div>
            <h4 class="footer-name">${escapeHtml(fullName)}</h4>
            <p class="footer-role">${escapeHtml(headline)}</p>
          </div>
        </div>
        <h2 class="serif-h2">Thank you</h2>
        <div class="contact-email-row">
          <a href="mailto:${escapeHtml(email)}" class="btn-email">✉ ${escapeHtml(email)}</a>
        </div>
      </div>

      <div class="footer-letter-box">
        <p class="script-letter">
          &ldquo;Thank you for taking the time to explore my design sketchbook and case studies! Let&apos;s build something meaningful together.&rdquo;
        </p>
        <div class="footer-copy-row">
          <span>© ${new Date().getFullYear()} ${escapeHtml(fullName)}</span>
          <button id="backToTopBtn" class="btn-top">Top ↑</button>
        </div>
      </div>
    </div>
  </footer>

  <script src="./assets/script.js"></script>
</body>
</html>
`;
}

export function generateDoodleStaticCss(data, helpers) {
  const theme = data.design?.theme || "system";
  const primaryColor = data.design?.primaryColor || "#5A65B8";
  const fontFamilyKey = data.design?.fontFamily || "Playfair";

  const isDark = theme === "dark";
  const isLight = theme === "light";

  const headingFont =
    fontFamilyKey === "Geist"
      ? "'Geist Variable', 'Inter', sans-serif"
      : fontFamilyKey === "Inter"
      ? "'Inter', sans-serif"
      : fontFamilyKey === "Merriweather"
      ? "'Merriweather', Georgia, serif"
      : "'Playfair Display', Georgia, serif";

  const bodyFont =
    fontFamilyKey === "Geist"
      ? "'Geist Variable', 'Inter', sans-serif"
      : fontFamilyKey === "Inter"
      ? "'Inter', sans-serif"
      : "'Plus Jakarta Sans', -apple-system, sans-serif";

  const slateBg = isLight ? "#FAF7F2" : "#222223";
  const slateColor = isLight ? "#1E1E20" : "#f5f5f5";
  const slateBorder = isLight ? "#dcd7ce" : "#333336";

  const parchmentBg = isDark ? "#1B1B1E" : "#F4F0E8";
  const parchmentColor = isDark ? "#f5f5f5" : "#1E1E20";
  const parchmentBorder = isDark ? "#333336" : "#dcd7ce";

  return `
/* Reset & Base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-family: ${bodyFont}; }
body.doodle-body { background: ${slateBg}; color: ${slateColor}; line-height: 1.6; }

:root {
  --accent-color: ${primaryColor};
  --heading-font: ${headingFont};
}

/* Top Nav */
.doodle-nav { position: sticky; top: 0; z-index: 50; background: ${isLight ? "rgba(250, 247, 242, 0.95)" : "rgba(34, 34, 35, 0.95)"}; backdrop-filter: blur(8px); border-bottom: 1px solid ${slateBorder}; }
.nav-container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; height: 3.5rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; }
.nav-link { color: ${slateColor}; text-decoration: none; transition: color 0.2s; }
.nav-link:hover { color: var(--accent-color); }
.nav-divider { width: 1px; height: 1rem; background: ${slateBorder}; }

/* Sections */
.section-slate { background: ${slateBg}; color: ${slateColor}; padding: 5rem 1.5rem; border-top: 1px solid ${slateBorder}; }
.section-parchment { background: ${parchmentBg}; color: ${parchmentColor}; padding: 5rem 1.5rem; border-top: 1px solid ${parchmentBorder}; }
.content-container { max-width: 960px; margin: 0 auto; }
.grid-two-col { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 768px) { .grid-two-col { grid-template-columns: 1.1fr 0.9fr; align-items: center; } }

/* Hero */
.hero-doodle { text-align: center; padding: 5rem 1.5rem 6rem; min-height: 460px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.hero-callout { display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; position: relative; }
.script-welcome { font-family: 'Caveat', cursive; font-size: 2rem; color: var(--accent-color); transform: rotate(-4deg); }
.doodle-arrow { width: 4.5rem; height: 2.5rem; margin-left: -0.5rem; margin-top: -1rem; transform: rotate(12deg); color: var(--accent-color); }
.hero-title { font-family: var(--heading-font); font-size: clamp(3.5rem, 8vw, 6rem); color: ${isLight ? "#1E1E20" : "#ffffff"}; font-weight: 400; line-height: 1; margin: 0.5rem 0; }
.encircled-o { position: relative; display: inline-block; }
.o-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 0.75rem; color: var(--accent-color); font-weight: bold; }
.star-badge { position: absolute; top: -0.75rem; right: 0; color: var(--accent-color); font-size: 1rem; }
.doodle-pill-headline { position: relative; display: inline-flex; align-items: center; justify-content: center; padding: 0.6rem 1.5rem; margin-top: 1.25rem; }
.oval-ring-svg { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--accent-color); }
.headline-text { position: relative; z-index: 2; font-family: 'Caveat', cursive; font-size: 1.75rem; color: ${isLight ? "#1E1E20" : "#e5e5e5"}; }

/* About Section */
.grid-about { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 768px) { .grid-about { grid-template-columns: 5fr 7fr; align-items: center; } }
.about-portrait-col { display: flex; flex-direction: column; align-items: center; position: relative; }
.arched-photo-frame { width: 14rem; height: 18rem; border-radius: 100px 100px 16px 16px; overflow: hidden; border: 2px solid #1E1E20; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.portrait-img { width: 100%; height: 100%; object-fit: cover; }
.annotation-pin { position: absolute; top: -1.5rem; left: 0; color: #5A65B8; font-family: 'Caveat', cursive; font-size: 1.25rem; transform: rotate(-8deg); }
.annotation-role { position: absolute; top: -1.75rem; right: 0; color: #5A65B8; font-family: 'Caveat', cursive; font-size: 1.25rem; transform: rotate(6deg); }
.annotation-coffee { margin-top: 1rem; color: #5A65B8; font-family: 'Caveat', cursive; font-size: 1.25rem; transform: rotate(-3deg); }
.serif-h2 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 400; line-height: 1.1; margin-bottom: 1rem; }
.text-white { color: #ffffff !important; }
.body-p { font-size: 1.125rem; line-height: 1.7; color: #38383a; }
.wavy-underline { width: 12rem; height: 1rem; margin-top: 0.5rem; }

/* Education & Skills */
.sub-desc { font-size: 0.875rem; color: #6b6b70; margin-bottom: 1.5rem; }
.edu-items { display: flex; flex-direction: column; gap: 1.25rem; }
.edu-row { border-bottom: 1px solid rgba(0, 0, 0, 0.1); padding-bottom: 1rem; }
.edu-top { display: flex; justify-content: space-between; align-items: baseline; }
.edu-degree { font-weight: 700; font-size: 1.1rem; color: #1E1E20; }
.edu-date { font-family: monospace; font-size: 0.85rem; color: #666; }
.edu-school { font-size: 0.875rem; color: #444; margin-top: 0.25rem; }
.qr-card { background: rgba(255, 255, 255, 0.8); border: 1px solid #d4cfc5; border-radius: 1rem; padding: 1.5rem; text-align: center; display: inline-flex; flex-direction: column; align-items: center; }
.qr-box { background: white; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #ccc; width: 7rem; height: 7rem; }
.qr-svg { width: 100%; height: 100%; }
.qr-caption { margin-top: 0.75rem; font-family: 'Caveat', cursive; font-size: 1.25rem; color: #5A65B8; }
.skills-bullet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.skill-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #2d2d30; }
.bullet-dot { width: 6px; height: 6px; border-radius: 50%; background: #5A65B8; }
.book-stack-col { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; }
.book-stack { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.book-spine { padding: 0.4rem 1rem; border: 2px solid #1E1E20; font-family: monospace; font-size: 0.65rem; font-weight: bold; border-radius: 2px; }
.book-1 { width: 9rem; background: #e5e0d8; }
.book-2 { width: 11rem; background: #fdfdfd; transform: rotate(1.5deg); }
.book-3 { width: 12rem; background: #dcd7ce; transform: rotate(-1deg); }
.book-caption { margin-top: 1.5rem; font-family: 'Caveat', cursive; font-size: 1.15rem; color: #5A65B8; }

/* Projects Strip */
.projects-head-row { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 1.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
.projects-title-flex { display: flex; align-items: center; gap: 0.75rem; }
.smiley-doodle { font-family: 'Caveat', cursive; font-size: 2rem; color: #9AA5E2; transform: rotate(10deg); }
.projects-sub { font-family: monospace; font-size: 0.85rem; color: #999; }
.script-tag { font-family: 'Caveat', cursive; font-size: 1.5rem; color: #9AA5E2; }
.projects-grid-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.project-mini-card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; padding: 0.75rem; text-align: center; }
.mini-img-frame { aspect-ratio: 9/16; border-radius: 0.5rem; overflow: hidden; position: relative; margin-bottom: 0.5rem; background: #111; }
.mini-img { width: 100%; height: 100%; object-fit: cover; }
.mini-num { position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0, 0, 0, 0.7); font-family: monospace; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; color: white; }
.mini-title { font-size: 0.85rem; font-weight: bold; color: #eee; }
.mini-tag { font-family: monospace; font-size: 0.7rem; color: #888; }

/* Case Studies */
.case-label { font-family: monospace; font-size: 0.75rem; color: #9AA5E2; text-transform: uppercase; letter-spacing: 0.05em; }
.case-h3 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 400; margin: 0.25rem 0 1rem; }
.case-desc { font-size: 1rem; line-height: 1.6; }
.doodle-btn-wrap { margin-top: 1.5rem; }
.btn-doodle-oval { display: inline-block; padding: 0.6rem 1.75rem; border: 2px solid #9AA5E2; border-radius: 50px; color: #9AA5E2; font-family: 'Caveat', cursive; font-size: 1.5rem; text-decoration: none; transition: all 0.2s; }
.btn-doodle-oval:hover { background: rgba(154, 165, 226, 0.15); color: #fff; }
.mockup-dance-wrap { display: flex; justify-content: center; }
.phone-frame { width: 13rem; aspect-ratio: 9/18; border-radius: 1.5rem; overflow: hidden; border: 4px solid #444; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6); }
.phone-screen { width: 100%; height: 100%; object-fit: cover; }

/* Footer */
.footer-doodle { border-top: 1px solid #d4cfc5; }
.footer-avatar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
.footer-avatar { width: 3rem; height: 3rem; border-radius: 50%; object-fit: cover; border: 2px solid #1E1E20; }
.footer-name { font-weight: 700; font-size: 0.95rem; color: #1E1E20; }
.footer-role { font-family: monospace; font-size: 0.75rem; color: #666; }
.contact-email-row { margin-top: 1rem; }
.btn-email { display: inline-flex; align-items: center; gap: 0.5rem; color: #1E1E20; text-decoration: none; font-weight: 600; font-size: 0.95rem; }
.btn-email:hover { color: #5A65B8; }
.footer-letter-box { background: rgba(255, 255, 255, 0.6); border: 1px solid #d4cfc5; border-radius: 1rem; padding: 1.5rem; }
.script-letter { font-family: 'Caveat', cursive; font-size: 1.4rem; color: #5A65B8; line-height: 1.6; }
.footer-copy-row { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0dbd1; display: flex; justify-content: space-between; font-family: monospace; font-size: 0.75rem; color: #777; }
.btn-top { background: none; border: none; font-weight: bold; cursor: pointer; color: #444; font-family: monospace; }
.btn-top:hover { color: #000; }
`;
}

export function generateDoodleStaticJs(data) {
  return `
(function() {
  var backBtn = document.getElementById("backToTopBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
`;
}
