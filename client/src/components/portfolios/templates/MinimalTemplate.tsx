import type { ReactNode } from "react";
import { ArrowUp } from "lucide-react";

import { AboutSection } from "@/components/portfolios/sections/AboutSection";
import { CertificationsSection } from "@/components/portfolios/sections/CertificationsSection";
import { ContactSection } from "@/components/portfolios/sections/ContactSection";
import { EducationSection } from "@/components/portfolios/sections/EducationSection";
import { ExperienceSection } from "@/components/portfolios/sections/ExperienceSection";
import { HeroSection } from "@/components/portfolios/sections/HeroSection";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import { ProjectsSection } from "@/components/portfolios/sections/ProjectsSection";
import { SkillsSection } from "@/components/portfolios/sections/SkillsSection";
import type { Portfolio } from "@/types/portfolio";

export interface PortfolioTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function MinimalTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "projects", "experience", "skills", "education", "certifications", "contact"],
  hiddenSections = [],
}: PortfolioTemplateProps) {
  const { profile, socialLinks, skills, experience, education, projects, certifications, design } =
    portfolio;
  const primaryColor = design?.primaryColor || "#2563eb";
  const templateSettings = design?.templateSettings || {};
  const whitespaceDensity = (templateSettings.whitespaceDensity as string) || "normal";
  const spacingClass =
    whitespaceDensity === "compact"
      ? "space-y-4"
      : whitespaceDensity === "relaxed"
      ? "space-y-16"
      : "space-y-8";
  const editorialSerif = Boolean(templateSettings.editorialSerif);

  const isHidden = (sec: string) => hiddenSections.includes(sec);

  const sectionMap: Record<string, ReactNode> = {
    hero: (
      <HeroSection
        key="hero"
        profile={profile}
        socialLinks={socialLinks}
        variant="minimal"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    about: (
      <AboutSection
        key="about"
        bio={profile?.bio}
        variant="minimal"
        showEmpty={showEmpty}
      />
    ),
    projects: (
      <ProjectsSection
        key="projects"
        projects={projects}
        variant="minimal"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    experience: (
      <ExperienceSection
        key="experience"
        experience={experience}
        variant="minimal"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    skills: (
      <SkillsSection
        key="skills"
        skills={skills}
        variant="minimal"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    education: (
      <EducationSection
        key="education"
        education={education}
        variant="minimal"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    certifications: (
      <CertificationsSection
        key="certifications"
        certifications={certifications}
        variant="minimal"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    contact: (
      <ContactSection
        key="contact"
        profile={profile}
        socialLinks={socialLinks}
        variant="minimal"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      {/* Top minimal header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-neutral-950/70 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate max-w-[200px] sm:max-w-xs">
            {profile?.avatarUrl && (
              <img
                src={normalizeAvatarUrl(profile.avatarUrl, 24)}
                alt={profile.fullName || "Avatar"}
                width={24}
                height={24}
                loading="eager"
                decoding="async"
                className="h-6 w-6 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-800"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
              {profile?.fullName || portfolio.title || "Portfolio"}
            </span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6 text-xs text-neutral-500 font-light">
            {profile?.bio && (
              <a href="#about" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                About
              </a>
            )}
            {projects && projects.length > 0 && (
              <a href="#projects" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Work
              </a>
            )}
            {experience && experience.length > 0 && (
              <a href="#experience" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Experience
              </a>
            )}
            {profile?.email && (
              <a href="#contact" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Contact
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main sequenced sections */}
      <main className={`${spacingClass} ${editorialSerif ? "font-serif" : ""}`}>
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;
          return <div id={sectionKey} key={sectionKey}>{sectionMap[sectionKey] || null}</div>;
        })}
      </main>

      {/* Elegant footer */}
      <footer className="py-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-neutral-400 font-light">
          <span>
            © {new Date().getFullYear()} {profile?.fullName || "Portfolio"}. All rights reserved.
          </span>
          <button
            type="button"
            onClick={scrollToTop}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 inline-flex items-center gap-1 transition-colors"
          >
            <span>Top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
