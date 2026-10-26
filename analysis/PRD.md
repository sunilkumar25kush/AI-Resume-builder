# Product Requirements Document (PRD)
## Portfolio Builder Integration for AI Resume Builder

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Author:** AI Product Engineering Team  
**Last Updated:** October 24, 2026  

---

## 1. Product Overview & Problem Statement

### 1.1 Product Overview
The **AI Resume Builder & Career Platform** currently allows candidates to parse resumes, match job descriptions, generate ATS-friendly resumes, and export pixel-perfect PDFs. 

This initiative expands the platform by integrating an **Interactive Portfolio Builder** powered by GitSkins-inspired design systems, Three.js 3D arcade worlds, and kinetic editorial layouts. With a single click, users can transform their structured resume data into an interactive personal website hosted on a custom slug (`/p/:slug`), a downloadable offline HTML package, or an open-source GitHub profile README.

### 1.2 Problem Statement
* **Static Resume Disconnect:** Resumes are static, text-dense documents optimized for applicant tracking systems (ATS), not human engagement. They fail to showcase visual craft, live projects, coding rhythm, and creative design.
* **Double Data Entry:** Job seekers spend hours manually copying their work history, projects, and skills from their resumes into portfolio site builders (e.g. Squarespace, Webflow, GitHub Pages).
* **High Technical Barrier for 3D/Interactive Portfolios:** Modern interactive web experiences (WebGL, Three.js, Spline) require advanced 3D mathematics and front-end development skills that most software engineers and designers lack the time to build from scratch.

---

## 2. Goals & Target Users

### 2.1 Strategic Goals
1. **Zero-Friction Conversion:** Enable job seekers to generate a production-ready, interactive web portfolio from their existing resume in under 60 seconds without manual retyping.
2. **Visual & Architectural Diversity:** Provide curated templates spanning 3D WebGL worlds (Ramen Shop), kinetic editorial motion (Motion Canvas), terminal/developer dashboards, and executive minimalism.
3. **Multi-Format Export Parity:** Offer instant live hosting at `/p/:username`, downloadable standalone HTML/JS packages (ZIP), and copy-paste GitHub Profile `README.md` templates.
4. **Preserve ATS Engine Integrity:** Ensure 100% decoupling between the ATS resume generation pipeline and the web portfolio presentation layer.

### 2.2 Target Users
* **Software Engineers & Full-Stack Developers:** Want live GitHub commit activity, skill pills, and interactive project cards to showcase open-source credibility.
* **Creative Technologists & 3D Builders:** Seek immersive Three.js spaces and WebGL animations to highlight interactive capabilities.
* **Job Seekers & New Graduates:** Need a shareable link on job applications that stands out from standard PDF submissions.
* **Product Designers & Executives:** Require clean typography, editorial pacing, and case-study presentations.

---

## 3. User Personas & Core Use Cases

### Persona 1: Alex — Full-Stack Developer
* **Need:** Has an ATS resume tailored for engineering roles but wants a shareable link in their email signature that showcases live GitHub repositories and an interactive terminal.
* **Primary Use Case:** Imports their resume into the platform, clicks "Convert to Portfolio", selects the *Open-Source Maintainer* template, connects their GitHub username, and publishes to `/p/alex-dev`.

### Persona 2: Priya — Creative Front-End & 3D Enthusiast
* **Need:** Wants to wow recruiters with a 3D visual experience without having to code Three.js camera rigs and shaders from scratch.
* **Primary Use Case:** Generates a portfolio using the *Ramen Shop 3D* template, customizes project screenshots, tests mobile responsiveness, and exports the standalone code bundle.

### Persona 3: Marcus — Senior Engineering Manager
* **Need:** Needs a clean, distraction-free executive page with fast load times and clean typography.
* **Primary Use Case:** Selects the *Minimalist Executive* template, tweaks the accent color to royal blue, reorders the sections to place Leadership Experience above Projects, and shares the private preview link.

---

## 4. Functional & Non-Functional Requirements

### 4.1 Functional Requirements (FR)

