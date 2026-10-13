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
 * Strips internal server hosts if relative, keeping valid remote or direct links.
 */
function normalizeExportAvatar(url) {
  if (!url) return "";
  const trimmed = url.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return "";

  // Convert Google Drive share links to direct uc export links
  const gdrive = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdrive) {
    return `https://drive.google.com/uc?export=view&id=${gdrive[1]}`;
  }
  // Convert Dropbox share links to raw direct links
  if (trimmed.includes("dropbox.com") && trimmed.includes("dl=0")) {
    return trimmed.replace("dl=0", "raw=1");
  }
  return sanitizeUrl(trimmed) || trimmed;
}

/**
 * Sanitizes portfolio data to exclude private DB metadata, user passwords, or internal IDs.
 */
export function sanitizePortfolioData(portfolio) {
  const template = (portfolio.design?.template || "devport").toLowerCase();
  const normalizedTemplate = ["devport", "creative", "developer", "minimal"].includes(template)
    ? template
    : template === "modern"
    ? "creative"
    : template === "executive"
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
      template: normalizedTemplate,
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
 * Initializes an archiver stream directed to the Express response.
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

/**
 * Generates and streams a full React + Vite project archive.
 */
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
  <body class="bg-neutral-950 text-neutral-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SelectedTemplate portfolio={portfolioData} />
    </div>
  );
}
`;
  archive.append(appJsx, { name: "src/App.jsx" });

  // 8. src/components/common/BrandIcon.jsx
  const brandIconJsx = `import React from "react";
import { ExternalLink, Globe, Mail, MapPin, Phone } from "lucide-react";

