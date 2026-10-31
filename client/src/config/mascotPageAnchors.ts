import type { MascotExpression, MascotHandGesture } from "./mascotBehaviors";
import type { MascotPlacement } from "@/components/ResumeBuddy/MascotPositionEngine";

export interface PageMascotAnchorConfig {
  name: string;
  match: (pathname: string) => boolean;
  defaultSelector?: string;
  sectionSelectors: string[];
  preferredPlacement: MascotPlacement;
  greeting?: {
    text: string;
    mood: MascotExpression;
    gesture?: MascotHandGesture;
    autoDismissMs?: number;
  };
}

/**
 * Registry of contextual anchors, visibility sections, and positioning preferences
 * for all routes in the AI Resume Builder.
 */
export const PAGE_MASCOT_CONFIGS: PageMascotAnchorConfig[] = [
  // 1. Landing / Authentication Pages
  {
    name: "auth-login",
    match: (path) => path === "/login",
    defaultSelector: '[data-mascot-section="auth"], form, .auth-card',
    sectionSelectors: [
      '[data-mascot-section="auth"]',
      'form',
      '#login-card',
      '.auth-card',
      'button[type="submit"]',
    ],
    preferredPlacement: "top-right",
    greeting: {
      text: "Welcome back! Sign in to continue crafting your AI resume.",
      mood: "welcome",
      gesture: "waveHello",
      autoDismissMs: 6500,
    },
  },
  {
    name: "auth-register",
    match: (path) => path === "/register",
    defaultSelector: '[data-mascot-section="auth"], form, .auth-card',
    sectionSelectors: [
      '[data-mascot-section="auth"]',
      'form',
      '#register-card',
      '.auth-card',
      'button[type="submit"]',
    ],
    preferredPlacement: "top-right",
    greeting: {
      text: "Ready to land your dream job? Let's build a stand-out resume together!",
      mood: "excited",
      gesture: "thumbsUp",
      autoDismissMs: 6500,
    },
  },
  {
    name: "auth-password",
    match: (path) => path.startsWith("/forgot-password") || path.startsWith("/reset-password"),
    defaultSelector: '[data-mascot-section="auth"], form',
    sectionSelectors: ['[data-mascot-section="auth"]', 'form'],
    preferredPlacement: "top-right",
  },

  // 2. Dashboard
  {
    name: "dashboard",
    match: (path) => path === "/",
    defaultSelector: '[data-mascot-section="welcome"], #dashboard-features',
    sectionSelectors: [
      '[data-mascot-section="welcome"]',
      '#dashboard-features',
      '[data-mascot-section="features"]',
      '[data-mascot-section="stats"]',
      '[data-mascot-section="resumes"]',
    ],
    preferredPlacement: "top-right",
  },

  // 3. Resume Creation / Wizard & Scratch Build
  {
    name: "resume-wizard",
    match: (path) => path.startsWith("/wizard"),
    defaultSelector: '#wizard-step-content, [data-mascot-section="wizard-content"]',
    sectionSelectors: [
      '[data-mascot-section="wizard-steps"]',
      '#wizard-step-content',
      '[data-mascot-section="wizard-content"]',
      '[data-mascot-section="template-choice"]',
    ],
    preferredPlacement: "top-right",
    greeting: {
      text: "I'll guide you step-by-step through our 8-step AI Resume Wizard!",
      mood: "happy",
      gesture: "waveHello",
      autoDismissMs: 6000,
    },
  },
  {
    name: "resume-scratch-build",
    match: (path) => path.startsWith("/build"),
    defaultSelector: '[data-mascot-section="build-template"], form, main > div',
    sectionSelectors: [
      '[data-mascot-section="build-template"]',
      '[data-mascot-section="build-options"]',
      'form',
    ],
    preferredPlacement: "top-right",
  },

  // 4. Resume Editor (Interactive Section Tracking)
  {
    name: "resume-editor",
    match: (path) => /^\/resumes\/[^/]+\/edit/.test(path),
    defaultSelector: '[data-mascot-section="personal-info"], .editor-form-card',
    sectionSelectors: [
      '[data-mascot-section="personal-info"]',
      '[data-mascot-section="work"]',
      '[data-mascot-section="education"]',
      '[data-mascot-section="skills"]',
      '[data-mascot-section="projects"]',
      '[data-mascot-section="summary"]',
      '[data-mascot-section="certifications"]',
      '[data-mascot-section="languages"]',
      '[data-mascot-section="awards"]',
      '[data-mascot-section^="custom-"]',
      '.editor-form-card',
      '[data-mascot-section="preview-pane"]',
    ],
    preferredPlacement: "top-right",
    greeting: {
      text: "Editing your resume! I'll validate your entries as you fill them out.",
      mood: "curious",
      gesture: "handsExplaining",
      autoDismissMs: 5500,
    },
  },

  // 5. Resume Preview & Export
  {
    name: "resume-preview",
    match: (path) => /^\/resumes\/[^/]+$/.test(path),
    defaultSelector: '[data-mascot-section="template-picker"], [data-mascot-section="resume-preview"]',
    sectionSelectors: [
      '[data-mascot-section="header-actions"]',
      '[data-mascot-section="template-picker"]',
      '[data-mascot-section="density-controls"]',
      '[data-mascot-section="resume-preview"]',
      '#score-ring-card',
    ],
    preferredPlacement: "top-right",
  },

  // 6. ATS Checker
  {
    name: "ats-checker",
    match: (path) => path.startsWith("/ats-check"),
    defaultSelector: '[data-mascot-section="resume-select"], [data-mascot-section="jd-input"]',
    sectionSelectors: [
      '[data-mascot-section="resume-select"]',
      '[data-mascot-section="jd-input"]',
      '#score-ring-card',
      '[data-mascot-section="ats-score"]',
      '[data-mascot-section="ats-feedback"]',
    ],
    preferredPlacement: "top-right",
    greeting: {
      text: "Let's check your ATS score against job descriptions to pass automated screeners!",
      mood: "thinking",
      gesture: "handOnChin",
      autoDismissMs: 6500,
    },
  },

  // 7. Portfolio Builder
  {
    name: "portfolios",
    match: (path) => path === "/portfolios",
    defaultSelector: '[data-mascot-section="portfolios-header"], [data-mascot-section="portfolios-grid"]',
    sectionSelectors: [
      '[data-mascot-section="portfolios-header"]',
      '[data-mascot-section="portfolios-grid"]',
      '[data-mascot-section="create-portfolio"]',
    ],
    preferredPlacement: "top-right",
  },

  // 8. Portfolio Editor
  {
    name: "portfolio-editor",
    match: (path) => /^\/portfolios\/[^/]+\/edit/.test(path),
    defaultSelector: '[data-mascot-section="portfolio-controls"], [data-mascot-section="portfolio-preview"]',
    sectionSelectors: [
      '[data-mascot-section="portfolio-controls"]',
      '[data-mascot-section="portfolio-tabs"]',
      '[data-mascot-section="portfolio-preview"]',
    ],
    preferredPlacement: "top-right",
  },

  // 9. Settings
  {
    name: "settings",
    match: (path) => path.startsWith("/settings"),
    defaultSelector: '[data-mascot-section="settings-appearance"], [data-mascot-section="settings-companion"]',
    sectionSelectors: [
      '[data-mascot-section="settings-appearance"]',
      '[data-mascot-section="settings-companion"]',
      '[data-mascot-section="settings-preferences"]',
      '[data-mascot-section="settings-account"]',
    ],
    preferredPlacement: "top-right",
  },

  // 10. Optimizations & JDs
  {
    name: "optimizations",
    match: (path) => path.startsWith("/optimize") || path.startsWith("/jds"),
    defaultSelector: 'main > section, .card, form',
    sectionSelectors: ['[data-mascot-section]', 'main > section', '.card', 'form'],
    preferredPlacement: "top-right",
  },
];

/**
 * Resolve page mascot configuration by current route pathname
 */
export function getPageMascotConfig(pathname: string): PageMascotAnchorConfig | undefined {
  return PAGE_MASCOT_CONFIGS.find((config) => config.match(pathname));
}
