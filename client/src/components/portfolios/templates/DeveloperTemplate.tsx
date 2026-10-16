import type { ReactNode } from "react";
import { ArrowUp, Code2, Terminal } from "lucide-react";

import { AboutSection } from "@/components/portfolios/sections/AboutSection";
import { CertificationsSection } from "@/components/portfolios/sections/CertificationsSection";
import { ContactSection } from "@/components/portfolios/sections/ContactSection";
import { EducationSection } from "@/components/portfolios/sections/EducationSection";
import { ExperienceSection } from "@/components/portfolios/sections/ExperienceSection";
import { HeroSection } from "@/components/portfolios/sections/HeroSection";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import { ProjectsSection } from "@/components/portfolios/sections/ProjectsSection";
import { SkillsSection } from "@/components/portfolios/sections/SkillsSection";
import type { PortfolioTemplateProps } from "@/components/portfolios/templates/MinimalTemplate";

export function DeveloperTemplate({
  portfolio,
  showEmpty = false,
  sectionOrder = ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"],
  hiddenSections = [],
}: PortfolioTemplateProps) {
  const { profile, socialLinks, skills, experience, education, projects, certifications, design } =
    portfolio;
  const primaryColor = design?.primaryColor || "#2563eb";

  const isHidden = (sec: string) => hiddenSections.includes(sec);

  const sectionMap: Record<string, ReactNode> = {
    hero: (
      <HeroSection
        key="hero"
        profile={profile}
        socialLinks={socialLinks}
        variant="developer"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    about: (
      <AboutSection
        key="about"
        bio={profile?.bio}
        variant="developer"
        showEmpty={showEmpty}
      />
    ),
    skills: (
      <SkillsSection
        key="skills"
        skills={skills}
        variant="developer"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    projects: (
      <ProjectsSection
        key="projects"
        projects={projects}
        variant="developer"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    experience: (
      <ExperienceSection
        key="experience"
        experience={experience}
        variant="developer"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    education: (
      <EducationSection
        key="education"
        education={education}
        variant="developer"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    certifications: (
      <CertificationsSection
        key="certifications"
        certifications={certifications}
        variant="developer"
        primaryColor={primaryColor}
        showEmpty={showEmpty}
      />
    ),
    contact: (
      <ContactSection
        key="contact"
        profile={profile}
        socialLinks={socialLinks}
        variant="developer"
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

  const slugName = (profile?.fullName || "dev").toLowerCase().replace(/\s+/g, "");

  return (
    <div className="w-full antialiased">
      {/* Sticky developer navigation */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-sm">
            {profile?.avatarUrl ? (
              <img
                src={normalizeAvatarUrl(profile.avatarUrl, 24)}
                alt={profile.fullName || "Avatar"}
                width={24}
                height={24}
                loading="eager"
                decoding="async"
                className="h-6 w-6 rounded-md object-cover border border-neutral-300 dark:border-neutral-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Terminal className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-neutral-500">~/</span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">{slugName}</span>
          </div>

          <nav className="hidden sm:flex items-center gap-5 text-xs font-mono text-neutral-600 dark:text-neutral-400">
            {profile?.bio && (
              <a href="#about" className="hover:text-blue-500 transition-colors">
                .about()
              </a>
            )}
            {skills && skills.length > 0 && (
              <a href="#skills" className="hover:text-blue-500 transition-colors">
                .skills()
              </a>
            )}
            {projects && projects.length > 0 && (
              <a href="#projects" className="hover:text-blue-500 transition-colors">
                .projects()
              </a>
            )}
            {experience && experience.length > 0 && (
              <a href="#experience" className="hover:text-blue-500 transition-colors">
                .experience()
              </a>
            )}
            {profile?.email && (
              <a href="#contact" className="hover:text-blue-500 transition-colors">
                .contact()
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>
        {sectionOrder.map((sectionKey) => {
          if (isHidden(sectionKey)) return null;
          return <div id={sectionKey} key={sectionKey}>{sectionMap[sectionKey] || null}</div>;
        })}
      </main>

      {/* Engineering footer */}
      <footer className="py-10 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-neutral-400" />
            <span>Built with modern web standards</span>
          </div>

          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} {profile?.fullName || "Developer"}</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 inline-flex items-center gap-1 transition-colors"
            >
              <span>^top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
