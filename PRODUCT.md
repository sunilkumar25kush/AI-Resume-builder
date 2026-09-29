# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are **job seekers**, **college freshers**, **software developers**, and **career switchers**. They need to create, optimize, and tailor professional resumes for specific job descriptions quickly without struggling with formatting or getting rejected by Applicant Tracking Systems (ATS).

## Product Purpose

AI Resume Builder is an intelligent, full-stack career platform designed to help candidates land interviews. It eliminates resume formatting headaches and ATS rejection by providing instant parsing, deep job description keyword matching, AI-assisted content optimization, 11+ curated professional templates, and true-to-preview PDF export.

## Positioning

Unlike basic resume builders that produce generic templates or misaligned PDF exports, AI Resume Builder combines:
- **Intelligent Gemini AI Engine:** Real-time resume extraction, keyword gap analysis, and tailored bullet-point rewriting.
- **11+ Authentic ATS-Friendly Templates:** Handcrafted designs spanning Classic Executive, Dense Analyst, Modern Two-Column, and Tech Engineer styles.
- **Auto-Fit Density Engine:** Dynamically calculates content volume and adjusts vertical rhythm to eliminate awkward page breaks and half-empty trailing pages.
- **True A4 Print Parity:** High-resolution server-side Puppeteer export guaranteeing 100% fidelity between browser preview and downloaded PDF.

## Operating Context

- **Primary Workflows:**
  1. **Upload & Parse:** Drag-and-drop existing PDF or DOCX resume for automated structured data extraction.
  2. **Job Description Matching:** Paste target job descriptions to calculate ATS match percentages and missing skills.
  3. **AI Resume Tailoring:** One-click AI optimization enhancing bullet points and summary for target roles.
  4. **Live Template Customization:** Switch between 11+ templates, customize themes (colors/font sizing), and adjust spacing density.
  5. **Scratch Builder & Wizard:** Step-by-step guidance for freshers building their very first resume.
  6. **Export:** Download pixel-perfect A4 PDF or editable DOCX.

## Capabilities and Constraints

- **Capabilities:**
  - Multi-format file parsing (PDF via `pdf-parse`, DOCX via `mammoth`).
  - Google Gemini 2.5 Flash integration for fast resume rewriting and ATS scoring.
  - 11 dedicated React resume template components with auto-fit density levels (`density-compact`, `density-1`, `density-2`, `density-3`).
  - True A4 proportions (794px × 1123px at 96 DPI) with CSS scale transform for responsive previewing.
  - Puppeteer headless browser rendering for server-side PDF generation, backed by client-side browser print fallback.
- **Technical Constraints:**
  - Browser-first SPA deployed on Vercel with REST API deployed on Render.
  - Strict ATS compatibility: Single clean DOM flow without complex SVG layering or unreadable tables.
  - Cookie and Bearer token authentication supporting email/password and Google OAuth.

## Brand Commitments

- **Name:** AI Resume Builder
- **Tone & Voice:** Professional, confident, actionable, and modern.
- **Aesthetic:** Minimalist, high-craft, distraction-free interface with Geist Variable typography, high-contrast dark/light mode, and subtle accents.

## Evidence on Hand

- 11 fully functional resume templates in `client/src/templates/` ([ClassicAtsExecutive](file:///c:/Users/sunil/OneDrive/Desktop/AI-resume/AI-Resume-builder/client/src/templates/ClassicAtsExecutive.jsx), [TechEngineerClean](file:///c:/Users/sunil/OneDrive/Desktop/AI-resume/AI-Resume-builder/client/src/templates/TechEngineerClean.jsx), [DenseAnalystSerif](file:///c:/Users/sunil/OneDrive/Desktop/AI-resume/AI-Resume-builder/client/src/templates/DenseAnalystSerif.jsx), etc.).
- Normalized resume data schema in `client/src/templates/normalizeResume.js`.
- Automated density measurement hook in `client/src/hooks/useAutoDensity.ts`.
- Server-side Puppeteer export service in `server/src/services/pdfExport.service.js`.

## Product Principles

1. **ATS Parseability Above All:** Aesthetics must never break parsing by standard ATS scanners (Workday, Greenhouse, Lever).
2. **Zero Awkward White Space:** The auto-density system intelligently balances content so every resume feels complete and deliberately formatted on single or multi-page layouts.
3. **What You See Is What You Export:** 100% visual parity between the interactive editor preview and the exported PDF.
4. **Honest, High-Impact AI:** AI enhancements must sharpen phrasing and align with job descriptions without fabricating credentials or hallucinating experiences.
