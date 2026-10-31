import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Compass,
  Minimize2,
  EyeOff,
  Smile,
} from "lucide-react";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import { MascotRenderer } from "./MascotRenderer";
import type { MascotMood } from "@/config/mascotBehaviors";
import { cn } from "@/lib/utils";

export interface MascotAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MascotAssistantPanel({ isOpen, onClose }: MascotAssistantPanelProps) {
  const {
    state,
    react,
    say,
    dock,
    reanchor,
    isCustomPositioned,
    toggleMinimize,
    setDisabled,
    triggerGesture,
  } = useResumeBuddy();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  const quickMoods: MascotMood[] = ["celebrate", "happy", "thinking", "curious", "playful", "proud"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-end p-4 pointer-events-none">
        {/* Backdrop for closing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
        />

        {/* Floating Slide-In Assistant Card */}
        <motion.div
          initial={{ x: 340, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 340, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          role="dialog"
          aria-modal="true"
          aria-label="ResumeBuddy Assistant Panel"
          className={cn(
            "relative w-full max-w-sm rounded-3xl p-5 shadow-2xl pointer-events-auto border",
            "bg-white/95 dark:bg-slate-900/95 border-emerald-500/20 dark:border-emerald-500/30 text-slate-900 dark:text-slate-100",
          )}
          style={{
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(84, 227, 37, 0.15)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <MascotRenderer
                  characterId={state.characterId}
                  mood={state.mood}
                  size={48}
                />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">ResumeBuddy</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Assistant
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Close assistant panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Context & Status */}
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Positioning Active</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              I smoothly float near your active forms, validate entries in real-time, and celebrate your ATS wins!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Quick Actions
            </span>

            {isCustomPositioned && (
              <button
                onClick={() => {
                  reanchor();
                  say("Re-anchored to active content!", { mood: "happy", autoDismissMs: 3000 });
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>Re-anchor to current section</span>
              </button>
            )}

            <button
              onClick={() => {
                triggerGesture("wave");
                say("Hello! I'm tracking your resume sections. Need guidance with formatting or keywords?", {
                  mood: "happy",
                  gesture: "wave",
                  autoDismissMs: 6000,
                });
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <Smile className="w-4 h-4 text-emerald-500" />
              <span>Say Hello / Wave</span>
            </button>

            <button
              onClick={() => {
                dock();
                say("Docked in the corner! Drag me or click anytime to wake me up.", {
                  mood: "idle",
                  autoDismissMs: 4000,
                });
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <Minimize2 className="w-4 h-4 text-slate-500" />
              <span>Dock to corner</span>
            </button>
          </div>

          {/* Emotional Reactions */}
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Test Moods & Reactions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickMoods.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    react(m, 4000);
                    triggerGesture("bounce");
                  }}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg font-medium capitalize transition-all active:scale-95",
                    state.mood === m
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                toggleMinimize(true);
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Minimize to Pill
            </button>

            <button
              onClick={() => {
                setDisabled(true);
                onClose();
              }}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Disable Assistant
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
