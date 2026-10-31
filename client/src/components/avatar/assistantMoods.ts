export type AssistantMood =
  | "idle"
  | "happy"
  | "welcome"
  | "thinking"
  | "confused"
  | "sad"
  | "warning"
  | "explaining"
  | "celebrating";

export interface MoodConfig {
  animation: string;
  expression?: string;
  label: string;
  badgeColor: string;
  accentBorder: string;
  defaultMessage: string;
}

export const ASSISTANT_MOODS: Record<AssistantMood, MoodConfig> = {
  idle: {
    animation: "idle",
    label: "Ready",
    badgeColor: "bg-muted text-muted-foreground",
    accentBorder: "border-border",
    defaultMessage: "I'm here to help you build and optimize your resume.",
  },
  happy: {
    animation: "happy",
    label: "Great Job!",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accentBorder: "border-emerald-500/30",
    defaultMessage: "Looking good! That looks well formatted.",
  },
  welcome: {
    animation: "excited",
    label: "Welcome!",
    badgeColor: "bg-primary/10 text-primary",
    accentBorder: "border-primary/40",
    defaultMessage: "Hi there! Let's craft an outstanding, ATS-optimized resume together.",
  },
  thinking: {
    animation: "thinking",
    label: "Analyzing...",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accentBorder: "border-amber-500/30",
    defaultMessage: "Analyzing your content and comparing against ATS standards...",
  },
  confused: {
    animation: "confused",
    label: "Need Help?",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accentBorder: "border-amber-500/30",
    defaultMessage: "Something seems unclear or missing. Let's review this section.",
  },
  sad: {
    animation: "sad",
    label: "Attention Needed",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    accentBorder: "border-rose-500/30",
    defaultMessage: "This score or section could use some improvement to pass automated filters.",
  },
  warning: {
    animation: "suspicious",
    expression: "expression-3d2bed26-f97c-477d-922f-77600cb10e92",
    label: "Validation Alert",
    badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400",
    accentBorder: "border-red-500/40",
    defaultMessage: "Please check this field! Valid contact and details ensure recruiters can reach you.",
  },
  explaining: {
    animation: "listening",
    label: "Tip",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accentBorder: "border-blue-500/30",
    defaultMessage: "Pro-tip: Include measurable metrics and action verbs for maximum ATS impact.",
  },
  celebrating: {
    animation: "celebrate",
    label: "Outstanding!",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    accentBorder: "border-purple-500/40",
    defaultMessage: "Fantastic work! Your resume is highly competitive and ready to impress.",
  },
};

