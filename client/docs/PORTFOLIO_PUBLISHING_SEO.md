# Portfolio Publishing & SEO Architecture

## Overview
Phase 6 adds multi-tenant public portfolio publishing directly inside the existing deployed Single Page Application (SPA), accessible at `/p/:slug` without creating independent deployments or databases per user.

---

## 1. Route Design & Access Control
- **Public Client Route:** `/p/:slug` rendered by `PublicPortfolioPage.tsx` using React Router.
- **Public API Endpoint:** `GET /api/portfolios/public/:slug`.
  - Accessible without session cookies or JWT tokens.
  - Returns HTTP 200 **only** when `status === "published"` and `publication.isPublic === true`.
  - Returns HTTP 404 for drafts, archived portfolios, deleted records, or non-existent slugs.
- **Privacy & Field Allowlist:**
  - Database metadata (`_id`, `__v`, `createdAt`) and relational references (`userId`, `resumeId`, `user`) are strictly stripped from the public response.
  - Account credentials, email, password hashes, and raw resume text are never exposed on public routes.

---

## 2. Slug Generation & Collision Strategy
1. **Initial Slug Generation:**
   - Slugs are normalized using `slugify(title)`: lowercase alphanumeric with hyphens (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`).
   - If a collision occurs, a cryptographically random suffix (`crypto.randomBytes(3).toString("hex")`) is appended, with a timestamp fallback.
2. **Database Enforcement:**
   - MongoDB enforces uniqueness with a unique index on `{ slug: 1 }`.
   - The service layer performs collision checks before updates (`Portfolio.exists({ slug, _id: { $ne: id } })`), throwing `ApiError.conflict(409)` on collision.
   - Race conditions are caught by MongoDB driver error code `11000`.

---

## 3. SEO Behavior & SPA Rendering Analysis
### Architectural Reality:
The application is a Vite + React Single-Page Application (SPA) served by Express in production.

| Crawler Type | JavaScript Execution | SEO / Metadata Compatibility |
| :--- | :--- | :--- |
| **Googlebot & Modern Search Engines** | Full (Chrome V8 engine runs client bundles) | **Fully Supported**: Evaluates dynamically injected `<title>`, meta descriptions, canonical URLs, and structured DOM. |
| **Bingbot / DuckDuckGo** | Partial to Full | **Supported**: Renders JS-driven DOM within index queues. |
| **Social Unfurlers (WhatsApp, Slack, Twitter Bot, Facebook Scraper)** | None (reads initial static HTML `<head>` only) | **Limitation**: Without server-side rendering (SSR), initial static HTML contains base application metadata. |

### Implemented Compatible Solution:
1. **Dynamic Head Synchronization (`PortfolioSeo.tsx` / `usePortfolioSeo.ts`):**
   - Injects `document.title` dynamically based on `portfolio.publication.seoTitle` or user's full name.
   - Updates `<meta name="description">` from `portfolio.publication.seoDescription` or biography.
   - Sets canonical `<link rel="canonical" href="${origin}/p/${slug}">`.
   - Injects OpenGraph (`og:title`, `og:description`, `og:url`, `og:image`, `og:type = website`) and Twitter Card (`twitter:card = summary_large_image`, `twitter:title`, `twitter:description`) tags into `document.head`.
   - Cleans up tags and restores original title on unmount.
2. **React 19 Native Hoisting:**
   - Renders `<title>`, `<meta>`, and `<link>` directly in component JSX, which React 19 natively hoists to the root document `<head>`.

### Optional Future Enhancement (Zero Rewrite):
If static social unfurling (e.g. instant rich cards in WhatsApp or Discord) is required in the future:
- An Express middleware or Edge Worker (Cloudflare / Vercel Edge) can inspect the `User-Agent` header for known bot tokens (`facebookexternalhit`, `Twitterbot`, `Slackbot`, `WhatsApp`).
- For bot requests only, it can fetch the public portfolio JSON and inject `<meta property="og:...">` tags into the raw `index.html` string before serving it, without migrating to Next.js or rewriting the application.