| Req ID | Feature Area | Requirement Description | Status in Codebase |
| :--- | :--- | :--- | :---: |
| **FR-001** | **Data Bridge** | System shall provide a 1-click conversion action `createPortfolioFromResume` that maps resume sections to portfolio entities. | **Exists** (needs UI bridge) |
| **FR-002** | **Template Gallery** | User shall be able to browse templates filtered by category (`3D`, `Creative`, `Technical`, `Editorial`, `Minimal`) and access tier. | **Needs Modification** |
| **FR-003** | **Live Preview** | Portfolio editor shall display real-time interactive preview of the portfolio while editing form fields. | **Exists** |
| **FR-004** | **3D WebGL Runtime** | System shall integrate the *Ramen Shop* 3D WebGL template as a lazy-loaded Three.js canvas component with camera and touch controls. | **New** |
| **FR-005** | **Kinetic Motion Template**| System shall integrate the *Motion Canvas* template using Framer Motion animations and horizontal project snapping. | **New** |
| **FR-006** | **Open-Source Template**| System shall support GitSkins-inspired Open-Source Maintainer template displaying live GitHub widgets and repo cards. | **New** |
| **FR-007** | **Section Reordering** | User shall be able to drag-and-drop reorder portfolio sections (Hero, About, Projects, Skills, Experience, Education, Contact). | **Exists** |
| **FR-008** | **Section Visibility** | User shall be able to toggle visibility of any individual section on or off. | **Exists** |
| **FR-009** | **Theme Customizer** | User shall be able to customize accent colors, dark/light surface modes, and typography pairing (Geist, Space Grotesk, Serif). | **Needs Modification** |
| **FR-010** | **Unique Public Slug** | System shall enforce unique alphanumeric URL slugs (`/p/:slug`) with automated conflict detection. | **Exists** |
| **FR-011** | **Publishing Toggle** | User shall be able to toggle portfolio state between Draft (private) and Published (accessible via public URL). | **Exists** |
| **FR-012** | **Standalone ZIP Export**| System shall bundle the selected portfolio, static assets, and viewer HTML into a downloadable ZIP file using `archiver`. | **Exists** (needs template assets) |
| **FR-013** | **GitHub README Export** | System shall generate a copy-pasteable GitHub Profile `README.md` populated with user's skills and pinned projects. | **New** |
| **FR-014** | **Custom Domain Ready** | System shall store optional custom domain records for future DNS mapping. | **New** |
| **FR-015** | **Attribution Enforcement**| Adapted templates shall render persistent, unobtrusive creator attribution footers in compliance with upstream MIT/ISC licenses. | **New** |

---

### 4.2 Non-Functional Requirements (NFR)

| Req ID | Category | Requirement Description |
| :--- | :--- | :--- |
| **NFR-001** | **Performance** | 2D portfolio landing pages shall achieve a Lighthouse Performance score ≥ 90; 3D templates shall achieve ≥ 75. |
| **NFR-002** | **3D Lazy Loading** | WebGL and Three.js chunk bundles shall be code-split and loaded on demand (`React.lazy`) to keep the initial editor bundle < 350 KB. |
| **NFR-003** | **Accessibility** | All templates must meet WCAG 2.1 AA contrast ratios; 3D/video elements must respect `prefers-reduced-motion`. |
| **NFR-004** | **Mobile Responsiveness**| Portfolios must render gracefully across mobile (375px+), tablet (768px), and desktop (1024px–1920px). |
| **NFR-005** | **Security** | Public portfolio views must strictly sanitize user inputs and social links against Cross-Site Scripting (XSS). |
| **NFR-006** | **Isolation** | Portfolio styles must be strictly scoped (CSS Modules or Tailwind prefixes) to prevent style bleeding into the main app. |
| **NFR-007** | **Availability & Cache Invalidation** | Public portfolios hosted at `/p/:slug` must be cached via HTTP edge headers (Stale-While-Revalidate: 300s). When a portfolio is unpublished or archived, edge caches must be invalidated immediately via an edge purge (Surrogate-Key / Cache-Tag invalidation) or versioned cache keys (`?v=updatedAt`) so revocation takes effect immediately without waiting for TTL expiry. Automated test suites must include tests covering the unpublishing path, asserting that revoking publication immediately returns HTTP 404 and purges edge-cached responses. |

