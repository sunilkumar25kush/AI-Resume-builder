import { ZipArchive } from "archiver";

/**
 * Escapes HTML characters for safe embedding into static markup.
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes external URLs (allows http, https, mailto, tel).
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    if (trimmed.includes("\r") || trimmed.includes("\n") || trimmed.includes("\u0000")) return "";
    return trimmed;
  }
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized) && !/^[a-z0-9+-.]+:/i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return "";
  }
  return "";
}

/**
 * Normalizes avatar URLs for exported standalone packages.
 */
function normalizeExportAvatar(url) {
  if (!url) return "";
  const trimmed = url.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return "";

  const gdrive = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdrive) {
    return `https://drive.google.com/uc?export=view&id=${gdrive[1]}`;
  }
  if (trimmed.includes("dropbox.com") && trimmed.includes("dl=0")) {
    return trimmed.replace("dl=0", "raw=1");
  }
  return sanitizeUrl(trimmed) || trimmed;
}

/**
 * Resolves standard fallback CSS font family string for a given font family token.
 */
function getFontFamilyCss(fontFamilyKey) {
  const map = {
    Inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    Roboto: "'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    Merriweather: "'Merriweather', Georgia, serif",
    Playfair: "'Playfair Display', Georgia, serif",
    JetBrains: "'JetBrains Mono', 'Fira Code', monospace",
    Fira: "'Fira Code', 'JetBrains Mono', monospace",
    Geist: "'Geist Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  };
  return map[fontFamilyKey] || map.Inter;
}


/**
 * Adjusts brightness of a hex color by a given percentage.
 */
function adjustBrightness(hex, percent) {
  if (!hex || typeof hex !== "string") return "#e3141f";
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex.length === 3 ? cleanHex.split("").map((c) => c + c).join("") : cleanHex, 16);
  if (isNaN(num)) return hex;
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

const GOOGLE_FONTS_LINK_TAG = `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">`;

/**
 * Sanitizes portfolio data to exclude private DB metadata or internal IDs.
 */
export function sanitizePortfolioData(portfolio) {
  const rawTemplate = (portfolio.design?.template || "spotlight").toLowerCase().trim();
  const template =
    rawTemplate === "spotlight"
      ? "spotlight"
      : rawTemplate === "poster"
      ? "poster"
      : rawTemplate === "creative" || rawTemplate === "modern"
      ? "creative"
      : rawTemplate === "developer"
      ? "developer"
      : rawTemplate === "minimal" || rawTemplate === "executive"
      ? "minimal"
      : "devport";

  const theme = portfolio.design?.theme || "system";
  const primaryColor =
    portfolio.design?.primaryColor ||
    (template === "spotlight" ? "#e3141f" : template === "poster" ? "#e11d2a" : template === "creative" ? "#9333ea" : template === "devport" ? "#06b6d4" : "#2563eb");
  const fontFamily = portfolio.design?.fontFamily || "Inter";

  return {
    title: portfolio.title || "Portfolio",
    slug: portfolio.slug || "",
    profile: {
      fullName: portfolio.profile?.fullName || "",
      headline: portfolio.profile?.headline || "",
      bio: portfolio.profile?.bio || "",
      email: portfolio.profile?.email || "",
      phone: portfolio.profile?.phone || "",
      location: portfolio.profile?.location || "",
      avatarUrl: normalizeExportAvatar(portfolio.profile?.avatarUrl),
    },
    socialLinks: (portfolio.socialLinks || []).map((s) => ({
      platform: s.platform || "",
      label: s.label || "",
      url: s.url || "",
    })),
    skills: (portfolio.skills || []).map((s) => ({
      name: s.name || "",
      category: s.category || "General",
      level: s.level || "intermediate",
    })),
    experience: (portfolio.experience || []).map((e) => ({
      title: e.title || "",
      company: e.company || "",
      location: e.location || "",
      startDate: e.startDate || "",
      endDate: e.endDate || "",
      current: Boolean(e.current),
      description: e.description || "",
      highlights: Array.isArray(e.highlights) ? e.highlights : [],
    })),
    education: (portfolio.education || []).map((ed) => ({
      institution: ed.institution || "",
      degree: ed.degree || "",
      fieldOfStudy: ed.fieldOfStudy || "",
      startDate: ed.startDate || "",
      endDate: ed.endDate || "",
      grade: ed.grade || "",
    })),
    projects: (portfolio.projects || []).map((p) => ({
      title: p.title || "",
      description: p.description || "",
      tags: Array.isArray(p.tags) ? p.tags : [],
      liveUrl: p.liveUrl || "",
      repoUrl: p.repoUrl || p.githubUrl || "",
      imageUrl: p.imageUrl || "",
      featured: Boolean(p.featured),
    })),
    certifications: (portfolio.certifications || []).map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      issueDate: c.issueDate || "",
      url: c.url || "",
    })),
    design: {
      template,
      theme,
      primaryColor,
      fontFamily,
      backgroundEffect: portfolio.design?.backgroundEffect || "default",
      sectionOrder: portfolio.design?.sectionOrder || [
        "hero",
        "about",
        "skills",
        "projects",
        "experience",
        "education",
        "certifications",
        "contact",
      ],
      sectionVisibility: portfolio.design?.sectionVisibility || {},
      layoutOptions: portfolio.design?.layoutOptions || {},
      templateSettings: portfolio.design?.templateSettings || {},
      customCss: portfolio.design?.customCss || "",
    },
    publication: {
      seoTitle: portfolio.publication?.seoTitle || portfolio.title || "Portfolio",
      seoDescription:
        portfolio.publication?.seoDescription ||
        portfolio.profile?.headline ||
        "Professional portfolio showcase",
    },
  };
}

/**
 * Computes a sanitized, safe filename for the download archive.
 */
export function getExportFilename(portfolio, format) {
  const raw = portfolio.slug || portfolio.title || "portfolio";
  const clean = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "portfolio";
  const suffix = format === "static" ? "static-website" : "react-source";
  return `${clean}-${suffix}.zip`;
}

/**
 * Initializes a ZipArchive stream directed to the Express response.
 */
function createArchive(res, filename) {
  const archive = new ZipArchive({
    zlib: { level: 9 },
  });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  archive.on("error", (err) => {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: `Archive error: ${err.message}` });
    }
  });

  archive.pipe(res);
  return archive;
}

/* ==========================================================================
   REACT SOURCE CODE ARCHIVE GENERATOR
   ========================================================================== */

