# Implementation Roadmap: Portfolio Builder Integration
## AI Resume Builder & Career Platform

**Document Version:** 1.0.0  
**Status:** Approved Engineering Plan  
**Target Completion:** 7 Sprints (Phased Delivery)  
**Author:** AI Product Engineering Team  
**Last Updated:** October 24, 2026  

---

## 1. Roadmap Overview & Engineering Principles

### Core Principles
1. **Zero Downtime & Zero Regression:** The existing ATS resume generation, PDF export (Puppeteer), and job description matching engines must remain 100% operational and isolated from portfolio additions.
2. **Compile-Time Allowlisting:** All portfolio templates must be strictly registered in `registry.ts` with TypeScript type constraints.
3. **Lazy-Loaded 3D Assets:** Three.js and heavy 3D GLTF assets must be dynamically imported via `React.lazy()` to maintain an editor bundle size under 350 KB.
4. **Stable Builds Before Every Commit:** Every phase requires a green build (`npm run build`), clean linting (`npm run lint`), and verified test runs prior to committing.

---

## 2. Phase-by-Phase Implementation Plan

### Phase 1: Architecture & Data Model Validation
* **Objective:** Validate the existing `Portfolio` Mongoose model, verify schema fields, and ensure type safety across frontend and backend contracts without applying breaking changes.
* **Prerequisites:** Clean Git working tree, MongoDB connection, local Node.js environment.
* **Modules & Files Likely to Change:**
  - `server/src/models/Portfolio.js` (Verify & add optional `githubTelemetry` subdocument)
  - `server/src/validations/portfolio.validation.js` (Expand `design.template` enum allowlist)
  - `client/src/types/portfolio.ts` (Update TypeScript interfaces for new templates)
* **Tasks & Dependencies:**
  1. Audit `server/src/models/Portfolio.js` to ensure backward-compatibility.
  2. Add `ramen-shop`, `motion-studio`, and `oss-maintainer` to template enum validations.
  3. Update `client/src/types/portfolio.ts` to reflect the extended template IDs.
* **Risks & Mitigations:**
  - *Risk:* Mongoose validation errors on existing draft portfolios.
  - *Mitigation:* Set default values for all newly added optional subdocuments.
* **Tests & Acceptance Criteria:**
  - Unit test verifying Mongoose schema creation with both old and new template IDs.
  - TypeScript compilation check (`npm run build -w client`) passes with zero type errors.
* **Definition of Done:** Updated schema passes validation tests; TypeScript types synchronized between client and server.
* **Suggested Git Commit Message:**
  `chore(portfolio): validate schema compatibility and expand template enum types`

---

### Phase 2: GitSkins Template Integration & Registry Expansion
* **Objective:** Integrate the 3 new GitSkins-inspired templates into the client template registry (`Ramen Shop 3D`, `Motion Canvas`, and `Open-Source Maintainer`).
* **Prerequisites:** Phase 1 complete; `three` package evaluated for 3D canvas rendering.
* **Modules & Files Likely to Change:**
  - `client/src/components/portfolios/templates/registry.ts` (Register new template definitions)
  - `client/src/components/portfolios/templates/RamenShopTemplate.tsx` (New 3D WebGL component)
  - `client/src/components/portfolios/templates/MotionCanvasTemplate.tsx` (New kinetic editorial component)
  - `client/src/components/portfolios/templates/OpenSourceTemplate.tsx` (New GitHub maintainer component)
  - `client/src/components/portfolios/common/AttributionFooter.tsx` (New upstream license attribution)
  - `client/package.json` (Add `three` and `@types/three` if needed for 3D canvas)
* **Tasks & Dependencies:**
  1. Create `AttributionFooter.tsx` enforcing MIT/ISC creator attribution for adapted designs.
  2. Implement `OpenSourceTemplate.tsx` using SkillIcons and GitHub activity widget mappings.
  3. Implement `MotionCanvasTemplate.tsx` utilizing existing `framer-motion` layout animations.
  4. Implement `RamenShopTemplate.tsx` with dynamic Three.js canvas and reduced-motion fallback.
  5. Register all 3 templates in `registry.ts` with category badges and metadata.
* **Risks & Mitigations:**
  - *Risk:* Three.js increases initial client bundle size by > 500 KB.
  - *Mitigation:* Import `RamenShopTemplate` via `React.lazy()` so Three.js only downloads when selected.
* **Tests & Acceptance Criteria:**
  - Switching to each template renders without unhandled React errors or memory leaks.
  - Attribution footer renders the correct author and upstream repository links.
* **Definition of Done:** All 3 templates render sample portfolio data accurately and pass responsive checks.
* **Suggested Git Commit Message:**
  `feat(portfolio): integrate ramen-shop, motion-studio, and oss-maintainer templates`

---