export function BrandIcon({ name, size = 16, className = "" }) {
  const norm = (name || "").toLowerCase().trim();

  const svgProps = {
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    fill: "currentColor",
    viewBox: "0 0 24 24",
  };

  if (norm.includes("github")) {
    return (
      <svg {...svgProps}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
        />
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

  if (norm.includes("website") || norm.includes("portfolio")) {
    return <Globe className={className} style={{ width: size, height: size }} />;
  }
  if (norm.includes("mail")) {
    return <Mail className={className} style={{ width: size, height: size }} />;
  }
  if (norm.includes("phone")) {
    return <Phone className={className} style={{ width: size, height: size }} />;
  }
  if (norm.includes("location")) {
    return <MapPin className={className} style={{ width: size, height: size }} />;
  }

  return <ExternalLink className={className} style={{ width: size, height: size }} />;
}
`;
  archive.append(brandIconJsx, { name: "src/components/common/BrandIcon.jsx" });

  // 9. src/components/common/SafeLink.jsx
  const safeLinkJsx = `import React from "react";
import { sanitizeExternalUrl } from "./urlUtils.js";

export function SafeLink({ href, className = "", children, onClick, ...rest }) {
  const safeHref = sanitizeExternalUrl(href);

  if (!safeHref) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </a>
  );
}
`;
  archive.append(safeLinkJsx, { name: "src/components/common/SafeLink.jsx" });

  // 10. src/components/common/urlUtils.js
  const urlUtilsJs = `export function sanitizeExternalUrl(url) {
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
    return null;
  } catch {
    return null;
  }
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
  archive.append(urlUtilsJs, { name: "src/components/common/urlUtils.js" });

  // 11. src/components/templates/DevPortTemplate.jsx
  const devPortTemplateJsx = getDevPortTemplateJsx();
  archive.append(devPortTemplateJsx, { name: "src/components/templates/DevPortTemplate.jsx" });

  // 12. src/components/templates/ModernCreativeTemplate.jsx
  const modernCreativeTemplateJsx = getModernCreativeTemplateJsx();
  archive.append(modernCreativeTemplateJsx, { name: "src/components/templates/ModernCreativeTemplate.jsx" });

  // 13. src/components/templates/DeveloperTemplate.jsx
  const developerTemplateJsx = getDeveloperTemplateJsx();
  archive.append(developerTemplateJsx, { name: "src/components/templates/DeveloperTemplate.jsx" });

  // 14. src/components/templates/MinimalTemplate.jsx
  const minimalTemplateJsx = getMinimalTemplateJsx();
  archive.append(minimalTemplateJsx, { name: "src/components/templates/MinimalTemplate.jsx" });

  // 15. src/components/sections/
  archive.append(getHeroSectionJsx(), { name: "src/components/sections/HeroSection.jsx" });
  archive.append(getAboutSectionJsx(), { name: "src/components/sections/AboutSection.jsx" });
  archive.append(getSkillsSectionJsx(), { name: "src/components/sections/SkillsSection.jsx" });
  archive.append(getProjectsSectionJsx(), { name: "src/components/sections/ProjectsSection.jsx" });
  archive.append(getExperienceSectionJsx(), { name: "src/components/sections/ExperienceSection.jsx" });
  archive.append(getEducationSectionJsx(), { name: "src/components/sections/EducationSection.jsx" });
  archive.append(getCertificationsSectionJsx(), { name: "src/components/sections/CertificationsSection.jsx" });
  archive.append(getContactSectionJsx(), { name: "src/components/sections/ContactSection.jsx" });

  // 16. README.md
  const readme = `# ${data.title} - React Source Code

This is a standalone, production-ready portfolio website built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Lucide Icons**.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **npm** (or yarn / pnpm)

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Local Development
Run the local dev server with hot module replacement:
\`\`\`bash
npm run dev
\`\`\`
Open the URL shown in your terminal (usually \`http://localhost:5173\`) in your browser.

### 4. Production Build
Compile and bundle the project for production:
\`\`\`bash
npm run build
\`\`\`
The static output will be generated inside the \`dist/\` folder.

You can preview the production build locally:
\`\`\`bash
npm run preview
\`\`\`

---

## 🎨 Customization

- **Portfolio Content**: All your career details, projects, skills, and settings are saved in \`src/portfolioData.json\`. Edit this file to update any information.
- **Templates**: Switch templates in \`src/App.jsx\` or update \`design.template\` in \`portfolioData.json\`:
  - \`devport\`: Cosmic dark aesthetic with orbital avatar, terminal card, and tech badges.
  - \`creative\`: Midnight indigo gradient, 3D spotlight avatar, floating stat badge.
  - \`developer\`: Clean developer terminal style with bash commands and tech stack cards.
  - \`minimal\`: Refined typography and quiet elegance.
- **Styling**: Styles are customized using Tailwind CSS v4 in \`src/index.css\`.

---

## 🌐 Deployment Instructions

### Deploy to Vercel
1. Install Vercel CLI: \`npm i -g vercel\`
2. Run \`vercel\` in this folder and follow the prompts.
3. Or push this code to GitHub and import it on [vercel.com](https://vercel.com).
   - Framework Preset: **Vite**
   - Build Command: \`npm run build\`
   - Output Directory: \`dist\`

### Deploy to Netlify
1. Build the static assets: \`npm run build\`
2. Drag and drop the \`dist/\` folder to [Netlify Drop](https://app.netlify.com/drop).
3. Or connect your GitHub repository on Netlify.

### Deploy to GitHub Pages
1. In \`vite.config.js\`, set \`base: '/<repository-name>/'\`.
2. Build the app: \`npm run build\`
3. Push the contents of \`dist/\` to the \`gh-pages\` branch or use the GitHub Pages GitHub Action.

---

## 📄 License
This project is licensed under the MIT License.
`;
  archive.append(readme, { name: "README.md" });

  // 17. LICENSE
  const license = `MIT License

Copyright (c) ${new Date().getFullYear()} ${data.profile?.fullName || "Developer"}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
  archive.append(license, { name: "LICENSE" });

  await archive.finalize();
}

/* ==========================================================================
   STATIC WEBSITE ARCHIVE GENERATOR
   ========================================================================== */

/**
 * Generates and streams a 100% self-contained static website archive.
 */
export async function exportPortfolioAsStaticZip(rawPortfolio, res) {
  const data = sanitizePortfolioData(rawPortfolio);
  const filename = getExportFilename(data, "static");
  const archive = createArchive(res, filename);

  const template = data.design.template;

  // 1. Generate Static HTML
  const staticHtml = generateStaticHtml(data, template);
  archive.append(staticHtml, { name: "index.html" });

  // 2. Generate Static CSS
  const staticCss = generateStaticCss(data, template);
  archive.append(staticCss, { name: "assets/style.css" });

  // 3. Generate Static Vanilla JS
  const staticJs = generateStaticJs(data, template);
  archive.append(staticJs, { name: "assets/script.js" });

  // 4. README.md
  const readme = `# ${data.title} - Static Website Bundle

This archive contains your self-contained, production-ready portfolio website.

## 🚀 Instant Local Preview
Simply double-click \`index.html\` to open your website directly in any web browser!
No Node.js, no build tools, and no server configuration required.

You can also run a quick local HTTP server:
\`\`\`bash
# Using Python
python -m http.server 8000

# Or using npx
npx serve .
\`\`\`

---

## 🌐 Free Hosting Deployment Options

### 1. Netlify Drop (Easiest - 10 Seconds)
1. Visit [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the extracted folder containing \`index.html\`, \`assets/\`, and this README.
3. Your website goes live immediately with a free HTTPS URL and custom domain support!

### 2. GitHub Pages (Free forever)
1. Create a new GitHub repository named \`<your-username>.github.io\` (or any repository name).
2. Upload the files in this folder (\`index.html\`, \`assets/\`) to the root of the \`main\` branch.
3. Go to **Settings** > **Pages** > Select branch **main** > Click **Save**.
4. Your site will be live at \`https://<your-username>.github.io\`!

### 3. Vercel
1. Install Vercel CLI: \`npm i -g vercel\`
2. Run \`vercel deploy --prod .\`
3. Your site is deployed instantly on Vercel's global CDN.

### 4. Cloudflare Pages
1. Log in to Cloudflare Dashboard > **Workers & Pages** > **Create application** > **Pages**.
2. Upload this folder directly using Direct Upload.
3. Enjoy ultra-fast edge delivery and free SSL.

---

## 🔒 Security & Privacy Notice
- **100% Offline Compatible**: This website runs completely without contacting any backend API.
- **Zero Secrets**: No API keys, credentials, or private database IDs are contained in this build.
- **Lightweight & Fast**: Pure vanilla HTML, CSS, and modern JavaScript for blazing 100/100 Lighthouse performance.
`;
  archive.append(readme, { name: "README.md" });

  await archive.finalize();
}