---

## 5. User Stories & Acceptance Criteria

### User Story 1: One-Click Resume Conversion
> **As a** job seeker who just finished creating an ATS resume,  
> **I want to** click "Create Web Portfolio" from my resume dashboard,  
> **So that** my experience, skills, and projects instantly populate an interactive website without manual copy-pasting.

* **Acceptance Criteria:**
  - Clicking "Create Web Portfolio" generates a new record in MongoDB `Portfolio` collection linked to `userId`.
  - Full name, headline, summary, skills, experience, and projects are mapped accurately to portfolio schema.
  - User is immediately navigated to `client/src/pages/PortfolioEditorPage.tsx` with pre-filled preview.
  - The original resume remains untouched and unaltered.

---

### User Story 2: Exploring and Switching Templates
> **As a** creative engineer,  
> **I want to** preview my actual data across 3D, creative, and technical templates,  
> **So that** I can pick the design that best represents my personal aesthetic.

* **Acceptance Criteria:**
  - Gallery displays cards with live video/image previews for each template.
  - Clicking a template switches the live preview frame in < 250ms without losing unsaved field edits.
  - If a 3D template is selected on an unsupported browser, a descriptive fallback notification is displayed.

---

### User Story 3: Publishing to a Unique Web URL
> **As a** candidate applying for jobs,  
> **I want to** publish my portfolio to a custom slug like `/p/priya-sharma`,  
> **So that** I can include a clean, memorable link on my LinkedIn profile and email signature.

* **Acceptance Criteria:**
  - Slug validation rejects special characters, spaces, and reserved paths (`admin`, `api`, `dashboard`).
  - Slug collision triggers an instant error message suggesting an available suffix (e.g. `priya-sharma-1`).
  - Toggling "Published" to true makes `/p/:slug` publicly readable without authentication.
  - Toggling "Published" to false immediately causes `/p/:slug` to return a 404/Private page.

---

### User Story 4: Downloading Offline Portfolio Bundle
> **As a** developer who wants to host their portfolio on their own server or GitHub Pages,  
> **I want to** download a standalone ZIP file of my customized portfolio,  
> **So that** I have full ownership of my website files.

* **Acceptance Criteria:**
  - Clicking "Download Site (ZIP)" triggers an API call to `/api/portfolios/:id/export`.
  - Backend compiles a standalone `index.html`, bundled CSS, JS, and user images into a single ZIP.
  - Opening `index.html` locally in any modern browser renders the complete portfolio offline.

---

## 6. Resume-to-Portfolio Content Mapping

The system executes automated structural transformation from the `Resume` schema to the `Portfolio` schema:

| Resume Field (`Resume.js`) | Target Portfolio Field (`Portfolio.js`) | Transformation / Default Rule |
| :--- | :--- | :--- |
| `contact.name` / `basics.fullName` | `profile.fullName` | Direct string copy. |
| `basics.headline` / `experience[0].title` | `profile.headline` | Uses resume headline or most recent job title. |
| `summary` | `profile.bio` | Direct markdown/text copy. |
| `contact.email` | `profile.email` | Direct string copy. |
| `contact.location` | `profile.location` | Direct string copy. |
| `contact.photo` / User Avatar | `profile.avatarUrl` | Cloudinary asset URL. |
| `contact.github`, `linkedin`, `website` | `socialLinks` | Converted into array of `{ platform, label, url }`. |
| `skills[].name` | `skills` | Mapped into `{ name, category: 'Technical', level: 'advanced' }`. |
| `projects[]` | `projects` | Maps `{ title, description, repoUrl, liveUrl, tags }`. |
| `experience[]` | `experience` | Maps `{ title, company, location, startDate, endDate, description }`. |
| `education[]` | `education` | Maps `{ degree, institution, fieldOfStudy, graduationDate }`. |
| N/A | `design.template` | Defaults to `"devport"` (or user selection). |
| N/A | `slug` | Slugified from `fullName` (`slugify(fullName)`). |

