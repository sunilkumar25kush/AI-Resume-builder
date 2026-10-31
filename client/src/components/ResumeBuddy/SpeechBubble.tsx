import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpeechAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface SpeechBubbleProps {
  text?: string;
  isThinking?: boolean;
  actions?: SpeechAction[];
  onDismiss?: () => void;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  typewriter?: boolean;
}

export function SpeechBubble({
  text,
  isThinking = false,
  actions = [],
  onDismiss,
  position = "top",
  className,
  typewriter = true,
}: SpeechBubbleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect matching Screenshot 3
  useEffect(() => {
    if (isThinking || !text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    if (!typewriter) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      currentIndex += 1;
      setDisplayedText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text, isThinking, typewriter]);

  const hasContent = isThinking || Boolean(text && text.length > 0);

  if (!hasContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: position === "top" ? 8 : -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={cn(
          "absolute pointer-events-auto z-50 flex flex-col items-center",
          position === "top" && "bottom-full mb-3",
          position === "bottom" && "top-full mt-3",
          position === "left" && "right-full mr-3 top-1/2 -translate-y-1/2",
          position === "right" && "left-full ml-3 top-1/2 -translate-y-1/2",
          className,
        )}
      >
        {/* Main Thought / Speech Bubble Shell */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-200 border",
            "bg-white/95 dark:bg-slate-900/95 border-emerald-500/20 dark:border-emerald-500/30 text-slate-900 dark:text-slate-100",
            "max-w-[280px] sm:max-w-[340px]",
            isThinking && "rounded-3xl px-5 py-3.5",
          )}
          style={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 12px rgba(84, 227, 37, 0.12)",
          }}
        >
          {/* Dismiss button */}
          {onDismiss && !isThinking && (
            <button
              onClick={onDismiss}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Thinking Dots Indicator (Reference Screenshots 2 & 5) */}
          {isThinking ? (
            <div className="flex items-center gap-1.5 py-1 px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <>
              {/* Typewriter message text */}
              <div className="text-[13px] leading-relaxed font-medium">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 bg-emerald-500 animate-pulse align-middle" />
                )}
              </div>

              {/* Action Buttons (Reference Screenshot 1) */}
              {actions && actions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95",
                        action.variant === "secondary"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow",
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 3 Thought Dots Connecting Bubble to Antenna (Signature Reference Style) */}
        {position === "top" && (
          <div className="flex flex-col items-center -space-y-0.5 mt-0.5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
          </div>
        )}

        {position === "bottom" && (
          <div className="flex flex-col-reverse items-center -space-y-0.5 mb-0.5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