/* ==========================================================================
   STATIC HTML GENERATION HELPER
   ========================================================================== */

function generateStaticHtml(data, template) {
  const { profile, socialLinks, skills, experience, education, projects, certifications, design } = data;
  const fullName = profile.fullName || "Developer";
  const headline = profile.headline || "Full Stack Developer";
  const bio = profile.bio || "";
  const avatarUrl = profile.avatarUrl;
  const primaryColor = design.primaryColor || "#38bdf8";

  const initials = (fullName || "DV")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Social Links HTML
  const socialIconsHtml = socialLinks
    .map((s) => {
      const url = sanitizeUrl(s.url);
      if (!url) return "";
      const label = escapeHtml(s.label || s.platform || "Link");
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="social-btn" title="${label}">${label}</a>`;
    })
    .join("\n");

  // Skills grouped or listed
  const skillsHtml = skills
    .map((s) => {
      return `<div class="skill-pill"><span class="skill-name">${escapeHtml(s.name)}</span>${s.level ? `<span class="skill-lvl">${escapeHtml(s.level)}</span>` : ""}</div>`;
    })
    .join("\n");

  // Projects HTML
  const projectsHtml = projects
    .map((p) => {
      const liveUrl = sanitizeUrl(p.liveUrl);
      const repoUrl = sanitizeUrl(p.repoUrl);
      const tagsHtml = (p.tags || [])
        .map((t) => `<span class="tag-badge">${escapeHtml(t)}</span>`)
        .join("");

      return `
        <div class="project-card ${p.featured ? "featured-card" : ""}">
          <div class="project-header">
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            ${p.featured ? `<span class="featured-pill">Featured</span>` : ""}
          </div>
          <p class="project-desc">${escapeHtml(p.description)}</p>
          ${tagsHtml ? `<div class="project-tags">${tagsHtml}</div>` : ""}
          <div class="project-actions">
            ${liveUrl ? `<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Live Demo &rarr;</a>` : ""}
            ${repoUrl ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Source Code</a>` : ""}
          </div>
        </div>
      `;
    })
    .join("\n");

  // Experience HTML
  const experienceHtml = experience
    .map((exp) => {
      const highlightsHtml = (exp.highlights || [])
        .map((h) => `<li>${escapeHtml(h)}</li>`)
        .join("");

      return `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div>
                <h4 class="timeline-role">${escapeHtml(exp.title)}</h4>
                <div class="timeline-company">${escapeHtml(exp.company)} ${exp.location ? `&bull; ${escapeHtml(exp.location)}` : ""}</div>
              </div>
              <span class="timeline-date">${escapeHtml(exp.startDate || "")} ${exp.endDate ? `&ndash; ${escapeHtml(exp.endDate)}` : exp.current ? "&ndash; Present" : ""}</span>
            </div>
            ${exp.description ? `<p class="timeline-desc">${escapeHtml(exp.description)}</p>` : ""}
            ${highlightsHtml ? `<ul class="timeline-bullets">${highlightsHtml}</ul>` : ""}
          </div>
        </div>
      `;
    })
    .join("\n");

  // Education HTML
  const educationHtml = education
    .map((ed) => {
      return `
        <div class="edu-card">
          <div class="edu-header">
            <h4 class="edu-degree">${escapeHtml(ed.degree)} ${ed.fieldOfStudy ? `in ${escapeHtml(ed.fieldOfStudy)}` : ""}</h4>
            <span class="edu-date">${escapeHtml(ed.startDate || "")} ${ed.endDate ? `&ndash; ${escapeHtml(ed.endDate)}` : ""}</span>
          </div>
          <div class="edu-institution">${escapeHtml(ed.institution)}</div>
          ${ed.grade ? `<div class="edu-grade">Grade: ${escapeHtml(ed.grade)}</div>` : ""}
        </div>
      `;
    })
    .join("\n");

  // Certifications HTML
  const certsHtml = certifications
    .map((c) => {
      const url = sanitizeUrl(c.url);
      return `
        <div class="cert-card">
          <div class="cert-info">
            <h4 class="cert-name">${escapeHtml(c.name)}</h4>
            <div class="cert-issuer">${escapeHtml(c.issuer)} ${c.issueDate ? `&bull; ${escapeHtml(c.issueDate)}` : ""}</div>
          </div>
          ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs">Verify</a>` : ""}
        </div>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en" data-template="${template}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.publication.seoTitle || data.title)}</title>
  <meta name="description" content="${escapeHtml(data.publication.seoDescription)}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css">
  <style>
    :root {
      --primary-color: ${primaryColor};
    }
  </style>
</head>
<body class="theme-${template}">
  <!-- Top Navigation Header -->
  <header class="navbar" id="top-navbar">
    <div class="nav-container">
      <a href="#hero" class="brand-logo">
        ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" class="brand-avatar">` : `<span class="brand-initials">${escapeHtml(initials)}</span>`}
        <span class="brand-name">${escapeHtml(fullName)}</span>
      </a>
      <nav class="nav-links">
        <a href="#about" class="nav-link">About</a>
        ${skills.length ? `<a href="#skills" class="nav-link">Skills</a>` : ""}
        ${projects.length ? `<a href="#projects" class="nav-link">Projects</a>` : ""}
        ${experience.length ? `<a href="#experience" class="nav-link">Experience</a>` : ""}
        ${education.length ? `<a href="#education" class="nav-link">Education</a>` : ""}
        ${certifications.length ? `<a href="#certifications" class="nav-link">Certifications</a>` : ""}
        <a href="#contact" class="nav-link nav-link-cta">Contact</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="section hero-section" id="hero">
    <div class="hero-container">
      <div class="hero-content">
        <div class="status-badge">
          <span class="status-dot"></span> Available for Opportunities
        </div>
        <h1 class="hero-name">${escapeHtml(fullName)}</h1>
        <h2 class="hero-headline" id="typewriter-headline" data-headline="${escapeHtml(headline)}">${escapeHtml(headline)}</h2>
        <p class="hero-bio">${escapeHtml(bio)}</p>

        <div class="hero-actions">
          ${profile.email ? `<a href="mailto:${escapeHtml(profile.email)}" class="btn btn-primary">Get in Touch &rarr;</a>` : ""}
          ${projects.length ? `<a href="#projects" class="btn btn-outline">View Projects</a>` : ""}
        </div>

        ${socialIconsHtml ? `<div class="hero-socials">${socialIconsHtml}</div>` : ""}
      </div>

      <div class="hero-visual">
        <div class="avatar-orbit-card">
          <div class="avatar-glow"></div>
          ${avatarUrl ? `
            <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName)}" class="orbit-avatar-img">
          ` : `
            <div class="orbit-avatar-placeholder">${escapeHtml(initials)}</div>
          `}
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section class="section" id="about">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">OVERVIEW</span>
        <h2 class="section-title">About Me</h2>
      </div>
      <div class="about-card">
        <p class="about-text">${escapeHtml(bio || headline)}</p>
        <div class="about-meta">
          ${profile.location ? `<div class="meta-item"><span class="meta-label">Location:</span> <span>${escapeHtml(profile.location)}</span></div>` : ""}
          ${profile.email ? `<div class="meta-item"><span class="meta-label">Email:</span> <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></div>` : ""}
          ${profile.phone ? `<div class="meta-item"><span class="meta-label">Phone:</span> <span>${escapeHtml(profile.phone)}</span></div>` : ""}
        </div>
      </div>
    </div>
  </section>

  <!-- Skills Section -->
  ${skills.length ? `
  <section class="section" id="skills">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">CAPABILITIES</span>
        <h2 class="section-title">Technical Skills & Expertise</h2>
      </div>
      <div class="skills-grid">
        ${skillsHtml}
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Projects Section -->
  ${projects.length ? `
  <section class="section" id="projects">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">PORTFOLIO</span>
        <h2 class="section-title">Featured Projects</h2>
      </div>
      <div class="projects-grid">
        ${projectsHtml}
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Experience Section -->
  ${experience.length ? `
  <section class="section" id="experience">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">CAREER JOURNEY</span>
        <h2 class="section-title">Work Experience</h2>
      </div>
      <div class="timeline">
        ${experienceHtml}
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Education & Certifications -->
  ${(education.length || certifications.length) ? `
  <section class="section" id="education">
    <div class="container">
      <div class="grid-2-col">
        ${education.length ? `
        <div>
          <div class="section-header">
            <span class="section-tag">ACADEMICS</span>
            <h2 class="section-title">Education</h2>
          </div>
          <div class="edu-list">
            ${educationHtml}
          </div>
        </div>
        ` : ""}

        ${certifications.length ? `
        <div id="certifications">
          <div class="section-header">
            <span class="section-tag">CREDENTIALS</span>
            <h2 class="section-title">Certifications</h2>
          </div>
          <div class="certs-list">
            ${certsHtml}
          </div>
        </div>
        ` : ""}
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Contact Section -->
  <section class="section contact-section" id="contact">
    <div class="container">
      <div class="contact-box">
        <span class="section-tag">CONNECT</span>
        <h2 class="contact-title">Let's Build Something Great Together</h2>
        <p class="contact-desc">Feel free to reach out for collaborations, project opportunities, or a friendly hello.</p>
        
        <div class="contact-details">
          ${profile.email ? `
            <a href="mailto:${escapeHtml(profile.email)}" class="btn btn-primary btn-lg">Email Me: ${escapeHtml(profile.email)}</a>
          ` : ""}
          ${profile.phone ? `<div class="contact-phone">Phone: ${escapeHtml(profile.phone)}</div>` : ""}
        </div>

        ${socialIconsHtml ? `<div class="contact-socials">${socialIconsHtml}</div>` : ""}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(fullName)}. All rights reserved.</p>
      <button type="button" class="back-to-top" id="backToTopBtn">&uarr; Top</button>
    </div>
  </footer>

  <script src="assets/script.js"></script>
</body>
</html>
`;
}

/* ==========================================================================
   STATIC CSS GENERATION HELPER
   ========================================================================== */

function generateStaticCss(data, template) {
  return `/* Standalone Portfolio Stylesheet */
:root {
  --bg-color: #090d16;
  --bg-card: #0f172a;
  --bg-card-hover: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(56, 189, 248, 0.5);
  --primary-color: #38bdf8;
  --primary-glow: rgba(56, 189, 248, 0.25);
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
  background-color: var(--bg-color);
  color: var(--text-main);
  line-height: 1.6;
}

body {
  overflow-x: hidden;
  min-height: 100vh;
}

/* Navigation */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 76px;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.nav-container {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-main);
}

.brand-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-color);
}