export async function exportPortfolioAsSourceZip(rawPortfolio, res) {
  const data = sanitizePortfolioData(rawPortfolio);
  const filename = getExportFilename(data, "source");
  const archive = createArchive(res, filename);

  const selectedTemplate = data.design.template;

  // 1. package.json
  const packageJson = {
    name: `${data.slug || "portfolio"}-website`,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      clsx: "^2.1.1",
      "lucide-react": "^1.28.0",
      react: "^19.2.8",
      "react-dom": "^19.2.8",
      "tailwind-merge": "^3.6.0",
    },
    devDependencies: {
      "@tailwindcss/vite": "^4.3.3",
      "@vitejs/plugin-react": "^6.0.4",
      tailwindcss: "^4.3.3",
      vite: "^8.2.0",
    },
  };
  archive.append(JSON.stringify(packageJson, null, 2), { name: "package.json" });

  // 2. vite.config.js
  const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;
  archive.append(viteConfig, { name: "vite.config.js" });

  // 3. index.html
  const isLight = data.design.theme === "light";
  const fontFamilyCss = getFontFamilyCss(data.design.fontFamily);
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(data.publication.seoTitle || data.title)}</title>
    <meta name="description" content="${escapeHtml(data.publication.seoDescription)}" />
    ${GOOGLE_FONTS_LINK_TAG}
  </head>
  <body class="${isLight ? "bg-[#f8fafc] text-neutral-900" : "bg-[#090a16] text-neutral-100"} antialiased selection:bg-cyan-500/30 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
  archive.append(indexHtml, { name: "index.html" });

  // 4. src/index.css
  const indexCss = `@import "tailwindcss";

@layer base {
  html {
    scroll-behavior: smooth;
    font-family: ${fontFamilyCss};
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.35;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse-glow {
  animation: pulseGlow 4s ease-in-out infinite;
}
`;
  archive.append(indexCss, { name: "src/index.css" });

  // 5. src/portfolioData.json
  archive.append(JSON.stringify(data, null, 2), { name: "src/portfolioData.json" });

  // 6. src/main.jsx
  const mainJsx = `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  archive.append(mainJsx, { name: "src/main.jsx" });

  // 7. src/App.jsx
  const appJsx = `import React from "react";
import portfolioData from "./portfolioData.json";
import { SpotlightTemplate } from "./components/templates/SpotlightTemplate.jsx";
import { PosterTemplate } from "./components/templates/PosterTemplate.jsx";
import { DevPortTemplate } from "./components/templates/DevPortTemplate.jsx";
import { ModernCreativeTemplate } from "./components/templates/ModernCreativeTemplate.jsx";
import { DeveloperTemplate } from "./components/templates/DeveloperTemplate.jsx";
import { MinimalTemplate } from "./components/templates/MinimalTemplate.jsx";

const TEMPLATE_MAP = {
  spotlight: SpotlightTemplate,
  poster: PosterTemplate,
  devport: DevPortTemplate,
  creative: ModernCreativeTemplate,
  developer: DeveloperTemplate,
  minimal: MinimalTemplate,
};

export default function App() {
  const templateKey = (portfolioData?.design?.template || "${selectedTemplate}").toLowerCase();
  const SelectedTemplate = TEMPLATE_MAP[templateKey] || SpotlightTemplate;

  return (
    <div className="min-h-screen">
      <SelectedTemplate portfolio={portfolioData} />
    </div>
  );
}
`;
  archive.append(appJsx, { name: "src/App.jsx" });

  // 8. Common Components
  archive.append(getBrandIconJsx(), { name: "src/components/common/BrandIcon.jsx" });
  archive.append(getSafeLinkJsx(), { name: "src/components/common/SafeLink.jsx" });
  archive.append(getUrlUtilsJs(), { name: "src/components/common/urlUtils.js" });

  // 9. Templates
  archive.append(getFullSpotlightTemplateJsx(), { name: "src/components/templates/SpotlightTemplate.jsx" });
  archive.append(getFullPosterTemplateJsx(), { name: "src/components/templates/PosterTemplate.jsx" });
  archive.append(getFullDevPortTemplateJsx(), { name: "src/components/templates/DevPortTemplate.jsx" });
  archive.append(getFullModernCreativeTemplateJsx(), { name: "src/components/templates/ModernCreativeTemplate.jsx" });
  archive.append(getFullDeveloperTemplateJsx(), { name: "src/components/templates/DeveloperTemplate.jsx" });
  archive.append(getFullMinimalTemplateJsx(), { name: "src/components/templates/MinimalTemplate.jsx" });

  // 10. README.md & LICENSE
  archive.append(getSourceReadme(data), { name: "README.md" });
  archive.append(getLicenseText(data), { name: "LICENSE" });

  await archive.finalize();
}

/* ==========================================================================
   STATIC WEBSITE ARCHIVE GENERATOR
   ========================================================================== */

export async function exportPortfolioAsStaticZip(rawPortfolio, res) {
  const data = sanitizePortfolioData(rawPortfolio);
  const filename = getExportFilename(data, "static");
  const archive = createArchive(res, filename);

  const template = data.design.template;

  // 1. Generate Template-Specific Static HTML
  let staticHtml;
  if (template === "spotlight") {
    staticHtml = generateSpotlightStaticHtml(data);
  } else if (template === "poster") {
    staticHtml = generatePosterStaticHtml(data);
  } else if (template === "creative") {
    staticHtml = generateCreativeStaticHtml(data);
  } else if (template === "developer") {
    staticHtml = generateDeveloperStaticHtml(data);
  } else if (template === "minimal") {
    staticHtml = generateMinimalStaticHtml(data);
  } else {
    // Default: DevPort
    staticHtml = generateDevPortStaticHtml(data);
  }
  archive.append(staticHtml, { name: "index.html" });

  // 2. Generate Template-Specific Static CSS
  let staticCss;
  if (template === "spotlight") {
    staticCss = generateSpotlightStaticCss(data);
  } else if (template === "poster") {
    staticCss = generatePosterStaticCss(data);
  } else if (template === "creative") {
    staticCss = generateCreativeStaticCss(data);
  } else if (template === "developer") {
    staticCss = generateDeveloperStaticCss(data);
  } else if (template === "minimal") {
    staticCss = generateMinimalStaticCss(data);
  } else {
    staticCss = generateDevPortStaticCss(data);
  }
  archive.append(staticCss, { name: "assets/style.css" });

  // 3. Generate Template-Specific Static Vanilla JS
  let staticJs;
  if (template === "spotlight") {
    staticJs = generateSpotlightStaticJs(data);
  } else if (template === "poster") {
    staticJs = generatePosterStaticJs(data);
  } else {
    staticJs = generateDevPortStaticJs(data, template);
  }
  archive.append(staticJs, { name: "assets/script.js" });

  // 4. README.md
  archive.append(getStaticReadme(data), { name: "README.md" });

  await archive.finalize();
}

/* ==========================================================================
   DEVPORT STATIC HTML, CSS & JS GENERATORS
   ========================================================================== */

function generateDevPortStaticHtml(data) {
  const { profile, socialLinks, skills, experience, education, projects, certifications } = data;
  const fullName = profile.fullName || "Developer";
  const headline = profile.headline || "Full Stack Engineer & Creative Developer";
  const bio = profile.bio || "Crafting high-performance web experiences and scalable cloud applications with modern architecture.";
  const avatarUrl = profile.avatarUrl;
  const location = profile.location || "";
  const email = profile.email || "";
  const phone = profile.phone || "";

  const initials = (fullName || "DV")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = fullName ? fullName.split(" ")[0] : "Dev";

  // Typewriter roles
  const roles = headline
    ? headline.split(/[,|•&/]/).map((s) => s.trim()).filter(Boolean)
    : ["Creative Developer", "Tech Enthusiast", "Full Stack Engineer"];
  const rolesJson = JSON.stringify(roles.length > 0 ? roles : [headline]);

  // Derived stats
  const projectCount = projects.length > 0 ? `${projects.length}+` : "10+";
  const experienceYears = experience.length > 0 ? `${Math.max(1, Math.round(experience.length * 1.5))}+` : "3+";

  // Top skills for hero pills
  const topSkills = skills.slice(0, 6);
  const codeSkills = (skills.length > 0 ? skills.slice(0, 3).map((s) => `"${s.name}"`) : ['"React"', '"Node"', '"TypeScript"']).join(", ");

  const TECH_PILL_CLASSES = [
    "pill-sky",
    "pill-pink",
    "pill-amber",
    "pill-cyan",
    "pill-emerald",
    "pill-purple",
  ];

  // Social Links HTML
  const socialIconsHtml = socialLinks
    .map((s, idx) => {
      const url = sanitizeUrl(s.url);
      if (!url) return "";
      const label = escapeHtml(s.label || s.platform || "Link");
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" title="${label}"><span class="social-text">${label}</span></a>`;
    })
    .join("\n");

  // Top Skills Pills HTML
  const topSkillsHtml = topSkills
    .map((s, idx) => {
      const pillClass = TECH_PILL_CLASSES[idx % TECH_PILL_CLASSES.length];
      return `<span class="tech-pill ${pillClass}">${escapeHtml(s.name)}</span>`;
    })
    .join("\n");

  // Full Skills Cards HTML
  const allSkillsHtml = skills
    .map((s, idx) => {
      const pct = s.level === "expert" ? "95%" : s.level === "advanced" ? "85%" : s.level === "intermediate" ? "70%" : "55%";
      return `
        <div class="skill-card">
          <div class="skill-card-header">
            <span class="skill-card-name">${escapeHtml(s.name)}</span>
            <span class="skill-card-cat">${escapeHtml(s.category || "Skill")}</span>
          </div>
          <div class="skill-progress-track">
            <div class="skill-progress-bar" style="width: ${pct}"></div>
          </div>
        </div>
      `;
    })
    .join("\n");

  // Projects Cards HTML
  const projectsHtml = projects
    .map((p, idx) => {
      const liveUrl = sanitizeUrl(p.liveUrl);
      const repoUrl = sanitizeUrl(p.repoUrl);
      const tagsHtml = (p.tags || [])
        .map((t) => `<span class="proj-tag">#${escapeHtml(t)}</span>`)
        .join("");

      return `
        <div class="devport-project-card">
          <div class="proj-body">
            <div class="proj-top">
              <span class="proj-num">// ${String(idx + 1).padStart(2, "0")}</span>
              <h4 class="proj-title">${escapeHtml(p.title)}</h4>
              ${p.featured ? `<span class="featured-badge">Featured</span>` : ""}
            </div>
            <p class="proj-desc">${escapeHtml(p.description)}</p>
            ${tagsHtml ? `<div class="proj-tags">${tagsHtml}</div>` : ""}
          </div>
          <div class="proj-footer">
            ${liveUrl ? `<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn-live">Live Demo &rarr;</a>` : ""}
            ${repoUrl ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-source">Code Repository</a>` : ""}
          </div>
        </div>
      `;
    })
    .join("\n");

  // Experience Cards HTML
  const experienceHtml = experience
    .map((exp, idx) => {
      const highlightsHtml = (exp.highlights || [])
        .map((h) => `<li>${escapeHtml(h)}</li>`)
        .join("");

      return `
        <div class="exp-card">
          <div class="exp-header">
            <div>
              <h4 class="exp-title">${escapeHtml(exp.title)}</h4>
              <p class="exp-company">${escapeHtml(exp.company)} ${exp.location ? `• ${escapeHtml(exp.location)}` : ""}</p>
            </div>
            <span class="exp-date">${escapeHtml(exp.startDate || "")} &mdash; ${exp.current ? "Present" : escapeHtml(exp.endDate || "Present")}</span>
          </div>
          ${exp.description ? `<p class="exp-desc">${escapeHtml(exp.description)}</p>` : ""}
          ${highlightsHtml ? `<ul class="exp-bullets">${highlightsHtml}</ul>` : ""}
        </div>
      `;
    })
    .join("\n");

  // Education HTML
  const educationHtml = education
    .map((edu, idx) => {
      return `
        <div class="edu-box">
          <h4 class="edu-box-title">${escapeHtml(edu.degree)} ${edu.fieldOfStudy ? `in ${escapeHtml(edu.fieldOfStudy)}` : ""}</h4>
          <p class="edu-box-inst">${escapeHtml(edu.institution)}</p>
          <p class="edu-box-date">${escapeHtml(edu.startDate || "")} &mdash; ${escapeHtml(edu.endDate || "Present")}</p>
        </div>
      `;
    })
    .join("\n");

  // Certifications HTML
  const certsHtml = certifications
    .map((cert, idx) => {
      const url = sanitizeUrl(cert.url);
      return `
        <div class="cert-box">
          <h4 class="cert-box-title">${escapeHtml(cert.name)}</h4>
          <p class="cert-box-issuer">${escapeHtml(cert.issuer)}</p>
          ${cert.issueDate ? `<p class="cert-box-date">Issued ${escapeHtml(cert.issueDate)}</p>` : ""}
          ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn-verify">Verify &rarr;</a>` : ""}
        </div>
      `;
    })
    .join("\n");

  const isLight = data.design?.theme === "light";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>">
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="devport-theme${isLight ? " devport-light" : ""}">
  <!-- Ambient Cosmic Glow Backdrops -->
  <div class="ambient-glow-layer" aria-hidden="true">
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>
    <div class="glow-orb orb-3"></div>
    <div class="glow-orb orb-4"></div>
  </div>

  <!-- Floating Glassmorphic Top Navigation Bar -->
  <header class="devport-navbar" id="top-navbar">
    <div class="navbar-container">
      <a href="#hero" class="brand-group">
        <div class="brand-gradient-box">
          <div class="brand-inner-box">
            <span>${escapeHtml(initials)}</span>
          </div>
        </div>
        <div class="brand-text">
          <div class="brand-title">${escapeHtml(fullName)}</div>
          <div class="brand-sub">${escapeHtml(headline || "Developer")}</div>
        </div>
      </a>

      <nav class="devport-nav-pills">
        <a href="#hero" class="nav-pill active">Home</a>
        <a href="#about" class="nav-pill">About</a>
        ${skills.length ? `<a href="#skills" class="nav-pill">Skills</a>` : ""}
        ${projects.length ? `<a href="#projects" class="nav-pill">Projects</a>` : ""}
        ${experience.length ? `<a href="#experience" class="nav-pill">Experience</a>` : ""}
        ${(education.length || certifications.length) ? `<a href="#education" class="nav-pill">Education</a>` : ""}
        <a href="#contact" class="nav-pill">Contact</a>
      </nav>

      <div class="nav-actions">
        <a href="#contact" class="btn-hire-me">
          <span>Hire Me</span>
          <span class="arrow-icon">&rarr;</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="devport-main-container">
    <!-- 1. HERO SECTION -->
    <section id="hero" class="devport-hero-section">
      <div class="hero-grid">
        <!-- Left Column -->
        <div class="hero-left">
          <div class="status-pill">
            <span class="ping-dot"><span class="ping-ring"></span></span>
            <span>Available for opportunities &amp; freelance work</span>
          </div>

          <div class="greeting-block">
            <p class="sub-greeting">Hey there! I&apos;m</p>
            <h1 class="hero-full-name">${escapeHtml(fullName)}</h1>
          </div>

          <div class="typewriter-headline">
            <span>I&apos;m a</span>
            <span class="glowing-typewriter-text" id="typewriterText" data-roles='${escapeHtml(rolesJson)}'>${escapeHtml(roles[0] || headline)}</span>
            <span class="typewriter-cursor"></span>
          </div>

          <p class="hero-bio-text">${escapeHtml(bio)}</p>

          ${topSkillsHtml ? `
          <div class="core-tech-container">
            <p class="core-tech-label">CORE TECHNOLOGIES</p>
            <div class="core-tech-pills">
              ${topSkillsHtml}
            </div>
          </div>
          ` : ""}

          <div class="hero-cta-row">
            <a href="#projects" class="btn-primary-gradient">
              <span>View My Work</span>
              <span>&rarr;</span>
            </a>
            <a href="#contact" class="btn-secondary-glass">
              <span>Let&apos;s Talk</span>
            </a>
            ${location ? `<div class="location-badge"><span>📍 ${escapeHtml(location)}</span></div>` : ""}
          </div>

          ${socialIconsHtml ? `
          <div class="hero-connect-row">
            <span class="connect-label">CONNECT:</span>
            <div class="connect-icons">
              ${socialIconsHtml}
            </div>
          </div>
          ` : ""}
        </div>

        <!-- Right Column: Orbital Avatar Frame + Code Snippet + Stat Badges -->
        <div class="hero-right">
          <div class="orbital-stage">
            <!-- Background Rotating Aura -->
            <div class="orbital-aura"></div>

            <!-- Central Circular Avatar Frame -->
            <div class="orbital-avatar-ring">
              <div class="orbital-avatar-inner">
                ${avatarUrl ? `
                  <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" class="avatar-photo">
                ` : `
                  <div class="avatar-fallback">
                    <span class="fallback-initials">${escapeHtml(initials)}</span>
                  </div>
                `}
              </div>

              <!-- 4 Orbital Floating Badges -->
              <div class="orbital-badge badge-top" title="Code">&lt;/&gt;</div>
              <div class="orbital-badge badge-right" title="Design">&#10024;</div>
              <div class="orbital-badge badge-bottom" title="Verified">&#10003;</div>
              <div class="orbital-badge badge-left" title="Passion">&#9829;</div>
            </div>

            <!-- Floating Code Card (developer.js) -->
            <div class="floating-code-card">
              <div class="code-card-header">
                <span class="dot dot-red"></span>
                <span class="dot dot-amber"></span>
                <span class="dot dot-green"></span>
                <span class="code-filename">developer.js</span>
              </div>
              <div class="code-card-body">
                <span class="code-pink">const</span> <span class="code-white">developer</span> = {<br>
                &nbsp;&nbsp;<span class="code-muted">name:</span> <span class="code-cyan">&quot;${escapeHtml(firstName)}&quot;</span>,<br>
                &nbsp;&nbsp;<span class="code-muted">skills:</span> <span class="code-amber">[${escapeHtml(codeSkills)}]</span>,<br>
                &nbsp;&nbsp;<span class="code-muted">hardWorker:</span> <span class="code-emerald">true</span><br>
                };
              </div>
            </div>

            <!-- Floating Stat 1: Projects Done -->
            <div class="floating-stat-card stat-left">
              <div class="stat-icon-box cyan-icon">&#128196;</div>
              <div>
                <div class="stat-number">${escapeHtml(projectCount)}</div>
                <div class="stat-label">Projects Done</div>
              </div>
            </div>

            <!-- Floating Stat 2: Experience -->
            <div class="floating-stat-card stat-right">
              <div class="stat-icon-box pink-icon">&#128188;</div>
              <div>
                <div class="stat-number">${escapeHtml(experienceYears)}</div>
                <div class="stat-label">Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. ABOUT SECTION -->
    <section id="about" class="devport-section">
      <div class="glass-section-card">
        <div class="card-glow-accent"></div>
        <div class="section-tag-row">
          <span class="section-tag-num">// 01. About Me</span>
        </div>
        <h2 class="section-main-heading">Passionate about turning vision into high-impact software</h2>
        <div class="about-bio-body">
          <p>${escapeHtml(bio || headline)}</p>
        </div>
        ${(location || email || phone) ? `
        <div class="about-details-grid">
          ${location ? `<div class="detail-item"><span class="detail-label">Location:</span> <span>${escapeHtml(location)}</span></div>` : ""}
          ${email ? `<div class="detail-item"><span class="detail-label">Email:</span> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>` : ""}
          ${phone ? `<div class="detail-item"><span class="detail-label">Phone:</span> <span>${escapeHtml(phone)}</span></div>` : ""}
        </div>
        ` : ""}
      </div>
    </section>

    <!-- 3. SKILLS SECTION -->
    ${skills.length ? `
    <section id="skills" class="devport-section">
      <div class="section-header-block">
        <div class="section-tag-num">// 02. Skills &amp; Tech Stack</div>
        <h2 class="section-main-heading">Tools, Frameworks &amp; Core Competencies</h2>
      </div>
      <div class="skills-cards-grid">
        ${allSkillsHtml}
      </div>
    </section>
    ` : ""}

    <!-- 4. PROJECTS SECTION -->
    ${projects.length ? `
    <section id="projects" class="devport-section">
      <div class="section-header-block">
        <div class="section-tag-num">// 03. Featured Engineering Projects</div>
        <h2 class="section-main-heading">Selected Work &amp; Interactive Case Studies</h2>
      </div>
      <div class="projects-cards-grid">
        ${projectsHtml}
      </div>
    </section>
    ` : ""}

    <!-- 5. EXPERIENCE SECTION -->
    ${experience.length ? `
    <section id="experience" class="devport-section">
      <div class="section-header-block">
        <div class="section-tag-num">// 04. Career Experience</div>
        <h2 class="section-main-heading">Professional Timeline &amp; Contributions</h2>
      </div>
      <div class="experience-list">
        ${experienceHtml}
      </div>
    </section>
    ` : ""}

    <!-- 6. EDUCATION & CERTIFICATIONS SECTION -->
    ${(education.length || certifications.length) ? `
    <section id="education" class="devport-section">
      <div class="two-col-grid">
        ${education.length ? `
        <div>
          <div class="section-tag-num">// Education</div>
          <h3 class="col-heading">Academic Foundation</h3>
          <div class="edu-list-stack">
            ${educationHtml}
          </div>
        </div>
        ` : ""}
        ${certifications.length ? `
        <div id="certifications">
          <div class="section-tag-num">// Certifications</div>
          <h3 class="col-heading">Credentials &amp; Awards</h3>
          <div class="cert-list-stack">
            ${certsHtml}
          </div>
        </div>
        ` : ""}
      </div>
    </section>
    ` : ""}

    <!-- 7. CONTACT SECTION -->
    <section id="contact" class="devport-section">
      <div class="contact-cta-box">
        <div class="contact-tag">Get In Touch</div>
        <h2 class="contact-headline">Let&apos;s build something extraordinary together</h2>
        <p class="contact-subtext">Interested in collaborating, hiring for full-time or freelance roles, or just want to say hi? Reach out anytime!</p>
        
        <div class="contact-btns-row">
          ${email ? `
            <a href="mailto:${escapeHtml(email)}" class="btn-primary-gradient btn-lg">
              <span>Send an Email (${escapeHtml(email)})</span>
            </a>
          ` : ""}
          ${phone ? `
            <a href="tel:${escapeHtml(phone)}" class="btn-secondary-glass btn-lg">
              <span>Call: ${escapeHtml(phone)}</span>
            </a>
          ` : ""}
        </div>

        ${socialIconsHtml ? `
        <div class="contact-social-icons">
          ${socialIconsHtml}
        </div>
        ` : ""}
      </div>
    </section>
  </main>

  <!-- Floating Bottom-Right Chat Button -->
  <a href="#contact" class="floating-chat-bubble" title="Contact Me">
    <span>&#128172;</span>
  </a>

  <!-- Cosmic Footer -->
  <footer class="devport-footer">
    <div class="footer-container">
      <div class="footer-left">
        <span class="spark-icon">&#10024;</span>
        <span>Built with modern web standards &amp; DevPort</span>
      </div>
      <div class="footer-right">
        <span>&copy; ${new Date().getFullYear()} ${escapeHtml(fullName)}. All rights reserved.</span>
        <button type="button" class="btn-scroll-top" id="scrollTopBtn">^top</button>
      </div>
    </div>
  </footer>

  <script src="assets/script.js"></script>
</body>
</html>
`;
}

/* ==========================================================================
   DEVPORT STATIC CSS
   ========================================================================== */

function generateDevPortStaticCss(data) {
  const primaryColor = data.design?.primaryColor || "#06b6d4";
  const fontFamilyCss = getFontFamilyCss(data.design?.fontFamily);

  return `/* DevPort Cosmic Theme Stylesheet */
:root {
  --bg-dark: #090a16;
  --bg-card: rgba(255, 255, 255, 0.03);
  --border-glass: rgba(255, 255, 255, 0.1);
  --text-white: #ffffff;
  --text-muted: #94a3b8;
  --cyan-accent: ${primaryColor};
  --pink-accent: #ec4899;
  --purple-accent: #a855f7;
  --font-sans: ${fontFamilyCss};
  --font-mono: 'JetBrains Mono', monospace;
}

body.devport-theme.devport-light {
  --bg-dark: #f8fafc;
  --bg-card: #ffffff;
  --border-glass: rgba(0, 0, 0, 0.08);
  --text-white: #0f172a;
  --text-muted: #64748b;
  background-color: #f8fafc;
  color: #0f172a;
}

body.devport-theme.devport-light .ambient-glow-layer {
  opacity: 0.2;
}

body.devport-theme.devport-light .devport-navbar {
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

body.devport-theme.devport-light .brand-title {
  color: #0f172a;
}

body.devport-theme.devport-light .nav-link-item {
  color: #64748b;
}

body.devport-theme.devport-light .nav-link-item:hover {
  color: #0f172a;
}

body.devport-theme.devport-light .glass-stat-card,
body.devport-theme.devport-light .about-card,
body.devport-theme.devport-light .project-card,
body.devport-theme.devport-light .experience-card,
body.devport-theme.devport-light .edu-box,
body.devport-theme.devport-light .cert-box,
body.devport-theme.devport-light .contact-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

body.devport-theme.devport-light .stat-value,
body.devport-theme.devport-light .card-title,
body.devport-theme.devport-light .timeline-title,
body.devport-theme.devport-light .edu-box-degree,
body.devport-theme.devport-light .cert-box-title {
  color: #0f172a;
}

body.devport-theme.devport-light .social-icon-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
}

body.devport-theme.devport-light .social-icon-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

body.devport-theme.devport-light .cosmic-footer {
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  color: #64748b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-family: var(--font-sans);
  background-color: var(--bg-dark);
  color: var(--text-white);
  line-height: 1.6;
}

body.devport-theme {
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
}

/* Ambient Glow Orbs */
.ambient-glow-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
}

.orb-1 {
  top: -100px;
  left: -100px;
  width: 520px;
  height: 520px;
  background: rgba(6, 182, 212, 0.15);
}

.orb-2 {
  top: 20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: rgba(168, 85, 247, 0.15);
}

.orb-3 {
  top: 60%;
  left: -10%;
  width: 550px;
  height: 550px;
  background: rgba(236, 72, 153, 0.1);
}

.orb-4 {
  bottom: -10%;
  right: 10%;
  width: 500px;
  height: 500px;
  background: rgba(37, 99, 235, 0.1);
}

/* Navbar */
.devport-navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 76px;
  background: rgba(9, 10, 22, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
}

.navbar-container {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-white);
}

.brand-gradient-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, #06b6d4, #6366f1, #ec4899);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
}

.brand-inner-box {
  width: 100%;
  height: 100%;
  background: #090a16;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 14px;
  background: linear-gradient(90deg, #22d3ee, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-title {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.02em;
}

.brand-sub {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.devport-nav-pills {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: 9999px;
  backdrop-filter: blur(10px);
}

.nav-pill {
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-pill:hover,
.nav-pill.active {
  background: linear-gradient(90deg, #06b6d4, #ec4899);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.4);
}

.btn-hire-me {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(90deg, #06b6d4, #3b82f6, #ec4899);
  text-decoration: none;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
  transition: all 0.2s ease;
}

.btn-hire-me:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
}

/* Main Layout */
.devport-main-container {
  position: relative;
  z-index: 10;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
}

.devport-section {
  padding: 80px 0;
}

/* Hero Section */
.devport-hero-section {
  padding: 60px 0 100px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 48px;
  align-items: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: #67e8f9;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
  margin-bottom: 20px;
}

.ping-dot {
  position: relative;
  display: flex;
  width: 8px;
  height: 8px;
}

.ping-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #22d3ee;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

.sub-greeting {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.hero-full-name {
  font-size: 64px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 12px;
}

.typewriter-headline {
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.glowing-typewriter-text {
  background: linear-gradient(90deg, #22d3ee, #7dd3fc, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.6));
}

.typewriter-cursor {
  display: inline-block;
  width: 3px;
  height: 28px;
  background: #22d3ee;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hero-bio-text {
  font-size: 15px;
  color: #cbd5e1;
  font-weight: 300;
  line-height: 1.7;
  max-width: 560px;
  margin-bottom: 24px;
}

/* Core Tech */
.core-tech-container {
  margin-bottom: 28px;
}

.core-tech-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.core-tech-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-pill {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

.pill-sky { border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.pill-pink { border-color: rgba(244, 114, 182, 0.4); background: rgba(244, 114, 182, 0.1); color: #f472b6; }
.pill-amber { border-color: rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.pill-cyan { border-color: rgba(34, 211, 238, 0.4); background: rgba(34, 211, 238, 0.1); color: #22d3ee; }
.pill-emerald { border-color: rgba(52, 211, 153, 0.4); background: rgba(52, 211, 153, 0.1); color: #34d399; }
.pill-purple { border-color: rgba(192, 132, 252, 0.4); background: rgba(192, 132, 252, 0.1); color: #c084fc; }

.hero-cta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.btn-primary-gradient {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(90deg, #06b6d4, #3b82f6, #ec4899);
  text-decoration: none;
  box-shadow: 0 0 25px rgba(6, 182, 212, 0.4);
  transition: all 0.2s ease;
}

.btn-primary-gradient:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.btn-secondary-glass {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-secondary-glass:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.location-badge {
  font-size: 12px;
  color: var(--text-muted);
}

.hero-connect-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connect-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

.connect-icons {
  display: flex;
  gap: 8px;
}

.social-icon-btn {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  color: #cbd5e1;
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.2s ease;
}

.social-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-color: #06b6d4;
  transform: scale(1.05);
}

/* Orbital Avatar Stage */
.hero-right {
  display: flex;
  justify-content: center;
}

.orbital-stage {
  position: relative;
  width: 360px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbital-aura {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.2));
  filter: blur(40px);
  animation: pulse-aura 4s ease-in-out infinite;
}

@keyframes pulse-aura {
  0%, 100% { opacity: 0.5; transform: scale(0.95); }
  50% { opacity: 0.9; transform: scale(1.05); }
}

.orbital-avatar-ring {
  position: relative;
  z-index: 10;
  width: 230px;
  height: 230px;
  border-radius: 50%;
  padding: 6px;
  background: linear-gradient(135deg, #06b6d4, #a855f7, #ec4899);
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.5);
}

.orbital-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #111425;
  border: 2px solid #090a16;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-family: var(--font-mono);
  font-size: 48px;
  font-weight: 800;
  color: #22d3ee;
}

.orbital-badge {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  border: 2px solid #090a16;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.badge-top { top: -8px; left: 50%; transform: translateX(-50%); background: #9333ea; animation: float-up 3s ease-in-out infinite; }
.badge-right { top: 35%; right: -8px; background: #06b6d4; }
.badge-bottom { bottom: -8px; left: 50%; transform: translateX(-50%); background: #10b981; }
.badge-left { top: 35%; left: -8px; background: #ec4899; }

@keyframes float-up {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -6px); }
}

/* Floating Code Card */
.floating-code-card {
  position: absolute;
  top: -10px;
  right: -20px;
  z-index: 20;
  width: 220px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.6;
}

.code-card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 6px;
  margin-bottom: 8px;
}

.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-red { background: #ef4444; }
.dot-amber { background: #f59e0b; }
.dot-green { background: #10b981; }
.code-filename { font-size: 9px; color: var(--text-muted); margin-left: 4px; }

.code-pink { color: #f472b6; }
.code-white { color: #ffffff; }
.code-cyan { color: #38bdf8; }
.code-amber { color: #fbbf24; }
.code-emerald { color: #34d399; }
.code-muted { color: #94a3b8; }

/* Floating Stats */
.floating-stat-card {
  position: absolute;
  z-index: 20;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-left { bottom: -10px; left: -10px; }
.stat-right { bottom: -10px; right: -10px; }

.stat-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.cyan-icon { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
.pink-icon { background: rgba(236, 72, 153, 0.2); color: #ec4899; }

.stat-number { font-family: var(--font-mono); font-weight: 700; font-size: 16px; line-height: 1; }
.stat-label { font-size: 10px; color: var(--text-muted); }

/* About Card */
.glass-section-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(20px);
}

.card-glow-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.12);
  filter: blur(60px);
  pointer-events: none;
}

.section-tag-num {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #22d3ee;
  margin-bottom: 6px;
  display: block;
}

.section-main-heading {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}

.about-bio-body {
  font-size: 16px;
  color: #cbd5e1;
  line-height: 1.8;
  margin-bottom: 28px;
}

.about-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border-glass);
}

.detail-label { color: var(--text-muted); margin-right: 6px; }
.detail-item a { color: #22d3ee; text-decoration: none; }

/* Skills Grid */
.skills-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.skill-card {
  padding: 16px;
  border-radius: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;
}

.skill-card:hover {
  border-color: rgba(6, 182, 212, 0.4);
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.skill-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.skill-card-name { font-weight: 600; font-size: 14px; }
.skill-card-cat { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; }

.skill-progress-track {
  width: 100%;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.skill-progress-bar {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #22d3ee, #ec4899);
}

/* Projects Grid */
.projects-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.devport-project-card {
  border-radius: 20px;
  padding: 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s ease;
}

.devport-project-card:hover {
  border-color: rgba(6, 182, 212, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(6, 182, 212, 0.15);
}

.proj-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.proj-num { font-family: var(--font-mono); font-size: 11px; color: #22d3ee; }
.proj-title { font-size: 18px; font-weight: 700; flex: 1; }

.featured-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(236, 72, 153, 0.2);
  border: 1px solid rgba(236, 72, 153, 0.4);
  color: #f472b6;
}

.proj-desc {
  font-size: 14px;
  color: #cbd5e1;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 16px;
}

.proj-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 24px;
}

.proj-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  color: #94a3b8;
}

.proj-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
}

.btn-live {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  background: #06b6d4;
  color: #090a16;
  text-decoration: none;
}

.btn-source {
  font-size: 12px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  color: #ffffff;
  text-decoration: none;
}

/* Experience */
.experience-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exp-card {
  padding: 28px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(20px);
}

.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.exp-title { font-size: 18px; font-weight: 700; }
.exp-company { font-family: var(--font-mono); font-size: 13px; color: #22d3ee; margin-top: 2px; }
.exp-date { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 6px; }

.exp-desc { font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 12px; }

.exp-bullets {
  padding-left: 20px;
  font-size: 13px;
  color: var(--text-muted);
}

.exp-bullets li { margin-bottom: 4px; }

/* Education & Certs */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.col-heading { font-size: 20px; font-weight: 700; margin-bottom: 16px; }

.edu-box, .cert-box {
  padding: 18px;
  border-radius: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  margin-bottom: 12px;
}

.edu-box-title, .cert-box-title { font-size: 15px; font-weight: 600; }
.edu-box-inst, .cert-box-issuer { font-family: var(--font-mono); font-size: 12px; color: #22d3ee; margin: 4px 0; }
.edu-box-date, .cert-box-date { font-size: 11px; color: var(--text-muted); }
.btn-verify { display: inline-block; font-size: 11px; color: #f472b6; text-decoration: none; margin-top: 6px; }

/* Contact CTA */
.contact-cta-box {
  padding: 60px 24px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(24px);
  text-align: center;
}

.contact-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #22d3ee;
  padding: 4px 14px;
  border-radius: 9999px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  margin-bottom: 16px;
}

.contact-headline {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.contact-subtext {
  font-size: 15px;
  color: var(--text-muted);
  max-width: 540px;
  margin: 0 auto 28px;
}

.contact-btns-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.contact-social-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 24px;
  border-top: 1px solid var(--border-glass);
}

/* Floating Chat Bubble */
.floating-chat-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 40;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  text-decoration: none;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
  transition: transform 0.2s ease;
}

.floating-chat-bubble:hover {
  transform: scale(1.1);
}

/* Footer */
.devport-footer {
  border-top: 1px solid var(--border-glass);
  padding: 36px 0;
  background: rgba(9, 10, 22, 0.9);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

.footer-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left { display: flex; align-items: center; gap: 8px; }
.footer-right { display: flex; align-items: center; gap: 20px; }

.btn-scroll-top {
  background: none;
  border: 1px solid var(--border-glass);
  color: #22d3ee;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 860px) {
  .hero-grid { grid-template-columns: 1fr; text-align: center; }
  .hero-full-name { font-size: 44px; }
  .typewriter-headline { justify-content: center; }
  .hero-bio-text { margin-left: auto; margin-right: auto; }
  .core-tech-pills { justify-content: center; }
  .hero-cta-row { justify-content: center; }
  .hero-connect-row { justify-content: center; }
  .two-col-grid { grid-template-columns: 1fr; }
  .devport-nav-pills { display: none; }
}
`;
}

/* ==========================================================================
   DEVPORT STATIC JS (Interactive Typewriter & Smooth Navigation)
   ========================================================================== */

function generateDevPortStaticJs(data, template) {
  return `(function() {
  'use strict';

  // 1. Smooth scroll with header offset
  const navHeight = 76;
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 2. Scroll to top button
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 3. Scrollspy active nav link
  const sections = document.querySelectorAll('section[id]');
  const navPills = document.querySelectorAll('.nav-pill');

  function updateActiveNav() {
    const scrollPos = window.pageYOffset + 120;
    sections.forEach(current => {
      const top = current.offsetTop;
      const height = current.offsetHeight;
      const id = current.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navPills.forEach(pill => {
          pill.classList.remove('active');
          if (pill.getAttribute('href') === '#' + id) {
            pill.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // 4. Smooth Typewriter effect
  const typewriterElem = document.getElementById('typewriterText');
  if (typewriterElem) {
    try {
      const roles = JSON.parse(typewriterElem.getAttribute('data-roles') || '[]');
      if (roles.length > 0) {
        let roleIndex = 0;
        let charIndex = roles[0].length;
        let isDeleting = true;

        function tick() {
          const currentRole = roles[roleIndex % roles.length];
          if (isDeleting) {
            charIndex--;
            typewriterElem.textContent = currentRole.substring(0, charIndex);
            if (charIndex <= 0) {
              isDeleting = false;
              roleIndex++;
              setTimeout(tick, 300);
              return;
            }
          } else {
            charIndex++;
            typewriterElem.textContent = currentRole.substring(0, charIndex);
            if (charIndex >= currentRole.length) {
              isDeleting = true;
              setTimeout(tick, 2000);
              return;
            }
          }
          const speed = isDeleting ? 40 : 80;
          setTimeout(tick, speed);
        }

        setTimeout(tick, 2000);
      }
    } catch (e) {
      // keep fallback text
    }
  }
})();
`;
}

/* ==========================================================================
   MODERN CREATIVE (3D) STATIC GENERATORS
   ========================================================================== */

function generateCreativeStaticHtml(data) {
  const { profile, socialLinks, skills, experience, education, projects, certifications } = data;
  const fullName = profile.fullName || "Creative Engineer";
  const firstName = fullName ? fullName.split(" ")[0] : "Creative";
  const headline = profile.headline || "Data Analyst & Creative Engineer";
  const bio = profile.bio || "Data Analyst with extensive experience transforming raw data into actionable insights.";
  const avatarUrl = profile.avatarUrl;
  const email = profile.email || "";

  const initials = (fullName || "JD")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const experienceYears = experience.length > 0 ? `${Math.max(1, Math.round(experience.length * 1.5))}+` : "4+";

  const socialIconsHtml = socialLinks
    .map((s) => {
      const url = sanitizeUrl(s.url);
      if (!url) return "";
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="creative-social-btn">${escapeHtml(s.label || s.platform)}</a>`;
    })
    .join("\n");

  const skillsHtml = skills
    .map((s) => `<span class="creative-skill-pill">${escapeHtml(s.name)}</span>`)
    .join("\n");

  const projectsHtml = projects
    .map((p) => {
      const liveUrl = sanitizeUrl(p.liveUrl);
      return `
        <div class="creative-card">
          <h3 class="creative-card-title">${escapeHtml(p.title)}</h3>
          <p class="creative-card-desc">${escapeHtml(p.description)}</p>
          ${liveUrl ? `<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn-creative-link">Explore Project &rarr;</a>` : ""}
        </div>
      `;
    })
    .join("\n");

  const isLight = data.design?.theme === "light";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Modern 3D Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>">
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="creative-theme${isLight ? " creative-light" : ""}">
  <div class="creative-ambient-glow"></div>
  <header class="creative-navbar">
    <div class="container navbar-flex">
      <a href="#hero" class="creative-logo">${escapeHtml(firstName)}</a>
      <nav class="creative-nav">
        <a href="#hero">Home</a>
        <a href="#about">About</a>
        <a href="#projects">Work</a>
        <a href="#contact">Contact</a>
      </nav>
      <a href="#contact" class="btn-creative-primary">Hire Me</a>
    </div>
  </header>

  <main class="container">
    <section id="hero" class="creative-hero">
      <div class="creative-hero-grid">
        <div class="creative-hero-content">
          <div class="welcome-pill">&#10024; WELCOME TO MY PORTFOLIO</div>
          <h1 class="creative-name">Hi, I'm <span class="purple-gradient-text">${escapeHtml(fullName)}</span></h1>
          <p class="creative-headline">${escapeHtml(headline)}</p>
          <p class="creative-bio">${escapeHtml(bio)}</p>
          <div class="hero-btns">
            <a href="#projects" class="btn-creative-primary">Explore My Work &rarr;</a>
            <a href="#contact" class="btn-creative-outline">Contact Me</a>
          </div>
          ${socialIconsHtml ? `<div class="socials-row">${socialIconsHtml}</div>` : ""}
        </div>

        <div class="creative-hero-visual">
          <div class="spotlight-avatar-halo">
            <div class="halo-inner">
              ${avatarUrl ? `
                <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" class="halo-avatar-img">
              ` : `
                <div class="halo-avatar-fallback">${escapeHtml(initials)}</div>
              `}
            </div>
            <div class="floating-exp-badge">
              <span class="exp-badge-num">${escapeHtml(experienceYears)}</span>
              <span class="exp-badge-text">Years Experience</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects -->
    ${projects.length ? `
    <section id="projects" class="creative-section">
      <h2 class="creative-heading">Featured Projects</h2>
      <div class="creative-grid">
        ${projectsHtml}
      </div>
    </section>
    ` : ""}

    <!-- Skills -->
    ${skills.length ? `
    <section id="skills" class="creative-section">
      <h2 class="creative-heading">Skills &amp; Expertise</h2>
      <div class="creative-skills-wrap">
        ${skillsHtml}
      </div>
    </section>
    ` : ""}

    <!-- Contact -->
    <section id="contact" class="creative-section text-center">
      <h2 class="creative-heading">Let's Connect</h2>
      <p class="creative-bio" style="margin: 0 auto 20px;">Ready to collaborate on new opportunities.</p>
      ${email ? `<a href="mailto:${escapeHtml(email)}" class="btn-creative-primary btn-lg">Email Me: ${escapeHtml(email)}</a>` : ""}
    </section>
  </main>

  <footer class="creative-footer">
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(fullName)}. Modern 3D Theme.</p>
  </footer>
  <script src="assets/script.js"></script>
</body>
</html>`;
}

function generateCreativeStaticCss(data) {
  const primaryColor = data.design?.primaryColor || "#9333ea";
  const fontFamilyCss = getFontFamilyCss(data.design?.fontFamily);
  const isLight = data.design?.theme === "light";

  return `
:root {
  --bg-dark: ${isLight ? "#f8fafc" : "#0b0f19"};
  --purple: ${primaryColor};
  --indigo: #6366f1;
  --font-family: ${fontFamilyCss};
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body.creative-theme {
  background: var(--bg-dark);
  color: ${isLight ? "#0f172a" : "#ffffff"};
  font-family: var(--font-family);
  line-height: 1.6;
  position: relative;
  overflow-x: hidden;
}
body.creative-theme.creative-light .creative-ambient-glow {
  opacity: 0.15;
}
body.creative-theme.creative-light .creative-navbar {
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
body.creative-theme.creative-light .creative-logo {
  color: #0f172a;
}
body.creative-theme.creative-light .creative-nav a {
  color: #64748b;
}
body.creative-theme.creative-light .creative-nav a:hover {
  color: #0f172a;
}
body.creative-theme.creative-light .creative-name {
  color: #0f172a;
}
body.creative-theme.creative-light .creative-bio {
  color: #64748b;
}
body.creative-theme.creative-light .creative-card,
body.creative-theme.creative-light .creative-exp-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}
body.creative-theme.creative-light .creative-card-title,
body.creative-theme.creative-light .creative-exp-title {
  color: #0f172a;
}
body.creative-theme.creative-light .creative-card-desc,
body.creative-theme.creative-light .creative-exp-desc {
  color: #64748b;
}
body.creative-theme.creative-light .creative-footer {
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  color: #64748b;
}
.creative-ambient-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15), transparent 50%),
              radial-gradient(circle at 20% 70%, rgba(147, 51, 234, 0.12), transparent 50%);
}
.container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
.creative-navbar {
  height: 76px;
  background: rgba(11, 15, 25, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
}
.navbar-flex { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.creative-logo { font-weight: 800; font-size: 20px; color: #fff; text-decoration: none; }
.creative-nav a { color: #94a3b8; text-decoration: none; margin: 0 12px; font-size: 14px; }
.creative-nav a:hover { color: #fff; }
.btn-creative-primary {
  padding: 10px 22px;
  border-radius: 12px;
  background: linear-gradient(90deg, #9333ea, #6366f1);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.4);
}
.btn-creative-outline {
  padding: 10px 22px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  text-decoration: none;
  display: inline-block;
  margin-left: 10px;
}
.creative-hero { padding: 80px 0 60px; }
.creative-hero-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; align-items: center; }
.welcome-pill {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 9999px;
  background: rgba(147, 51, 234, 0.15);
  border: 1px solid rgba(147, 51, 234, 0.3);
  color: #c084fc;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 16px;
}
.creative-name { font-size: 56px; font-weight: 900; line-height: 1.1; margin-bottom: 12px; }
.purple-gradient-text {
  background: linear-gradient(90deg, #c084fc, #818cf8, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.creative-headline { font-size: 22px; color: #c084fc; margin-bottom: 16px; font-weight: 600; }
.creative-bio { color: #cbd5e1; font-size: 15px; max-width: 540px; margin-bottom: 24px; }
.hero-btns { margin-bottom: 24px; }
.socials-row { display: flex; gap: 8px; }
.creative-social-btn {
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  text-decoration: none;
  font-size: 12px;
}
.spotlight-avatar-halo {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
  border-radius: 50%;
  padding: 8px;
  background: linear-gradient(135deg, #9333ea, #6366f1, #ec4899);
  box-shadow: 0 0 50px rgba(147, 51, 234, 0.5);
}
.halo-inner { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #1e1b4b; display: flex; align-items: center; justify-content: center; }
.halo-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.halo-avatar-fallback { font-size: 64px; font-weight: 900; color: #fff; }
.floating-exp-badge {
  position: absolute;
  bottom: -10px;
  right: -10px;
  padding: 8px 16px;
  border-radius: 12px;
  background: #1e1b4b;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  text-align: center;
}
.exp-badge-num { display: block; font-weight: 900; font-size: 18px; color: #c084fc; }
.exp-badge-text { font-size: 10px; color: #94a3b8; }
.creative-section { padding: 60px 0; }
.creative-heading { font-size: 32px; font-weight: 800; margin-bottom: 24px; }
.creative-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.creative-card { padding: 24px; border-radius: 16px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); }
.creative-card-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.creative-card-desc { font-size: 13px; color: #cbd5e1; margin-bottom: 16px; }
.btn-creative-link { font-size: 13px; color: #c084fc; text-decoration: none; font-weight: 600; }
.creative-skills-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
.creative-skill-pill { padding: 8px 16px; border-radius: 9999px; background: rgba(147, 51, 234, 0.15); border: 1px solid rgba(147, 51, 234, 0.3); color: #c084fc; font-size: 13px; font-weight: 600; }
.text-center { text-align: center; }
.creative-footer { text-align: center; padding: 40px 0; border-top: 1px solid rgba(255, 255, 255, 0.08); color: #94a3b8; font-size: 13px; }
@media (max-width: 768px) {
  .creative-hero-grid { grid-template-columns: 1fr; text-align: center; }
  .creative-name { font-size: 40px; }
}
`;
}

/* ==========================================================================
   DEVELOPER TERMINAL & MINIMAL STATIC GENERATORS
   ========================================================================== */

function generateDeveloperStaticHtml(data) {
  const { profile, skills, projects } = data;
  const fullName = profile.fullName || "Developer";
  const slug = (fullName).toLowerCase().replace(/\s+/g, "");
  const isLight = data.design?.theme === "light";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Terminal Portfolio")}</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>">
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="terminal-theme${isLight ? " terminal-light" : ""}">
  <div class="terminal-container">
    <header class="terminal-bar">
      <span>~/dev/${escapeHtml(slug)}</span>
    </header>
    <main>
      <div class="prompt-line"><span class="prompt">$</span> whoami</div>
      <h1 class="term-name">${escapeHtml(fullName)}</h1>
      <p class="term-role">${escapeHtml(profile.headline)}</p>
      <p class="term-bio">${escapeHtml(profile.bio)}</p>

      <div class="prompt-line"><span class="prompt">$</span> ls -la ./skills</div>
      <div class="term-skills">
        ${skills.map(s => `<span class="term-skill-tag">${escapeHtml(s.name)}</span>`).join(" ")}
      </div>

      <div class="prompt-line"><span class="prompt">$</span> cat ./projects.json</div>
      <div class="term-projects">
        ${projects.map(p => `
          <div class="term-proj-box">
            <div class="term-proj-title">&gt; ${escapeHtml(p.title)}</div>
            <div class="term-proj-desc">${escapeHtml(p.description)}</div>
            ${p.liveUrl ? `<a href="${escapeHtml(sanitizeUrl(p.liveUrl))}" target="_blank" class="term-link">[Live Demo]</a>` : ""}
          </div>
        `).join("")}
      </div>

      <div class="prompt-line"><span class="prompt">$</span> echo "Contact: ${escapeHtml(profile.email || '')}"</div>
    </main>
  </div>
  <script src="assets/script.js"></script>
</body>
</html>`;
}

function generateDeveloperStaticCss(data) {
  const primaryColor = data?.design?.primaryColor || "#2563eb";
  const fontFamilyCss = getFontFamilyCss(data?.design?.fontFamily || "JetBrains");
  const isLight = data?.design?.theme === "light";
  return `
:root {
  --bg-term: ${isLight ? "#f8fafc" : "#0d1117"};
  --box-bg: ${isLight ? "#ffffff" : "#161b22"};
  --border-color: ${isLight ? "#e2e8f0" : "#30363d"};
  --accent: ${primaryColor};
  --text-main: ${isLight ? "#0f172a" : "#c9d1d9"};
  --text-sub: ${isLight ? "#64748b" : "#8b949e"};
}
body.terminal-theme { background: var(--bg-term); color: var(--text-main); font-family: ${fontFamilyCss}; padding: 24px; line-height: 1.6; }
.terminal-container { max-width: 800px; margin: 40px auto; background: var(--box-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.terminal-bar { border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px; color: var(--accent); font-weight: 700; }
.prompt-line { color: var(--accent); font-size: 13px; margin: 20px 0 8px; }
.term-name { font-size: 32px; color: var(--text-main); margin-bottom: 6px; }
.term-role { color: var(--accent); font-size: 15px; margin-bottom: 10px; }
.term-bio { color: var(--text-sub); font-size: 13px; }
.term-skills { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 8px; }
.term-skill-tag { background: ${isLight ? "#f1f5f9" : "#21262d"}; border: 1px solid var(--border-color); padding: 3px 8px; border-radius: 4px; font-size: 12px; color: var(--accent); }
.term-proj-box { background: var(--bg-term); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; margin-bottom: 10px; }
.term-proj-title { color: var(--accent); font-weight: 600; }
.term-proj-desc { color: var(--text-sub); font-size: 12px; margin: 4px 0 8px; }
.term-link { color: var(--accent); text-decoration: none; font-size: 12px; font-weight: 600; }
`;
}

function generateMinimalStaticHtml(data) {
  const { profile, skills, projects, experience, education, certifications, socialLinks } = data;
  const fullName = profile.fullName || "Portfolio";
  const avatarUrl = profile.avatarUrl;

  const socialLinksHtml = socialLinks
    .map((s) => {
      const url = sanitizeUrl(s.url);
      if (!url) return "";
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="min-social-link">${escapeHtml(s.label || s.platform)}</a>`;
    })
    .join(" ");

  const skillsHtml = skills
    .map((s) => `<span class="min-skill-tag">${escapeHtml(s.name)}</span>`)
    .join(" ");

  const projectsHtml = projects
    .map((p) => {
      const liveUrl = sanitizeUrl(p.liveUrl);
      const repoUrl = sanitizeUrl(p.githubUrl);
      return `
        <div class="min-item">
          <div class="min-item-header">
            <h3 class="min-item-title">${escapeHtml(p.title)}</h3>
            <div class="min-item-links">
              ${liveUrl ? `<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="min-link">Live Demo &rarr;</a>` : ""}
              ${repoUrl ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="min-link">Source &rarr;</a>` : ""}
            </div>
          </div>
          <p class="min-item-desc">${escapeHtml(p.description)}</p>
          ${p.tags && p.tags.length ? `<div class="min-tags">${p.tags.map(t => `<span class="min-tag">${escapeHtml(t)}</span>`).join(" ")}</div>` : ""}
        </div>
      `;
    })
    .join("\n");

  const experienceHtml = experience
    .map((e) => `
      <div class="min-item">
        <div class="min-item-header">
          <h3 class="min-item-title">${escapeHtml(e.title)} <span class="min-company">@ ${escapeHtml(e.company)}</span></h3>
          <span class="min-date">${escapeHtml(e.startDate || "")} &mdash; ${e.current ? "Present" : escapeHtml(e.endDate || "Present")}</span>
        </div>
        ${e.description ? `<p class="min-item-desc">${escapeHtml(e.description)}</p>` : ""}
      </div>
    `)
    .join("\n");

  const isDark = data.design?.theme === "dark";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>">
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="minimal-theme${isDark ? " minimal-dark" : " minimal-light"}">
  <div class="minimal-wrap">
    <header class="min-header">
      <div class="min-avatar-row">
        ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" class="min-avatar" />` : ""}
        <div>
          <h1 class="min-name">${escapeHtml(fullName)}</h1>
          <p class="min-role">${escapeHtml(profile.headline)}</p>
        </div>
      </div>
      <p class="min-bio">${escapeHtml(profile.bio)}</p>
      ${socialLinksHtml ? `<div class="min-socials">${socialLinksHtml}</div>` : ""}
    </header>
    <main>
      ${skills.length ? `
      <section class="min-section">
        <h2 class="min-heading">Skills &amp; Technologies</h2>
        <div class="min-skills-list">
          ${skillsHtml}
        </div>
      </section>
      ` : ""}
      ${projects.length ? `
      <section class="min-section">
        <h2 class="min-heading">Selected Projects</h2>
        ${projectsHtml}
      </section>
      ` : ""}
      ${experience.length ? `
      <section class="min-section">
        <h2 class="min-heading">Experience</h2>
        ${experienceHtml}
      </section>
      ` : ""}
    </main>
    <footer class="min-footer">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(fullName)}. Minimal Editorial Theme.</p>
    </footer>
  </div>
  <script src="assets/script.js"></script>
</body>
</html>`;
}

function generateMinimalStaticCss(data) {
  const primaryColor = data?.design?.primaryColor || "#2563eb";
  const fontFamilyCss = getFontFamilyCss(data?.design?.fontFamily);
  const isDark = data?.design?.theme === "dark";
  return `
:root {
  --min-bg: ${isDark ? "#0f172a" : "#fafafa"};
  --min-text: ${isDark ? "#f8fafc" : "#171717"};
  --min-sub: ${isDark ? "#94a3b8" : "#525252"};
  --min-border: ${isDark ? "#334155" : "#e5e5e5"};
  --min-accent: ${primaryColor};
}
body.minimal-theme { background: var(--min-bg); color: var(--min-text); font-family: ${fontFamilyCss}; padding: 48px 24px; line-height: 1.7; }
.minimal-wrap { max-width: 680px; margin: 0 auto; }
.min-avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.min-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 1px solid var(--min-border); }
.min-name { font-size: 32px; font-weight: 600; letter-spacing: -0.02em; color: var(--min-text); }
.min-role { color: var(--min-sub); font-size: 15px; }
.min-bio { color: var(--min-sub); font-size: 14px; margin: 16px 0; }
.min-socials { display: flex; gap: 12px; margin-bottom: 32px; }
.min-social-link { font-size: 13px; color: var(--min-accent); text-decoration: underline; font-weight: 500; }
.min-section { margin-top: 40px; }
.min-heading { font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: var(--min-accent); margin-bottom: 20px; font-weight: 700; }
.min-skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
.min-skill-tag { background: ${isDark ? "#1e293b" : "#f0f0f0"}; border: 1px solid var(--min-border); padding: 4px 10px; border-radius: 6px; font-size: 12px; color: var(--min-text); }
.min-item { border-bottom: 1px solid var(--min-border); padding-bottom: 16px; margin-bottom: 20px; }
.min-item-header { display: flex; justify-content: space-between; align-items: baseline; }
.min-item-title { font-size: 16px; font-weight: 600; color: var(--min-text); }
.min-company { font-weight: 400; color: var(--min-sub); font-size: 14px; }
.min-date { font-size: 12px; color: var(--min-sub); }
.min-item-links { display: flex; gap: 10px; }
.min-item-desc { font-size: 13px; color: var(--min-sub); margin: 6px 0 8px; }
.min-tags { display: flex; gap: 6px; margin-top: 6px; }
.min-tag { font-size: 11px; color: var(--min-sub); background: ${isDark ? "#1e293b" : "#f4f4f4"}; padding: 2px 6px; border-radius: 4px; }
.min-link { color: var(--min-accent); font-size: 12px; text-decoration: underline; font-weight: 500; }
.min-footer { margin-top: 60px; font-size: 12px; color: var(--min-sub); text-align: center; }
`;
}

/* ==========================================================================
   SPOTLIGHT STATIC HTML, CSS & JS GENERATORS
   ========================================================================== */

function generateSpotlightStaticHtml(data) {
  const { profile = {}, socialLinks = [], skills = [], experience = [], education = [], projects = [], certifications = [] } = data;
  const fullName = profile.fullName || "Sunil Kumar";
  const firstName = fullName.split(/\s+/).filter((w) => !/^the$/i.test(w))[0] || fullName;
  const headline = profile.headline || "Full Stack Developer";
  const bio = profile.bio || `Explore ${fullName.toLowerCase()}'s public projects and open-source work.`;
  const location = profile.location || "";
  const primaryColor = data.design?.primaryColor || "#e3141f";
  const isLight = data.design?.theme === "light";
  const isDarkMode = data.design?.theme === "dark" || data.design?.theme === "system" || !isLight;

  // Semantic color tokens matching SpotlightTemplate.tsx
  const colors = isDarkMode
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

  const accentDeep = adjustBrightness(primaryColor, -30);
  const accentDark = adjustBrightness(primaryColor, -20);

  // GitHub handle & Avatar
  const githubLink = socialLinks.find(
    (l) => l.platform?.toLowerCase().includes("github") || l.url?.toLowerCase().includes("github.com")
  );
  const githubHandle = githubLink?.url
    ? githubLink.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/.*$/, "")
    : "sunilkumar25kush";

  const avatarUrl = profile.avatarUrl || `https://avatars.githubusercontent.com/${githubHandle}`;

  // Headline lines split
  const headlineWords = headline.trim().split(/\s+/);
  let headlineLine1 = "";
  let headlineLine2 = "";
  if (headlineWords.length <= 1) {
    headlineLine1 = headlineWords[0] || "developer";
  } else if (headlineWords.length === 2) {
    headlineLine1 = headlineWords[0];
    headlineLine2 = headlineWords[1];
  } else {
    headlineLine2 = headlineWords[headlineWords.length - 1];
    headlineLine1 = headlineWords.slice(0, headlineWords.length - 1).join(" ");
  }

  // Skills
  const skillNames = skills.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean);
  const safeSkills = skillNames.length ? skillNames : ["HTML", "JavaScript", "TypeScript", "CSS", "Python", "Dockerfile"];

  const LANG_COLORS = {
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
    Tailwind: "#38bdf8",
    TailwindCSS: "#38bdf8",
  };

  // Projects
  const displayProjects = projects.length ? projects : [
    {
      title: "NOTE-PROJECT",
      description: "Full-stack collaborative notes platform with instant Markdown sync and rich text formatting.",
      tags: ["HTML", "JavaScript"],
      repoUrl: `https://github.com/${githubHandle}/NOTE-PROJECT`,
    },
    {
      title: "AI-Interviewer",
      description: "Intelligent conversational interview platform simulating technical candidate evaluations.",
      tags: ["JavaScript", "React"],
      repoUrl: `https://github.com/${githubHandle}/AI-Interviewer`,
    },
    {
      title: "AI-Resume-builder",
      description: "Next-gen intelligent career document and portfolio generator with ATS optimization.",
      tags: ["TypeScript", "React"],
      repoUrl: `https://github.com/${githubHandle}/AI-Resume-builder`,
    },
    {
      title: "AI-CONTENT-GENERATOR",
      description: "Multi-modal AI content synthesizer for automated technical articles, docs, and assets.",
      tags: ["CSS", "JavaScript"],
      repoUrl: `https://github.com/${githubHandle}/AI-CONTENT-GENERATOR`,
    },
  ];

  // Expertise nodes
  const topSkills = safeSkills.slice(0, 4);
  const defaults = ["HTML", "JavaScript", "TypeScript", "CSS"];
  const merged = topSkills.length >= 4 ? topSkills : [...topSkills, ...defaults.slice(topSkills.length)];
  const expertiseNodes = merged.slice(0, 4).map((skillName, idx) => {
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
      isHot: idx === 1,
    };
  });

  // Tech stack groups
  const allSkills = safeSkills;
  const focus = allSkills.slice(0, 6);
  const frontendKeywords = ["html", "css", "javascript", "typescript", "react", "vue", "svelte", "tailwind", "next"];
  const backendKeywords = ["node", "python", "go", "java", "c#", "express", "sql", "mongo", "api", "ai"];
  const toolingKeywords = ["docker", "dockerfile", "git", "github", "linux", "vite", "webpack", "aws", "ci/cd"];

  const frontend = allSkills.filter((s) => frontendKeywords.some((k) => s.toLowerCase().includes(k)));
  const backend = allSkills.filter((s) => backendKeywords.some((k) => s.toLowerCase().includes(k)));
  const tooling = allSkills.filter((s) => toolingKeywords.some((k) => s.toLowerCase().includes(k)));

  const techGroups = [
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Spotlight Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>">
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="spotlight-body">
  <!-- Fixed Top Navigation -->
  <nav id="spotlightNav" aria-label="Primary portfolio navigation" class="spotlight-nav spotlight-nav-transparent">
    <div class="spotlight-nav-inner">
      <a href="#top" class="spotlight-logo">
        <span>${escapeHtml(firstName.toLowerCase())}</span><span class="spotlight-dot">.</span>
      </a>
      <div class="spotlight-nav-center">
        <a href="#about" class="spotlight-nav-link">About</a>
        <a href="#expertise" class="spotlight-nav-link">Expertise</a>
        <a href="#work" class="spotlight-nav-link">Work</a>
        <a href="#contact" class="spotlight-nav-link">Contact</a>
      </div>
      <a href="#contact" class="spotlight-nav-btn">Hire me</a>
    </div>
  </nav>

  <main class="w-full">
    <!-- HERO SECTION -->
    <section id="top" class="spotlight-hero">
      <div class="spotlight-hero-container">
        <!-- Left Hero Copy -->
        <div class="spotlight-hero-text">
          <h1>
            <span class="spotlight-hero-hi">Hi, I'm ${escapeHtml(firstName.toLowerCase())}</span>
            ${headlineLine1 ? `<span class="spotlight-hero-line1">${escapeHtml(headlineLine1)}</span>` : ""}
            ${headlineLine2 ? `<span class="spotlight-hero-line2">${escapeHtml(headlineLine2)}</span>` : ""}
          </h1>
          <p class="spotlight-hero-bio">${escapeHtml(bio)}</p>
          <div class="spotlight-hero-actions">
            <a href="#work" class="spotlight-btn-work">View my work</a>
            <a href="#contact" class="spotlight-btn-contact">Contact me</a>
          </div>
        </div>

        <!-- Right Hero Portrait Frame -->
        <div class="spotlight-hero-portrait-col">
          <div class="spotlight-portrait-frame">
            <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      <!-- Bottom SVG Wave -->
      <svg class="spotlight-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,60 C240,10 420,10 720,48 C1020,86 1200,86 1440,40 L1440,92 L0,92 Z" />
      </svg>
    </section>

    <!-- ABOUT SECTION -->
    <section id="about" class="spotlight-section-about">
      <div class="spotlight-about-container">
        <!-- Left: Hanging Swaying Tablet -->
        <div class="hanging-container">
          <div class="spotlight-cord"></div>
          <div class="spotlight-nail"></div>
          <div class="hanging-tablet">
            <div class="hanging-tablet-inner">
              <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" />
            </div>
          </div>
        </div>

        <!-- Right: Bio & Tech Pills -->
        <div class="spotlight-about-content">
          <span class="spotlight-pill-tag">HELLO!</span>
          <h2 class="spotlight-section-title">
            <span>A little </span><span class="spotlight-accent-text">about me</span>
          </h2>
          <p class="spotlight-about-desc">${escapeHtml(bio)}</p>

          <div class="spotlight-about-skills">
            ${safeSkills.slice(0, 8).map((skillName) => {
              const dotColor = LANG_COLORS[skillName] || primaryColor;
              return `
                <span class="spotlight-about-pill">
                  <span class="spotlight-pill-dot" style="background-color: ${dotColor};"></span>
                  <span>${escapeHtml(skillName)}</span>
                </span>
              `;
            }).join("")}
          </div>

          <div class="spotlight-about-stats">
            <span>2 followers</span>
            <span class="spotlight-stat-item">
              <svg class="spotlight-stat-star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>1 stars</span>
            </span>
            ${location ? `
              <span class="spotlight-stat-item spotlight-stat-loc">
                <svg class="spotlight-stat-map" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${escapeHtml(location)}</span>
              </span>
            ` : ""}
          </div>
        </div>
      </div>
    </section>

    <!-- EXPERTISE SECTION (4 Connected Nodes + Dashed Line) -->
    <section id="expertise" class="spotlight-section-expertise">
      <div class="spotlight-expertise-container">
        <!-- Left: Title -->
        <div class="spotlight-expertise-header">
          <span class="spotlight-pill-tag">MY EXPERTISE</span>
          <h2 class="spotlight-section-title">
            <span>Building modern digital solutions with </span><span class="spotlight-accent-text">code</span>
          </h2>
          <p class="spotlight-expertise-sub">
            What ${escapeHtml(firstName.toLowerCase())} spends their time on, from ${safeSkills.length || 24} public repositories.
          </p>
        </div>

        <!-- Right: 4 Connected Nodes Grid with Dashed SVG Line -->
        <div class="spotlight-expertise-grid-wrap">
          <svg class="spotlight-dashed-svg" aria-hidden="true">
            <path d="M 120 90 C 260 70, 200 240, 290 230 C 340 240, 310 370, 140 370" fill="none" stroke="${primaryColor}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="6 8" class="animate-dash" />
          </svg>

          <div class="spotlight-expertise-grid">
            ${expertiseNodes.map((node) => {
              if (node.isHot) {
                return `
                  <div class="spotlight-exp-card spotlight-exp-card-hot">
                    <span class="spotlight-exp-num">${escapeHtml(node.num)}</span>
                    <h3 class="spotlight-exp-skill">${escapeHtml(node.skill)}</h3>
                    <p class="spotlight-exp-desc">${escapeHtml(node.desc)}</p>
                  </div>
                `;
              }
              return `
                <div class="spotlight-exp-card">
                  <span class="spotlight-exp-num">${escapeHtml(node.num)}</span>
                  <h3 class="spotlight-exp-skill">${escapeHtml(node.skill)}</h3>
                  <p class="spotlight-exp-desc">${escapeHtml(node.desc)}</p>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </section>

    <!-- TECHNICAL STACK SECTION -->
    <section id="skills" class="spotlight-section-skills">
      <div class="spotlight-skills-container">
        <div class="spotlight-skills-header">
          <span class="spotlight-pill-tag">TECHNICAL STACK</span>
          <h2 class="spotlight-section-title">
            <span>Technologies I </span><span class="spotlight-accent-text">work with</span>
          </h2>
        </div>

        <div class="spotlight-tech-grid">
          ${techGroups.map((group) => `
            <div class="spotlight-tech-card">
              <h3 class="spotlight-tech-title">${escapeHtml(group.title)}</h3>
              <div class="spotlight-tech-pills">
                ${group.items.map((item) => `
                  <span class="spotlight-tech-pill">${escapeHtml(item)}</span>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>

        <div class="spotlight-skills-footer">
          <span class="spotlight-pill-tag">FEATURED WORK</span>
        </div>
      </div>
    </section>

    <!-- FEATURED WORK / PROJECTS SECTION -->
    <section id="work" class="spotlight-section-projects">
      <div class="spotlight-projects-container">
        <div class="spotlight-projects-header">
          <div>
            <h2 class="spotlight-section-title">
              <span>Featured </span><span class="spotlight-accent-text">Projects</span>
            </h2>
            <p class="spotlight-projects-sub">Production-grade applications, developer tooling, and open-source repositories.</p>
          </div>
          <a href="https://github.com/${escapeHtml(githubHandle)}?tab=repositories" target="_blank" rel="noopener noreferrer" class="spotlight-repo-link">
            <span>View all GitHub repos</span>
            <svg class="spotlight-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>

        <div class="spotlight-projects-grid">
          ${displayProjects.map((project, idx) => {
            const primaryTag = project.tags?.[0] || "Code";
            const tagColor = LANG_COLORS[primaryTag] || primaryColor;
            return `
              <div class="spotlight-project-card">
                ${project.imageUrl ? `
                  <div class="spotlight-proj-thumb">
                    <img src="${escapeHtml(project.imageUrl)}" alt="${escapeHtml(project.title)}" onerror="this.style.display='none'" />
                  </div>
                ` : ""}
                <div class="spotlight-proj-content">
                  <div class="spotlight-proj-top">
                    <span class="spotlight-proj-index">0${idx + 1} / 0${displayProjects.length}</span>
                    <div class="spotlight-proj-icon-links">
                      ${project.repoUrl ? `
                        <a href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="spotlight-icon-btn" title="GitHub Repository">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><circle cx="12" cy="13" r="2"/><path d="M14 13h3"/><path d="M7 13h3"/></svg>
                        </a>
                      ` : ""}
                      ${project.liveUrl ? `
                        <a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="spotlight-icon-btn spotlight-icon-btn-live" title="Live Demo">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                        </a>
                      ` : ""}
                    </div>
                  </div>

                  <h3 class="spotlight-proj-title">${escapeHtml(project.title)}</h3>
                  <p class="spotlight-proj-desc">${escapeHtml(project.description)}</p>
                </div>

                <div class="spotlight-proj-footer">
                  <div class="spotlight-proj-tag">
                    <span class="spotlight-pill-dot" style="background-color: ${tagColor};"></span>
                    <span>${escapeHtml(primaryTag)}</span>
                  </div>
                  <span class="spotlight-proj-star">★ 3</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </section>

    <!-- WORK EXPERIENCE SECTION -->
    ${experience.length ? `
      <section id="experience" class="spotlight-section-experience">
        <div class="spotlight-exp-container">
          <div class="spotlight-exp-heading-wrap">
            <span class="spotlight-pill-tag">CAREER JOURNEY</span>
            <h2 class="spotlight-section-title">
              <span>Work </span><span class="spotlight-accent-text">Experience</span>
            </h2>
          </div>

          <div class="spotlight-timeline">
            ${experience.map((exp) => `
              <div class="spotlight-timeline-item">
                <span class="spotlight-timeline-dot"></span>
                <div class="spotlight-timeline-card">
                  <div class="spotlight-timeline-top">
                    <h3 class="spotlight-timeline-title">${escapeHtml(exp.title)}</h3>
                    <span class="spotlight-timeline-date">${escapeHtml(exp.startDate || "")} &mdash; ${exp.current ? "Present" : escapeHtml(exp.endDate || "Present")}</span>
                  </div>
                  <p class="spotlight-timeline-company">${escapeHtml(exp.company)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ""}</p>
                  ${exp.description ? `<p class="spotlight-timeline-desc">${escapeHtml(exp.description)}</p>` : ""}
                  ${exp.highlights?.length ? `
                    <ul class="spotlight-timeline-highlights">
                      ${exp.highlights.map((h) => `<li><span>▸</span><span>${escapeHtml(h)}</span></li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    ` : ""}

    <!-- EDUCATION & CERTIFICATIONS -->
    ${education.length ? `
      <section id="education" class="spotlight-section-edu">
        <div class="spotlight-edu-container">
          <h2 class="spotlight-section-title">
            <span>Education &amp; </span><span class="spotlight-accent-text">Background</span>
          </h2>
          <div class="spotlight-edu-grid">
            ${education.map((edu) => `
              <div class="spotlight-edu-card">
                <span class="spotlight-edu-date">${escapeHtml(edu.startDate || "")} &mdash; ${escapeHtml(edu.endDate || "Present")}</span>
                <h3 class="spotlight-edu-degree">${escapeHtml(edu.degree)}</h3>
                <p class="spotlight-edu-inst">${escapeHtml(edu.institution)}${edu.fieldOfStudy ? ` · ${escapeHtml(edu.fieldOfStudy)}` : ""}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    ` : ""}

    ${certifications.length ? `
      <section id="certifications" class="spotlight-section-cert">
        <div class="spotlight-edu-container">
          <h2 class="spotlight-section-title">
            <span>Certifications &amp; </span><span class="spotlight-accent-text">Honors</span>
          </h2>
          <div class="spotlight-cert-grid">
            ${certifications.map((c) => `
              <div class="spotlight-cert-card">
                <svg class="spotlight-cert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                <div>
                  <h3 class="spotlight-cert-title">${escapeHtml(c.name)}</h3>
                  <p class="spotlight-cert-issuer">${escapeHtml(c.issuer)}${c.issueDate ? ` · ${escapeHtml(c.issueDate)}` : ""}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    ` : ""}

    <!-- CONTACT SECTION (Giant Watermark + Center Floating Red Card) -->
    <section id="contact" class="spotlight-contact-section">
      <div class="spotlight-watermark-wrap">
        <span class="spotlight-watermark font-anton">CONTACT</span>
        <span class="spotlight-watermark font-anton">${escapeHtml(firstName.toLowerCase())}</span>
      </div>

      <div class="spotlight-contact-card">
        <h2 class="spotlight-contact-title">Discuss an opportunity</h2>
        <p class="spotlight-contact-sub">Open to new roles, collaborations and interesting problems.</p>
        <div class="spotlight-contact-actions">
          <a href="https://www.linkedin.com/in/sunil-kumar-9042aa373/?isSelfProfile=true" target="_blank" rel="noopener noreferrer" class="spotlight-linkedin-btn" aria-label="Connect on LinkedIn">
            <div class="spotlight-linkedin-left">
              <svg class="spotlight-linkedin-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              <span>LinkedIn</span>
            </div>
            <span class="spotlight-linkedin-arrow">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  </main>

  <!-- Back to Top Floating Button -->
  <button type="button" id="scrollTopBtn" aria-label="Back to top" class="spotlight-scroll-top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
  </button>

  <script src="assets/script.js"></script>
</body>
</html>`;
}

function generateSpotlightStaticCss(data) {
  const primaryColor = data.design?.primaryColor || "#e3141f";
  const fontFamilyCss = getFontFamilyCss(data.design?.fontFamily);
  const isLight = data.design?.theme === "light";
  const isDarkMode = data.design?.theme === "dark" || data.design?.theme === "system" || !isLight;

  const colors = isDarkMode
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

  const accentDeep = adjustBrightness(primaryColor, -30);
  const accentDark = adjustBrightness(primaryColor, -20);

  return `/* Spotlight Signature GitSkins Template Stylesheet */
:root {
  --spotlight-accent: ${primaryColor};
  --spotlight-accent-deep: ${accentDeep};
  --spotlight-accent-dark: ${accentDark};
  --spotlight-font: ${fontFamilyCss};
  --spotlight-paper: ${colors.paper};
  --spotlight-section-white: ${colors.sectionWhite};
  --spotlight-card: ${colors.cardBg};
  --spotlight-card-border: ${colors.cardBorder};
  --spotlight-text: ${colors.ink};
  --spotlight-muted: ${colors.inkMuted};
  --spotlight-border: ${colors.border};
  --spotlight-nav-bg: ${colors.navBg};
  --spotlight-nav-text: ${colors.navInk};
  --spotlight-wave-fill: ${colors.waveFill};
  --spotlight-pill: ${colors.pillBg};
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-family: var(--spotlight-font); }
body.spotlight-body {
  background-color: var(--spotlight-paper);
  color: var(--spotlight-text);
  font-family: var(--spotlight-font);
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
  transition: background-color 0.3s, color 0.3s;
}

@keyframes sway {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}
@keyframes dash {
  to { stroke-dashoffset: -1000; }
}
.animate-dash {
  animation: dash 18s linear infinite;
  will-change: stroke-dashoffset;
}

/* Fixed Navigation */
.spotlight-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition: all 0.3s ease;
}
.spotlight-nav.spotlight-nav-transparent {
  background-color: transparent;
  padding: 22px 0;
  border-bottom: none;
}
.spotlight-nav.spotlight-nav-solid {
  background-color: var(--spotlight-nav-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--spotlight-border);
  padding: 12px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.spotlight-nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.spotlight-logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.3s;
}
.spotlight-nav-transparent .spotlight-logo { color: #ffffff; }
.spotlight-nav-solid .spotlight-logo { color: var(--spotlight-nav-text); }
.spotlight-dot { color: var(--spotlight-accent); }
.spotlight-nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  font-size: 14px;
  font-weight: 600;
}
.spotlight-nav-link {
  text-decoration: none;
  transition: opacity 0.2s, color 0.3s;
  opacity: 0.9;
}
.spotlight-nav-transparent .spotlight-nav-link { color: rgba(255, 255, 255, 0.85); }
.spotlight-nav-solid .spotlight-nav-link { color: var(--spotlight-muted); }
.spotlight-nav-link:hover { opacity: 1; color: var(--spotlight-accent); }
.spotlight-nav-btn {
  padding: 8px 20px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
  transition: transform 0.2s, background-color 0.3s, color 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  flex-shrink: 0;
}
.spotlight-nav-btn:hover { transform: scale(1.05); }
.spotlight-nav-transparent .spotlight-nav-btn { background-color: #ffffff; color: #111111; }
.spotlight-nav-solid .spotlight-nav-btn {
  background-color: ${isDarkMode ? "#ffffff" : "#111111"};
  color: ${isDarkMode ? "#111111" : "#ffffff"};
}

/* HERO SECTION */
.spotlight-hero {
  position: relative;
  color: #ffffff;
  overflow: hidden;
  background: linear-gradient(135deg, var(--spotlight-accent) 0%, var(--spotlight-accent-deep) 100%);
  min-height: 100vh;
}
.spotlight-hero-container {
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  padding: 100px 24px 90px;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  position: relative;
  z-index: 10;
}
.spotlight-hero-text h1 {
  font-weight: 800;
  font-size: clamp(36px, 6.5vw, 84px);
  line-height: 1.03;
  letter-spacing: -0.035em;
}
.spotlight-hero-text h1 span { display: block; color: #ffffff; }
.spotlight-hero-text h1 .spotlight-hero-line1 { margin-top: 4px; }
.spotlight-hero-bio {
  max-width: 460px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  line-height: 1.65;
  margin: 20px 0 28px;
}
.spotlight-hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.spotlight-btn-work {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 28px;
  border-radius: 9999px;
  background: #ffffff;
  color: var(--spotlight-accent);
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}
.spotlight-btn-work:hover { transform: scale(1.05); }
.spotlight-btn-contact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 28px;
  border-radius: 9999px;
  border: 1.5px solid #ffffff;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}
.spotlight-btn-contact:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}
.spotlight-hero-portrait-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.spotlight-portrait-frame {
  position: relative;
  border-radius: 32px;
  border: 10px solid #ffffff;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  width: min(300px, 44vw);
  aspect-ratio: 4/5;
  box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.45), 0 0 50px rgba(227, 20, 31, 0.25);
}
@media (min-width: 1024px) {
  .spotlight-portrait-frame {
    margin-top: -330px;
    right: 80px;
  }
}
.spotlight-portrait-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}
.spotlight-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  width: 100%;
  height: 75px;
  display: block;
  pointer-events: none;
  z-index: 4;
}
.spotlight-wave path { fill: var(--spotlight-wave-fill); }

/* Common Pill Badge & Typography */
.spotlight-pill-tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: rgba(227, 20, 31, 0.12);
  color: var(--spotlight-accent);
  margin-bottom: 16px;
}
.spotlight-section-title {
  font-size: clamp(34px, 4.5vw, 56px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: var(--spotlight-text);
  margin-bottom: 16px;
}
.spotlight-accent-text { color: var(--spotlight-accent); }

/* ABOUT SECTION & SWAY TABLET */
.spotlight-section-about {
  position: relative;
  padding: 96px 24px;
  background-color: var(--spotlight-paper);
  color: var(--spotlight-text);
}
.spotlight-about-container {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 64px;
  align-items: center;
}
.hanging-container {
  position: relative;
  justify-self: center;
  padding-top: 60px;
  user-select: none;
}
.spotlight-cord {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 68px;
  transform: translateX(-50%);
  background: ${isDarkMode ? "linear-gradient(to bottom, #888, #444)" : "linear-gradient(to bottom, #bbb, #777)"};
}
.spotlight-nail {
  position: absolute;
  left: 50%;
  top: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translateX(-50%);
  background-color: ${isDarkMode ? "#666" : "#444"};
}
.hanging-tablet {
  width: min(330px, 78vw);
  aspect-ratio: 4/5;
  padding: 12px;
  border-radius: 32px;
  box-shadow: 0 30px 70px -25px rgba(0, 0, 0, 0.5);
  background-color: ${isDarkMode ? "#18181b" : "#111111"};
  transform-origin: 50% 0;
  animation: sway 6s ease-in-out infinite;
  transform: rotate(-4deg);
}
.hanging-tablet-inner {
  width: 100%;
  height: 100%;
  border-radius: 22px;
  overflow: hidden;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hanging-tablet-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}
.spotlight-about-desc {
  font-size: 17px;
  line-height: 1.7;
  color: var(--spotlight-muted);
  margin-bottom: 24px;
}
.spotlight-about-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}
.spotlight-about-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--spotlight-card);
  border: 1px solid var(--spotlight-card-border);
  color: var(--spotlight-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.spotlight-pill-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.spotlight-about-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--spotlight-muted);
}
.spotlight-stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.spotlight-stat-star, .spotlight-stat-map {
  width: 16px;
  height: 16px;
  color: var(--spotlight-accent);
}
.spotlight-stat-loc { margin-left: auto; }

/* EXPERTISE SECTION */
.spotlight-section-expertise {
  position: relative;
  padding: 96px 24px;
  background-color: var(--spotlight-section-white);
  color: var(--spotlight-text);
  overflow: hidden;
}
.spotlight-expertise-container {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 64px;
  align-items: center;
}
.spotlight-expertise-sub {
  font-size: 17px;
  line-height: 1.6;
  color: var(--spotlight-muted);
}
.spotlight-expertise-grid-wrap {
  position: relative;
  min-height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.spotlight-dashed-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}
@media (max-width: 1023px) {
  .spotlight-dashed-svg { display: none; }
}
.spotlight-expertise-grid {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 540px;
}
.spotlight-exp-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--spotlight-card);
  border: 1px solid var(--spotlight-card-border);
  color: var(--spotlight-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.spotlight-exp-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
.spotlight-exp-card-hot {
  background-color: var(--spotlight-accent);
  color: #ffffff;
  border: none;
  box-shadow: 0 20px 40px -15px rgba(227, 20, 31, 0.45);
}
.spotlight-exp-card-hot .spotlight-exp-skill,
.spotlight-exp-card-hot .spotlight-exp-desc,
.spotlight-exp-card-hot .spotlight-exp-num {
  color: #ffffff !important;
}
.spotlight-exp-num {
  display: block;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--spotlight-muted);
  margin-bottom: 8px;
}
.spotlight-exp-skill {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.spotlight-exp-desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--spotlight-muted);
}

/* TECHNICAL STACK SECTION */
.spotlight-section-skills {
  padding: 96px 24px;
  background-color: var(--spotlight-paper);
}
.spotlight-skills-container {
  max-width: 1180px;
  margin: 0 auto;
}
.spotlight-skills-header { margin-bottom: 48px; }
.spotlight-tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
.spotlight-tech-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--spotlight-card);
  border: 1px solid var(--spotlight-card-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.spotlight-tech-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--spotlight-text);
}
.spotlight-tech-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.spotlight-tech-pill {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: var(--spotlight-pill);
  color: var(--spotlight-text);
}
.spotlight-skills-footer { margin-top: 36px; }

/* FEATURED PROJECTS SECTION */
.spotlight-section-projects {
  padding: 80px 24px 112px;
  background-color: var(--spotlight-section-white);
}
.spotlight-projects-container {
  max-width: 1180px;
  margin: 0 auto;
}
.spotlight-projects-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 48px;
}
.spotlight-projects-sub {
  font-size: 16px;
  color: var(--spotlight-muted);
  margin-top: 8px;
}
.spotlight-repo-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--spotlight-accent);
  text-decoration: none;
}
.spotlight-repo-link:hover { text-decoration: underline; }
.spotlight-chevron { width: 16px; height: 16px; }
.spotlight-projects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.spotlight-project-card {
  padding: 28px;
  border-radius: 28px;
  background: var(--spotlight-card);
  border: 1px solid var(--spotlight-card-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s, box-shadow 0.3s;
}
.spotlight-project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}
.spotlight-proj-thumb {
  width: 100%;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid var(--spotlight-border);
}
.spotlight-proj-thumb img { width: 100%; height: 100%; object-fit: cover; }
.spotlight-proj-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.spotlight-proj-index {
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--spotlight-muted);
}
.spotlight-proj-icon-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
.spotlight-icon-btn {
  padding: 6px;
  border-radius: 50%;
  color: var(--spotlight-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background-color 0.2s;
}
.spotlight-icon-btn:hover { background-color: rgba(0,0,0,0.06); }
.spotlight-icon-btn svg { width: 16px; height: 16px; }
.spotlight-icon-btn-live { color: var(--spotlight-accent); }
.spotlight-proj-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  color: var(--spotlight-text);
}
.spotlight-proj-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--spotlight-muted);
  margin-bottom: 16px;
}
.spotlight-proj-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--spotlight-border);
}
.spotlight-proj-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--spotlight-text);
}
.spotlight-proj-star {
  font-size: 12px;
  font-weight: 600;
  color: var(--spotlight-accent);
}

/* WORK EXPERIENCE TIMELINE */
.spotlight-section-experience {
  padding: 80px 24px 112px;
  background-color: var(--spotlight-paper);
}
.spotlight-exp-container {
  max-width: 900px;
  margin: 0 auto;
}
.spotlight-exp-heading-wrap { margin-bottom: 48px; }
.spotlight-timeline {
  position: relative;
  padding-left: 28px;
  border-left: 2px solid rgba(227, 20, 31, 0.35);
  display: flex;
  flex-direction: column;
  gap: 36px;
}
.spotlight-timeline-item { position: relative; }
.spotlight-timeline-dot {
  position: absolute;
  left: -35px;
  top: 6px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--spotlight-accent);
  border: 2px solid var(--spotlight-paper);
}
.spotlight-timeline-card {
  padding: 24px;
  border-radius: 22px;
  background: var(--spotlight-card);
  border: 1px solid var(--spotlight-card-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.spotlight-timeline-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.spotlight-timeline-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--spotlight-text);
}
.spotlight-timeline-date {
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--spotlight-accent);
}
.spotlight-timeline-company {
  font-size: 14px;
  font-weight: 600;
  color: var(--spotlight-muted);
  margin-bottom: 12px;
}
.spotlight-timeline-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--spotlight-muted);
  margin-bottom: 12px;
}
.spotlight-timeline-highlights {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.spotlight-timeline-highlights li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--spotlight-muted);
}
.spotlight-timeline-highlights li span:first-child { color: var(--spotlight-accent); }

/* EDUCATION & CERTIFICATIONS */
.spotlight-section-edu, .spotlight-section-cert {
  padding: 72px 24px;
  background-color: var(--spotlight-section-white);
}
.spotlight-edu-container {
  max-width: 900px;
  margin: 0 auto;
}
.spotlight-edu-grid, .spotlight-cert-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 24px;
}
.spotlight-edu-card, .spotlight-cert-card {
  padding: 24px;
  border-radius: 22px;
  background: var(--spotlight-card);
  border: 1px solid var(--spotlight-card-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.spotlight-edu-date {
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--spotlight-accent);
}
.spotlight-edu-degree, .spotlight-cert-title {
  font-size: 17px;
  font-weight: 700;
  margin-top: 4px;
  color: var(--spotlight-text);
}
.spotlight-edu-inst, .spotlight-cert-issuer {
  font-size: 14px;
  color: var(--spotlight-muted);
  margin-top: 4px;
}
.spotlight-cert-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.spotlight-cert-icon {
  width: 24px;
  height: 24px;
  color: var(--spotlight-accent);
  flex-shrink: 0;
}

/* CONTACT SECTION (GIANT WATERMARK & FLOATING CARD) */
.spotlight-contact-section {
  position: relative;
  min-height: 85vh;
  padding: 100px 24px;
  background-color: #09090b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  user-select: none;
  text-align: center;
}
.spotlight-watermark-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  padding: 32px 0;
  z-index: 0;
  overflow: hidden;
}
.spotlight-watermark {
  font-family: 'Anton', sans-serif;
  font-size: clamp(44px, 14vw, 220px);
  color: #ffffff;
  opacity: 0.95;
  line-height: 1;
  letter-spacing: -0.02em;
  text-align: center;
  padding: 0 8px;
}
.spotlight-contact-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 620px;
  padding: 48px;
  border-radius: 36px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--spotlight-accent) 0%, var(--spotlight-accent-dark) 100%);
  box-shadow: 0 30px 90px -20px rgba(0, 0, 0, 0.8);
}
.spotlight-contact-title {
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.spotlight-contact-sub {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 24px;
}
.spotlight-linkedin-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 24px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.25);
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}
.spotlight-linkedin-btn:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: scale(1.01);
  border-color: rgba(255, 255, 255, 0.3);
}
.spotlight-linkedin-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.spotlight-linkedin-icon { width: 20px; height: 20px; }
.spotlight-linkedin-arrow { font-size: 20px; font-weight: 700; }

/* Floating Back To Top Button */
.spotlight-scroll-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 40;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: var(--spotlight-accent);
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border: none;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.spotlight-scroll-top:hover { transform: scale(1.1); }
.spotlight-scroll-top svg { width: 20px; height: 20px; }

/* Responsive adjustments */
@media (max-width: 1023px) {
  .spotlight-hero-container {
    grid-template-columns: 1fr;
    padding-top: 100px;
    padding-bottom: 60px;
    text-align: left;
    gap: 32px;
  }
  .spotlight-hero-portrait-col {
    justify-content: center;
  }
  .spotlight-portrait-frame {
    margin-top: 0;
    right: 0;
    width: min(280px, 70vw);
  }
  .spotlight-about-container,
  .spotlight-expertise-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .spotlight-tech-grid {
    grid-template-columns: 1fr 1fr;
  }
  .spotlight-projects-grid {
    grid-template-columns: 1fr;
  }
  .spotlight-edu-grid,
  .spotlight-cert-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 639px) {
  .spotlight-nav-center { display: none; }
  .spotlight-tech-grid { grid-template-columns: 1fr; }
  .spotlight-expertise-grid { grid-template-columns: 1fr; }
  .spotlight-contact-card { padding: 32px 20px; }
}
`;
}

function generateSpotlightStaticJs(data) {
  return `(function() {
  'use strict';
  const nav = document.getElementById('spotlightNav');
  const hero = document.getElementById('top');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const navHeight = 70;

  function updateNav() {
    if (hero && nav) {
      const rect = hero.getBoundingClientRect();
      const isOverlapping = rect.top < navHeight && rect.bottom > 0;
      if (isOverlapping) {
        nav.classList.remove('spotlight-nav-solid');
        nav.classList.add('spotlight-nav-transparent');
      } else {
        nav.classList.remove('spotlight-nav-transparent');
        nav.classList.add('spotlight-nav-solid');
      }
    }
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.style.display = 'flex';
      } else {
        scrollTopBtn.style.display = 'none';
      }
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - (targetId === '#top' ? 0 : navHeight);
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();`;
}

function generatePosterStaticHtml(data) {
  const { profile, socialLinks, skills, experience, projects } = data;
  const fullName = profile.fullName || "Developer";
  const headline = profile.headline || "Creative Software Developer";
  const bio = profile.bio || "Crafting bold and memorable digital experiences.";
  const avatarUrl = profile.avatarUrl;
  const email = profile.email || "";
  const phone = profile.phone || "";
  const isDark = data.design?.theme === "dark";

  const templateSettings = data.design?.templateSettings || {};
  const marqueeText =
    typeof templateSettings.marqueeText === "string" && templateSettings.marqueeText.trim()
      ? templateSettings.marqueeText.trim()
      : "CREATIVE • VISIONARY • ENGINEER • FULLSTACK";

  const skillNames = skills.map((s) => s.name).filter(Boolean);
  const skillsJson = JSON.stringify(skillNames.length ? skillNames : ["JavaScript", "React", "TypeScript", "Node.js"]);

  const socialLinksHtml = socialLinks
    .map((s) => {
      const url = sanitizeUrl(s.url);
      if (!url) return "";
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="poster-social-link">${escapeHtml(s.label || s.platform)}</a>`;
    })
    .join(" &bull; ");

  const projectsHtml = projects
    .map((p, idx) => {
      const liveUrl = sanitizeUrl(p.liveUrl);
      const repoUrl = sanitizeUrl(p.repoUrl);
      const tagsHtml = (p.tags || [])
        .map((t) => `<span class="poster-tag">#${escapeHtml(t)}</span>`)
        .join(" ");

      return `
        <article class="poster-project-card">
          <div class="poster-proj-num">// 0${idx + 1}</div>
          <h3 class="poster-proj-title">${escapeHtml(p.title)}</h3>
          <p class="poster-proj-desc">${escapeHtml(p.description)}</p>
          ${tagsHtml ? `<div class="poster-proj-tags">${tagsHtml}</div>` : ""}
          <div class="poster-proj-actions">
            ${liveUrl ? `<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="poster-action-link">Live Project &rarr;</a>` : ""}
            ${repoUrl ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="poster-action-link">GitHub Source &rarr;</a>` : ""}
          </div>
        </article>
      `;
    })
    .join("\n");

  const experienceHtml = experience
    .map((e) => `
      <div class="poster-exp-row">
        <div class="poster-exp-period">${escapeHtml(e.startDate || "")} &mdash; ${e.current ? "PRESENT" : escapeHtml(e.endDate || "")}</div>
        <div class="poster-exp-info">
          <h4 class="poster-exp-role">${escapeHtml(e.title)}</h4>
          <p class="poster-exp-company">${escapeHtml(e.company)} ${e.location ? `(${escapeHtml(e.location)})` : ""}</p>
          ${e.description ? `<p class="poster-exp-desc">${escapeHtml(e.description)}</p>` : ""}
        </div>
      </div>
    `)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Poster Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📰</text></svg>">
  ${GOOGLE_FONTS_LINK_TAG}
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="poster-theme${isDark ? " poster-dark" : " poster-light"}">
  <!-- Top Marquee Ticker -->
  <div class="poster-ticker" aria-hidden="true">
    <div class="poster-ticker-track">
      <span>${escapeHtml(marqueeText)} &nbsp;&bull;&nbsp; ${escapeHtml(marqueeText)} &nbsp;&bull;&nbsp; ${escapeHtml(marqueeText)}</span>
    </div>
  </div>

  <div class="poster-wrapper">
    <header class="poster-header">
      <div class="poster-top-bar">
        <span class="poster-brand">${escapeHtml(fullName)}</span>
        <div class="poster-socials-top">${socialLinksHtml}</div>
      </div>
      <h1 class="poster-hero-name">${escapeHtml(fullName.toUpperCase())}</h1>
      <div class="poster-meta-banner">
        <div class="poster-headline-badge">${escapeHtml(headline.toUpperCase())}</div>
        <div class="poster-typewriter-box">
          <span class="poster-typewriter-prefix">SKILLS:</span>
          <span class="poster-typewriter-text" id="posterTypewriter" data-skills='${escapeHtml(skillsJson)}'></span>
          <span class="poster-cursor">_</span>
        </div>
      </div>
    </header>

    <main class="poster-main">
      <!-- Bio / Statement Section -->
      <section class="poster-statement-section">
        <div class="poster-col-label">01 / STATEMENT</div>
        <div class="poster-statement-content">
          <p class="poster-statement-text">${escapeHtml(bio)}</p>
          ${avatarUrl ? `
            <div class="poster-portrait-wrap">
              <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" class="poster-portrait-img" />
            </div>
          ` : ""}
        </div>
      </section>

      <!-- Featured Projects Section -->
      ${projects.length ? `
      <section class="poster-projects-section" id="projects">
        <div class="poster-col-label">02 / SELECTED WORK</div>
        <div class="poster-projects-grid">
          ${projectsHtml}
        </div>
      </section>
      ` : ""}

      <!-- Experience Section -->
      ${experience.length ? `
      <section class="poster-exp-section" id="experience">
        <div class="poster-col-label">03 / TRACK RECORD</div>
        <div class="poster-exp-list">
          ${experienceHtml}
        </div>
      </section>
      ` : ""}

      <!-- Contact Section -->
      <section class="poster-contact-section" id="contact">
        <div class="poster-col-label">04 / INQUIRIES</div>
        <div class="poster-contact-content">
          <h2 class="poster-contact-giant">LET'S CONNECT</h2>
          <div class="poster-contact-actions">
            ${email ? `<a href="mailto:${escapeHtml(email)}" class="poster-btn-massive">EMAIL: ${escapeHtml(email)} &rarr;</a>` : ""}
            ${phone ? `<a href="tel:${escapeHtml(phone)}" class="poster-btn-massive">TEL: ${escapeHtml(phone)} &rarr;</a>` : ""}
          </div>
        </div>
      </section>
    </main>

    <footer class="poster-footer">
      <span>&copy; ${new Date().getFullYear()} ${escapeHtml(fullName)}. POSTER EDITORIAL ARCHIVE.</span>
      <button type="button" class="poster-btn-top" id="scrollTopBtn">TOP &uarr;</button>
    </footer>
  </div>

  <script src="assets/script.js"></script>
</body>
</html>`;
}

function generatePosterStaticCss(data) {
  const primaryColor = data.design?.primaryColor || "#e11d2a";
  const fontFamilyCss = getFontFamilyCss(data.design?.fontFamily);
  const isDark = data.design?.theme === "dark";

  return `/* Poster Bold Editorial Stylesheet */
:root {
  --poster-accent: ${primaryColor};
  --poster-font: ${fontFamilyCss};
  --poster-bg: ${isDark ? "#09090b" : "#fdfbf7"};
  --poster-text: ${isDark ? "#f4f4f5" : "#18181b"};
  --poster-border: ${isDark ? "#27272a" : "#18181b"};
  --poster-muted: ${isDark ? "#a1a1aa" : "#52525b"};
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body.poster-theme {
  background: var(--poster-bg);
  color: var(--poster-text);
  font-family: var(--poster-font);
  line-height: 1.5;
}

/* Ticker Marquee */
.poster-ticker {
  background: var(--poster-accent);
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  padding: 8px 0;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.1em;
}
.poster-ticker-track {
  display: inline-block;
  animation: posterMarquee 25s linear infinite;
}
@keyframes posterMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.poster-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* Header */
.poster-header {
  border-bottom: 3px solid var(--poster-border);
  padding-bottom: 40px;
}
.poster-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.poster-brand {
  font-family: monospace;
  font-weight: 700;
  font-size: 16px;
}
.poster-social-link {
  color: var(--poster-accent);
  text-decoration: underline;
  font-size: 13px;
  font-weight: 600;
}
.poster-hero-name {
  font-size: clamp(48px, 10vw, 110px);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.04em;
  margin-bottom: 24px;
}
.poster-meta-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}
.poster-headline-badge {
  background: var(--poster-border);
  color: var(--poster-bg);
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.poster-typewriter-box {
  font-family: monospace;
  font-size: 14px;
}
.poster-typewriter-prefix {
  color: var(--poster-muted);
  margin-right: 8px;
}
.poster-typewriter-text {
  color: var(--poster-accent);
  font-weight: 700;
}
.poster-cursor {
  animation: blink 1s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }

/* Sections */
.poster-statement-section, .poster-projects-section, .poster-exp-section, .poster-contact-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  padding: 48px 0;
  border-bottom: 2px solid var(--poster-border);
}
.poster-col-label {
  font-family: monospace;
  font-weight: 800;
  font-size: 14px;
  color: var(--poster-accent);
}
.poster-statement-text {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 24px;
}
.poster-portrait-wrap {
  width: 140px;
  height: 140px;
  border: 3px solid var(--poster-border);
  overflow: hidden;
}
.poster-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Projects */
.poster-projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}
.poster-project-card {
  border: 2px solid var(--poster-border);
  padding: 32px;
  background: ${isDark ? "#121215" : "#ffffff"};
}
.poster-proj-num {
  font-family: monospace;
  color: var(--poster-accent);
  font-weight: 700;
  margin-bottom: 8px;
}
.poster-proj-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
}
.poster-proj-desc {
  font-size: 15px;
  color: var(--poster-muted);
  margin-bottom: 16px;
}
.poster-proj-tags {
  margin-bottom: 20px;
}
.poster-tag {
  font-size: 12px;
  font-family: monospace;
  margin-right: 8px;
  color: var(--poster-accent);
}
.poster-proj-actions {
  display: flex;
  gap: 16px;
}
.poster-action-link {
  font-weight: 700;
  font-size: 14px;
  color: var(--poster-text);
  text-decoration: underline;
}

/* Experience */
.poster-exp-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.poster-exp-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
}
.poster-exp-period {
  font-family: monospace;
  font-weight: 700;
  font-size: 13px;
  color: var(--poster-muted);
}
.poster-exp-role {
  font-size: 18px;
  font-weight: 800;
}
.poster-exp-company {
  font-size: 14px;
  color: var(--poster-accent);
  margin-bottom: 6px;
}
.poster-exp-desc {
  font-size: 14px;
  color: var(--poster-muted);
}

/* Contact */
.poster-contact-giant {
  font-size: clamp(36px, 8vw, 84px);
  font-weight: 900;
  line-height: 0.95;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
}
.poster-contact-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.poster-btn-massive {
  font-size: 20px;
  font-weight: 800;
  color: var(--poster-accent);
  text-decoration: underline;
}

/* Footer */
.poster-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  font-family: monospace;
  font-size: 12px;
}
.poster-btn-top {
  background: none;
  border: 2px solid var(--poster-border);
  color: var(--poster-text);
  font-weight: 800;
  padding: 6px 14px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .poster-statement-section, .poster-projects-section, .poster-exp-section, .poster-contact-section {
    grid-template-columns: 1fr;
  }
  .poster-exp-row { grid-template-columns: 1fr; }
}
`;
}

function generatePosterStaticJs(data) {
  return `(function() {
  'use strict';
  const typewriterElem = document.getElementById('posterTypewriter');
  if (typewriterElem) {
    try {
      const skills = JSON.parse(typewriterElem.getAttribute('data-skills') || '[]');
      if (skills.length > 0) {
        let skillIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        function step() {
          const current = skills[skillIdx % skills.length];
          if (isDeleting) {
            charIdx--;
            typewriterElem.textContent = current.substring(0, charIdx);
            if (charIdx <= 0) {
              isDeleting = false;
              skillIdx++;
              setTimeout(step, 400);
              return;
            }
          } else {
            charIdx++;
            typewriterElem.textContent = current.substring(0, charIdx);
            if (charIdx >= current.length) {
              isDeleting = true;
              setTimeout(step, 2000);
              return;
            }
          }
          setTimeout(step, isDeleting ? 40 : 90);
        }
        setTimeout(step, 800);
      }
    } catch(e) {}
  }

  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();`;
}

/* ==========================================================================
   REACT SOURCE CODE TEMPLATE JSX BUILDERS
   ========================================================================== */

function getFullSpotlightTemplateJsx() {
  return "import { useEffect, useState, useMemo } from \"react\";\nimport {\n  ArrowUp,\n  MapPin,\n  Award,\n  ExternalLink,\n  ChevronRight,\n  Star,\n  FolderGit2,\n} from \"lucide-react\";\n\nimport { SafeLink } from \"../common/SafeLink.jsx\";\nimport { normalizeAvatarUrl } from \"../common/urlUtils.js\";\n\n\n\n// GitSkins exact language dot colors\nconst LANG_COLORS = {\n  JavaScript: \"#f1e05a\",\n  TypeScript: \"#3178c6\",\n  Python: \"#3572A5\",\n  Go: \"#00ADD8\",\n  Rust: \"#dea584\",\n  Ruby: \"#701516\",\n  Java: \"#b07219\",\n  \"C++\": \"#f34b7d\",\n  C: \"#555555\",\n  \"C#\": \"#178600\",\n  PHP: \"#4F5D95\",\n  Swift: \"#F05138\",\n  Kotlin: \"#A97BFF\",\n  Dart: \"#00B4AB\",\n  HTML: \"#e34c26\",\n  CSS: \"#663399\",\n  Shell: \"#89e051\",\n  Vue: \"#41b883\",\n  Svelte: \"#ff3e00\",\n  React: \"#61dafb\",\n  \"Node.js\": \"#339933\",\n  Dockerfile: \"#384d54\",\n};\n\n// Font family map supporting the typography customization settings\nconst FONT_FAMILY_MAP = {\n  Inter: \"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\",\n  Roboto: \"'Roboto', -apple-system, BlinkMacSystemFont, sans-serif\",\n  Merriweather: \"'Merriweather', Georgia, serif\",\n  Playfair: \"'Playfair Display', Georgia, serif\",\n  JetBrains: \"'JetBrains Mono', 'Fira Code', monospace\",\n};\n\n// Helper to adjust color shade for gradients and contrast\nfunction adjustBrightness(hex, percent) {\n  const cleanHex = hex.replace(\"#\", \"\");\n  const num = parseInt(cleanHex.length === 3 ? cleanHex.split(\"\").map((c) => c + c).join(\"\") : cleanHex, 16);\n  if (isNaN(num)) return hex;\n  const amt = Math.round(2.55 * percent);\n  const R = Math.max(0, Math.min(255, (num >> 16) + amt));\n  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));\n  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));\n  return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;\n}\n\nexport function SpotlightTemplate({\n  portfolio = {},\n  showEmpty = false,\n  sectionOrder = [\n    \"hero\",\n    \"about\",\n    \"expertise\",\n    \"skills\",\n    \"projects\",\n    \"experience\",\n    \"education\",\n    \"certifications\",\n    \"contact\",\n  ],\n  hiddenSections = [],\n}) {\n  const profile = portfolio.profile;\n  const design = portfolio.design;\n  const socialLinks = portfolio.socialLinks || [];\n  const skills = useMemo(() => portfolio.skills || [], [portfolio.skills]);\n  const experience = portfolio.experience || [];\n  const education = portfolio.education || [];\n  const projects = useMemo(() => portfolio.projects || [], [portfolio.projects]);\n  const certifications = portfolio.certifications || [];\n\n  // ---------------------------------------------------------------------------\n  // 1. DYNAMIC CUSTOMIZATION: ACCENT COLOR, THEME, AND TYPOGRAPHY\n  // ---------------------------------------------------------------------------\n  const accentColor = design?.primaryColor || \"#e3141f\";\n  const accentDeep = useMemo(() => adjustBrightness(accentColor, -30), [accentColor]);\n  const accentDark = useMemo(() => adjustBrightness(accentColor, -20), [accentColor]);\n\n  // Template-specific customization\n  const templateSettings = design?.templateSettings || {};\n  const showGlowHalo = templateSettings.glowHalo !== false;\n  const showExpertiseTree = templateSettings.expertiseTree !== false;\n\n  // Theme mode handling (light / dark / system)\n  const themeSetting = design?.theme || \"system\";\n  const [isDarkMode, setIsDarkMode] = useState(false);\n\n  useEffect(() => {\n    if (themeSetting === \"dark\") {\n      setIsDarkMode(true);\n    } else if (themeSetting === \"light\") {\n      setIsDarkMode(false);\n    } else {\n      const mq = window.matchMedia(\"(prefers-color-scheme: dark)\");\n      setIsDarkMode(mq.matches);\n      const handler = (e) => setIsDarkMode(e.matches);\n      mq.addEventListener(\"change\", handler);\n      return () => mq.removeEventListener(\"change\", handler);\n    }\n  }, [themeSetting]);\n\n  // Semantic color tokens responding to theme\n  const colors = useMemo(() => {\n    return isDarkMode\n      ? {\n        paper: \"#0c0c0e\",\n        sectionWhite: \"#141418\",\n        cardBg: \"#1c1c22\",\n        cardBorder: \"rgba(255, 255, 255, 0.08)\",\n        ink: \"#f4f4f6\",\n        inkMuted: \"#a1a1aa\",\n        border: \"rgba(255, 255, 255, 0.08)\",\n        navBg: \"rgba(18, 18, 22, 0.92)\",\n        navInk: \"#ffffff\",\n        waveFill: \"#0c0c0e\",\n        pillBg: \"#27272f\",\n      }\n      : {\n        paper: \"#ffffff\",\n        sectionWhite: \"#ffffff\",\n        cardBg: \"#ffffff\",\n        cardBorder: \"rgba(0, 0, 0, 0.08)\",\n        ink: \"#121212\",\n        inkMuted: \"#555555\",\n        border: \"rgba(0, 0, 0, 0.08)\",\n        navBg: \"rgba(255, 255, 255, 0.92)\",\n        navInk: \"#121212\",\n        waveFill: \"#ffffff\",\n        pillBg: \"#f1f1f3\",\n      };\n  }, [isDarkMode]);\n\n  // Typography font family\n  const selectedFontKey = design?.fontFamily || \"Inter\";\n  const activeFontFamily = FONT_FAMILY_MAP[selectedFontKey] || FONT_FAMILY_MAP.Inter;\n\n  // Navigation scroll state\n  const [isNavSolid, setIsNavSolid] = useState(false);\n  const [showScrollTop, setShowScrollTop] = useState(false);\n\n  // Responsive breakpoint tracking (lg = 1024px) for hero layout\n  const [isLgScreen, setIsLgScreen] = useState(() =>\n    typeof window !== \"undefined\" ? window.innerWidth >= 1024 : false\n  );\n\n  useEffect(() => {\n    if (typeof window === \"undefined\") return;\n\n    if (window.matchMedia) {\n      const mediaQuery = window.matchMedia(\"(min-width: 1024px)\");\n      const updateLg = () => setIsLgScreen(mediaQuery.matches);\n      updateLg();\n      if (mediaQuery.addEventListener) {\n        mediaQuery.addEventListener(\"change\", updateLg);\n        return () => mediaQuery.removeEventListener(\"change\", updateLg);\n      } else if ((mediaQuery ).addListener) {\n        (mediaQuery ).addListener(updateLg);\n        return () => (mediaQuery ).removeListener(updateLg);\n      }\n    }\n\n    const handleResize = () => setIsLgScreen(window.innerWidth >= 1024);\n    window.addEventListener(\"resize\", handleResize);\n    return () => window.removeEventListener(\"resize\", handleResize);\n  }, []);\n\n  useEffect(() => {\n    const handleScroll = () => {\n      const heroEl = document.getElementById(\"top\");\n      if (heroEl) {\n        const { top: heroTop, bottom: heroBottom } = heroEl.getBoundingClientRect();\n        const navHeight = 70;\n        // Transparent only while hero overlaps navigation bar; solid when entirely above or below\n        const isHeroOverlappingNav = heroTop < navHeight && heroBottom > 0;\n        setIsNavSolid(!isHeroOverlappingNav);\n      } else {\n        setIsNavSolid(window.scrollY > 400);\n      }\n      setShowScrollTop(window.scrollY > 400);\n    };\n\n    handleScroll();\n    window.addEventListener(\"scroll\", handleScroll, { passive: true });\n    return () => window.removeEventListener(\"scroll\", handleScroll);\n  }, []);\n\n  const scrollToTop = () => window.scrollTo({ top: 0, behavior: \"smooth\" });\n  const isHidden = (sec) => hiddenSections.includes(sec);\n\n  // ---------------------------------------------------------------------------\n  // 2. CANDIDATE PROFILE DATA EXTRACTION\n  // ---------------------------------------------------------------------------\n  const fullName = profile?.fullName || (showEmpty ? \"sunil kumar\" : \"developer\");\n  const firstName = fullName.split(/\\s+/).filter((w) => !/^the$/i.test(w))[0] || fullName;\n  const headline = profile?.headline || (showEmpty ? \"HTML and JavaScript developer\" : \"Full Stack Developer\");\n  // Extract GitHub handle and avatar\n  const githubLink = socialLinks.find(\n    (l) =>\n      l.platform?.toLowerCase().includes(\"github\") || l.url?.toLowerCase().includes(\"github.com\")\n  );\n  const githubHandle = githubLink?.url\n    ? githubLink.url.replace(/^https?:\\/\\/(www\\.)?github\\.com\\//i, \"\").replace(/\\/.*$/, \"\")\n    : \"sunilkumar25kush\";\n\n  // Fallback to candidate's github avatar if none uploaded\n  const avatarUrl = profile?.avatarUrl\n    ? normalizeAvatarUrl(profile.avatarUrl)\n    : `https://avatars.githubusercontent.com/${githubHandle}`;\n\n  // Smart headline split for clean multi-line display (exact match to screenshot 1)\n  const headlineLines = useMemo(() => {\n    const text = headline.trim();\n    const words = text.split(/\\s+/);\n    if (words.length <= 1) return { line1: words[0] || \"developer\", line2: \"\" };\n    if (words.length === 2) return { line1: words[0], line2: words[1] };\n    const lastWord = words[words.length - 1];\n    const rest = words.slice(0, words.length - 1).join(\" \");\n    return { line1: rest, line2: lastWord };\n  }, [headline]);\n\n  // All extracted skills s\n  const skillNames = useMemo(() => {\n    const list = skills.map((s) => (typeof s === \"string\" ? s : s.name)).filter(Boolean);\n    if (list.length > 0) return list;\n    return [\"HTML\", \"JavaScript\", \"TypeScript\", \"CSS\", \"Python\", \"Dockerfile\"];\n  }, [skills]);\n\n  // Realistic sample projects matching candidate's public repos from screenshots\n  const displayProjects = useMemo(() => {\n    if (projects.length > 0) {\n      return projects.map((p) => ({\n        title: p.title,\n        description: p.description,\n        tags: p.tags || [\"JavaScript\"],\n        repoUrl: p.repoUrl || `https://github.com/${githubHandle}/${p.title.toLowerCase().replace(/\\s+/g, \"-\")}`,\n        liveUrl: p.liveUrl,\n        imageUrl: p.imageUrl,\n        featured: p.featured ?? true,\n      }));\n    }\n    return [\n      {\n        title: \"NOTE-PROJECT\",\n        description: \"Full-stack collaborative notes platform with instant Markdown sync and rich text formatting.\",\n        tags: [\"HTML\", \"JavaScript\"],\n        repoUrl: `https://github.com/${githubHandle}/NOTE-PROJECT`,\n        liveUrl: undefined ,\n        imageUrl: undefined ,\n        featured: true,\n      },\n      {\n        title: \"AI-Interviewer\",\n        description: \"Intelligent conversational interview platform simulating technical candidate evaluations.\",\n        tags: [\"JavaScript\", \"React\"],\n        repoUrl: `https://github.com/${githubHandle}/AI-Interviewer`,\n        liveUrl: undefined ,\n        featured: true,\n      },\n      {\n        title: \"AI-Resume-builder\",\n        description: \"Next-gen intelligent career document and portfolio generator with ATS optimization.\",\n        tags: [\"TypeScript\", \"React\"],\n        repoUrl: `https://github.com/${githubHandle}/AI-Resume-builder`,\n        liveUrl: undefined ,\n        featured: true,\n      },\n      {\n        title: \"AI-CONTENT-GENERATOR\",\n        description: \"Multi-modal AI content synthesizer for automated technical articles, docs, and assets.\",\n        tags: [\"CSS\", \"JavaScript\"],\n        repoUrl: `https://github.com/${githubHandle}/AI-CONTENT-GENERATOR`,\n        liveUrl: undefined ,\n        featured: true,\n      },\n    ];\n  }, [projects, githubHandle]);\n\n  // ---------------------------------------------------------------------------\n  // 3. EXPERTISE CARDS: 4 CONNECTED NODES (MATCHING SCREENSHOT 3)\n  // ---------------------------------------------------------------------------\n  const expertiseNodes = useMemo(() => {\n    const topSkills = skillNames.slice(0, 4);\n    const defaults = [\"HTML\", \"JavaScript\", \"TypeScript\", \"CSS\"];\n    const merged = topSkills.length >= 4 ? topSkills : [...topSkills, ...defaults.slice(topSkills.length)];\n\n    return merged.slice(0, 4).map((skillName, idx) => {\n      const match = displayProjects.find(\n        (p) =>\n          p.tags?.some((t) => t.toLowerCase() === skillName.toLowerCase()) ||\n          p.description?.toLowerCase().includes(skillName.toLowerCase())\n      );\n      const projectName = match?.title || displayProjects[idx % displayProjects.length]?.title || \"Featured-Project\";\n      const count = idx === 1 ? 2 : 1;\n\n      return {\n        num: `0${idx + 1}`,\n        skill: skillName,\n        desc: `${count} featured project${count > 1 ? \"s\" : \"\"}, including ${projectName}.`,\n        isHot: idx === 1, // Card 02 is bold hot accent color\n      };\n    });\n  }, [skillNames, displayProjects]);\n\n  // ---------------------------------------------------------------------------\n  // 4. TECHNICAL STACK CATEGORIZED GROUPS (MATCHING SCREENSHOT 4)\n  // ---------------------------------------------------------------------------\n  const techGroups = useMemo(() => {\n    const all = skillNames;\n    const focus = all.slice(0, 6);\n\n    const frontendKeywords = [\"html\", \"css\", \"javascript\", \"typescript\", \"react\", \"vue\", \"svelte\", \"tailwind\", \"next\"];\n    const backendKeywords = [\"node\", \"python\", \"go\", \"java\", \"c#\", \"express\", \"sql\", \"mongo\", \"api\", \"ai\"];\n    const toolingKeywords = [\"docker\", \"dockerfile\", \"git\", \"github\", \"linux\", \"vite\", \"webpack\", \"aws\", \"ci/cd\"];\n\n    const frontend = all.filter((s) => frontendKeywords.some((k) => s.toLowerCase().includes(k)));\n    const backend = all.filter((s) => backendKeywords.some((k) => s.toLowerCase().includes(k)));\n    const tooling = all.filter((s) => toolingKeywords.some((k) => s.toLowerCase().includes(k)));\n\n    return [\n      {\n        title: \"What I focus on\",\n        items: focus.length > 0 ? focus : [\"HTML\", \"JavaScript\", \"TypeScript\", \"CSS\", \"Python\", \"Dockerfile\"],\n      },\n      {\n        title: \"Frontend\",\n        items: frontend.length > 0 ? frontend : [\"HTML\", \"JavaScript\", \"TypeScript\", \"CSS\"],\n      },\n      {\n        title: \"Data & AI\",\n        items: backend.length > 0 ? backend : [\"Python\"],\n      },\n      {\n        title: \"Tooling & infra\",\n        items: tooling.length > 0 ? tooling : [\"Dockerfile\"],\n      },\n    ];\n  }, [skillNames]);\n\n  // ---------------------------------------------------------------------------\n  // 5. SECTION MAP\n  // ---------------------------------------------------------------------------\n  const sectionMap = {\n    // -------------------------------------------------------------------------\n    // HERO: Exact Match to Screenshot 1\n    // -------------------------------------------------------------------------\n    hero: (\n      <section\n        key=\"hero\"\n        id=\"top\"\n        className=\"spotlight-hero relative text-white overflow-hidden\"\n        style={{\n          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentDeep} 100%)`,\n          minHeight: \"100svh\",\n        }}\n      >\n        {/* Main grid: left text, right portrait — both visible in one viewport */}\n        <div\n          className=\"max-w-[1180px] w-full mx-auto px-5 sm:px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10\"\n          style={{ minHeight: \"100svh\", paddingTop: \"80px\", paddingBottom: \"90px\", alignItems: \"center\" }}\n        >\n          {/* Left: Text */}\n          <div className=\"flex flex-col justify-center gap-5\">\n            <h1 className=\"font-extrabold text-[clamp(36px,6.5vw,84px)] leading-[1.03] tracking-[-0.035em]\">\n              <span className=\"block text-white\">Hi, I&apos;m {firstName.toLowerCase()}</span>\n              {headlineLines.line1 && (\n                <span className=\"block text-white mt-1\">{headlineLines.line1}</span>\n              )}\n              {headlineLines.line2 && (\n                <span className=\"block text-white\">{headlineLines.line2}</span>\n              )}\n            </h1>\n\n            <p className=\"max-w-[460px] text-white/90 text-base sm:text-lg leading-[1.65]\">\n              {profile?.bio || `Explore ${fullName.toLowerCase()}'s public projects and open-source work.`}\n            </p>\n\n            <div className=\"flex flex-wrap items-center gap-3\">\n              <a\n                href=\"#work\"\n                className=\"inline-flex items-center justify-center min-h-[46px] px-7 rounded-full bg-white font-semibold text-sm hover:scale-105 transition-all shadow-md\"\n                style={{ color: accentColor }}\n              >\n                View my work\n              </a>\n              <a\n                href=\"#contact\"\n                className=\"inline-flex items-center justify-center min-h-[46px] px-7 rounded-full border-[1.5px] border-white text-white font-semibold text-sm hover:bg-white/10 hover:scale-105 transition-all\"\n              >\n                Contact me\n              </a>\n            </div>\n          </div>\n\n          {/* Right: Portrait — right-aligned, fully visible */}\n          <div className=\"flex items-center justify-center lg:justify-end\">\n            <div\n              className={`relative rounded-[24px] sm:rounded-[32px] border-[6px] sm:border-[10px] border-white overflow-hidden bg-white/10 ${\n                showGlowHalo ? \"shadow-[0_30px_70px_-20px_rgba(0,0,0,0.45)]\" : \"shadow-md\"\n              }`}\n              style={{\n                width: \"min(300px, 44vw)\",\n                aspectRatio: \"4/5\",\n                marginTop: isLgScreen ? \"-330px\" : undefined,\n                right: isLgScreen ? \"80px\" : undefined,\n                boxShadow: showGlowHalo\n                  ? `0 30px 70px -20px rgba(0,0,0,0.45), 0 0 50px ${accentColor}40`\n                  : undefined,\n              }}\n            >\n              <img\n                src={avatarUrl}\n                alt={fullName}\n                className=\"w-full h-full object-cover object-top\"\n                onError={(e) => {\n                  (e.target ).style.display = \"none\";\n                }}\n              />\n            </div>\n          </div>\n        </div>\n\n        {/* Bottom wave */}\n        <svg\n          className=\"absolute bottom-[-1px] left-0 right-0 w-full h-[60px] sm:h-[90px] block pointer-events-none z-[4]\"\n          viewBox=\"0 0 1440 90\"\n          preserveAspectRatio=\"none\"\n          aria-hidden=\"true\"\n        >\n          <path\n            fill={colors.waveFill}\n            d=\"M0,60 C240,10 420,10 720,48 C1020,86 1200,86 1440,40 L1440,92 L0,92 Z\"\n          />\n        </svg>\n      </section>\n    ),\n\n    // -------------------------------------------------------------------------\n    // ABOUT: Exact Match to Screenshot 2 (Hanging Sway Tablet + Bio & Pills)\n    // -------------------------------------------------------------------------\n    about: (\n      <section\n        key=\"about\"\n        id=\"about\"\n        className=\"relative py-24 sm:py-32 px-5 sm:px-8 transition-colors duration-300\"\n        style={{ backgroundColor: colors.paper, color: colors.ink }}\n      >\n        <div className=\"max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center\">\n          {/* Left: Hanging Swaying Tablet */}\n          <div className=\"hanging-container relative justify-self-center pt-[60px] select-none\">\n            {/* Cord & Anchor Nail */}\n            <div\n              className=\"absolute left-1/2 top-0 w-[2px] h-[68px] -translate-x-1/2\"\n              style={{\n                background: isDarkMode\n                  ? \"linear-gradient(to bottom, #888, #444)\"\n                  : \"linear-gradient(to bottom, #bbb, #777)\",\n              }}\n            />\n            <div\n              className=\"absolute left-1/2 -top-1 w-3 h-3 rounded-full -translate-x-1/2 shadow-xs\"\n              style={{ backgroundColor: isDarkMode ? \"#666\" : \"#444\" }}\n            />\n\n            {/* Tablet with Candidate Photo & Sway Motion */}\n            <div\n              className=\"hanging-tablet w-[min(330px,78vw)] aspect-[4/5] p-3 rounded-[32px] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.5)] rotate-[-4deg]\"\n              style={{\n                backgroundColor: isDarkMode ? \"#18181b\" : \"#111111\",\n                transformOrigin: \"50% 0\",\n                animation: \"sway 6s ease-in-out infinite\",\n                willChange: \"transform\",\n              }}\n            >\n              <div className=\"w-full h-full rounded-[22px] overflow-hidden bg-black flex items-center justify-center\">\n                <img\n                  src={avatarUrl}\n                  alt={fullName}\n                  className=\"w-full h-full object-cover object-top\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {/* Right: Pill Badge, Title, Bio, Tech Pills & Stats */}\n          <div className=\"space-y-6\">\n            <span\n              className=\"inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase\"\n              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}\n            >\n              HELLO!\n            </span>\n\n            <h2 className=\"font-extrabold text-[clamp(34px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em]\">\n              <span style={{ color: colors.ink }}>A little </span>\n              <span style={{ color: accentColor }}>about me</span>\n            </h2>\n\n            <p className=\"text-base sm:text-lg leading-[1.7]\" style={{ color: colors.inkMuted }}>\n              {profile?.bio || `Explore ${fullName.toLowerCase()}'s public projects and open-source work.`}\n            </p>\n\n            {/* Language/Tech Badges with Dots */}\n            <div className=\"flex flex-wrap gap-2.5 pt-2\">\n              {skillNames.slice(0, 8).map((skillName, idx) => {\n                const dotColor = LANG_COLORS[skillName] || accentColor;\n                return (\n                  <span\n                    key={idx}\n                    className=\"inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs transition-transform hover:-translate-y-0.5\"\n                    style={{\n                      backgroundColor: colors.cardBg,\n                      border: `1px solid ${colors.cardBorder}`,\n                      color: colors.ink,\n                    }}\n                  >\n                    <span\n                      className=\"w-2.5 h-2.5 rounded-full flex-shrink-0\"\n                      style={{ backgroundColor: dotColor }}\n                    />\n                    <span>{skillName}</span>\n                  </span>\n                );\n              })}\n            </div>\n\n            {/* Stats row */}\n            <div\n              className=\"flex items-center gap-6 pt-4 text-sm font-medium\"\n              style={{ color: colors.inkMuted }}\n            >\n              <span>2 followers</span>\n              <span className=\"flex items-center gap-1.5\">\n                <Star className=\"h-4 w-4\" style={{ color: accentColor }} />\n                <span>1 stars</span>\n              </span>\n              {profile?.location && (\n                <span className=\"flex items-center gap-1.5 ml-auto\">\n                  <MapPin className=\"h-4 w-4\" style={{ color: accentColor }} />\n                  <span>{profile.location}</span>\n                </span>\n              )}\n            </div>\n          </div>\n        </div>\n      </section>\n    ),\n\n    // -------------------------------------------------------------------------\n    // EXPERTISE: Exact Match to Screenshot 3 (Connected Nodes + Dashed Line)\n    // -------------------------------------------------------------------------\n    expertise: (\n      <section\n        key=\"expertise\"\n        id=\"expertise\"\n        className=\"relative py-24 sm:py-32 px-5 sm:px-8 transition-colors duration-300 overflow-hidden\"\n        style={{\n          backgroundColor: colors.sectionWhite,\n          color: colors.ink,\n        }}\n      >\n        <div className=\"max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-center\">\n          {/* Left Title & Description */}\n          <div className=\"space-y-4\">\n            <span\n              className=\"inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase\"\n              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}\n            >\n              MY EXPERTISE\n            </span>\n\n            <h2 className=\"font-extrabold text-[clamp(34px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em]\">\n              <span style={{ color: colors.ink }}>Building modern digital solutions with </span>\n              <span style={{ color: accentColor }}>code</span>\n            </h2>\n\n            <p className=\"text-base sm:text-lg leading-[1.6]\" style={{ color: colors.inkMuted }}>\n              What {firstName.toLowerCase()} spends their time on, from 24 public repositories.\n            </p>\n          </div>\n\n          {/* Right: The 4 Connected Nodes with Dashed Connecting Line */}\n          <div className=\"relative min-h-0 lg:min-h-[460px] flex items-center justify-center p-2 w-full\">\n            {/* SVG Connecting Dashed Curve - hidden on mobile/tablet to avoid distortion */}\n            {showExpertiseTree && (\n              <svg\n                className=\"absolute inset-0 w-full h-full pointer-events-none overflow-visible hidden lg:block\"\n                aria-hidden=\"true\"\n              >\n                <path\n                  d=\"M 120 90 C 260 70, 200 240, 290 230 C 340 240, 310 370, 140 370\"\n                  fill=\"none\"\n                  stroke={accentColor}\n                  strokeOpacity=\"0.55\"\n                  strokeWidth=\"2\"\n                  strokeDasharray=\"6 8\"\n                  style={{ willChange: \"stroke-dashoffset\" }}\n                  className=\"animate-[dash_18s_linear_infinite]\"\n                />\n              </svg>\n            )}\n\n            {/* 4 Cards Grid */}\n            <div className=\"relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-[540px]\">\n              {expertiseNodes.map((node) => {\n                if (node.isHot) {\n                  // Hot Accent Card (Card 02)\n                  return (\n                    <div\n                      key={node.num}\n                      className=\"p-6 rounded-[24px] text-white shadow-xl transition-all hover:scale-105\"\n                      style={{\n                        backgroundColor: accentColor,\n                        boxShadow: `0 20px 40px -15px ${accentColor}66`,\n                      }}\n                    >\n                      <span className=\"block text-xs font-mono font-semibold opacity-85 mb-2\">\n                        {node.num}\n                      </span>\n                      <h3 className=\"text-xl font-bold tracking-tight mb-2\">\n                        {node.skill}\n                      </h3>\n                      <p className=\"text-xs text-white/90 leading-relaxed\">\n                        {node.desc}\n                      </p>\n                    </div>\n                  );\n                }\n\n                // Standard Clean Card (Card 01, 03, 04)\n                return (\n                  <div\n                    key={node.num}\n                    className=\"p-6 rounded-[24px] shadow-sm transition-all hover:shadow-md hover:scale-102\"\n                    style={{\n                      backgroundColor: colors.cardBg,\n                      border: `1px solid ${colors.cardBorder}`,\n                      color: colors.ink,\n                    }}\n                  >\n                    <span className=\"block text-xs font-mono font-semibold mb-2\" style={{ color: colors.inkMuted }}>\n                      {node.num}\n                    </span>\n                    <h3 className=\"text-xl font-bold tracking-tight mb-2\" style={{ color: colors.ink }}>\n                      {node.skill}\n                    </h3>\n                    <p className=\"text-xs leading-relaxed\" style={{ color: colors.inkMuted }}>\n                      {node.desc}\n                    </p>\n                  </div>\n                );\n              })}\n            </div>\n          </div>\n        </div>\n      </section>\n    ),\n\n    // -------------------------------------------------------------------------\n    // TECHNICAL STACK: Exact Match to Screenshot 4 (4 Cards Grid + Pills)\n    // -------------------------------------------------------------------------\n    skills: (\n      <section\n        key=\"skills\"\n        id=\"skills\"\n        className=\"relative py-24 sm:py-32 px-5 sm:px-8 transition-colors duration-300\"\n        style={{ backgroundColor: colors.paper, color: colors.ink }}\n      >\n        <div className=\"max-w-[1180px] mx-auto space-y-12\">\n          {/* Header */}\n          <div className=\"space-y-4\">\n            <span\n              className=\"inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase\"\n              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}\n            >\n              TECHNICAL STACK\n            </span>\n\n            <h2 className=\"font-extrabold text-[clamp(34px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em]\">\n              <span style={{ color: colors.ink }}>Technologies I </span>\n              <span style={{ color: accentColor }}>work with</span>\n            </h2>\n          </div>\n\n          {/* 4 Cards Grid */}\n          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6\">\n            {techGroups.map((group, idx) => (\n              <div\n                key={idx}\n                className=\"p-6 rounded-[24px] shadow-sm transition-all hover:shadow-md\"\n                style={{\n                  backgroundColor: colors.cardBg,\n                  border: `1px solid ${colors.cardBorder}`,\n                  color: colors.ink,\n                }}\n              >\n                <h3 className=\"text-base font-bold tracking-tight mb-4\" style={{ color: colors.ink }}>\n                  {group.title}\n                </h3>\n                <div className=\"flex flex-wrap gap-2\">\n                  {group.items.map((item, itemIdx) => (\n                    <span\n                      key={itemIdx}\n                      className=\"px-3 py-1.5 rounded-lg text-xs font-semibold\"\n                      style={{\n                        backgroundColor: colors.pillBg,\n                        color: colors.ink,\n                      }}\n                    >\n                      {item}\n                    </span>\n                  ))}\n                </div>\n              </div>\n            ))}\n          </div>\n\n          {/* Next Section Indicator Pill (as seen at bottom of screenshot 4) */}\n          <div className=\"pt-6\">\n            <span\n              className=\"inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase\"\n              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}\n            >\n              FEATURED WORK\n            </span>\n          </div>\n        </div>\n      </section>\n    ),\n\n    // -------------------------------------------------------------------------\n    // FEATURED WORK / PROJECTS\n    // -------------------------------------------------------------------------\n    projects: (\n      <section\n        key=\"projects\"\n        id=\"work\"\n        className=\"relative py-20 sm:py-28 px-5 sm:px-8 transition-colors duration-300\"\n        style={{ backgroundColor: colors.sectionWhite, color: colors.ink }}\n      >\n        <div className=\"max-w-[1180px] mx-auto space-y-12\">\n          <div className=\"flex flex-col sm:flex-row sm:items-end justify-between gap-4\">\n            <div>\n              <h2 className=\"font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-0.035em]\">\n                <span style={{ color: colors.ink }}>Featured </span>\n                <span style={{ color: accentColor }}>Projects</span>\n              </h2>\n              <p className=\"text-base mt-2\" style={{ color: colors.inkMuted }}>\n                Production-grade applications, developer tooling, and open-source repositories.\n              </p>\n            </div>\n\n            <SafeLink\n              href={`https://github.com/${githubHandle}?tab=repositories`}\n              className=\"inline-flex items-center gap-2 text-sm font-semibold hover:underline\"\n              style={{ color: accentColor }}\n            >\n              <span>View all GitHub repos</span>\n              <ChevronRight className=\"h-4 w-4\" />\n            </SafeLink>\n          </div>\n\n          {/* Project Cards Grid */}\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8\">\n            {displayProjects.map((project, idx) => {\n              const primaryTag = project.tags?.[0] || \"Code\";\n              const tagColor = LANG_COLORS[primaryTag] || accentColor;\n\n              return (\n                <div\n                  key={idx}\n                  className=\"group relative p-7 sm:p-8 rounded-[28px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between\"\n                  style={{\n                    backgroundColor: colors.cardBg,\n                    border: `1px solid ${colors.cardBorder}`,\n                  }}\n                >\n                  <div className=\"space-y-4\">\n                    {/* Project Screenshot / Thumbnail (if available) */}\n                    {project.imageUrl && (\n                      <div className=\"w-full h-44 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 relative\">\n                        <img\n                          src={project.imageUrl}\n                          alt={project.title}\n                          className=\"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105\"\n                          onError={(e) => {\n                            (e.target ).style.display = \"none\";\n                          }}\n                        />\n                      </div>\n                    )}\n\n                    <div className=\"flex items-center justify-between\">\n                      <span className=\"font-mono text-xs font-bold\" style={{ color: colors.inkMuted }}>\n                        0{idx + 1} / 0{displayProjects.length}\n                      </span>\n                      <div className=\"flex items-center gap-2\">\n                        {project.repoUrl && (\n                          <SafeLink\n                            href={project.repoUrl}\n                            className=\"p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10\"\n                            style={{ color: colors.ink }}\n                            title=\"GitHub Repository\"\n                          >\n                            <FolderGit2 className=\"h-4 w-4\" />\n                          </SafeLink>\n                        )}\n                        {project.liveUrl && (\n                          <SafeLink\n                            href={project.liveUrl}\n                            className=\"p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10\"\n                            style={{ color: accentColor }}\n                            title=\"Live Demo\"\n                          >\n                            <ExternalLink className=\"h-4 w-4\" />\n                          </SafeLink>\n                        )}\n                      </div>\n                    </div>\n\n                    <h3\n                      className=\"text-2xl font-bold tracking-tight transition-colors group-hover:text-[var(--hover-color)]\"\n                      style={{ color: colors.ink, [\"--hover-color\" ]: accentColor }}\n                    >\n                      {project.title}\n                    </h3>\n\n                    <p className=\"text-sm sm:text-base leading-relaxed\" style={{ color: colors.inkMuted }}>\n                      {project.description}\n                    </p>\n                  </div>\n\n                  <div\n                    className=\"flex items-center justify-between pt-6 mt-6 border-t\"\n                    style={{ borderColor: colors.border }}\n                  >\n                    <div className=\"flex items-center gap-2 text-xs font-semibold\" style={{ color: colors.ink }}>\n                      <span className=\"w-2.5 h-2.5 rounded-full\" style={{ backgroundColor: tagColor }} />\n                      <span>{primaryTag}</span>\n                    </div>\n\n                    <span className=\"flex items-center gap-1 text-xs font-medium\" style={{ color: colors.inkMuted }}>\n                      <Star className=\"h-3.5 w-3.5\" style={{ color: accentColor }} />\n                      <span>★ 3</span>\n                    </span>\n                  </div>\n                </div>\n              );\n            })}\n          </div>\n        </div>\n      </section>\n    ),\n\n    // -------------------------------------------------------------------------\n    // EXPERIENCE\n    // -------------------------------------------------------------------------\n    experience: (\n      <section\n        key=\"experience\"\n        id=\"experience\"\n        className=\"relative py-20 sm:py-28 px-5 sm:px-8 transition-colors duration-300\"\n        style={{ backgroundColor: colors.paper, color: colors.ink }}\n      >\n        <div className=\"max-w-[900px] mx-auto space-y-12\">\n          <div>\n            <span\n              className=\"inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3\"\n              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}\n            >\n              CAREER JOURNEY\n            </span>\n            <h2 className=\"font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-0.035em]\">\n              <span style={{ color: colors.ink }}>Work </span>\n              <span style={{ color: accentColor }}>Experience</span>\n            </h2>\n          </div>\n\n          <div className=\"relative pl-6 sm:pl-8 space-y-10 border-l-2\" style={{ borderColor: `${accentColor}40` }}>\n            {experience.map((exp, idx) => (\n              <div key={idx} className=\"relative group\">\n                <span\n                  className=\"absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform group-hover:scale-125\"\n                  style={{ backgroundColor: accentColor }}\n                />\n\n                <div\n                  className=\"p-6 rounded-[22px] shadow-sm transition-all\"\n                  style={{\n                    backgroundColor: colors.cardBg,\n                    border: `1px solid ${colors.cardBorder}`,\n                  }}\n                >\n                  <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2\">\n                    <h3 className=\"text-xl font-bold tracking-tight\" style={{ color: colors.ink }}>\n                      {exp.title}\n                    </h3>\n                    <span className=\"text-xs font-mono font-semibold\" style={{ color: accentColor }}>\n                      {exp.startDate} - {exp.current ? \"Present\" : exp.endDate || \"Present\"}\n                    </span>\n                  </div>\n\n                  <p className=\"text-sm font-semibold mb-3\" style={{ color: colors.inkMuted }}>\n                    {exp.company} {exp.location ? `· ${exp.location}` : \"\"}\n                  </p>\n\n                  {exp.description && (\n                    <p className=\"text-sm leading-relaxed mb-3\" style={{ color: colors.inkMuted }}>\n                      {exp.description}\n                    </p>\n                  )}\n\n                  {exp.highlights && exp.highlights.length > 0 && (\n                    <ul className=\"space-y-1.5 text-xs sm:text-sm\" style={{ color: colors.inkMuted }}>\n                      {exp.highlights.map((h, hIdx) => (\n                        <li key={hIdx} className=\"flex items-start gap-2\">\n                          <span style={{ color: accentColor }}>▸</span>\n                          <span>{h}</span>\n                        </li>\n                      ))}\n                    </ul>\n                  )}\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n    ),\n\n    // -------------------------------------------------------------------------\n    // EDUCATION & CERTIFICATIONS\n    // -------------------------------------------------------------------------\n    education: (\n      <section\n        key=\"education\"\n        id=\"education\"\n        className=\"relative py-20 px-5 sm:px-8 transition-colors duration-300\"\n        style={{ backgroundColor: colors.sectionWhite, color: colors.ink }}\n      >\n        <div className=\"max-w-[900px] mx-auto space-y-8\">\n          <h2 className=\"font-extrabold text-[clamp(28px,3.5vw,44px)] leading-[1.08] tracking-[-0.035em]\">\n            <span style={{ color: colors.ink }}>Education &amp; </span>\n            <span style={{ color: accentColor }}>Background</span>\n          </h2>\n\n          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-6\">\n            {education.map((edu, idx) => (\n              <div\n                key={idx}\n                className=\"p-6 rounded-[22px] shadow-sm\"\n                style={{\n                  backgroundColor: colors.cardBg,\n                  border: `1px solid ${colors.cardBorder}`,\n                }}\n              >\n                <span className=\"text-xs font-mono font-semibold\" style={{ color: accentColor }}>\n                  {edu.startDate} - {edu.endDate || \"Present\"}\n                </span>\n                <h3 className=\"text-lg font-bold tracking-tight mt-1\" style={{ color: colors.ink }}>\n                  {edu.degree}\n                </h3>\n                <p className=\"text-sm mt-1\" style={{ color: colors.inkMuted }}>\n                  {edu.institution} {edu.fieldOfStudy ? `· ${edu.fieldOfStudy}` : \"\"}\n                </p>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n    ),\n\n    certifications: (\n      <section\n        key=\"certifications\"\n        id=\"certifications\"\n        className=\"relative py-16 px-5 sm:px-8 transition-colors duration-300\"\n        style={{ backgroundColor: colors.paper, color: colors.ink }}\n      >\n        <div className=\"max-w-[900px] mx-auto space-y-6\">\n          <h2 className=\"font-extrabold text-[clamp(24px,3vw,38px)]\">\n            <span style={{ color: colors.ink }}>Certifications &amp; </span>\n            <span style={{ color: accentColor }}>Honors</span>\n          </h2>\n          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-4\">\n            {certifications.map((c, idx) => (\n              <div\n                key={idx}\n                className=\"p-5 rounded-2xl flex items-center gap-4 shadow-xs\"\n                style={{\n                  backgroundColor: colors.cardBg,\n                  border: `1px solid ${colors.cardBorder}`,\n                }}\n              >\n                <Award className=\"h-6 w-6 flex-shrink-0\" style={{ color: accentColor }} />\n                <div>\n                  <h3 className=\"font-bold text-sm\" style={{ color: colors.ink }}>\n                    {c.name}\n                  </h3>\n                  <p className=\"text-xs\" style={{ color: colors.inkMuted }}>\n                    {c.issuer} {c.issueDate ? `· ${c.issueDate}` : \"\"}\n                  </p>\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n    ),\n\n    // -------------------------------------------------------------------------\n    // CONTACT: Exact Match to Screenshot 5 (Giant Watermark + Overlapping Red Card)\n    // -------------------------------------------------------------------------\n    contact: (\n      <section\n        key=\"contact\"\n        id=\"contact\"\n        className=\"relative min-h-[85vh] sm:min-h-[90vh] py-20 sm:py-36 px-4 sm:px-8 overflow-hidden flex flex-col justify-center items-center select-none\"\n        style={{ backgroundColor: \"#09090b\" }}\n      >\n        {/* Giant Watermark Text (CONTACT on top, Name below) */}\n        <div className=\"absolute inset-0 flex flex-col justify-between items-center pointer-events-none py-6 sm:py-8 z-0 overflow-hidden select-none\">\n          <span className=\"font-['Anton'] text-[clamp(44px,14vw,220px)] text-white tracking-tight leading-none opacity-95 text-center px-2\">\n            CONTACT\n          </span>\n          <span className=\"font-['Anton'] text-[clamp(44px,14vw,220px)] text-white tracking-tight leading-none opacity-95 text-center px-2\">\n            {firstName.toLowerCase()}\n          </span>\n        </div>\n\n        {/* Center Floating Accent Card */}\n        <div\n          className=\"relative z-10 w-full max-w-[620px] p-6 sm:p-12 rounded-[24px] sm:rounded-[36px] text-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)]\"\n          style={{\n            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentDark} 100%)`,\n          }}\n        >\n          <h2 className=\"text-2xl sm:text-4xl font-extrabold tracking-tight mb-2\">\n            Discuss an opportunity\n          </h2>\n\n          <p className=\"text-sm sm:text-base text-white/90 leading-relaxed mb-6 sm:mb-8\">\n            Open to new roles, collaborations and interesting problems.\n          </p>\n\n          {/* Direct Action Pills - Only LinkedIn option as requested */}\n          <div className=\"space-y-3\">\n            <SafeLink\n              href=\"https://www.linkedin.com/in/sunil-kumar-9042aa373/?isSelfProfile=true\"\n              className=\"flex items-center justify-between w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/25 hover:bg-black/40 text-white font-semibold text-sm sm:text-base transition-all duration-200 group shadow-md hover:shadow-xl hover:scale-[1.01] border border-white/10 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80\"\n              aria-label=\"Connect on LinkedIn (opens in a new tab)\"\n            >\n              <div className=\"flex items-center gap-3\">\n                <svg className=\"w-5 h-5 fill-current text-white shrink-0\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">\n                  <path d=\"M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z\" />\n                </svg>\n                <span>LinkedIn</span>\n              </div>\n              <span className=\"group-hover:translate-x-1.5 transition-transform duration-200 font-bold text-white/90\">→</span>\n            </SafeLink>\n          </div>\n        </div>\n      </section>\n    ),\n  };\n\n  // ---------------------------------------------------------------------------\n  // 6. RENDER TEMPLATE WITH STICKY FROSTED NAV & GLOBAL STYLES\n  // ---------------------------------------------------------------------------\n  return (\n    <div\n      className=\"spotlight-root relative w-full min-h-screen transition-colors duration-300 overflow-x-hidden\"\n      style={{\n        fontFamily: activeFontFamily,\n        backgroundColor: colors.paper,\n        color: colors.ink,\n      }}\n    >\n      {/* Dynamic Keyframe & Typography Styles */}\n      <style>{`\n        @keyframes sway {\n          0%, 100% {\n            transform: rotate(-4deg);\n          }\n          50% {\n            transform: rotate(4deg);\n          }\n        }\n        @keyframes dash {\n          to {\n            stroke-dashoffset: -1000;\n          }\n        }\n      `}</style>\n\n      {/* Sticky Navigation Bar */}\n      <nav\n        aria-label=\"Primary portfolio navigation\"\n        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isNavSolid ? \"py-3 shadow-md backdrop-blur-md\" : \"py-5 sm:py-6\"\n          }`}\n        style={{\n          backgroundColor: isNavSolid ? colors.navBg : \"transparent\",\n          borderBottom: isNavSolid ? `1px solid ${colors.border}` : \"none\",\n        }}\n      >\n        {/* Navbar: logo | centered links | hire-me button */}\n        <div className=\"max-w-[1180px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-4\">\n          {/* Logo */}\n          <a\n            href=\"#top\"\n            className=\"text-xl sm:text-2xl font-extrabold tracking-tight flex items-center\"\n            style={{ color: isNavSolid ? colors.navInk : \"#ffffff\" }}\n          >\n            <span>{firstName.toLowerCase()}</span>\n            <span style={{ color: accentColor }}>.</span>\n          </a>\n\n          {/* Centered nav links */}\n          <div className=\"hidden sm:flex items-center justify-center gap-6 sm:gap-8 text-sm font-semibold\">\n            {[\"about\", \"expertise\", \"work\", \"contact\"].map((link) => (\n              <a\n                key={link}\n                href={`#${link}`}\n                className=\"capitalize transition-opacity hover:opacity-100\"\n                style={{ color: isNavSolid ? colors.inkMuted : \"rgba(255,255,255,0.85)\" }}\n              >\n                {link.charAt(0).toUpperCase() + link.slice(1)}\n              </a>\n            ))}\n          </div>\n\n          {/* Hire me button */}\n          <a\n            href=\"#contact\"\n            className=\"px-5 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all hover:scale-105 shadow-sm whitespace-nowrap\"\n            style={{\n              backgroundColor: isNavSolid\n                ? isDarkMode\n                  ? \"#ffffff\"\n                  : \"#111111\"\n                : \"#ffffff\",\n              color: isNavSolid\n                ? isDarkMode\n                  ? \"#111111\"\n                  : \"#ffffff\"\n                : \"#111111\",\n            }}\n          >\n            Hire me\n          </a>\n        </div>\n      </nav>\n\n      {/* Ordered Section Rendering */}\n      <main className=\"w-full\">\n        {sectionOrder\n          .filter((sec) => !isHidden(sec))\n          .map((sec) => (\n            <div key={sec}>{sectionMap[sec] || null}</div>\n          ))}\n      </main>\n\n\n      {/* Back to Top Floating Button */}\n      {showScrollTop && (\n        <button\n          type=\"button\"\n          onClick={scrollToTop}\n          aria-label=\"Back to top\"\n          className=\"fixed bottom-6 right-6 z-40 p-3 rounded-full text-white shadow-lg transition-all hover:scale-110\"\n          style={{ backgroundColor: accentColor }}\n        >\n          <ArrowUp className=\"h-5 w-5\" />\n        </button>\n      )}\n    </div>\n  );\n}\n";
}

function getFullPosterTemplateJsx() {
  return `import React, { useState, useEffect, useMemo } from "react";
import { ArrowUp, Award, ExternalLink, MapPin } from "lucide-react";
import { BrandIcon } from "../common/BrandIcon.jsx";
import { SafeLink } from "../common/SafeLink.jsx";
import { normalizeAvatarUrl } from "../common/urlUtils.js";

export function PosterTemplate({ portfolio = {} }) {
  const { profile = {}, socialLinks = [], skills = [], experience = [], projects = [] } = portfolio;
  const primaryColor = portfolio?.design?.primaryColor || "#e11d2a";
  const theme = portfolio?.design?.theme || "dark";
  const isDark = theme === "dark";

  const fullName = profile.fullName || "Developer";
  const headline = profile.headline || "Creative Software Developer";
  const bio = profile.bio || "Crafting bold and memorable digital experiences.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl);

  const marqueeText = portfolio?.design?.templateSettings?.marqueeText || "CREATIVE • VISIONARY • ENGINEER • FULLSTACK";

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={\`min-h-screen font-sans transition-colors \${isDark ? "bg-[#09090b] text-[#f4f4f5]" : "bg-[#fdfbf7] text-[#18181b]"}\`}>
      <div className="overflow-hidden whitespace-nowrap py-2 text-xs font-black tracking-widest text-white uppercase" style={{ backgroundColor: primaryColor }}>
        <div className="inline-block animate-marquee">
          <span>{marqueeText} &nbsp;&bull;&nbsp; {marqueeText} &nbsp;&bull;&nbsp; {marqueeText}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <header className={\`border-b-4 pb-12 \${isDark ? "border-neutral-800" : "border-neutral-900"}\`}>
          <div className="flex justify-between items-center mb-8 text-xs font-mono uppercase tracking-wider">
            <span className="font-bold">{fullName}</span>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((s, i) => (
                  <SafeLink key={i} href={s.url} style={{ color: primaryColor }} className="hover:underline">
                    {s.label || s.platform}
                  </SafeLink>
                ))}
              </div>
            )}
          </div>
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
            {fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase">
            <span className={\`px-3 py-1 text-xs \${isDark ? "bg-white text-black" : "bg-black text-white"}\`}>{headline}</span>
            {skills.length > 0 && (
              <div className="font-mono text-xs" style={{ color: primaryColor }}>
                SKILLS: {skills.map(s => s.name).join(" • ")}
              </div>
            )}
          </div>
        </header>

        <section className={\`grid grid-cols-1 md:grid-cols-12 gap-8 border-b-2 pb-16 \${isDark ? "border-neutral-800" : "border-neutral-900"}\`}>
          <div className="md:col-span-3 font-mono font-bold text-xs" style={{ color: primaryColor }}>
            01 / STATEMENT
          </div>
          <div className="md:col-span-9 space-y-6">
            <p className="text-xl sm:text-3xl font-medium leading-relaxed">{bio}</p>
            {avatarUrl && (
              <div className={\`w-36 h-36 border-4 overflow-hidden \${isDark ? "border-neutral-800" : "border-neutral-900"}\`}>
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>

        {projects.length > 0 && (
          <section className={\`grid grid-cols-1 md:grid-cols-12 gap-8 border-b-2 pb-16 \${isDark ? "border-neutral-800" : "border-neutral-900"}\`}>
            <div className="md:col-span-3 font-mono font-bold text-xs" style={{ color: primaryColor }}>
              02 / SELECTED WORK
            </div>
            <div className="md:col-span-9 space-y-8">
              {projects.map((p, i) => (
                <article key={i} className={\`p-8 border-2 \${isDark ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-900"}\`}>
                  <div className="font-mono text-xs font-bold mb-2" style={{ color: primaryColor }}>// 0{i + 1}</div>
                  <h3 className="text-2xl font-black mb-3">{p.title}</h3>
                  <p className={\`text-sm leading-relaxed mb-4 \${isDark ? "text-neutral-400" : "text-neutral-600"}\`}>{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 font-mono text-xs" style={{ color: primaryColor }}>
                      {p.tags.map(t => <span key={t}>#{t}</span>)}
                    </div>
                  )}
                  <div className="flex gap-4 text-xs font-bold underline">
                    {p.liveUrl && <SafeLink href={p.liveUrl}>Live Project &rarr;</SafeLink>}
                    {p.repoUrl && <SafeLink href={p.repoUrl}>GitHub Source &rarr;</SafeLink>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className={\`grid grid-cols-1 md:grid-cols-12 gap-8 border-b-2 pb-16 \${isDark ? "border-neutral-800" : "border-neutral-900"}\`}>
            <div className="md:col-span-3 font-mono font-bold text-xs" style={{ color: primaryColor }}>
              03 / TRACK RECORD
            </div>
            <div className="md:col-span-9 space-y-6">
              {experience.map((e, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-4">
                  <div className="text-xs font-mono text-neutral-400">{e.startDate} &mdash; {e.current ? "PRESENT" : e.endDate}</div>
                  <div className="sm:col-span-2 space-y-1">
                    <h4 className="font-bold text-base">{e.title}</h4>
                    <p className="text-xs font-medium" style={{ color: primaryColor }}>{e.company} {e.location ? \`(\${e.location})\` : ""}</p>
                    {e.description && <p className={\`text-xs leading-relaxed pt-1 \${isDark ? "text-neutral-400" : "text-neutral-600"}\`}>{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-16">
          <div className="md:col-span-3 font-mono font-bold text-xs" style={{ color: primaryColor }}>
            04 / INQUIRIES
          </div>
          <div className="md:col-span-9 space-y-4">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">LET'S CONNECT</h2>
            <div className="space-y-2 text-lg sm:text-xl font-bold" style={{ color: primaryColor }}>
              {profile.email && <div><a href={\`mailto:\${profile.email}\`} className="underline">EMAIL: {profile.email} &rarr;</a></div>}
              {profile.phone && <div><a href={\`tel:\${profile.phone}\`} className="underline">TEL: {profile.phone} &rarr;</a></div>}
            </div>
          </div>
        </section>

        <footer className={\`border-t-2 pt-6 flex justify-between items-center text-xs font-mono \${isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-900 text-neutral-500"}\`}>
          <span>&copy; {new Date().getFullYear()} {fullName}. POSTER EDITORIAL ARCHIVE.</span>
          <button onClick={scrollToTop} className="font-bold underline flex items-center gap-1">
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </footer>
      </div>
    </div>
  );
}
`;
}

function getFullDevPortTemplateJsx() {
  // Transpiled version of DevPortTemplate.tsx
  return `import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Award,
  Briefcase,
  Check,
  Code2,
  ExternalLink,
  FileCode,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { BrandIcon } from "../common/BrandIcon.jsx";
import { SafeLink } from "../common/SafeLink.jsx";
import { normalizeAvatarUrl } from "../common/urlUtils.js";

const TECH_PILL_COLORS = [
  "border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20",
  "border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20",
  "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
  "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
  "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
  "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20",
  "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
];

export function DevPortTemplate({ portfolio = {} }) {
  const { profile = {}, socialLinks = [], skills = [], experience = [], education = [], projects = [], certifications = [] } = portfolio;

  const primaryColor = portfolio?.design?.primaryColor || "#06b6d4";
  const theme = portfolio?.design?.theme || "system";
  const isLight =
    theme === "light" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: light)").matches &&
      !window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  const [activeSection, setActiveSection] = useState("hero");

  const fullName = profile.fullName || "Developer";
  const headline = profile.headline || "Full Stack Engineer & Creative Developer";
  const bio = profile.bio || "Crafting high-performance web experiences and scalable cloud applications with modern architecture.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl);
  const initials = (fullName || "DV")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const accentGradient = \`linear-gradient(135deg, \${primaryColor}, #a855f7, #ec4899)\`;
  const primaryButtonBg = \`linear-gradient(90deg, \${primaryColor}, #a855f7)\`;
  const primaryGlowShadow = \`0 0 25px \${primaryColor}55\`;
  const primaryTextShadow = \`0 0 24px \${primaryColor}66\`;

  const roles = useMemo(() => {
    if (!headline) return ["Creative Developer", "Tech Enthusiast", "Full Stack Engineer"];
    const parts = headline.split(/[,|•&/]/).map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [headline];
  }, [headline]);

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullRole = roles[currentRoleIndex % roles.length];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentFullRole.slice(0, displayText.length + 1));
        if (displayText.length + 1 >= currentFullRole.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayText(currentFullRole.slice(0, displayText.length - 1));
        if (displayText.length <= 0) {
          setIsDeleting(false);
          setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentRoleIndex, roles]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 76;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
    setActiveSection(id);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      const sections = ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(s);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const projectCount = projects.length > 0 ? \`\${projects.length}+\` : "20+";
  const experienceYears = useMemo(() => {
    if (experience.length === 0) return "4+";
    const yrs = Math.max(1, experience.length * 1.5);
    return \`\${Math.round(yrs)}+\`;
  }, [experience]);

  const topSkills = skills.slice(0, 6);
  const codeSnippetSkills = (skills.length > 0 ? skills.slice(0, 3).map((s) => \`"\${s.name}"\`) : ['"React"', '"Node"', '"TypeScript"']).join(", ");

  return (
    <div
      className={\`relative min-h-screen transition-colors duration-300 selection:bg-cyan-500/30 selection:text-white antialiased overflow-x-hidden scroll-smooth \${
        isLight ? "bg-[#f8fafc] text-neutral-900" : "bg-[#090a16] text-neutral-100"
      }\`}
    >
      <div className={\`pointer-events-none fixed inset-0 overflow-hidden z-0 transition-opacity duration-300 \${isLight ? "opacity-20" : "opacity-100"}\`}>
        <div
          className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-[130px]"
          style={{ backgroundColor: \`\${primaryColor}22\` }}
        />
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-[60%] left-[-10%] h-[550px] w-[550px] rounded-full bg-pink-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <header
        className={\`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-200 \${
          isLight
            ? "bg-white/85 border-neutral-200/80 shadow-xs text-neutral-800"
            : "bg-[#090a16]/85 border-white/10 text-neutral-100"
        }\`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-3 group text-left transition-transform hover:scale-[1.02]"
          >
            <div
              className="h-10 w-10 rounded-xl p-0.5 shadow-md transition-shadow"
              style={{ background: accentGradient, boxShadow: \`0 0 15px \${primaryColor}40\` }}
            >
              <div
                className={\`h-full w-full rounded-[10px] flex items-center justify-center font-bold text-sm tracking-wider font-mono \${
                  isLight ? "bg-white text-neutral-900" : "bg-[#090a16] text-white"
                }\`}
              >
                <span
                  style={{
                    backgroundImage: accentGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {initials}
                </span>
              </div>
            </div>
            <div>
              <div
                className={\`font-bold text-sm tracking-tight transition-colors flex items-center gap-1.5 \${
                  isLight ? "text-neutral-900 group-hover:text-blue-600" : "text-white group-hover:text-cyan-400"
                }\`}
              >
                <span>{fullName || "DevPort"}</span>
              </div>
              <p className={\`text-[11px] font-mono truncate max-w-[160px] sm:max-w-[200px] \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                {headline || "Developer & Designer"}
              </p>
            </div>
          </button>

          <nav
            className={\`hidden md:flex items-center gap-1.5 p-1 rounded-full border backdrop-blur-md text-xs font-medium \${
              isLight
                ? "bg-neutral-100/80 border-neutral-200 text-neutral-600"
                : "bg-white/5 border-white/10 text-neutral-300"
            }\`}
          >
            {[
              { id: "hero", label: "Home" },
              { id: "about", label: "About", condition: !!bio },
              { id: "skills", label: "Skills", condition: skills.length > 0 },
              { id: "projects", label: "Projects", condition: projects.length > 0 },
              { id: "experience", label: "Experience", condition: experience.length > 0 },
              { id: "education", label: "Education", condition: education.length > 0 || certifications.length > 0 },
              { id: "contact", label: "Contact", condition: true },
            ]
              .filter((item) => item.condition !== false)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  style={
                    activeSection === item.id
                      ? {
                          background: primaryButtonBg,
                          color: "#ffffff",
                          boxShadow: \`0 0 15px \${primaryColor}40\`,
                        }
                      : {}
                  }
                  className={\`px-3.5 py-1.5 rounded-full transition-all duration-200 \${
                    activeSection === item.id
                      ? "font-semibold text-white shadow-xs"
                      : isLight
                        ? "hover:text-neutral-900 hover:bg-neutral-200/60"
                        : "hover:text-white hover:bg-white/5"
                  }\`}
                >
                  {item.label}
                </button>
              ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollTo("contact")}
              style={{
                background: primaryButtonBg,
                boxShadow: \`0 0 20px \${primaryColor}45\`,
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Hire Me</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-24 py-8 sm:py-16">
        <section id="hero" className="pt-8 sm:pt-14 pb-12 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div
                className={\`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md shadow-xs \${
                  isLight
                    ? "border-neutral-300 bg-white text-neutral-700"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                }\`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: primaryColor }}
                  />
                </span>
                <span>Available for opportunities & freelance work</span>
              </div>

              <div className="space-y-2">
                <p className={\`text-sm sm:text-base font-mono uppercase tracking-widest \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                  Hey there! I'm
                </p>
                <h1
                  className={\`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] \${
                    isLight ? "text-neutral-900" : "text-white"
                  }\`}
                >
                  {fullName || "Andrew Ryan"}
                </h1>
              </div>

              <div
                className={\`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center flex-wrap gap-2 \${
                  isLight ? "text-neutral-800" : "text-white"
                }\`}
              >
                <span>I'm a</span>
                <span
                  style={{
                    color: primaryColor,
                    textShadow: primaryTextShadow,
                  }}
                  className="font-extrabold transition-colors duration-200"
                >
                  {displayText}
                </span>
                <span
                  className="inline-block w-0.5 h-6 sm:h-8 animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {bio && (
                <p
                  className={\`text-sm sm:text-base leading-relaxed max-w-xl font-light \${
                    isLight ? "text-neutral-600" : "text-neutral-300/90"
                  }\`}
                >
                  {bio}
                </p>
              )}

              {topSkills.length > 0 && (
                <div className="pt-2">
                  <p className={\`text-xs font-mono mb-2.5 uppercase tracking-wider \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                    Core Technologies
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {topSkills.map((skill, idx) => {
                      const colorClass = TECH_PILL_COLORS[idx % TECH_PILL_COLORS.length];
                      return (
                        <span
                          key={skill.name}
                          className={\`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all \${colorClass}\`}
                        >
                          {skill.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollTo("projects")}
                  style={{
                    background: primaryButtonBg,
                    boxShadow: primaryGlowShadow,
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>View My Work</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollTo("contact")}
                  className={\`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border backdrop-blur-md transition-all hover:scale-[1.02] \${
                    isLight
                      ? "border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 shadow-xs"
                      : "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  }\`}
                >
                  <MessageSquare className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>Let's Talk</span>
                </button>

                {profile?.location && (
                  <div className={\`hidden sm:inline-flex items-center gap-1.5 text-xs pl-2 \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                    <MapPin className="h-3.5 w-3.5 text-pink-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="pt-3 flex items-center gap-3">
                  <span className={\`text-xs font-mono uppercase tracking-widest \${isLight ? "text-neutral-400" : "text-neutral-500"}\`}>
                    Connect:
                  </span>
                  <div className="flex items-center gap-2">
                    {socialLinks.map((link, idx) => (
                      <SafeLink
                        key={\`\${link.platform}-\${idx}\`}
                        href={link.url}
                        className={\`h-8 w-8 rounded-lg border flex items-center justify-center transition-all hover:scale-110 \${
                          isLight
                            ? "border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 shadow-xs"
                            : "border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
                        }\`}
                        title={link.label || link.platform}
                      >
                        <BrandIcon name={link.platform} size={15} />
                      </SafeLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative w-[300px] sm:w-[360px] h-[340px] sm:h-[400px] flex items-center justify-center">
                <div
                  className="absolute inset-4 rounded-full opacity-25 blur-2xl animate-pulse"
                  style={{ background: accentGradient }}
                />

                <div
                  className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 transition-shadow"
                  style={{
                    background: accentGradient,
                    boxShadow: \`0 0 40px \${primaryColor}66\`,
                  }}
                >
                  <div
                    className={\`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center \${
                      isLight ? "bg-white border-neutral-100" : "bg-neutral-900 border-[#090a16]"
                    }\`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName || "Portfolio Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={\`w-full h-full flex flex-col items-center justify-center font-mono font-bold text-4xl \${
                          isLight ? "bg-neutral-100 text-neutral-700" : "bg-neutral-800 text-white"
                        }\`}
                      >
                        <span style={{ color: primaryColor }}>{initials}</span>
                        <span className="text-[10px] text-neutral-400 font-sans mt-1">Photo</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full text-white flex items-center justify-center shadow-lg border-2 animate-bounce"
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: isLight ? "#ffffff" : "#090a16",
                    }}
                  >
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div
                    className="absolute top-1/3 -right-2 h-7 w-7 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: isLight ? "#ffffff" : "#090a16" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: isLight ? "#ffffff" : "#090a16" }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div
                    className="absolute top-1/3 -left-2 h-7 w-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg border-2"
                    style={{ borderColor: isLight ? "#ffffff" : "#090a16" }}
                  >
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div
                  className={\`absolute -top-4 -right-2 sm:-right-6 z-20 w-48 sm:w-56 p-3 rounded-xl border backdrop-blur-xl shadow-2xl text-[10px] font-mono leading-relaxed hidden xs:block \${
                    isLight
                      ? "bg-neutral-900/95 border-neutral-700 text-neutral-200"
                      : "bg-neutral-900/90 border-white/15 text-neutral-300"
                  }\`}
                >
                  <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-neutral-400 ml-1">developer.js</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-pink-400">const <span className="text-white">developer</span> = &#123;</p>
                    <p className="pl-2">
                      name: <span style={{ color: primaryColor }}>&quot;{fullName ? fullName.split(" ")[0] : "Dev"}&quot;</span>,
                    </p>
                    <p className="pl-2 truncate">skills: <span className="text-amber-300">[{codeSnippetSkills}]</span>,</p>
                    <p className="pl-2">hardWorker: <span className="text-emerald-400">true</span></p>
                    <p className="text-pink-400">&#125;;</p>
                  </div>
                </div>

                <div
                  className={\`absolute -bottom-4 -left-2 sm:-left-4 z-20 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2.5 \${
                    isLight
                      ? "bg-white border-neutral-200 shadow-md text-neutral-900"
                      : "bg-neutral-900/85 border-white/15 text-white"
                  }\`}
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor }}
                  >
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold font-mono leading-none">
                      {projectCount}
                    </div>
                    <div className={\`text-[10px] \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                      Projects Done
                    </div>
                  </div>
                </div>

                <div
                  className={\`absolute -bottom-4 -right-2 sm:-right-4 z-20 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2.5 \${
                    isLight
                      ? "bg-white border-neutral-200 shadow-md text-neutral-900"
                      : "bg-neutral-900/85 border-white/15 text-white"
                  }\`}
                >
                  <div className="h-9 w-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold font-mono leading-none">
                      {experienceYears}
                    </div>
                    <div className={\`text-[10px] \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                      Experience
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {bio && (
          <section id="about" className="scroll-mt-20">
            <div
              className={\`p-6 sm:p-10 rounded-2xl border backdrop-blur-xl shadow-xl relative overflow-hidden \${
                isLight ? "bg-white border-neutral-200/90 text-neutral-900" : "bg-white/[0.03] border-white/10 text-neutral-100"
              }\`}
            >
              <div
                className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: \`\${primaryColor}15\` }}
              />

              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor }}
                >
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                  // 01. About Me
                </h2>
              </div>

              <h3 className={\`text-2xl sm:text-3xl font-bold tracking-tight mb-6 \${isLight ? "text-neutral-900" : "text-white"}\`}>
                Passionate about turning vision into high-impact software
              </h3>

              <div className={\`max-w-none text-base leading-relaxed space-y-4 font-light \${isLight ? "text-neutral-700" : "text-neutral-300/90"}\`}>
                <p className="whitespace-pre-line">{bio}</p>
              </div>
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" className="scroll-mt-20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor }}
                  >
                    <Code2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                    // 02. Skills & Tech Stack
                  </h2>
                </div>
                <h3 className={\`text-2xl sm:text-3xl font-bold tracking-tight \${isLight ? "text-neutral-900" : "text-white"}\`}>
                  Tools, Frameworks & Core Competencies
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {skills.map((skill, idx) => (
                <div
                  key={\`\${skill.name}-\${idx}\`}
                  className={\`p-3.5 rounded-xl border backdrop-blur-md transition-all duration-200 group \${
                    isLight
                      ? "bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-xs"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                  }\`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={\`font-semibold text-sm truncate transition-colors \${
                        isLight ? "text-neutral-800" : "text-white group-hover:text-cyan-300"
                      }\`}
                    >
                      {skill.name}
                    </span>
                    <span className={\`text-[10px] font-mono uppercase \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                      {skill.category || "Skill"}
                    </span>
                  </div>
                  <div className={\`h-1.5 w-full rounded-full overflow-hidden \${isLight ? "bg-neutral-200" : "bg-white/10"}\`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        background: primaryButtonBg,
                        width:
                          skill.level === "expert"
                            ? "95%"
                            : skill.level === "advanced"
                              ? "85%"
                              : skill.level === "intermediate"
                                ? "70%"
                                : "55%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section id="projects" className="scroll-mt-20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor }}
                  >
                    <FileCode className="h-4 w-4" />
                  </div>
                  <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                    // 03. Featured Engineering Projects
                  </h2>
                </div>
                <h3 className={\`text-2xl sm:text-3xl font-bold tracking-tight \${isLight ? "text-neutral-900" : "text-white"}\`}>
                  Selected Work & Interactive Case Studies
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={\`\${proj.title}-\${idx}\`}
                  className={\`rounded-2xl border p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 \${
                    isLight
                      ? "bg-white border-neutral-200 hover:border-neutral-400 shadow-sm hover:shadow-md"
                      : "bg-white/[0.03] border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                  }\`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: primaryColor }}>
                          // {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h4 className={\`text-xl font-bold transition-colors \${isLight ? "text-neutral-900" : "text-white"}\`}>
                          {proj.title}
                        </h4>
                      </div>
                      {proj.featured && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className={\`text-sm leading-relaxed font-light \${isLight ? "text-neutral-600" : "text-neutral-300/90"}\`}>
                      {proj.description}
                    </p>

                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className={\`px-2.5 py-0.5 rounded-md text-[11px] font-mono border \${
                              isLight
                                ? "bg-neutral-100 border-neutral-200 text-neutral-700"
                                : "bg-white/5 border-white/10 text-neutral-300"
                            }\`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={\`pt-6 mt-4 border-t flex items-center justify-between \${isLight ? "border-neutral-200" : "border-white/10"}\`}>
                    <div className="flex items-center gap-3">
                      {proj.liveUrl && (
                        <SafeLink
                          href={proj.liveUrl}
                          style={{ color: primaryColor }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline transition-colors"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </SafeLink>
                      )}
                      {proj.repoUrl && (
                        <SafeLink
                          href={proj.repoUrl}
                          className={\`inline-flex items-center gap-1.5 text-xs font-medium transition-colors \${
                            isLight ? "text-neutral-600 hover:text-neutral-900" : "text-neutral-400 hover:text-white"
                          }\`}
                        >
                          <BrandIcon name="github" size={14} />
                          <span>Code Repository</span>
                        </SafeLink>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section id="experience" className="scroll-mt-20 space-y-6">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor }}
              >
                <Briefcase className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
                // 04. Career Experience
              </h2>
            </div>
            <h3 className={\`text-2xl sm:text-3xl font-bold tracking-tight \${isLight ? "text-neutral-900" : "text-white"}\`}>
              Professional Timeline & Contributions
            </h3>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={\`\${exp.title}-\${exp.company}-\${idx}\`}
                  className={\`p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all \${
                    isLight
                      ? "bg-white border-neutral-200 shadow-sm text-neutral-900"
                      : "bg-white/[0.03] border-white/10 text-neutral-100"
                  }\`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className={\`text-lg font-bold \${isLight ? "text-neutral-900" : "text-white"}\`}>
                        {exp.title}
                      </h4>
                      <p className="text-sm font-mono" style={{ color: primaryColor }}>
                        {exp.company} {exp.location ? \`• \${exp.location}\` : ""}
                      </p>
                    </div>
                    <span
                      className={\`text-xs font-mono px-2.5 py-1 rounded-md border self-start sm:self-auto \${
                        isLight ? "bg-neutral-100 border-neutral-200 text-neutral-600" : "bg-white/5 border-white/10 text-neutral-400"
                      }\`}
                    >
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>

                  {exp.description && (
                    <p className={\`text-sm leading-relaxed font-light mb-3 \${isLight ? "text-neutral-700" : "text-neutral-300/90"}\`}>
                      {exp.description}
                    </p>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className={\`space-y-1.5 text-xs pl-4 list-disc font-light \${isLight ? "text-neutral-600 marker:text-blue-600" : "text-neutral-400 marker:text-cyan-400"}\`}>
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(education.length > 0 || certifications.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {education.length > 0 && (
              <section id="education" className="scroll-mt-20 space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" style={{ color: primaryColor }} />
                  <h3 className={\`text-xl font-bold \${isLight ? "text-neutral-900" : "text-white"}\`}>Education</h3>
                </div>
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div
                      key={\`\${edu.institution}-\${idx}\`}
                      className={\`p-4 rounded-xl border backdrop-blur-md \${
                        isLight ? "bg-white border-neutral-200 text-neutral-900 shadow-xs" : "bg-white/[0.03] border-white/10 text-neutral-100"
                      }\`}
                    >
                      <h4 className={\`font-semibold text-sm \${isLight ? "text-neutral-900" : "text-white"}\`}>
                        {edu.degree} {edu.fieldOfStudy ? \`in \${edu.fieldOfStudy}\` : ""}
                      </h4>
                      <p className="text-xs font-mono mt-0.5" style={{ color: primaryColor }}>{edu.institution}</p>
                      <p className={\`text-[11px] mt-1 \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>
                        {edu.startDate} — {edu.endDate || "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section id="certifications" className="scroll-mt-20 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-pink-500" />
                  <h3 className={\`text-xl font-bold \${isLight ? "text-neutral-900" : "text-white"}\`}>Certifications</h3>
                </div>
                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div
                      key={\`\${cert.name}-\${idx}\`}
                      className={\`p-4 rounded-xl border backdrop-blur-md \${
                        isLight ? "bg-white border-neutral-200 text-neutral-900 shadow-xs" : "bg-white/[0.03] border-white/10 text-neutral-100"
                      }\`}
                    >
                      <h4 className={\`font-semibold text-sm \${isLight ? "text-neutral-900" : "text-white"}\`}>{cert.name}</h4>
                      <p className="text-xs text-pink-500 font-mono mt-0.5">{cert.issuer}</p>
                      {cert.issueDate && (
                        <p className={\`text-[11px] mt-1 \${isLight ? "text-neutral-500" : "text-neutral-400"}\`}>Issued {cert.issueDate}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <section id="contact" className="scroll-mt-20">
          <div
            className={\`p-8 sm:p-12 rounded-3xl border backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center space-y-6 \${
              isLight
                ? "bg-white border-neutral-200 text-neutral-900"
                : "border-white/15 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent text-white"
            }\`}
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium"
              style={{ backgroundColor: \`\${primaryColor}18\`, color: primaryColor }}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Get In Touch</span>
            </div>

            <h2 className={\`text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto \${isLight ? "text-neutral-900" : "text-white"}\`}>
              Let's build something extraordinary together
            </h2>

            <p className={\`text-sm sm:text-base max-w-xl mx-auto font-light \${isLight ? "text-neutral-600" : "text-neutral-300/80"}\`}>
              Interested in collaborating, hiring for full-time or freelance roles, or just want to say hi? Reach out anytime!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {profile?.email && (
                <SafeLink
                  href={\`mailto:\${profile.email}\`}
                  style={{
                    background: primaryButtonBg,
                    boxShadow: primaryGlowShadow,
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all hover:scale-105 active:scale-95"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send an Email</span>
                </SafeLink>
              )}

              {profile?.phone && (
                <SafeLink
                  href={\`tel:\${profile.phone}\`}
                  className={\`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border backdrop-blur-md transition-all \${
                    isLight ? "border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-800" : "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  }\`}
                >
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span>{profile.phone}</span>
                </SafeLink>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className={\`pt-6 border-t flex items-center justify-center gap-3 \${isLight ? "border-neutral-200" : "border-white/10"}\`}>
                {socialLinks.map((link, idx) => (
                  <SafeLink
                    key={\`\${link.platform}-\${idx}\`}
                    href={link.url}
                    className={\`h-10 w-10 rounded-xl border flex items-center justify-center transition-all hover:scale-110 \${
                      isLight
                        ? "border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        : "border-white/10 bg-white/5 hover:bg-white/20 text-neutral-300 hover:text-white"
                    }\`}
                    title={link.label || link.platform}
                  >
                    <BrandIcon name={link.platform} size={18} />
                  </SafeLink>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <button
        type="button"
        onClick={() => scrollTo("contact")}
        style={{
          background: primaryButtonBg,
          boxShadow: primaryGlowShadow,
        }}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Contact Me"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      <footer
        className={\`border-t py-10 relative z-10 backdrop-blur-md \${
          isLight ? "bg-white/90 border-neutral-200 text-neutral-600" : "bg-[#090a16]/90 border-white/10 text-neutral-400"
        }\`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
            <span>Built with modern web standards & DevPort</span>
          </div>

          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} {fullName || "Developer"}. All rights reserved.</span>
            <button
              type="button"
              onClick={() => scrollTo("hero")}
              style={{ color: primaryColor }}
              className="inline-flex items-center gap-1.5 hover:underline transition-colors"
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
`;
}

function getFullModernCreativeTemplateJsx() {
  return `import React from "react";
import { ArrowRight, Code2, Mail, Sparkles, User } from "lucide-react";
import { BrandIcon } from "../common/BrandIcon.jsx";
import { SafeLink } from "../common/SafeLink.jsx";
import { normalizeAvatarUrl } from "../common/urlUtils.js";

export function ModernCreativeTemplate({ portfolio = {} }) {
  const { profile = {}, socialLinks = [], skills = [], projects = [], experience = [] } = portfolio;
  const primaryColor = portfolio?.design?.primaryColor || "#9333ea";
  const theme = portfolio?.design?.theme || "system";
  const isLight =
    theme === "light" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: light)").matches &&
      !window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  const fullName = profile.fullName || "Creative Engineer";
  const firstName = fullName ? fullName.split(" ")[0] : "Creative";
  const headline = profile.headline || "Data Analyst & Creative Engineer";
  const bio = profile.bio || "Data Analyst with extensive experience transforming raw data into actionable insights.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl);

  const primaryGradient = \`linear-gradient(90deg, \${primaryColor}, #6366f1)\`;
  const haloGradient = \`linear-gradient(135deg, \${primaryColor}, #6366f1, #ec4899)\`;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 76;
    const pos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: pos, behavior: "smooth" });
  };

  return (
    <div className={\`relative min-h-screen transition-colors duration-300 font-sans antialiased overflow-x-hidden \${isLight ? "bg-[#f8fafc] text-neutral-900" : "bg-[#0b0f19] text-neutral-100"}\`}>
      <header className={\`sticky top-0 z-40 backdrop-blur-xl border-b h-18 flex items-center transition-colors \${isLight ? "bg-white/85 border-neutral-200" : "bg-[#0b0f19]/85 border-white/5"}\`}>
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <span className={\`font-bold text-lg \${isLight ? "text-neutral-900" : "text-white"}\`}>{firstName}</span>
          <nav className={\`flex gap-6 text-sm \${isLight ? "text-neutral-600" : "text-neutral-400"}\`}>
            <button onClick={() => scrollTo("hero")} className={\`hover:\${isLight ? "text-neutral-900" : "text-white"}\`}>Home</button>
            <button onClick={() => scrollTo("projects")} className={\`hover:\${isLight ? "text-neutral-900" : "text-white"}\`}>Projects</button>
            <button onClick={() => scrollTo("contact")} className={\`hover:\${isLight ? "text-neutral-900" : "text-white"}\`}>Contact</button>
          </nav>
          <button
            onClick={() => scrollTo("contact")}
            style={{ background: primaryGradient, boxShadow: \`0 0 20px \${primaryColor}55\` }}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
          >
            Hire Me
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        <section id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase border"
              style={{ backgroundColor: \`\${primaryColor}15\`, borderColor: \`\${primaryColor}30\`, color: primaryColor }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} />
              <span>Welcome to my portfolio</span>
            </div>
            <h1 className={\`text-5xl sm:text-6xl font-extrabold \${isLight ? "text-neutral-900" : "text-white"}\`}>
              Hi, I'm <span className="text-transparent bg-clip-text" style={{ backgroundImage: haloGradient }}>{fullName}</span>
            </h1>
            <p className="text-xl font-semibold font-mono" style={{ color: primaryColor }}>{headline}</p>
            <p className={\`text-base max-w-xl \${isLight ? "text-neutral-600" : "text-neutral-300"}\`}>{bio}</p>
            <div className="flex gap-4">
              <button
                onClick={() => scrollTo("projects")}
                style={{ background: primaryGradient, boxShadow: \`0 0 20px \${primaryColor}66\` }}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
              >
                Explore My Work &rarr;
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className={\`px-6 py-3 rounded-xl text-sm font-medium border transition-colors \${isLight ? "border-neutral-300 text-neutral-800 hover:bg-neutral-100" : "border-white/15 text-white hover:bg-white/10"}\`}
              >
                Contact Me
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div
              className="relative w-64 h-64 rounded-full p-2"
              style={{ background: haloGradient, boxShadow: \`0 0 50px \${primaryColor}50\` }}
            >
              <div className={\`w-full h-full rounded-full overflow-hidden flex items-center justify-center \${isLight ? "bg-white" : "bg-indigo-950"}\`}>
                {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : <span className="text-5xl font-black" style={{ color: primaryColor }}>{fullName[0]}</span>}
              </div>
            </div>
          </div>
        </section>

        {projects.length > 0 && (
          <section id="projects" className="space-y-8">
            <h2 className={\`text-3xl font-bold \${isLight ? "text-neutral-900" : "text-white"}\`}>Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p, idx) => (
                <div key={idx} className={\`p-6 rounded-2xl border space-y-4 \${isLight ? "bg-white border-neutral-200 shadow-sm" : "bg-white/[0.03] border-white/10"}\`}>
                  <h3 className={\`font-bold text-lg \${isLight ? "text-neutral-900" : "text-white"}\`}>{p.title}</h3>
                  <p className={\`text-sm \${isLight ? "text-neutral-600" : "text-neutral-300"}\`}>{p.description}</p>
                  {p.liveUrl && <SafeLink href={p.liveUrl} style={{ color: primaryColor }} className="text-sm font-semibold hover:underline">Explore Project &rarr;</SafeLink>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
`;
}

function getFullDeveloperTemplateJsx() {
  return `import React from "react";
import { Terminal, ArrowUp } from "lucide-react";
import { BrandIcon } from "../common/BrandIcon.jsx";
import { SafeLink } from "../common/SafeLink.jsx";

export function DeveloperTemplate({ portfolio = {} }) {
  const { profile = {}, skills = [], projects = [], experience = [], socialLinks = [] } = portfolio;
  const fullName = profile.fullName || "Developer";
  const primaryColor = portfolio?.design?.primaryColor || "#38bdf8";
  const theme = portfolio?.design?.theme || "dark";
  const isLight = theme === "light";

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={\`min-h-screen font-mono p-6 sm:p-12 transition-colors \${isLight ? "bg-[#f6f8fa] text-[#24292f]" : "bg-[#0d1117] text-[#c9d1d9]"}\`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className={\`border-b pb-4 font-bold flex items-center justify-between gap-2 \${isLight ? "border-[#d0d7de]" : "border-[#30363d]"}\`}>
          <div className="flex items-center gap-2" style={{ color: primaryColor }}>
            <Terminal className="h-5 w-5" />
            <span>~/dev/{fullName.toLowerCase().replace(/\\s+/g, "")}</span>
          </div>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2">
              {socialLinks.map((l, i) => (
                <SafeLink key={i} href={l.url} className={\`p-1 rounded \${isLight ? "hover:bg-neutral-200 text-neutral-600" : "hover:bg-neutral-800 text-neutral-400 hover:text-white"}\`}>
                  <BrandIcon name={l.platform} size={15} />
                </SafeLink>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs" style={{ color: primaryColor }}>$ whoami</p>
          <h1 className={\`text-4xl font-bold \${isLight ? "text-neutral-900" : "text-white"}\`}>{fullName}</h1>
          <p className="text-sm font-semibold" style={{ color: primaryColor }}>{profile.headline}</p>
          {profile.bio && <p className={\`text-sm pt-2 \${isLight ? "text-neutral-600" : "text-[#8b949e]"}\`}>{profile.bio}</p>}
        </div>

        {skills.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: primaryColor }}>$ ls -la ./skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className={\`px-2.5 py-1 rounded border text-xs \${isLight ? "bg-white border-[#d0d7de] text-neutral-800" : "bg-[#21262d] border-[#30363d] text-[#7ee787]"}\`}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: primaryColor }}>$ cat ./projects.json</p>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((p, i) => (
                <div key={i} className={\`p-4 rounded border space-y-2 \${isLight ? "bg-white border-[#d0d7de]" : "bg-[#161b22] border-[#30363d]"}\`}>
                  <div className="flex items-center justify-between">
                    <h4 className={\`font-bold \${isLight ? "text-neutral-900" : "text-white"}\`}>&gt; {p.title}</h4>
                    {p.liveUrl && (
                      <SafeLink href={p.liveUrl} style={{ color: primaryColor }} className="text-xs underline flex items-center gap-1">
                        [Live Demo]
                      </SafeLink>
                    )}
                  </div>
                  <p className={\`text-xs \${isLight ? "text-neutral-600" : "text-[#8b949e]"}\`}>{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.tags.map(t => (
                        <span key={t} className="text-[10px] text-neutral-500 font-mono">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {experience.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: primaryColor }}>$ git log --oneline ./experience</p>
            <div className="space-y-3">
              {experience.map((e, i) => (
                <div key={i} className={\`p-4 rounded border \${isLight ? "bg-white border-[#d0d7de]" : "bg-[#161b22] border-[#30363d]"}\`}>
                  <div className="flex justify-between items-start text-xs">
                    <span className={\`font-bold \${isLight ? "text-neutral-900" : "text-white"}\`}>{e.title} @ {e.company}</span>
                    <span className="text-neutral-500">{e.startDate} - {e.current ? "Present" : e.endDate}</span>
                  </div>
                  {e.description && <p className={\`text-xs mt-2 \${isLight ? "text-neutral-600" : "text-[#8b949e]"}\`}>{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className={\`border-t pt-6 flex justify-between text-xs text-neutral-500 \${isLight ? "border-[#d0d7de]" : "border-[#30363d]"}\`}>
          <span>exit 0</span>
          <button onClick={scrollToTop} className="hover:underline flex items-center gap-1" style={{ color: primaryColor }}>
            <span>^top</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </footer>
      </div>
    </div>
  );
}
`;
}

function getFullMinimalTemplateJsx() {
  return `import React from "react";
import { ArrowUp } from "lucide-react";
import { BrandIcon } from "../common/BrandIcon.jsx";
import { SafeLink } from "../common/SafeLink.jsx";

export function MinimalTemplate({ portfolio = {} }) {
  const { profile = {}, projects = [], skills = [], experience = [], socialLinks = [] } = portfolio;
  const fullName = profile.fullName || "Portfolio";
  const primaryColor = portfolio?.design?.primaryColor || "#171717";
  const theme = portfolio?.design?.theme || "light";
  const isDark = theme === "dark";

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={\`min-h-screen font-sans p-8 sm:p-20 transition-colors \${isDark ? "bg-[#0a0a0a] text-neutral-100" : "bg-[#fafafa] text-[#171717]"}\`}>
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-light tracking-tight">{fullName}</h1>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((l, i) => (
                  <SafeLink key={i} href={l.url} className={\`p-1 rounded \${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"}\`}>
                    <BrandIcon name={l.platform} size={16} />
                  </SafeLink>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm font-medium" style={{ color: primaryColor }}>{profile.headline}</p>
          {profile.bio && <p className={\`text-sm leading-relaxed \${isDark ? "text-neutral-300" : "text-neutral-600"}\`}>{profile.bio}</p>}
        </header>

        {skills.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className={\`px-2.5 py-1 text-xs rounded border \${isDark ? "border-neutral-800 bg-neutral-900 text-neutral-300" : "border-neutral-200 bg-white text-neutral-700"}\`}>
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Selected Projects</h2>
            <div className="space-y-6">
              {projects.map((p, i) => (
                <div key={i} className={\`border-b pb-4 \${isDark ? "border-neutral-800" : "border-neutral-200"}\`}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-base">{p.title}</h3>
                    {p.liveUrl && (
                      <SafeLink href={p.liveUrl} style={{ color: primaryColor }} className="text-xs underline inline-block">
                        Visit &rarr;
                      </SafeLink>
                    )}
                  </div>
                  <p className={\`text-xs mt-1 \${isDark ? "text-neutral-400" : "text-neutral-600"}\`}>{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {p.tags.map(t => (
                        <span key={t} className="text-[10px] text-neutral-400 font-mono">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Experience</h2>
            <div className="space-y-4">
              {experience.map((e, i) => (
                <div key={i} className={\`border-b pb-4 \${isDark ? "border-neutral-800" : "border-neutral-200"}\`}>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="font-medium">{e.title}</span>
                    <span className="text-xs text-neutral-400">{e.startDate} - {e.current ? "Present" : e.endDate}</span>
                  </div>
                  <p className="text-xs font-mono mt-0.5" style={{ color: primaryColor }}>{e.company}</p>
                  {e.description && <p className={\`text-xs mt-1 \${isDark ? "text-neutral-400" : "text-neutral-600"}\`}>{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className={\`border-t pt-8 flex justify-between items-center text-xs text-neutral-400 \${isDark ? "border-neutral-800" : "border-neutral-200"}\`}>
          <span>© {new Date().getFullYear()} {fullName}</span>
          <button onClick={scrollToTop} className="hover:underline flex items-center gap-1" style={{ color: primaryColor }}>
            <span>Top</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </footer>
      </div>
    </div>
  );
}
`;
}

function getBrandIconJsx() {
  return `import React from "react";
import { ExternalLink, Globe, Mail, MapPin, Phone } from "lucide-react";

export function BrandIcon({ name, size = 16, className = "" }) {
  const norm = (name || "").toLowerCase().trim();
  const svgProps = { width: size, height: size, className, "aria-hidden": "true", fill: "currentColor", viewBox: "0 0 24 24" };

  if (norm.includes("github")) {
    return (
      <svg {...svgProps}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  if (norm.includes("linkedin")) {
    return (
      <svg {...svgProps}>
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.75-.79 1.75-1.76s-.78-1.75-1.75-1.75a1.75 1.75 0 0 0-1.75 1.75c0 .97.78 1.76 1.75 1.76m1.4 9.74v-8.37H5.06v8.37h2.8z" />
      </svg>
    );
  }
  if (norm.includes("twitter") || norm === "x") {
    return (
      <svg {...svgProps}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (norm.includes("website") || norm.includes("portfolio")) return <Globe className={className} style={{ width: size, height: size }} />;
  if (norm.includes("mail")) return <Mail className={className} style={{ width: size, height: size }} />;
  if (norm.includes("phone")) return <Phone className={className} style={{ width: size, height: size }} />;
  if (norm.includes("location")) return <MapPin className={className} style={{ width: size, height: size }} />;
  return <ExternalLink className={className} style={{ width: size, height: size }} />;
}
`;
}

function getSafeLinkJsx() {
  return `import React from "react";
import { sanitizeExternalUrl } from "./urlUtils.js";

export function SafeLink({ href, className = "", children, onClick, ...rest }) {
  const safeHref = sanitizeExternalUrl(href);
  if (!safeHref) return <span className={className}>{children}</span>;
  return (
    <a href={safeHref} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
`;
}

function getUrlUtilsJs() {
  return `export function sanitizeExternalUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    if (trimmed.includes("\\r") || trimmed.includes("\\n") || trimmed.includes("\\u0000")) return null;
    return trimmed;
  }
  let normalized = trimmed;
  if (!/^https?:\\/\\//i.test(normalized) && !/^[a-z0-9+-.]+:/.test(normalized)) {
    normalized = \`https://\${normalized}\`;
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {}
  return null;
}

export function normalizeAvatarUrl(rawUrl) {
  if (!rawUrl) return "";
  let url = rawUrl.trim().replace(/^["']|["']$/g, "");
  if (!url) return "";
  const gdrive = url.match(/drive\\.google\\.com\\/(?:file\\/d\\/|open\\?id=)([a-zA-Z0-9_-]+)/);
  if (gdrive) {
    return \`https://drive.google.com/uc?export=view&id=\${gdrive[1]}\`;
  }
  if (url.includes("dropbox.com") && url.includes("dl=0")) {
    url = url.replace("dl=0", "raw=1");
  }
  return url;
}
`;
}

function getSourceReadme(data) {
  return `# ${data.title} - Standalone React Source Project

This package contains the complete, production-ready source code for your personal portfolio website.

## 🌟 Highlights
- **100% Standalone**: Completely decoupled from AI Resume Builder. Runs independently without backend API dependencies.
- **Modern Tech Stack**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Privacy Guaranteed**: Contains zero API keys, secrets, or internal database metadata.

## 🚀 Quick Start (Local Development)
1. Install project dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Start the local Vite development server:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Open \`http://localhost:5173\` in your browser to view your live portfolio.

## 📦 Production Build
Compile optimized static production assets:
\`\`\`bash
npm run build
\`\`\`
The compiled assets will be placed into the \`dist/\` directory.

To preview the production build locally:
\`\`\`bash
npm run preview
\`\`\`

## 🌐 Free One-Click Deployment

### Option A: Vercel
1. Push this folder to a GitHub, GitLab, or Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Framework Preset: **Vite**
4. Build Command: \`npm run build\`
5. Output Directory: \`dist\`
6. Click **Deploy**.

### Option B: Netlify
1. Push this folder to your Git provider.
2. Go to [app.netlify.com](https://app.netlify.com) and click **Add new site > Import an existing project**.
3. Build Command: \`npm run build\`
4. Publish Directory: \`dist\`
5. Click **Deploy site**.

## 🔌 External Dependencies
- **Google Fonts CDN** (\`fonts.googleapis.com\`): Used for typography rendering (${data.design?.fontFamily || "Inter"}). System fallbacks are defined in CSS for offline scenarios.
`;
}

function getStaticReadme(data) {
  return `# ${data.title} - Standalone Static Website Bundle

This archive contains your self-contained, pre-rendered portfolio website.

## 🌟 Highlights
- **100% Independent**: Zero dependencies on the AI Resume Builder backend. All markup, styles, scripts, and content are bundled.
- **Zero Configuration**: No Node.js, npm, or build tools required to run.
- **Privacy Guaranteed**: Does not contain API keys, credentials, or private account fields.

## 🚀 Instant Local Preview
There are two ways to preview your website locally:

### Option 1: Direct Browser Launch
Simply double-click \`index.html\` to open the portfolio directly in any modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local HTTP Server (Recommended)
If you prefer testing over a local HTTP server:
\`\`\`bash
# Using Python 3:
python -m http.server 8080

# Or using npx:
npx serve .
\`\`\`
Then visit \`http://localhost:8080\` in your browser.

## 🌐 Free Static Hosting Deployment

### Option A: Netlify Drop (Drag & Drop, No Git Needed)
1. Visit [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the unzipped folder containing \`index.html\`.
3. Your site will be instantly live with a free SSL certificate.

### Option B: GitHub Pages
1. Create a repository on GitHub (e.g. \`username.github.io\` or \`my-portfolio\`).
2. Upload the contents of this folder (\`index.html\`, \`assets/\`, \`README.md\`).
3. In repository **Settings > Pages**, choose \`Branch: main / (root)\` and click **Save**.

### Option C: Cloudflare Pages
1. Log in to the Cloudflare dashboard and go to **Workers & Pages > Create application > Pages > Direct Upload**.
2. Upload this folder and deploy in seconds.

## 🔌 External Dependencies
- **Google Fonts CDN** (\`fonts.googleapis.com\`): Used for custom fonts with system font fallbacks included.
`;
}

function getLicenseText(data) {
  return `MIT License
Copyright (c) ${new Date().getFullYear()} ${data.profile?.fullName || "Developer"}
`;
}