---

## 7. Template Gallery & Selection Experience

### 7.1 Template Registry Architecture
Templates are registered in an immutable allowlist at `client/src/components/portfolios/templates/registry.ts`:

1. **`devport`** (DevPort): Cosmic dark aesthetics, orbital avatar, glowing typography, and badge grids.
2. **`creative`** (Modern 3D): Midnight indigo theme with floating glassmorphic cards.
3. **`developer`** (Terminal): Terminal window headers, command prompts, and monospace typography.
4. **`minimal`** (Minimalist Executive): High whitespace, refined typography, and single-column elegance.
5. **`ramen-shop`** *(New)*: Neon 3D arcade diner with Three.js camera interaction and keyboard navigation.
6. **`motion-studio`** *(New)*: Kinetic editorial layout with smooth horizontal project motion.
7. **`oss-maintainer`** *(New)*: GitHub-centric maintainer layout with typing headlines, skill icons, and repo telemetry.

### 7.2 Selection Interface
* Integrated directly into the portfolio editor top bar.
* Features responsive category filter pills (`All`, `3D World`, `Creative`, `Technical`, `Editorial`, `Minimal`).
* Video hover scrub: Cards lazy-stream `.mp4` preview clips on pointer hover.

---

## 8. Live Preview & Editor Workflow

```text
+-----------------------------------------------------------------------------------+
|  Portfolio Studio: Alex Kumar                           [Save]  [Preview]  [Publish] |
+------------------------------------+----------------------------------------------+
| EDIT CONTROLS                      | LIVE PREVIEW                                 |
|                                    |                                              |
| [Template: Ramen Shop 3D    v]     | +------------------------------------------+ |
| [Theme: Cyberpunk Neon      v]     | |  [3D Canvas / Three.js Scene]            | |
| [Font: Space Grotesk        v]     | |                                          | |
|                                    | |   Welcome to Alex's Workshop             | |
| Sections (Drag to reorder):        | |   > Full-Stack & 3D Web Developer        | |
| [::] (o) Hero & Identity           | |                                          | |
| [::] (o) Featured Repositories     | |   [Interactive Arcade Cabinets]          | |
| [::] (o) Technical Toolbox         | |   - Project Alpha (React/Node)           | |
| [::] (o) Work History              | |   - Project Beta (Three.js/WebGL)        | |
| [::] ( ) Academic Credentials      | |                                          | |
| [::] (o) Connect & Socials         | |   [Skill Icons Grid]                     | |
|                                    | |   [Attribution Footer]                   | |
| Custom Slug:                       | +------------------------------------------+ |
| gitskins.com/p/[ alex-dev        ] | Mode: [ Desktop | Tablet | Mobile ]         |
+------------------------------------+----------------------------------------------+
```

---

## 9. Customization Capabilities

1. **Color Themes**:
   - `Cyberpunk Neon` (Accent: `#55e7ff`, Base: `#050505`)
   - `Emerald Terminal` (Accent: `#34d399`, Base: `#0a0f0d`)
   - `Midnight Purple` (Accent: `#8b5cf6`, Base: `#090714`)
   - `Clean Corporate` (Accent: `#1d4ed8`, Base: `#f8fafc`)
2. **Typography Pairings**:
   - Modern Tech: `Geist` + `Geist Mono`
   - Bold Display: `Space Grotesk` + `Geist`
   - Editorial Classic: `Newsreader` (Serif) + `Geist`
3. **Section Visibility & Ordering**:
   - Controlled via `@dnd-kit/sortable` list in the sidebar.
   - Any section can be hidden without deleting the underlying portfolio data.

---

## 10. Public Publishing & URL Architecture

* **URL Pattern:** `https://yourdomain.com/p/:slug`
* **Slug Rules:**
  - 3 to 40 characters: lowercase letters, numbers, and hyphens (`^[a-z0-9-]+$`).
  - Reserved slugs blocked: `admin`, `api`, `auth`, `dashboard`, `resumes`, `portfolios`, `pricing`, `settings`.
