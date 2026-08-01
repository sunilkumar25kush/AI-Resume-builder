# AI Resume Builder & Job Optimization Platform — Master Implementation Plan

> **Workflow:** One module at a time. After each module: explain what changed → wait for approval → next module. Never generate the whole project in one shot.

**Goal:** Production-ready AI Resume Builder — resume/JD parsing, AI optimization (ATS score, match %, missing skills), resume editor with templates, exports, generators (cover letter / LinkedIn / interview Qs / portfolio), analytics, admin panel.

**Architecture:** Clean monorepo — `client/` (React SPA) + `server/` (Express REST API). Business logic in server `services/`, HTTP in `controllers/`, AI behind a provider interface (Ollama primary, Gemini optional, switchable via env).

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind + shadcn/ui + React Router + React Hook Form + Zod + Zustand + Axios + Framer Motion + Lucide + dnd-kit + react-pdf/docx (exports)
- Backend: Node + Express + Mongoose (MongoDB Atlas) + JWT + bcrypt + Multer + pdf-parse + mammoth + google-auth-library + helmet + express-rate-limit + zod
- AI: Ollama (local, installed & running — deepseek model present) primary; Gemini optional fallback

---

## Current Context / Assumptions

- Project folder `C:\Users\NavGurukul\OneDrive\Desktop\AI Resume Builder` is **empty** — fresh start, git init needed.
- Node v24.11.0, npm 11.6.1, git configured.
- Ollama 0.32.5 installed & serving on `http://localhost:11434` (model `milanjeremic2/deepseek-r1-32b-uncensored`). Env `OLLAMA_MODEL` will point at it.
- No local MongoDB → MongoDB Atlas (MONGO_URI env var), same pattern as user's ChatApp project.
- Monorepo via npm workspaces, root scripts run both servers with `concurrently`.

---

## Folder Structure

```
AI Resume Builder/
├── package.json              # workspaces + dev scripts (concurrently)
├── .gitignore
├── README.md
├── .env.example              # (root: none — env lives per package)
│
├── client/                   # React + Vite + Tailwind + shadcn
│   ├── index.html
│   ├── vite.config.ts        # proxy /api → server, path aliases
│   ├── tailwind.config.*     # dark mode class, design tokens
│   ├── components.json       # shadcn config
│   ├── .env.example          # VITE_API_URL etc.
│   └── src/
│       ├── main.tsx / App.tsx / index.css
│       ├── api/              # axios instance + per-feature API modules
│       ├── components/
│       │   ├── ui/           # shadcn primitives (button, dialog, toast...)
│       │   ├── common/       # skeleton, empty-state, error-state, confirm-dialog, logo...
│       │   └── layout/       # sidebar, topbar, bottom-nav, drawer
│       ├── features/         # one folder per feature (auth/, resume/, jd/, editor/, ai/...)
│       ├── hooks/            # useDebounce, useLocalStorage, useMediaQuery...
│       ├── layouts/          # AppLayout (sidebar+topbar), AuthLayout, AdminLayout
│       ├── lib/              # cn(), formatters, constants
│       ├── stores/           # zustand: auth, theme, resume, notifications
│       ├── routes/           # route config + ProtectedRoute + RoleRoute
│       ├── pages/            # lazy-loaded route pages
│       ├── styles/           # tailwind entry + component styles
│       └── types/            # shared TS types (mirror server schema)
│
└── server/                   # Express + Mongoose
    ├── .env.example          # PORT, MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID, OLLAMA_URL, GEMINI_API_KEY, AI_PROVIDER...
    ├── package.json
    └── src/
        ├── server.js         # bootstrap (connect db, listen)
        ├── app.js            # express app assembly
        ├── config/           # env.js (validated), db.js, ai.js
        ├── constants/        # roles, limits, messages
        ├── models/           # User, Resume, JobDescription, Optimization, Version, Notification, AdminLog
        ├── controllers/      # thin HTTP handlers
        ├── routes/           # /auth /users /resumes /jd /ai /analytics /admin /health
        ├── services/         # business logic (auth, resumeParser, jdParser, optimizer, generators, analytics)
        ├── middlewares/      # auth, rbac, errorHandler, rateLimiter, validate, upload, sanitize
        ├── validations/      # zod schemas (auth, resume, jd, ai)
        ├── ai/               # providers/index.js (factory), ollama.provider.js, gemini.provider.js, prompts/
        ├── utils/            # token, password, asyncHandler, ApiError, ApiResponse, file
        └── jobs/             # (later) cleanup/notifications cron
```

---

## Module Plan (one at a time, approval gate after each)

### M1 — Project Scaffold ✅ (first)
- Root: `package.json` (workspaces), `.gitignore`, `README.md`, git init.
- **client:** Vite react-ts scaffold, Tailwind (dark mode class), shadcn init (button, input, card, dialog, dropdown, toast/sonner, skeleton, tabs, form), folder skeleton (api/, features/, hooks/, stores/, routes/, pages/, lib/, components/), axios instance + interceptor skeleton, theme store (zustand + class toggle), App shell with dark/light + placeholder pages, lazy loading setup.
- **server:** Express app, config/env validation, MongoDB connection (Atlas), helmet, cors, rate limiter, error handler middleware, zod validation middleware skeleton, `/api/health` route, auth middleware skeleton, folder skeleton.
- **Verify:** `npm run dev` — client serves, server `/api/health` returns ok, dark/light toggles, no lint/build errors.

