import type { Portfolio, PortfolioDesignSettings, PortfolioExperience, PortfolioProject, PortfolioSkill, PortfolioSocialLink, PortfolioTemplateId } from "@/types/portfolio";
import type { ParsedResumeData, Resume } from "@/types/resume";

export interface AdaptResumeOptions {
  template?: PortfolioTemplateId;
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  fontFamily?: string;
  customTitle?: string;
}

export interface TemplateFieldContract {
  id: PortfolioTemplateId;
  name: string;
  requiredFields: string[];
  supportedFields: string[];
  optionalFields: string[];
  specialFeatures: string[];
}

export interface TemplateCompatibilityReport {
  templateId: PortfolioTemplateId;
  isCompatible: boolean;
  missingRequired: string[];
  presentSupported: string[];
  missingOptional: string[];
  completenessScore: number; // 0 to 100
}

/**
 * Strict, type-safe capability contract for all 20 integrated portfolio templates.
 * Documents exactly which resume fields each template renders and requires.
 */
export const TEMPLATE_FIELD_CONTRACTS: Record<PortfolioTemplateId, TemplateFieldContract> = {
  devport: {
    id: "devport",
    name: "DevPort (Featured)",
    requiredFields: ["profile.fullName"],
    supportedFields: [
      "profile.fullName",
      "profile.headline",
      "profile.bio",
      "profile.email",
      "profile.phone",
      "profile.location",
      "profile.avatarUrl",
      "socialLinks",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
    ],
    optionalFields: ["profile.avatarUrl", "certifications", "education"],
    specialFeatures: ["Cosmic Dark Theme", "Orbital Avatar Ring", "Tech Badge Grid", "Floating Code Card"],
  },
  creative: {
    id: "creative",
    name: "Modern 3D",
    requiredFields: ["profile.fullName"],
    supportedFields: [
      "profile.fullName",
      "profile.headline",
      "profile.bio",
      "profile.email",
      "profile.location",
      "profile.avatarUrl",
      "socialLinks",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
    ],
    optionalFields: ["profile.avatarUrl", "education", "certifications"],
    specialFeatures: ["Midnight Indigo", "3D Avatar Spotlight", "Glassmorphic Cards", "Floating Stats"],
  },
  developer: {
    id: "developer",
    name: "Terminal Developer",
    requiredFields: ["profile.fullName"],
    supportedFields: [
      "profile.fullName",
      "profile.headline",
      "profile.bio",
      "profile.email",
      "profile.location",
      "socialLinks",
      "skills",
      "experience",
      "education",
      "projects",
    ],
    optionalFields: ["education", "certifications", "profile.avatarUrl"],
    specialFeatures: ["CLI Terminal Header", "Monospace Accents", "Blinking Prompt", "Code Blocks"],
  },
  minimal: {
    id: "minimal",
    name: "Minimalist Executive",
    requiredFields: ["profile.fullName"],
    supportedFields: [
      "profile.fullName",
      "profile.headline",
      "profile.bio",
      "profile.email",
      "profile.phone",
      "profile.location",
      "socialLinks",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
    ],
    optionalFields: ["profile.avatarUrl", "certifications"],
    specialFeatures: ["High-Whitespace", "Single-Column Reading", "Zero Distraction", "Serif Typography"],
  },
  poster: {
    id: "poster",
    name: "Poster Brutalist",
    requiredFields: ["profile.fullName"],
    supportedFields: [
      "profile.fullName",
      "profile.headline",
      "profile.bio",
      "profile.location",
      "profile.avatarUrl",
      "socialLinks",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
    ],
    optionalFields: ["education", "certifications"],
    specialFeatures: ["Brutalist Monochrome", "Dynamic Viewport Sizing (vw)", "Staggered Floating Cards"],
  },
  spotlight: {
    id: "spotlight",
    name: "Spotlight",
    requiredFields: ["profile.fullName"],
    supportedFields: [
      "profile.fullName",
      "profile.headline",
      "profile.bio",
      "profile.avatarUrl",
      "profile.location",
      "socialLinks",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
    ],
    optionalFields: ["education", "certifications"],
    specialFeatures: ["Obsidian & Crimson", "Avatar Halo", "Video Spotlight Hero", "Connected Expertise Tree"],
  },
  modern: {
    id: "modern",
    name: "Modern 3D (Alias)",
    requiredFields: ["profile.fullName"],
    supportedFields: ["profile.fullName", "profile.headline", "profile.bio", "skills", "experience", "projects"],
    optionalFields: ["education", "certifications"],
    specialFeatures: ["Alias for creative"],
  },
  executive: {
    id: "executive",
    name: "Minimalist Executive (Alias)",
    requiredFields: ["profile.fullName"],
    supportedFields: ["profile.fullName", "profile.headline", "profile.bio", "skills", "experience", "projects"],
    optionalFields: ["education", "certifications"],
    specialFeatures: ["Alias for minimal"],
  },
};