### Phase 3: Resume-to-Portfolio Data Bridge & 1-Click Generation UI
* **Objective:** Enable candidates to transform their ATS resume into a fully populated portfolio in a single click from the resume dashboard and editor.
* **Prerequisites:** Phase 2 complete; `portfolio.service.js` accessible from server router.
* **Modules & Files Likely to Change:**
  - `server/src/services/portfolio.service.js` (Implement `createPortfolioFromResume`)
  - `server/src/controllers/portfolio.controller.js` (Add `createFromResume` controller method)
  - `server/src/routes/portfolio.routes.js` (Register `POST /api/portfolios/from-resume/:resumeId`)
  - `client/src/api/portfolios.ts` (Add `convertResumeToPortfolio` API method)
  - `client/src/pages/ResumeEditorPage.tsx` (Add "Create Web Portfolio" CTA button)
  - `client/src/pages/ResumesPage.tsx` (Add "Convert to Portfolio" card action)
* **Tasks & Dependencies:**
  1. Write backend mapping function in `portfolio.service.js` handling slugification and data copy.
  2. Mount authenticated route `POST /api/portfolios/from-resume/:resumeId`.
  3. Add primary action button in `ResumeEditorPage.tsx` top navbar.
  4. Trigger navigation to `/portfolios/:id/edit` upon successful conversion.
* **Risks & Mitigations:**
  - *Risk:* Incomplete resumes (missing skills or projects) causing undefined crashes in portfolio templates.
  - *Mitigation:* Provide defensive fallbacks (`project.tags || []`, empty string defaults) in mapping logic.
* **Tests & Acceptance Criteria:**
  - Clicking "Convert to Portfolio" creates a valid Portfolio record in MongoDB.
  - All resume experience, projects, skills, and contact links map accurately to the new portfolio.
* **Definition of Done:** End-to-end 1-click conversion flow functional with toast confirmation and redirect.
* **Suggested Git Commit Message:**
  `feat(portfolio): implement 1-click resume-to-portfolio conversion pipeline`

---

### Phase 4: Template Customization, Drag-and-Drop Reordering & Theme Controls
* **Objective:** Provide deep visual customization in the portfolio studio, including section reordering, visibility toggling, color theme selection, and typography controls.
* **Prerequisites:** Phase 3 complete; `@dnd-kit/sortable` active in `client`.
* **Modules & Files Likely to Change:**
  - `client/src/components/portfolios/editor/PortfolioEditorSidebar.tsx` (Drag-and-drop section controls)
  - `client/src/components/portfolios/common/ThemeWrapper.tsx` (Add Cyberpunk, Emerald, Midnight palettes)
  - `client/src/components/portfolios/PortfolioRenderer.tsx` (Propagate live theme tokens)
  - `client/src/stores/portfolios.ts` (Debounced auto-save state handler)
* **Tasks & Dependencies:**
  1. Configure `@dnd-kit/sortable` for the section reordering list in `PortfolioEditorSidebar.tsx`.
  2. Add theme selector with Cyberpunk Neon (`#55e7ff`), Emerald Terminal (`#34d399`), and Midnight Purple (`#8b5cf6`).
  3. Wire typography dropdown (`Geist`, `Space Grotesk`, `Serif`).
  4. Implement debounced auto-save (500ms) to persist edits to `PATCH /api/portfolios/:id`.
* **Risks & Mitigations:**
  - *Risk:* Excessive API calls during rapid sidebar slider or color adjustments.
  - *Mitigation:* Apply 500ms debounce on backend synchronization while updating local state instantaneously.
* **Tests & Acceptance Criteria:**
  - Dragging a section reorders the live preview instantly.
  - Toggling visibility immediately hides the target section without deleting content.
  - Refreshing the page preserves all custom ordering and theme settings.
* **Definition of Done:** Full customization sidebar operational with debounced persistence and responsive preview canvas.
* **Suggested Git Commit Message:**
  `feat(portfolio): add drag-and-drop section reordering and multi-theme customization`

---

### Phase 5: Public Publishing, Slug Management & Responsive Public Viewer
* **Objective:** Enable users to publish their portfolio to a unique public URL (`/p/:slug`) with fast edge caching, rate limiting, and friendly 404 handling.
* **Prerequisites:** Phase 4 complete; public router mounted in Express.
* **Modules & Files Likely to Change:**
  - `server/src/routes/portfolio.routes.js` (Public endpoint `GET /public/:slug`)
  - `server/src/controllers/portfolio.controller.js` (`getPublicPortfolio` handler)
  - `server/src/middlewares/rateLimiter.middleware.js` (Protect public route from scraping)
  - `client/src/pages/PublicPortfolioPage.tsx` (Standalone public view)
  - `client/src/routes/AppRoutes.tsx` (Register `/p/:slug` route)
* **Tasks & Dependencies:**
  1. Implement `GET /api/portfolios/public/:slug` returning portfolio only if `published === true`.
  2. Add slug uniqueness validator with conflict suggestion (`slug-1`, `slug-2`).
  3. Create distraction-free `PublicPortfolioPage.tsx` stripped of dashboard headers/sidebars.
  4. Configure SEO meta tags (title, description, canonical link, OpenGraph tags) per portfolio.
* **Risks & Mitigations:**
  - *Risk:* Public URL scrapers overwhelming the MongoDB instance.
  - *Mitigation:* Apply `express-rate-limit` (100 req/15 min) and set `Cache-Control: public, max-age=60`.
