import type { MascotExpression, MascotHandGesture } from "@/config/mascotBehaviors";

export interface FeatureTourItem {
  id: string;
  name: string;
  targetSelector: string;
  message: string;
  mood: MascotExpression;
  gesture: MascotHandGesture;
}

export interface ResumeSectionTourItem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  message: string;
  mood: MascotExpression;
  gesture: MascotHandGesture;
}

/**
 * Step 2: 7 Core Platform Features
 */
export const PLATFORM_FEATURES: FeatureTourItem[] = [
  {
    id: "resume-builder",
    name: "Resume Builder",
    targetSelector: '[data-onboarding-feature="resume-builder"], #feature-card-resume-builder',
    message: "Resume Builder: Build, import, and customize professional resumes with real-time formatting and live preview.",
    mood: "happy",
    gesture: "pointRight",
  },
  {
    id: "ai-optimization",
    name: "AI Resume Optimization",
    targetSelector: '[data-onboarding-feature="ai-optimization"], #feature-card-ai-optimization',
    message: "AI Resume Optimization: Score your resume against target jobs, identify missing keywords, and get instant rewrite suggestions.",
    mood: "thinking",
    gesture: "handsExplaining",
  },
  {
    id: "ats-checker",
    name: "ATS Checker",
    targetSelector: '[data-onboarding-feature="ats-checker"], #feature-card-ats-checker',
    message: "ATS Checker: Beat applicant tracking systems! Test any resume against real job descriptions to reveal match rates.",
    mood: "curious",
    gesture: "pointDown",
  },
  {
    id: "resume-templates",
    name: "Resume Templates",
    targetSelector: '[data-onboarding-feature="scratch-builder"], #feature-card-scratch-builder',
    message: "Resume Templates: Choose from single and multi-page templates crafted for tech, business, and creative roles.",
    mood: "excited",
    gesture: "thumbsUp",
  },
  {
    id: "portfolio-builder",
    name: "Portfolio Builder",
    targetSelector: '[data-onboarding-feature="portfolio-generator"], #feature-card-portfolio-generator',
    message: "Portfolio Builder: Transform your resume into a personalized, responsive developer portfolio in one click.",
    mood: "happy",
    gesture: "raiseHands",
  },
  {
    id: "portfolio-publishing",
    name: "Portfolio Publishing",
    targetSelector: '[data-onboarding-feature="portfolio-generator"], #feature-card-portfolio-generator',
    message: "Portfolio Publishing: Publish your live website with a custom slug and share your unique portfolio link with recruiters.",
    mood: "explaining",
    gesture: "handsExplaining",
  },
  {
    id: "export-features",
    name: "Resume and Portfolio Export",
    targetSelector: '[data-onboarding-feature="ai-resume-wizard"], #feature-card-ai-resume-wizard',
    message: "Resume & Portfolio Export: Download pixel-perfect A4 PDFs, editable DOCX files, and JSON backups anytime.",
    mood: "happy",
    gesture: "thumbsUp",
  },
];

/**
 * Step 4: 8 Resume Creation Sections
 */
export const RESUME_CREATION_SECTIONS: ResumeSectionTourItem[] = [
  {
    id: "personal-details",
    name: "Personal Details",
    iconName: "User",
    description: "Contact information, location, LinkedIn & GitHub links.",
    message: "Personal Details: Add your contact information, location, and social links to make reaching out easy.",
    mood: "happy",
    gesture: "pointRight",
  },
  {
    id: "summary",
    name: "Professional Summary",
    iconName: "Sparkles",
    description: "High-impact 2-3 sentence elevator pitch summarizing your core value.",
    message: "Professional Summary: Craft an impactful 2-3 sentence elevator pitch highlighting your core value.",
    mood: "explaining",
    gesture: "handsExplaining",
  },
  {
    id: "experience",
    name: "Work Experience",
    iconName: "Briefcase",
    description: "Detailed work history with action verbs and quantifiable results.",
    message: "Work Experience: Highlight your career impact with action verbs and quantifiable metrics.",
    mood: "thinking",
    gesture: "pointAtInput",
  },
  {
    id: "education",
    name: "Education",
    iconName: "GraduationCap",
    description: "Degrees, institutions, GPA/honors, and relevant academic highlights.",
    message: "Education: List degrees, institutions, graduation dates, and relevant coursework.",
    mood: "happy",
    gesture: "nod",
  },
  {
    id: "skills",
    name: "Skills",
    iconName: "Cpu",
    description: "Categorized technical and soft skills to maximize ATS keyword matches.",
    message: "Skills: Categorize technical and soft skills to pass automated ATS keyword screens.",
    mood: "excited",
    gesture: "thumbsUp",
  },
  {
    id: "projects",
    name: "Projects",
    iconName: "FolderGit2",
    description: "Showcase real-world applications with tech stacks and live URLs.",
    message: "Projects: Showcase real-world applications with live demos and repository links.",
    mood: "curious",
    gesture: "pointRight",
  },
  {
    id: "templates",
    name: "Templates",
    iconName: "Layout",
    description: "Curated modern, clean, and executive layout designs.",
    message: "Templates: Pick from curated layout designs that hiring managers and recruiters love.",
    mood: "happy",
    gesture: "handsExplaining",
  },
  {
    id: "preview-export",
    name: "Preview & Export",
    iconName: "FileDown",
    description: "Single-page density tuning, live ATS score, and instant PDF/DOCX downloads.",
    message: "Preview & Export: Verify layout density, live ATS score, and download ready-to-send PDFs.",
    mood: "welcome",
    gesture: "waveHello",
  },
];