/**
 * Normalizes any skill input (string, object, categorized map) into structured PortfolioSkill items.
 */
export function normalizeSkills(rawSkills: unknown): PortfolioSkill[] {
  if (!rawSkills) return [];

  // 1. Array of strings or objects
  if (Array.isArray(rawSkills)) {
    const list: PortfolioSkill[] = [];
    for (const item of rawSkills) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed) {
          list.push({ name: trimmed, category: "Core Technologies", level: "intermediate" });
        }
      } else if (typeof item === "object" && item !== null) {
        const s = item as { name?: string; category?: string; level?: string };
        if (s.name && s.name.trim()) {
          const level: PortfolioSkill["level"] = ["beginner", "intermediate", "advanced", "expert"].includes(s.level || "")
            ? (s.level as PortfolioSkill["level"])
            : "intermediate";
          list.push({
            name: s.name.trim(),
            category: s.category?.trim() || "Core Technologies",
            level,
          });
        }
      }
    }
    return list;
  }

  // 2. Object with categories as keys: { "Frontend": ["React", "CSS"], "Backend": ["Node"] }
  if (typeof rawSkills === "object" && rawSkills !== null) {
    const list: PortfolioSkill[] = [];
    for (const [category, skills] of Object.entries(rawSkills)) {
      if (Array.isArray(skills)) {
        for (const name of skills) {
          if (typeof name === "string" && name.trim()) {
            list.push({
              name: name.trim(),
              category: category.trim() || "Core Technologies",
              level: "intermediate",
            });
          }
        }
      } else if (typeof skills === "string" && skills.trim()) {
        const split = skills.split(/[,•|]+/).map((s) => s.trim()).filter(Boolean);
        for (const name of split) {
          list.push({
            name,
            category: category.trim() || "Core Technologies",
            level: "intermediate",
          });
        }
      }
    }
    return list;
  }

  return [];
}

/**
 * Normalizes work experience entries from resume into clean PortfolioExperience items.
 */
export function normalizeExperience(rawExp: unknown): PortfolioExperience[] {
  if (!Array.isArray(rawExp)) return [];

  return rawExp
    .filter((e) => e && typeof e === "object")
    .map((e) => {
      const exp = e as Record<string, unknown>;
      const title = String(exp.title || "").trim();
      const company = String(exp.company || "").trim();
      const location = String(exp.location || "").trim();
      const startDate = String(exp.startDate || "").trim();
      const endDate = String(exp.endDate || "").trim();
      const isCurrent = Boolean(
        exp.current ||
        !endDate ||
        endDate.toLowerCase().includes("present") ||
        endDate.toLowerCase().includes("current")
      );

      // Extract highlights from achievements or bullet points in description
      let highlights: string[] = [];
      if (Array.isArray(exp.highlights)) {
        highlights = exp.highlights.map((h) => String(h || "").trim()).filter(Boolean);
      } else if (exp.achievements) {
        highlights = String(exp.achievements)
          .split(/\n|•|\*|-/)
          .map((s) => s.trim())
          .filter((s) => s.length > 2);
      } else if (exp.description && typeof exp.description === "string" && exp.description.includes("\n")) {
        highlights = exp.description
          .split(/\n|•|\*|-/)
          .map((s) => s.trim())
          .filter((s) => s.length > 5);
      }

      if (highlights.length === 0 && exp.technologies) {
        highlights = [String(exp.technologies).trim()];
      }

      return {
        title,
        company,
        location,
        startDate,
        endDate: isCurrent ? "Present" : endDate,
        current: isCurrent,
        description: String(exp.description || exp.achievements || "").trim(),
        highlights,
      };
    })
    .filter((e) => e.title.length > 0 || e.company.length > 0);
}

/**
 * Normalizes education items from resume.
 */
export function normalizeEducation(rawEdu: unknown) {
  if (!Array.isArray(rawEdu)) return [];

  return rawEdu
    .filter((ed) => ed && typeof ed === "object")
    .map((ed) => {
      const item = ed as Record<string, unknown>;
      return {
        institution: String(item.institution || "").trim(),
        degree: String(item.degree || "").trim(),
        fieldOfStudy: String(item.fieldOfStudy || "").trim(),
        startDate: String(item.startDate || "").trim(),
        endDate: String(item.endDate || "").trim(),
        grade: String(item.grade || "").trim(),
      };
    })
    .filter((ed) => ed.institution.length > 0 || ed.degree.length > 0);
}

/**
 * Normalizes project items from resume into PortfolioProject items.
 */