* **Tests & Acceptance Criteria:**
  - Published portfolio loads cleanly at `/p/:slug` in an incognito window.
  - Unpublished portfolio returns HTTP 404 with a branded "Private Portfolio" message.
  - Slugs matching reserved words (`admin`, `api`, `dashboard`) are rejected.
* **Definition of Done:** Public publishing live, slugs validated, SEO headers injected, and rate-limiting active.
* **Suggested Git Commit Message:**
  `feat(portfolio): implement public slug publishing and standalone portfolio viewer`

---

### Phase 6: Standalone ZIP Packaging & GitHub README Export
* **Objective:** Provide users with full code ownership by allowing them to download a standalone offline web package (ZIP) and export their portfolio as a GitHub Profile `README.md`.
* **Prerequisites:** Phase 5 complete; `archiver` available in `server`.
* **Modules & Files Likely to Change:**
  - `server/src/services/portfolioExport.service.js` (Standalone HTML/CSS bundle compiler)
  - `server/src/controllers/portfolio.controller.js` (Export route handler)
  - `client/src/components/portfolios/export/PortfolioExportToolbar.tsx` (Export buttons)
  - `client/src/components/portfolios/export/ReadmeModal.tsx` (Markdown copy dialog)
* **Tasks & Dependencies:**
  1. Build static HTML template generator in `portfolioExport.service.js`.
  2. Package standalone `index.html`, scoped CSS, script runtime, and deployment README into a ZIP using `archiver`.
  3. Build client-side GitHub `README.md` generator incorporating SkillIcons and project cards.
  4. Add "Download Site (ZIP)" and "Copy GitHub README" buttons in the export toolbar.
* **Risks & Mitigations:**
  - *Risk:* Downloaded ZIP fails to execute offline due to broken relative file paths.
  - *Mitigation:* Use strict relative paths (`./assets/style.css`) and inline critical CSS tokens in `index.html`.
* **Tests & Acceptance Criteria:**
  - Extracting the downloaded ZIP and opening `index.html` locally renders the complete portfolio offline.
  - GitHub README markdown renders perfectly in GitHub's web preview.
* **Definition of Done:** Offline ZIP download and GitHub README export tested and verified.
* **Suggested Git Commit Message:**
  `feat(portfolio): add standalone offline ZIP export and GitHub README generator`

---

### Phase 7: Performance Optimization, WebGL Error Boundaries & Security Hardening
* **Objective:** Harden security, optimize Core Web Vitals, implement WebGL crash fallbacks, and achieve comprehensive automated test coverage.
* **Prerequisites:** Phases 1–6 complete.
* **Modules & Files Likely to Change:**
  - `client/src/components/portfolios/common/WebGLErrorBoundary.tsx` (New fallback component)
  - `server/src/utils/sanitizer.js` (Input sanitization rules)
  - `client/vite.config.ts` (Manual chunk splitting for 3D dependencies)
* **Tasks & Dependencies:**
  1. Wrap all 3D canvas components in `WebGLErrorBoundary.tsx` displaying a static poster if WebGL crashes or is unsupported.
  2. Sanitize all user bio and project description inputs with strict HTML escaping.
  3. Configure Vite manual chunks: split `three` into a separate vendor chunk.
  4. Audit Lighthouse performance: ensure mobile score ≥ 85, desktop score ≥ 95.
* **Risks & Mitigations:**
  - *Risk:* Three.js crashes on older smartphones without WebGL 2.0.
  - *Mitigation:* Error boundary catches canvas context loss and seamlessly renders the 2D fallback.
* **Tests & Acceptance Criteria:**
  - Lighthouse audit passes performance and accessibility thresholds.
  - XSS injection attempts in bio or project URLs are neutralized.
  - Full regression suite passes on the existing ATS resume builder.
* **Definition of Done:** System hardened, 3D fallbacks verified, zero regressions on resume features.
* **Suggested Git Commit Message:**
  `perf(portfolio): add WebGL error boundaries, sanitize inputs, and optimize chunk splitting`

---

## 3. Summary Timeline & Milestones

| Phase | Title | Estimated Effort | Deliverable Milestone |
| :---: | :--- | :---: | :--- |
| **1** | Architecture & Schema Validation | 2 Days | Verified types & non-breaking schema compatibility |
| **2** | GitSkins Template Integration | 4 Days | 3 new templates registered in `registry.ts` |
| **3** | Resume-to-Portfolio Data Bridge | 3 Days | 1-Click "Convert to Portfolio" functional in UI |
| **4** | Customization & Drag-and-Drop | 3 Days | Reorder, themes, and debounced auto-save active |
| **5** | Public Slug Publishing | 3 Days | Live `/p/:slug` public routes with rate limiting |
| **6** | Standalone ZIP & README Export | 3 Days | Complete offline ZIP download & markdown modal |
| **7** | Hardening & Performance | 2 Days | WebGL fallbacks, XSS security, and green Lighthouse |
| **Total**| **Complete Integration** | **20 Days** | **Production-Ready Portfolio System** |

---

*Implementation roadmap complete. Proceed with Phase 1 when authorized.*