.brand-initials {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #818cf8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.brand-name {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
}

.nav-link-cta {
  padding: 6px 16px;
  border-radius: 20px;
  background: var(--primary-glow);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

/* Sections & Layout */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
}

.section {
  padding: 96px 0;
}

.section-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 32px;
}

/* Hero */
.hero-section {
  padding: 120px 0 80px;
  background: radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.08), transparent 60%);
}

.hero-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 48px;
  align-items: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  margin-bottom: 20px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.hero-name {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 40%, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-headline {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 16px;
  font-family: var(--font-mono);
}

.hero-bio {
  font-size: 16px;
  color: var(--text-muted);
  max-width: 580px;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.hero-socials {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Avatar Card */
.avatar-orbit-card {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
  filter: blur(24px);
  z-index: 1;
}

.orbit-avatar-img {
  position: relative;
  z-index: 2;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.orbit-avatar-placeholder {
  position: relative;
  z-index: 2;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 4px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  font-weight: 800;
  color: #fff;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--primary-color);
  color: #090d16;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-outline {
  border-color: var(--border-color);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-main);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--text-muted);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-xs {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 4px;
}

.social-btn {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-family: var(--font-mono);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* About Card */
.about-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
}

.about-text {
  font-size: 16px;
  color: var(--text-main);
  line-height: 1.8;
  margin-bottom: 24px;
}

.about-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.meta-item {
  font-size: 14px;
}

.meta-label {
  color: var(--text-muted);
  margin-right: 6px;
}

.about-meta a {
  color: var(--primary-color);
  text-decoration: none;
}

/* Skills Grid */
.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.skill-pill:hover {
  border-color: var(--primary-color);
  background: var(--bg-card-hover);
  transform: translateY(-2px);
}

.skill-lvl {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--primary-color);
  text-transform: uppercase;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.project-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.featured-card {
  border-color: rgba(56, 189, 248, 0.35);
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, var(--bg-card) 40%);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-title {
  font-size: 18px;
  font-weight: 700;
}

.featured-pill {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--primary-glow);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.project-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.tag-badge {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: var(--text-muted);
}

.project-actions {
  display: flex;
  gap: 12px;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 24px;
  border-left: 2px solid var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
}

.timeline-dot {
  position: absolute;
  left: -31px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
  box-shadow: 0 0 10px var(--primary-color);
}

.timeline-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.timeline-role {
  font-size: 18px;
  font-weight: 700;
}

.timeline-company {
  font-size: 14px;
  color: var(--primary-color);
}

.timeline-date {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.timeline-desc {
  font-size: 14px;
  color: var(--text-main);
  margin-bottom: 12px;
}

.timeline-bullets {
  padding-left: 20px;
  font-size: 14px;
  color: var(--text-muted);
}

.timeline-bullets li {
  margin-bottom: 6px;
}

/* Education & Certs */
.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.edu-card, .cert-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.edu-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.edu-degree {
  font-size: 16px;
  font-weight: 700;
}

.edu-date {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.edu-institution {
  font-size: 14px;
  color: var(--primary-color);
}

.edu-grade {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.cert-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cert-name {
  font-size: 15px;
  font-weight: 700;
}

.cert-issuer {
  font-size: 13px;
  color: var(--text-muted);
}

/* Contact */
.contact-section {
  text-align: center;
}

.contact-box {
  background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.1), var(--bg-card) 60%);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 64px 24px;
  max-width: 800px;
  margin: 0 auto;
}

.contact-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
}

.contact-desc {
  font-size: 16px;
  color: var(--text-muted);
  max-width: 500px;
  margin: 0 auto 32px;
}

.contact-details {
  margin-bottom: 32px;
}

.contact-phone {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-muted);
}

.contact-socials {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Footer */
.footer {
  border-top: 1px solid var(--border-color);
  padding: 32px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-to-top {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.2s ease;
}

.back-to-top:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-name {
    font-size: 38px;
  }
  .hero-bio {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-socials {
    justify-content: center;
  }
  .grid-2-col {
    grid-template-columns: 1fr;
  }
  .nav-links {
    display: none;
  }
}
`;
}

/* ==========================================================================
   STATIC JAVASCRIPT GENERATION HELPER
   ========================================================================== */

function generateStaticJs(data, template) {
  return `// Self-contained vanilla script for portfolio interactions
(function() {
  'use strict';

  // 1. Smooth scroll with 76px sticky navbar offset
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

  // 2. Back to top button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 3. Scrollspy active nav links
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // 4. Subtle typewriter headline effect (if available)
  const typewriter = document.getElementById('typewriter-headline');
  if (typewriter && typewriter.getAttribute('data-headline')) {
    const originalText = typewriter.getAttribute('data-headline');
    // Keep clean rendered text by default
  }
})();
`;
}

/* ==========================================================================
   TEMPLATE JSX GENERATOR HELPERS (FOR REACT SOURCE ZIP)
   ========================================================================== */

function getDevPortTemplateJsx() {
  return `import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Award,
  Briefcase,
  Check,
  Code2,
  ExternalLink,
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
];

export function DevPortTemplate({ portfolio }) {
  const { profile = {}, socialLinks = [], skills = [], experience = [], education = [], projects = [], certifications = [] } = portfolio || {};
  const [activeSection, setActiveSection] = useState("hero");

  const fullName = profile.fullName || "Developer";
  const headline = profile.headline || "Full Stack Engineer & Creative Developer";
  const bio = profile.bio || "Crafting high-performance web experiences and scalable cloud applications.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl);
  const initials = (fullName || "DV").split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 76;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070b14] text-neutral-100 font-sans antialiased selection:bg-sky-500/30 selection:text-sky-200">
      {/* Sticky cosmic header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/85 border-b border-sky-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-3 text-left">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="h-9 w-9 rounded-full object-cover ring-2 ring-sky-400/50" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                {initials}
              </div>
            )}
            <span className="font-bold text-base tracking-tight text-white">{fullName}</span>
          </button>
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-neutral-400">
            <button onClick={() => scrollTo("about")} className="hover:text-sky-400 transition-colors">About</button>
            {skills.length > 0 && <button onClick={() => scrollTo("skills")} className="hover:text-sky-400 transition-colors">Skills</button>}
            {projects.length > 0 && <button onClick={() => scrollTo("projects")} className="hover:text-sky-400 transition-colors">Projects</button>}
            {experience.length > 0 && <button onClick={() => scrollTo("experience")} className="hover:text-sky-400 transition-colors">Experience</button>}
            <button onClick={() => scrollTo("contact")} className="px-3.5 py-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all">
              Contact
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for opportunities</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Hi, I'm <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">{fullName}</span>
            </h1>
            <p className="text-lg font-mono text-sky-400">{headline}</p>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-xl">{bio}</p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button onClick={() => scrollTo("contact")} className="px-6 py-3 rounded-lg text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 transition-all flex items-center gap-2">
                <span>Let's Connect</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              {projects.length > 0 && (
                <button onClick={() => scrollTo("projects")} className="px-6 py-3 rounded-lg text-sm font-semibold border border-white/10 hover:border-sky-400/40 text-neutral-300 hover:text-white transition-all">
                  View Projects
                </button>
              )}
            </div>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-4">
                {socialLinks.map((s, idx) => (
                  <SafeLink key={idx} href={s.url} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-sky-400/40 text-neutral-400 hover:text-sky-400 text-xs font-mono transition-all">
                    {s.label || s.platform}
                  </SafeLink>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500/20 to-purple-500/20 blur-2xl animate-pulse" />
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 rounded-full object-cover ring-4 ring-sky-400/40 shadow-2xl shadow-sky-500/20" />
              ) : (
                <div className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-sky-900 to-indigo-900 ring-4 ring-sky-400/40 flex items-center justify-center text-6xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      {skills.length > 0 && (
        <section id="skills" className="py-20 border-t border-sky-500/10 px-4 sm:px-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
            <Code2 className="text-sky-400" />
            <span>Tech Stack & Skills</span>
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((s, i) => (
              <div key={i} className={\`px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-all \${TECH_PILL_COLORS[i % TECH_PILL_COLORS.length]}\`}>
                {s.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section id="projects" className="py-20 border-t border-sky-500/10 px-4 sm:px-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
            <Sparkles className="text-sky-400" />
            <span>Featured Work</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl border border-sky-500/10 bg-white/[0.02] hover:border-sky-400/40 transition-all flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-4">{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {p.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  {p.liveUrl && <SafeLink href={p.liveUrl} className="text-xs font-semibold px-3 py-1.5 rounded bg-sky-500 text-black hover:bg-sky-400">Live Demo &rarr;</SafeLink>}
                  {p.repoUrl && <SafeLink href={p.repoUrl} className="text-xs font-semibold px-3 py-1.5 rounded border border-white/10 text-neutral-300 hover:text-white">Source</SafeLink>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-24 border-t border-sky-500/10 px-4 sm:px-6 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Let's Build Something Together</h2>
        <p className="text-neutral-400 text-sm mb-8">Have a project in mind, want to collaborate, or just want to say hi?</p>
        {profile.email && (
          <a href={\`mailto:\${profile.email}\`} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-neutral-950 font-semibold hover:bg-sky-400 transition-all">
            <Mail className="h-4 w-4" />
            <span>{profile.email}</span>
          </a>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs font-mono text-neutral-500">
        &copy; {new Date().getFullYear()} {fullName}. Built with modern standards.
      </footer>
    </div>
  );
}
`;
}

function getModernCreativeTemplateJsx() {
  return `import React from "react";
import { ArrowRight, Code2, Mail, Sparkles, User } from "lucide-react";
import { BrandIcon } from "../common/BrandIcon.jsx";
import { SafeLink } from "../common/SafeLink.jsx";
import { normalizeAvatarUrl } from "../common/urlUtils.js";

export function ModernCreativeTemplate({ portfolio }) {
  const { profile = {}, socialLinks = [], skills = [], projects = [], experience = [] } = portfolio || {};
  const fullName = profile.fullName || "Creative Engineer";
  const headline = profile.headline || "Data Analyst & Creative Developer";
  const bio = profile.bio || "Transforming ideas into polished interactive software experiences.";
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl);

  return (
    <div className="w-full min-h-screen bg-[#08071a] text-neutral-100 font-sans antialiased">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#08071a]/80 border-b border-purple-500/20 px-6 h-16 flex items-center justify-between">
        <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">{fullName}</span>
        <nav className="flex gap-4 text-xs font-mono text-purple-300">
          <a href="#about" className="hover:text-white">About</a>
          <a href="#projects" className="hover:text-white">Work</a>
          <a href="#contact" className="hover:text-white">Contact</a>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        <section className="text-center space-y-6 pt-10">
          {avatarUrl && <img src={avatarUrl} alt={fullName} className="w-36 h-36 mx-auto rounded-full object-cover ring-4 ring-purple-500 shadow-2xl shadow-purple-500/30" />}
          <h1 className="text-5xl font-extrabold tracking-tight text-white">{fullName}</h1>
          <p className="text-xl text-purple-400 font-medium">{headline}</p>
          <p className="max-w-xl mx-auto text-neutral-300 text-sm leading-relaxed">{bio}</p>
        </section>
        {projects.length > 0 && (
          <section id="projects" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p, i) => (
                <div key={i} className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-4">
                  <h3 className="font-bold text-lg text-white">{p.title}</h3>
                  <p className="text-xs text-neutral-400">{p.description}</p>
                  {p.liveUrl && <SafeLink href={p.liveUrl} className="inline-block text-xs font-semibold text-purple-400 hover:text-purple-300">Visit Project &rarr;</SafeLink>}
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

function getDeveloperTemplateJsx() {
  return `import React from "react";
import { Terminal, Code2 } from "lucide-react";
import { SafeLink } from "../common/SafeLink.jsx";

export function DeveloperTemplate({ portfolio }) {
  const { profile = {}, skills = [], projects = [] } = portfolio || {};
  const fullName = profile.fullName || "Developer";

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6">
      <header className="border-b border-neutral-800 pb-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="text-emerald-400 h-5 w-5" />
          <span className="font-bold text-sm">~/dev/{profile.fullName?.toLowerCase().replace(/\\s+/g, "") || "portfolio"}</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto space-y-12">
        <section className="space-y-2">
          <p className="text-emerald-400 text-xs">$ whoami</p>
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="text-neutral-400 text-sm">{profile.headline}</p>
          <p className="text-neutral-500 text-xs mt-2">{profile.bio}</p>
        </section>
        {projects.length > 0 && (
          <section className="space-y-4">
            <p className="text-emerald-400 text-xs">$ ls -la ./projects</p>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((p, i) => (
                <div key={i} className="p-4 rounded border border-neutral-800 bg-neutral-900/50">
                  <h3 className="font-bold text-sm text-neutral-200">{p.title}</h3>
                  <p className="text-xs text-neutral-400 my-2">{p.description}</p>
                  {p.liveUrl && <SafeLink href={p.liveUrl} className="text-xs text-blue-400 underline">View Live</SafeLink>}
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

function getMinimalTemplateJsx() {
  return `import React from "react";
import { SafeLink } from "../common/SafeLink.jsx";

export function MinimalTemplate({ portfolio }) {
  const { profile = {}, projects = [] } = portfolio || {};
  return (
    <div className="w-full min-h-screen bg-white text-neutral-900 font-sans p-8 sm:p-16">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight">{profile.fullName || "Portfolio"}</h1>
          <p className="text-sm text-neutral-500">{profile.headline}</p>
          <p className="text-sm text-neutral-700 leading-relaxed pt-2">{profile.bio}</p>
        </header>
        {projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Selected Works</h2>
            <div className="space-y-6">
              {projects.map((p, i) => (
                <div key={i} className="border-b border-neutral-100 pb-4">
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

function getHeroSectionJsx() {
  return `import React from "react";
export function HeroSection({ profile = {} }) {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold">{profile.fullName}</h1>
      <p className="text-neutral-400 mt-2">{profile.headline}</p>
    </div>
  );
}
`;
}

function getAboutSectionJsx() {
  return `import React from "react";
export function AboutSection({ bio }) {
  return <div className="py-8"><p className="text-neutral-300">{bio}</p></div>;
}
`;
}

function getSkillsSectionJsx() {
  return `import React from "react";
export function SkillsSection({ skills = [] }) {
  return (
    <div className="flex flex-wrap gap-2 py-6">
      {skills.map((s, i) => (
        <span key={i} className="px-2 py-1 bg-neutral-800 rounded text-xs">{s.name}</span>
      ))}
    </div>
  );
}
`;
}

function getProjectsSectionJsx() {
  return `import React from "react";
export function ProjectsSection({ projects = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
      {projects.map((p, i) => (
        <div key={i} className="p-4 border border-neutral-800 rounded">
          <h4 className="font-bold text-sm">{p.title}</h4>
          <p className="text-xs text-neutral-400 mt-1">{p.description}</p>
        </div>
      ))}
    </div>
  );
}
`;
}

function getExperienceSectionJsx() {
  return `import React from "react";
export function ExperienceSection({ experience = [] }) {
  return (
    <div className="space-y-4 py-6">
      {experience.map((e, i) => (
        <div key={i} className="border-l-2 border-neutral-700 pl-4">
          <h4 className="font-bold text-sm">{e.title} &mdash; {e.company}</h4>
          <p className="text-xs text-neutral-400">{e.startDate} - {e.endDate || "Present"}</p>
          <p className="text-xs text-neutral-300 mt-1">{e.description}</p>
        </div>
      ))}
    </div>
  );
}
`;
}

function getEducationSectionJsx() {
  return `import React from "react";
export function EducationSection({ education = [] }) {
  return (
    <div className="space-y-3 py-6">
      {education.map((ed, i) => (
        <div key={i} className="text-xs">
          <div className="font-bold">{ed.degree}</div>
          <div className="text-neutral-400">{ed.institution}</div>
        </div>
      ))}
    </div>
  );
}
`;
}

function getCertificationsSectionJsx() {
  return `import React from "react";
export function CertificationsSection({ certifications = [] }) {
  return (
    <div className="space-y-2 py-6">
      {certifications.map((c, i) => (
        <div key={i} className="text-xs">
          <span className="font-bold">{c.name}</span> &mdash; <span className="text-neutral-400">{c.issuer}</span>
        </div>
      ))}
    </div>
  );
}
`;
}

function getContactSectionJsx() {
  return `import React from "react";
export function ContactSection({ profile = {} }) {
  return (
    <div className="py-8 text-center">
      {profile.email && <a href={\`mailto:\${profile.email}\`} className="text-sky-400 text-sm underline">{profile.email}</a>}
    </div>
  );
}
`;
}