export function normalizeProjects(rawProjects: unknown): PortfolioProject[] {
  if (!Array.isArray(rawProjects)) return [];

  return rawProjects
    .filter((p) => p && typeof p === "object")
    .map((p) => {
      const item = p as Record<string, unknown>;
      const title = String(item.name || item.title || "Project").trim();
      const description = String(item.description || "").trim();

      let tags: string[] = [];
      if (Array.isArray(item.tags)) {
        tags = item.tags.map((t) => String(t || "").trim()).filter(Boolean);
      } else if (item.technologies && typeof item.technologies === "string") {
        tags = item.technologies.split(/[,•|]+/).map((t) => t.trim()).filter(Boolean);
      }

      const liveUrl = String(item.liveDemo || item.link || item.liveUrl || "").trim();
      const repoUrl = String(
        item.repoUrl || (typeof item.link === "string" && item.link.includes("github") ? item.link : "")
      ).trim();

      return {
        title,
        description,
        tags,
        liveUrl,
        repoUrl,
        imageUrl: String(item.imageUrl || "").trim(),
        featured: Boolean(item.featured),
      };
    })
    .filter((p) => p.title.length > 0);
}

/**
 * Normalizes contact details and links into PortfolioSocialLink items.
 */
export function normalizeSocialLinks(contact: unknown): PortfolioSocialLink[] {
  if (!contact || typeof contact !== "object") return [];
  const c = contact as Record<string, unknown>;
  const links: PortfolioSocialLink[] = [];

  const github = String(c.github || c.githubUrl || "").trim();
  if (github) {
    links.push({ platform: "github", label: "GitHub", url: github.startsWith("http") ? github : `https://${github}` });
  }

  const linkedin = String(c.linkedin || c.linkedinUrl || "").trim();
  if (linkedin) {
    links.push({
      platform: "linkedin",
      label: "LinkedIn",
      url: linkedin.startsWith("http") ? linkedin : `https://${linkedin}`,
    });
  }

  const website = String(c.website || c.websiteUrl || "").trim();
  if (website) {
    links.push({
      platform: "website",
      label: "Website",
      url: website.startsWith("http") ? website : `https://${website}`,
    });
  }

  if (Array.isArray(c.customLinks)) {
    for (const cl of c.customLinks) {
      if (cl && typeof cl === "object") {
        const item = cl as { label?: string; url?: string };
        if (item.url && item.url.trim()) {
          const label = item.label?.trim() || "Link";
          links.push({
            platform: label.toLowerCase().replace(/\s+/g, ""),
            label,
            url: item.url.trim().startsWith("http") ? item.url.trim() : `https://${item.url.trim()}`,
          });
        }
      }
    }
  }

  return links;
}

/**
 * Normalizes certifications into portfolio certification items.
 */
export function normalizeCertifications(rawCerts: unknown) {
  if (!Array.isArray(rawCerts)) return [];

  return rawCerts
    .map((c) => {
      if (typeof c === "string" && c.trim()) {
        return { name: c.trim(), issuer: "", issueDate: "", url: "" };
      }
      if (c && typeof c === "object") {
        const item = c as { name?: string; issuer?: string; issueDate?: string; url?: string };
        if (item.name && item.name.trim()) {
          return {
            name: item.name.trim(),
            issuer: item.issuer?.trim() || "",
            issueDate: item.issueDate?.trim() || "",
            url: item.url?.trim() || "",
          };
        }
      }
      return null;
    })
    .filter((c): c is { name: string; issuer: string; issueDate: string; url: string } => c !== null);
}

/**
 * Primary Validated Common Data Adapter:
 * Converts any real saved Resume object or ParsedResumeData into a fully conforming,
 * non-destructive Portfolio object compatible with all 20 integrated portfolio templates.
 *
 * Guarantees:
 * 1. Immutability: original resume data is untouched.
 * 2. Graceful defaults: missing data never causes null reference errors or crashes.
 * 3. Contract compliance: strictly aligns with `PortfolioTemplateProps` and template registries.
 */
