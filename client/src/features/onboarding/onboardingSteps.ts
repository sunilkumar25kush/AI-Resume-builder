import type { MascotMood } from "@/config/mascotBehaviors";

export interface OnboardingStep {
  id: string;
  targetSelector: string;
  title: string;
  message: string;
  mood: MascotMood;
  placement?: "right" | "left" | "top" | "bottom" | "top-right";
}

export const DASHBOARD_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    targetSelector: "#dashboard-welcome",
    title: "Welcome to your AI Resume Hub!",
    message: "Hi! I'm ResumeBuddy. I'll help you craft top-tier resumes and beat ATS filters.",
    mood: "happy",
    placement: "right",
  },
  {
    id: "create-action",
    targetSelector: "#btn-create-resume",
    title: "Start Building",
    message: "Click here to build a new resume with our AI Wizard or import an existing PDF.",
    mood: "excited",
    placement: "bottom",
  },
  {
    id: "ats-quick-check",
    targetSelector: "#ats-quick-card",
    title: "ATS Optimization",
    message: "Run your resume against real job descriptions to reveal missing keywords.",
    mood: "curious",
    placement: "right",
  },
];