* **Public Route Implementation:**
  - Frontend: `client/src/pages/PublicPortfolioPage.tsx`.
  - Backend API: `GET /api/portfolios/public/:slug`.
  - Unauthenticated access permitted only if `portfolio.published === true`.

---

## 11. Standalone Package Export (ZIP & Markdown)

1. **Complete Offline Website (ZIP)**:
   - Generated by `server/src/services/portfolioExport.service.js`.
   - Bundles:
     - `index.html`: Fully rendered self-contained HTML page.
     - `assets/css/`: Scoped CSS styles.
     - `assets/js/`: Standalone script bundle (including Three.js runtime for 3D templates).
     - `README.md`: Instructions on hosting with GitHub Pages, Vercel, or Netlify.
2. **GitHub Profile README (`README.md`)**:
   - Generates standardized GFM (GitHub Flavored Markdown) incorporating animated typing headers, SkillIcons badges, pinned repository cards, and activity graphs.

---

## 12. Security, Privacy & Permissions

* **Access Control:**
  - Only authenticated owners can create, edit, or delete portfolios (`auth.middleware.js`).
  - Read access to `/api/portfolios/:id` requires owner credentials; read access to `/api/portfolios/public/:slug` is open to all visitors if published.
* **Content Sanitization:**
  - All markdown descriptions, biography text, and custom URLs are sanitized using `DOMPurify` / regex checks before rendering to prevent stored XSS attacks.
* **Third-Party Attribution Compliance:**
  - Templates adapted from MIT/ISC upstream repositories (`enderh3art/Ramen-Shop`, `HamishMW/portfolio`) automatically display the required attribution footer linking to the author and repository.

---

## 13. Error States & Edge Cases

| Scenario | System Behavior |
| :--- | :--- |
| **Slug Collision** | Editor immediately flags the field red: `"Slug 'alex' is taken. Try 'alex-dev' or 'alex-k'."` |
| **Missing Project Media** | Card renders clean placeholder with tech stack initials instead of broken image icon. |
| **WebGL Context Crash / Unsupported** | 3D canvas displays graceful static poster fallback: `"Interactive 3D mode requires hardware acceleration. Viewing static showcase."` |
| **Unpublished URL Visit** | Public URL `/p/:slug` renders branded 404 page: `"This portfolio is currently private or does not exist."` |
| **Empty Resume Fields** | Empty sections are automatically marked hidden in `design.sectionVisibility` during 1-click conversion. |

---

## 14. Scope: MVP vs. Future Enhancements

### Phase 1: MVP Scope (Current Implementation)
* [x] Automatic 1-click resume-to-portfolio content conversion.
* [x] Full integration of 2 new templates: **Ramen Shop 3D** and **Motion Canvas**.
* [x] GitSkins GitHub Profile `README.md` generator and export button.
* [x] Dynamic template gallery filter tabs in Portfolios page.
* [x] Live public hosting at `/p/:slug`.
* [x] Downloadable standalone ZIP bundle via `archiver`.

### Phase 2: Future Enhancements (Post-MVP)
* Custom domain DNS mapping (e.g. `alexkumar.dev` pointing to portfolio).
* Integrated visitor analytics dashboard (page views, project click-throughs).
* Direct 1-click deployment to GitHub Pages via GitHub OAuth token.
* Contact form forwarding directly to the user's verified email.

---

## 15. Success Metrics (KPIs)

1. **Adoption Rate:** ≥ 35% of users who complete an ATS resume generate a web portfolio within the same session.
2. **Conversion Speed:** Average time from resume completion to published portfolio < 60 seconds.
3. **Engagement:** ≥ 25% of published portfolio visitors click at least one project repository or live demo link.
4. **Performance:** 100% of generated portfolio pages pass Google Core Web Vitals on desktop and mobile.

---

*Product Requirements Document complete. Ready for architectural and engineering review.*