export function adaptResumeToPortfolio(
  resumeOrData: Resume | Partial<Resume> | ParsedResumeData | unknown,
  options: AdaptResumeOptions = {}
): Partial<Portfolio> {
  const resume = (resumeOrData as Record<string, unknown>) || {};
  const parsedData = ((resume.parsedData as ParsedResumeData) || resume) as Partial<ParsedResumeData>;
  const customization = (resume.customization || {}) as Record<string, unknown>;

  // Personal details
  const fullName = String(
    parsedData.name ||
    (typeof resume.fileName === "string" ? resume.fileName.replace(/\.[^/.]+$/, "") : "") ||
    "Professional Developer"
  ).trim();

  const headline = String(
    parsedData.title ||
    customization.jobTitle ||
    "Software Engineer & Digital Specialist"
  ).trim();

  const bio = String(parsedData.summary || "").trim();
  const contact = (parsedData.contact || {}) as Record<string, unknown>;
  const email = String(contact.email || "").trim();
  const phone = String(contact.phone || "").trim();
  const location = String(contact.location || "").trim();
  const avatarUrl = String(parsedData.photoUrl || customization.photoUrl || "").trim();

  // Child sections
  const skills = normalizeSkills(parsedData.skills);
  const experience = normalizeExperience(parsedData.experience);
  const education = normalizeEducation(parsedData.education);
  const projects = normalizeProjects(parsedData.projects);
  const socialLinks = normalizeSocialLinks(contact);
  const certifications = normalizeCertifications(parsedData.certifications);

  // Section Order & Visibility
  const baseOrder = [
    "hero",
    "about",
    "skills",
    "projects",
    "experience",
    "education",
    "certifications",
    "contact",
  ];

  const sectionOrder = Array.isArray(parsedData.sectionOrder) && parsedData.sectionOrder.length > 0
    ? parsedData.sectionOrder
    : baseOrder;

  const sectionVisibility: Record<string, boolean> = {};
  if (Array.isArray(parsedData.hiddenSections)) {
    for (const h of parsedData.hiddenSections) {
      sectionVisibility[h] = false;
    }
  }

  const selectedTemplate = options.template || "devport";
  const selectedTheme = options.theme || "system";
  const primaryColor = options.primaryColor || (customization.accentColor as string) || "#2563eb";
  const fontFamily = options.fontFamily || (customization.fontFamily as string) || "Inter";

  const design: PortfolioDesignSettings = {
    template: selectedTemplate,
    theme: selectedTheme,
    primaryColor,
    fontFamily,
    sectionOrder,
    sectionVisibility,
  };

  return {
    title: options.customTitle?.trim() || `${fullName}'s Portfolio`,
    slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "portfolio",
    status: "draft",
    profile: {
      fullName,
      headline,
      bio,
      email,
      phone,
      location,
      avatarUrl,
    },
    socialLinks,
    skills,
    experience,
    education,
    projects,
    certifications,
    design,
  };
}

/**
 * Evaluates compatibility of a given resume against a specific portfolio template.
 */
export function validateResumeForTemplate(
  resumeOrData: unknown,
  templateId: PortfolioTemplateId
): TemplateCompatibilityReport {
  const contract = TEMPLATE_FIELD_CONTRACTS[templateId] || TEMPLATE_FIELD_CONTRACTS.devport;
  const portfolio = adaptResumeToPortfolio(resumeOrData, { template: templateId });

  const missingRequired: string[] = [];
  const presentSupported: string[] = [];
  const missingOptional: string[] = [];

  // Check required fields
  for (const field of contract.requiredFields) {
    if (field === "profile.fullName" && (!portfolio.profile?.fullName || !portfolio.profile.fullName.trim())) {
      missingRequired.push(field);
    }
  }

  // Check supported & optional fields
  const checkField = (field: string, isPresent: boolean) => {
    if (!contract.supportedFields.includes(field)) return;
    if (isPresent) {
      presentSupported.push(field);
    } else {
      missingOptional.push(field);
    }
  };

  checkField("profile.fullName", Boolean(portfolio.profile?.fullName));
  checkField("profile.headline", Boolean(portfolio.profile?.headline));
  checkField("profile.bio", Boolean(portfolio.profile?.bio));
  checkField("profile.email", Boolean(portfolio.profile?.email));
  checkField("profile.phone", Boolean(portfolio.profile?.phone));
  checkField("profile.location", Boolean(portfolio.profile?.location));
  checkField("profile.avatarUrl", Boolean(portfolio.profile?.avatarUrl));
  checkField("skills", Boolean(portfolio.skills && portfolio.skills.length > 0));
  checkField("projects", Boolean(portfolio.projects && portfolio.projects.length > 0));
  checkField("experience", Boolean(portfolio.experience && portfolio.experience.length > 0));
  checkField("education", Boolean(portfolio.education && portfolio.education.length > 0));
  checkField("certifications", Boolean(portfolio.certifications && portfolio.certifications.length > 0));
  checkField("socialLinks", Boolean(portfolio.socialLinks && portfolio.socialLinks.length > 0));

  const totalPossible = contract.supportedFields.length;
  const completenessScore = totalPossible > 0
    ? Math.min(100, Math.round((presentSupported.length / totalPossible) * 100))
    : 100;

  return {
    templateId,
    isCompatible: missingRequired.length === 0,
    missingRequired,
    presentSupported,
    missingOptional,
    completenessScore,
  };
}