### M2 — Authentication ✅
- **server:** `User` model (name/email/passwordHash/avatar/googleId/role/resetToken...), zod auth schemas, `authService` (register, login, forgot/reset password, google OAuth via google-auth-library), JWT (httpOnly cookie + optional bearer), RBAC middleware, rate limits on auth routes, sanitization.
- **client:** Auth pages (login/signup/forgot/reset) — responsive, fullscreen modals→pages, RHF+Zod forms, auth store with persist, axios interceptors (401 → logout), ProtectedRoute + RoleRoute.
- **Verify:** register→login→me→logout flow, wrong password 401, token expiry, Google OAuth (test mode), rate limit 429.

### M3 — Dashboard Shell + Navigation + Profile ✅
- Responsive layout: desktop sidebar, tablet collapsible, mobile bottom-nav + drawer. Theme toggle. User profile page (edit, avatar upload via multer), Settings page, Notifications (bell + list, read/unread).
- **Verify:** 320→1920px widths, no horizontal scroll, keyboard nav, ARIA labels.

### M4 — Resume Upload + Parser ✅
- **server:** `Resume` model, multer upload (pdf/docx, size/type limits), parsing service — pdf-parse + mammoth → normalized JSON (contact, education, experience, skills, projects...), validation.
- **client:** Upload page (drag-drop, progress, skeletons, empty/error states), parsed resume preview + edit before save.
- **Verify:** PDF + DOCX parse, garbage file rejected, big file rejected, Unicode text handled.

### M5 — JD Upload + Parser ✅
- **server:** `JobDescription` model, paste-text or file upload, extraction service (title, company, skills, qualifications, responsibilities).
- **client:** JD page — input, parse result, editable, saved list.
- **Verify:** parse accuracy on sample JDs, empty/paste edge cases.

### M6 — AI Engine (Provider Abstraction) ✅
- **server:** `ai/providers/` — base interface (`generate(prompt, opts)`), `OllamaProvider` (fetch to 11434, model from env), `GeminiProvider` (REST via fetch, no SDK dep), factory switching via `AI_PROVIDER` env, JSON-output parsing + retry/timeout + fallback chain.
- **Verify:** both providers respond to a test prompt via a `/api/ai/ping` (dev-only) route; provider switch via env.

### M7 — AI Resume Optimization
- **server:** `Optimization` model, optimizer service — ATS score, match % vs JD, missing skills, keyword suggestions; prompt engineering for consistent JSON; streaming optional.
- **client:** Optimize page — pick resume + JD → run → results dashboard (score ring, match bar, missing-skill chips, keyword table), save to history.
- **Verify:** deterministic JSON parse, sensible scores on sample data, loading/skeleton/error states, history list.

### M8 — Resume Editor (Drag & Drop + Templates + Live Preview)
- **client:** editor with dnd-kit section reorder, section add/edit forms (RHF+Zod), 3-4 built-in templates, live preview pane (desktop side-by-side, mobile toggle), autosave (debounced).
- **server:** update endpoints for Resume sections, autosave persistence.
- **Verify:** reorder persists, template switch, preview matches data, mobile usability.

### M9 — Version History
- **server:** snapshot on save (diff-based or full snapshot, capped per resume), list/restore/compare endpoints.
- **client:** history drawer with restore + compare view.
- **Verify:** version created on edit, restore works, cap respected.

### M10 — Export PDF + DOCX
- **server or client:** PDF via react-pdf (browser) or server-side puppeteer; DOCX via `docx` lib. Template-aware export.
- **Verify:** downloads open correctly, content matches preview, file size sane.

### M11 — Generators (Cover Letter / LinkedIn / Interview Qs / Portfolio)
- **server:** generator service + prompts, history model.
- **client:** generator pages with copy-to-clipboard, download (txt/md), regenerate.
- **Verify:** each generator returns usable content, loading states, copy works.

### M12 — Dashboard Analytics
- **server:** aggregation endpoints (optimizations count, avg ATS score trend, resume count, activity).
- **client:** analytics cards + charts (recharts), skeletons, empty states.
- **Verify:** numbers match DB, responsive charts.

### M13 — Admin Panel
- **server:** admin routes guarded by RBAC — list/search users, block/unblock, delete, platform stats.
- **client:** admin layout + user table (→ cards on mobile), actions with confirm dialogs.
- **Verify:** non-admin blocked (403), actions work, audit log.

### M14 — Hardening & Final QA
- Full pass: security (helmet headers, rate limits everywhere, input sanitization everywhere, cookie flags), performance (lazy routes, code splitting, memoization, debounced calls), a11y audit, all breakpoints, dark/light contrast, empty/loading/error states everywhere, lint + build clean, README.

---

## Cross-Cutting Rules (applied in every module)

- Components ≤ 250 lines, functions ≤ 40 lines, single responsibility.
- No fixed widths; flex/grid/minmax/clamp/max-w/w-full/h-auto; modals fullscreen on mobile; tables → cards on mobile.
- Loading skeletons + empty states + error states + toast + confirm dialogs on every feature.
- Comments only where necessary; constants centralized; no duplicate code.
- Every module verified before approval gate.

## Risks / Open Questions

1. **Ollama model quality** — deepseek-r1-32b is large (~2GB, fine) but JSON reliability needs prompt discipline; fallback to Gemini if quality poor. Ask user for Gemini API key later if needed (M6).
2. **Google OAuth** — needs Google Cloud OAuth client ID/secret; can be stubbed until keys provided (login page hides button if unconfigured).
3. **PDF export** — browser react-pdf (no server dep) preferred; verify font/rendering in M10.
4. **MongoDB Atlas** — user must supply `MONGO_URI` (existing Atlas account from ChatApp likely reusable; a new free cluster/db name).
5. No local mongod — nothing to install; all deps are project-local (npm), no system-level changes.
