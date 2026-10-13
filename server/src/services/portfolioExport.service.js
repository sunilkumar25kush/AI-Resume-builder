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
 * Sanitizes portfolio data to exclude private DB metadata or internal IDs.
 */
export function sanitizePortfolioData(portfolio) {
  const rawTemplate = (portfolio.design?.template || "devport").toLowerCase().trim();
  const template =
    rawTemplate === "creative" || rawTemplate === "modern"
      ? "creative"
      : rawTemplate === "developer"
      ? "developer"
      : rawTemplate === "minimal" || rawTemplate === "executive"
      ? "minimal"
      : "devport";

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
      repoUrl: p.repoUrl || "",
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
      theme: portfolio.design?.theme || "dark",
      primaryColor: portfolio.design?.primaryColor || "#38bdf8",
      fontFamily: portfolio.design?.fontFamily || "Inter",
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
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(data.publication.seoTitle || data.title)}</title>
    <meta name="description" content="${escapeHtml(data.publication.seoDescription)}" />
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-[#090a16] text-neutral-100 antialiased selection:bg-cyan-500/30 selection:text-white">
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
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
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
import { DevPortTemplate } from "./components/templates/DevPortTemplate.jsx";
import { ModernCreativeTemplate } from "./components/templates/ModernCreativeTemplate.jsx";
import { DeveloperTemplate } from "./components/templates/DeveloperTemplate.jsx";
import { MinimalTemplate } from "./components/templates/MinimalTemplate.jsx";

const TEMPLATE_MAP = {
  devport: DevPortTemplate,
  creative: ModernCreativeTemplate,
  developer: DeveloperTemplate,
  minimal: MinimalTemplate,
};

export default function App() {
  const templateKey = (portfolioData?.design?.template || "${selectedTemplate}").toLowerCase();
  const SelectedTemplate = TEMPLATE_MAP[templateKey] || DevPortTemplate;

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
  if (template === "creative") {
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
  if (template === "creative") {
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
  const staticJs = generateDevPortStaticJs(data, template);
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="devport-theme">
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
  return `/* DevPort Cosmic Theme Stylesheet */
:root {
  --bg-dark: #090a16;
  --bg-card: rgba(255, 255, 255, 0.03);
  --border-glass: rgba(255, 255, 255, 0.1);
  --text-white: #ffffff;
  --text-muted: #94a3b8;
  --cyan-accent: #06b6d4;
  --pink-accent: #ec4899;
  --purple-accent: #a855f7;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Modern 3D Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="stylesheet" href="assets/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
</head>
<body class="creative-theme">
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
  return `
:root {
  --bg-dark: #0b0f19;
  --purple: #9333ea;
  --indigo: #6366f1;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body.creative-theme {
  background: var(--bg-dark);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  position: relative;
  overflow-x: hidden;
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Terminal Portfolio")}</title>
  <link rel="stylesheet" href="assets/style.css">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body class="terminal-theme">
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

function generateDeveloperStaticCss() {
  return `
body.terminal-theme { background: #0d1117; color: #c9d1d9; font-family: 'JetBrains Mono', monospace; padding: 24px; line-height: 1.6; }
.terminal-container { max-width: 800px; margin: 40px auto; background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
.terminal-bar { border-bottom: 1px solid #30363d; padding-bottom: 12px; margin-bottom: 20px; color: #58a6ff; font-weight: 700; }
.prompt-line { color: #7ee787; font-size: 13px; margin: 20px 0 8px; }
.term-name { font-size: 32px; color: #fff; margin-bottom: 6px; }
.term-role { color: #58a6ff; font-size: 15px; margin-bottom: 10px; }
.term-bio { color: #8b949e; font-size: 13px; }
.term-skills { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 8px; }
.term-skill-tag { background: #21262d; border: 1px solid #30363d; padding: 3px 8px; border-radius: 4px; font-size: 12px; color: #7ee787; }
.term-proj-box { background: #0d1117; border: 1px solid #30363d; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
.term-proj-title { color: #58a6ff; font-weight: 600; }
.term-proj-desc { color: #8b949e; font-size: 12px; margin: 4px 0 8px; }
.term-link { color: #7ee787; text-decoration: none; font-size: 12px; }
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || fullName + " - Portfolio")}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="stylesheet" href="assets/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="minimal-theme">
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

function generateMinimalStaticCss() {
  return `
body.minimal-theme { background: #fafafa; color: #171717; font-family: 'Inter', sans-serif; padding: 48px 24px; line-height: 1.7; }
.minimal-wrap { max-width: 680px; margin: 0 auto; }
.min-avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.min-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e5e5; }
.min-name { font-size: 32px; font-weight: 600; letter-spacing: -0.02em; }
.min-role { color: #525252; font-size: 15px; }
.min-bio { color: #404040; font-size: 14px; margin: 16px 0; }
.min-socials { display: flex; gap: 12px; margin-bottom: 32px; }
.min-social-link { font-size: 13px; color: #171717; text-decoration: underline; }
.min-section { margin-top: 40px; }
.min-heading { font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #a3a3a3; margin-bottom: 20px; }
.min-skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
.min-skill-tag { background: #f0f0f0; border: 1px solid #e0e0e0; padding: 4px 10px; border-radius: 6px; font-size: 12px; color: #333; }
.min-item { border-bottom: 1px solid #e5e5e5; padding-bottom: 16px; margin-bottom: 20px; }
.min-item-header { display: flex; justify-content: space-between; align-items: baseline; }
.min-item-title { font-size: 16px; font-weight: 600; }
.min-company { font-weight: 400; color: #737373; font-size: 14px; }
.min-date { font-size: 12px; color: #888; }
.min-item-links { display: flex; gap: 10px; }
.min-item-desc { font-size: 13px; color: #525252; margin: 6px 0 8px; }
.min-tags { display: flex; gap: 6px; margin-top: 6px; }
.min-tag { font-size: 11px; color: #888; background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
.min-link { color: #171717; font-size: 12px; text-decoration: underline; }
.min-footer { margin-top: 60px; font-size: 12px; color: #a3a3a3; text-align: center; }
`;
}

/* ==========================================================================
   REACT SOURCE CODE TEMPLATE JSX BUILDERS
   ========================================================================== */

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
  const [activeSection, setActiveSection] = useState("hero");

  const fullName = profile.fullName || "Developer";
  const headline = profile.headline || "Full Stack Engineer & Creative Developer";
  const bio = profile.bio || "Crafting high-performance web experiences and scalable cloud applications with modern architecture.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl);
  const initials = (fullName || "DV").split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const roles = useMemo(() => {
    if (!headline) return ["Creative Developer", "Tech Enthusiast", "Full Stack Engineer"];
    const parts = headline.split(/[,|•&/]/).map(s => s.trim()).filter(Boolean);
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
          setCurrentRoleIndex(prev => (prev + 1) % roles.length);
        }
      }
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentRoleIndex, roles]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 76;
    const pos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: pos, behavior: "smooth" });
    setActiveSection(id);
  };

  const projectCount = projects.length > 0 ? \`\${projects.length}+\` : "20+";
  const experienceYears = useMemo(() => {
    if (experience.length === 0) return "4+";
    const yrs = Math.max(1, experience.length * 1.5);
    return \`\${Math.round(yrs)}+\`;
  }, [experience]);

  const topSkills = skills.slice(0, 6);
  const codeSnippetSkills = (skills.length > 0 ? skills.slice(0, 3).map(s => \`"\${s.name}"\`) : ['"React"', '"Node"', '"TypeScript"']).join(", ");

  return (
    <div className="relative min-h-screen bg-[#090a16] text-neutral-100 selection:bg-cyan-500/30 selection:text-white font-sans antialiased overflow-x-hidden scroll-smooth">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-[60%] left-[-10%] h-[550px] w-[550px] rounded-full bg-pink-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090a16]/80 border-b border-white/10 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <button type="button" onClick={() => scrollTo("hero")} className="flex items-center gap-3 group text-left">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="h-full w-full rounded-[10px] bg-[#090a16] flex items-center justify-center font-bold text-sm tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                {initials}
              </div>
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white group-hover:text-cyan-400 transition-colors">{fullName}</div>
              <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[200px]">{headline}</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-medium text-neutral-300">
            {["hero", "about", "skills", "projects", "experience", "education", "contact"].map(id => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className={\`px-3.5 py-1.5 rounded-full capitalize transition-all duration-200 \${activeSection === id ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold" : "hover:text-white hover:bg-white/5"}\`}
              >
                {id}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => scrollTo("contact")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all"
          >
            <span>Hire Me</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-24 py-8 sm:py-16">
        <section id="hero" className="pt-8 sm:pt-14 pb-12 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Available for opportunities & freelance work</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-mono text-neutral-400 uppercase tracking-widest">Hey there! I'm</p>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">{fullName}</h1>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center flex-wrap gap-2 text-white">
                <span>I'm a</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-pink-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">{displayText}</span>
                <span className="inline-block w-0.5 h-6 sm:h-8 bg-cyan-400 animate-pulse" />
              </div>
              {bio && <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl font-light">{bio}</p>}
              {topSkills.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-mono text-neutral-400 mb-2.5 uppercase tracking-wider">Core Technologies</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {topSkills.map((s, idx) => (
                      <span key={s.name} className={\`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md \${TECH_PILL_COLORS[idx % TECH_PILL_COLORS.length]}\`}>{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <button type="button" onClick={() => scrollTo("projects")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-105 transition-all">
                  <span>View My Work</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => scrollTo("contact")} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  <span>Let's Talk</span>
                </button>
                {profile.location && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400 pl-2">
                    <MapPin className="h-3.5 w-3.5 text-pink-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
              {socialLinks.length > 0 && (
                <div className="pt-3 flex items-center gap-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Connect:</span>
                  <div className="flex items-center gap-2">
                    {socialLinks.map((l, idx) => (
                      <SafeLink key={idx} href={l.url} className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-all hover:scale-110">
                        <BrandIcon name={l.platform} size={15} />
                      </SafeLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative w-[300px] sm:w-[360px] h-[340px] sm:h-[400px] flex items-center justify-center">
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 opacity-25 blur-2xl animate-pulse" />
                <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 border-2 border-[#090a16] flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-400 font-mono font-bold text-4xl">{initials}</div>
                    )}
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-[#090a16] animate-bounce">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div className="absolute top-1/3 -right-2 h-7 w-7 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border-2 border-[#090a16]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-[#090a16]">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div className="absolute top-1/3 -left-2 h-7 w-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg border-2 border-[#090a16]">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="absolute -top-4 -right-2 sm:-right-6 z-20 w-48 sm:w-56 p-3 rounded-xl border border-white/15 bg-neutral-900/90 backdrop-blur-xl shadow-2xl text-[10px] font-mono leading-relaxed">
                  <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-neutral-400 ml-1">developer.js</span>
                  </div>
                  <div className="text-neutral-300 space-y-0.5">
                    <p className="text-pink-400">const <span className="text-white">developer</span> = &#123;</p>
                    <p className="pl-2">name: <span className="text-cyan-300">&quot;{fullName ? fullName.split(" ")[0] : "Dev"}&quot;</span>,</p>
                    <p className="pl-2 truncate">skills: <span className="text-amber-300">[{codeSnippetSkills}]</span>,</p>
                    <p className="pl-2">hardWorker: <span className="text-emerald-400">true</span></p>
                    <p className="text-pink-400">&#125;;</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 px-3.5 py-2.5 rounded-xl border border-white/15 bg-neutral-900/85 backdrop-blur-xl shadow-xl flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold font-mono text-white leading-none">{projectCount}</div>
                    <div className="text-[10px] text-neutral-400">Projects Done</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-2 sm:-right-4 z-20 px-3.5 py-2.5 rounded-xl border border-white/15 bg-neutral-900/85 backdrop-blur-xl shadow-xl flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold font-mono text-white leading-none">{experienceYears}</div>
                    <div className="text-[10px] text-neutral-400">Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {bio && (
          <section id="about" className="scroll-mt-20">
            <div className="p-6 sm:p-10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">// 01. About Me</h2>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">Passionate about turning vision into high-impact software</h3>
              <p className="text-neutral-300 text-base leading-relaxed">{bio}</p>
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section id="skills" className="scroll-mt-20 space-y-6">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-7 w-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Code2 className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-pink-400">// 02. Skills & Tech Stack</h2>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Tools, Frameworks & Core Competencies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {skills.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/40 backdrop-blur-md transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-white truncate">{s.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{s.category}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-pink-500" style={{ width: s.level === "expert" ? "95%" : s.level === "advanced" ? "85%" : "70%" }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section id="projects" className="scroll-mt-20 space-y-6">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <FileCode className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">// 03. Featured Engineering Projects</h2>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Selected Work & Case Studies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xl font-bold text-white">{p.title}</h4>
                      {p.featured && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">Featured</span>}
                    </div>
                    <p className="text-sm text-neutral-300 font-light">{p.description}</p>
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.tags.map(t => <span key={t} className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-neutral-300">#{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="pt-6 mt-4 border-t border-white/10 flex items-center gap-3">
                    {p.liveUrl && <SafeLink href={p.liveUrl} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">Live Demo &rarr;</SafeLink>}
                    {p.repoUrl && <SafeLink href={p.repoUrl} className="text-xs font-medium text-neutral-400 hover:text-white">Code Repository</SafeLink>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="scroll-mt-20">
          <div className="p-8 sm:p-12 rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent backdrop-blur-2xl shadow-2xl text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">Let's build something extraordinary together</h2>
            <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto font-light">Interested in collaborating or hiring? Reach out anytime!</p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {profile.email && (
                <SafeLink href={\`mailto:\${profile.email}\`} className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  <span>Send an Email</span>
                </SafeLink>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10 bg-[#090a16]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>&copy; {new Date().getFullYear()} {fullName}. Built with modern standards & DevPort.</span>
          <button type="button" onClick={() => scrollTo("hero")} className="text-cyan-400 hover:text-white">^top</button>
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
  const { profile = {}, socialLinks = [], skills = [], projects = [] } = portfolio;
  const fullName = profile.fullName || "Creative Engineer";
  const firstName = fullName ? fullName.split(" ")[0] : "Creative";
  const headline = profile.headline || "Data Analyst & Creative Engineer";
  const bio = profile.bio || "Data Analyst with extensive experience transforming raw data into actionable insights.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 76;
    const pos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: pos, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-neutral-100 font-sans antialiased overflow-x-hidden">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/85 border-b border-white/5 h-18 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <span className="font-bold text-lg text-white">{firstName}</span>
          <nav className="flex gap-6 text-sm text-neutral-400">
            <button onClick={() => scrollTo("hero")} className="hover:text-white">Home</button>
            <button onClick={() => scrollTo("projects")} className="hover:text-white">Projects</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-white">Contact</button>
          </nav>
          <button onClick={() => scrollTo("contact")} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.35)]">Hire Me</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        <section id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase border border-purple-500/25 bg-purple-500/10 text-purple-300">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Welcome to my portfolio</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white">Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">{fullName}</span></h1>
            <p className="text-xl text-purple-400 font-semibold">{headline}</p>
            <p className="text-neutral-300 text-base max-w-xl">{bio}</p>
            <div className="flex gap-4">
              <button onClick={() => scrollTo("projects")} className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]">Explore My Work &rarr;</button>
              <button onClick={() => scrollTo("contact")} className="px-6 py-3 rounded-xl text-sm font-medium border border-white/15 text-white">Contact Me</button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 rounded-full p-2 bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 shadow-[0_0_50px_rgba(147,51,234,0.5)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-indigo-950 flex items-center justify-center">
                {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-white">{fullName[0]}</span>}
              </div>
            </div>
          </div>
        </section>

        {projects.length > 0 && (
          <section id="projects" className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <h3 className="font-bold text-lg text-white">{p.title}</h3>
                  <p className="text-sm text-neutral-300">{p.description}</p>
                  {p.liveUrl && <SafeLink href={p.liveUrl} className="text-sm font-semibold text-purple-400 hover:text-purple-300">Explore Project &rarr;</SafeLink>}
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
import { Terminal } from "lucide-react";
import { SafeLink } from "../common/SafeLink.jsx";

export function DeveloperTemplate({ portfolio = {} }) {
  const { profile = {}, skills = [], projects = [] } = portfolio;
  const fullName = profile.fullName || "Developer";

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-mono p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-[#30363d] pb-4 text-[#58a6ff] font-bold flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          <span>~/dev/{fullName.toLowerCase().replace(/\\s+/g, "")}</span>
        </div>
        <div className="space-y-2">
          <p className="text-[#7ee787] text-xs">$ whoami</p>
          <h1 className="text-4xl font-bold text-white">{fullName}</h1>
          <p className="text-[#58a6ff]">{profile.headline}</p>
          <p className="text-[#8b949e] text-sm pt-2">{profile.bio}</p>
        </div>
        {skills.length > 0 && (
          <div className="space-y-3">
            <p className="text-[#7ee787] text-xs">$ ls -la ./skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className="px-2 py-1 rounded bg-[#21262d] border border-[#30363d] text-xs text-[#7ee787]">{s.name}</span>
              ))}
            </div>
          </div>
        )}
        {projects.length > 0 && (
          <div className="space-y-4">
            <p className="text-[#7ee787] text-xs">$ cat ./projects.json</p>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((p, i) => (
                <div key={i} className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-2">
                  <h4 className="text-white font-bold">&gt; {p.title}</h4>
                  <p className="text-xs text-[#8b949e]">{p.description}</p>
                  {p.liveUrl && <SafeLink href={p.liveUrl} className="text-xs text-[#7ee787] underline">[Live Demo]</SafeLink>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function getFullMinimalTemplateJsx() {
  return `import React from "react";
import { SafeLink } from "../common/SafeLink.jsx";

export function MinimalTemplate({ portfolio = {} }) {
  const { profile = {}, projects = [] } = portfolio;
  const fullName = profile.fullName || "Portfolio";
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-sans p-8 sm:p-20">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-3">
          <h1 className="text-4xl font-light tracking-tight">{fullName}</h1>
          <p className="text-sm text-neutral-500">{profile.headline}</p>
          <p className="text-sm text-neutral-700 leading-relaxed pt-2">{profile.bio}</p>
        </header>
        {projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Selected Projects</h2>
            <div className="space-y-6">
              {projects.map((p, i) => (
                <div key={i} className="border-b border-neutral-200 pb-4">
                  <h3 className="font-medium text-base">{p.title}</h3>
                  <p className="text-xs text-neutral-600 mt-1">{p.description}</p>
                  {p.liveUrl && <SafeLink href={p.liveUrl} className="text-xs text-neutral-900 underline mt-2 inline-block">Visit &rarr;</SafeLink>}
                </div>
              ))}
            </div>
          </section>
        )}
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
  return `# ${data.title} - React Source Code

This is a standalone, production-ready portfolio website built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Lucide Icons**.

## 🚀 Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

## 📦 Production Build
\`\`\`bash
npm run build
\`\`\`
The output will be in \`dist/\`.

## 🌐 Deploy to Vercel / Netlify
1. Connect this repository on Vercel or Netlify.
2. Build command: \`npm run build\`
3. Output directory: \`dist\`
`;
}

function getStaticReadme(data) {
  return `# ${data.title} - Static Website Bundle

This archive contains your self-contained, production-ready portfolio website.

## 🚀 Instant Local Preview
Simply double-click \`index.html\` to open your website directly in any web browser!

## 🌐 Free Hosting Deployment
- **Netlify Drop**: Drag and drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages**: Upload this folder to your repository and enable Pages in Settings.
`;
}

function getLicenseText(data) {
  return `MIT License
Copyright (c) ${new Date().getFullYear()} ${data.profile?.fullName || "Developer"}
`;
}
