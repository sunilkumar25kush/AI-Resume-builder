import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Code2,
  Cpu,
  FileSearch,
  Globe,
  Layers,
  Sparkles,
} from "lucide-react";

export interface PortfolioCreationAnimationModalProps {
  isOpen: boolean;
  statusMessage?: string;
  uploadProgress?: number | null;
  templateName?: string;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
  icon: typeof Sparkles;
}

const CREATION_STEPS: StepItem[] = [
  {
    id: 1,
    label: "Scanning Career Architecture",
    detail: "Parsing resume format, layout hierarchy, and contact metadata...",
    icon: FileSearch,
  },
  {
    id: 2,
    label: "Extracting Stack & Experience",
    detail: "Identifying skills, impact metrics, work history, and education...",
    icon: Code2,
  },
  {
    id: 3,
    label: "Gemini AI Narrative Synthesis",
    detail: "Crafting engaging headlines, bio overview, and project descriptions...",
    icon: Cpu,
  },
  {
    id: 4,
    label: "Compiling Portfolio Template",
    detail: "Assembling cosmic dark aesthetic, orbital avatars, and interactive cards...",
    icon: Layers,
  },
  {
    id: 5,
    label: "Portfolio Generated!",
    detail: "Configuring public slug routing and launching editor studio...",
    icon: Globe,
  },
];

const TELEMETRY_LOGS = [
  "Initializing Gemini AI model pipeline...",
  "Running optical layout and text analysis...",
  "Synthesizing punchy developer headline & bio...",
  "Formatting technical skill badges & proficiency tags...",
  "Generating responsive section ordering & schema...",
  "Styling orbital avatar ring and cosmic background shaders...",
  "Compiling glassmorphic cards and interactive terminal snippet...",
  "Finalizing portfolio draft payload...",
];

export function PortfolioCreationAnimationModal({
  isOpen,
  statusMessage,
  uploadProgress,
  templateName = "DevPort",
}: PortfolioCreationAnimationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [logIndex, setLogIndex] = useState(0);

  // Progressive simulation to keep the UI delightfully interactive
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgressPercent(15);
      setLogIndex(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < CREATION_STEPS.length - 2) return prev + 1;
        return prev;
      });
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (uploadProgress && uploadProgress > prev) {
          return uploadProgress;
        }
        if (prev < 92) {
          return prev + Math.floor(Math.random() * 8) + 4;
        }
        return prev;
      });
    }, 450);

    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % TELEMETRY_LOGS.length);
    }, 1500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [isOpen, uploadProgress]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Dark cosmic backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#090a16]/85 backdrop-blur-xl"
        />

        {/* Ambient radial glow orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-500/15 blur-[120px] animate-pulse" />
        </div>

        {/* Main modal container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-white/15 bg-[#0e1022]/95 p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(6,182,212,0.25)] backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
        >
          {/* Top glowing core orb */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
              {/* Spinning gradient ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-pink-500 border-b-purple-500 shadow-[0_0_25px_rgba(6,182,212,0.6)]"
              />
              {/* Inner glowing pulse */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md">
                <Sparkles className="h-7 w-7 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-pink-400">
              Generating Your Portfolio
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 font-mono">
              Applying <span className="text-cyan-400 font-semibold">{templateName}</span> template & AI intelligence
            </p>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">AI Synthesizer</span>
              <span className="text-cyan-400 font-semibold">{Math.min(progressPercent, 98)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                initial={{ width: "15%" }}
                animate={{ width: `${Math.min(progressPercent, 98)}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stepper Steps List */}
          <div className="mt-6 space-y-3">
            {CREATION_STEPS.slice(0, 4).map((step, idx) => {
              const StepIcon = step.icon;
              const isDone = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3.5 rounded-xl p-2.5 transition-all duration-300 ${
                    isCurrent
                      ? "bg-white/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : isDone
                      ? "bg-white/5 opacity-80"
                      : "opacity-40"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isCurrent
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 animate-pulse"
                        : "bg-white/5 text-neutral-400 border border-white/10"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? "text-cyan-300"
                            : isDone
                            ? "text-neutral-200"
                            : "text-neutral-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-400 line-clamp-1">
                      {isCurrent && statusMessage ? statusMessage : step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal Telemetry Log Footer */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#090a16]/90 p-3 font-mono text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>LIVE AI PIPELINE TELEMETRY</span>
            </div>
            <p className="text-cyan-300/90 truncate">
              &gt; {TELEMETRY_LOGS[logIndex]}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
