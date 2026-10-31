import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpeechAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface SpeechValidationTip {
  fieldLabel?: string;
  incorrect?: string;
  correct?: string;
}

export interface MascotAiSuggestion {
  id: string;
  type: "skills" | "summary" | "experience" | "project" | "education" | "portfolio" | "general";
  title?: string;
  originalText: string;
  suggestedText: string;
  items?: string[];
  fieldId?: string;
  onAccept?: (appliedValue: string | string[]) => void;
  onReject?: () => void;
  onEdit?: (customValue: string) => void;
}

export interface MascotSpeechBubbleProps {
  text?: string;
  isThinking?: boolean;
  actions?: SpeechAction[];
  onDismiss?: () => void;
  position?: "top" | "bottom" | "left" | "right";
  align?: "left" | "right" | "center";
  className?: string;
  typewriter?: boolean;
  autoDismissMs?: number;
  validationTip?: SpeechValidationTip;
  aiSuggestion?: MascotAiSuggestion;
}

export function MascotSpeechBubble({
  text,
  isThinking = false,
  actions = [],
  onDismiss,
  position = "top",
  align = "center",
  className,
  typewriter = true,
  autoDismissMs,
  validationTip,
  aiSuggestion,
}: MascotSpeechBubbleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customText, setCustomText] = useState("");
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync custom text when aiSuggestion changes
  useEffect(() => {
    if (aiSuggestion?.suggestedText) {
      setCustomText(aiSuggestion.suggestedText);
      setIsEditingCustom(false);
    }
  }, [aiSuggestion]);

  // Typewriter effect matching Reference Screenshots
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

  // Auto-dismissal with pause on hover
  useEffect(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    // Do not auto-dismiss if user is interacting with an AI suggestion or actions
    if (
      !autoDismissMs ||
      autoDismissMs <= 0 ||
      isPaused ||
      isThinking ||
      !text ||
      actions.length > 0 ||
      aiSuggestion !== undefined
    ) {
      return;
    }

    dismissTimerRef.current = setTimeout(() => {
      onDismiss?.();
    }, autoDismissMs);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [autoDismissMs, isPaused, isThinking, text, actions.length, aiSuggestion, onDismiss]);

  const hasContent = isThinking || Boolean(text && text.length > 0) || Boolean(aiSuggestion);

  if (!hasContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: position === "top" ? 8 : -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
        transition={{ type: "spring", damping: 22, stiffness: 320 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={cn(
          "absolute pointer-events-auto z-50 flex flex-col",
          align === "right" && "items-end right-0",
          align === "left" && "items-start left-0",
          align === "center" && "items-center left-1/2 -translate-x-1/2",
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
            "max-w-[290px] sm:max-w-[360px]",
            isThinking && "rounded-3xl px-5 py-3.5",
          )}
          style={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 0 14px rgba(84, 227, 37, 0.15)",
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

          {/* Thinking Dots (Reference Screenshots 2 & 5) */}
          {isThinking ? (
            <div className="flex items-center gap-1.5 py-1 px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <>
              {/* Typewriter message text */}
              {displayedText && (
                <div className="text-[13px] leading-relaxed font-medium">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-3 ml-0.5 bg-emerald-500 animate-pulse align-middle" />
                  )}
                </div>
              )}

              {/* Contextual Validation Examples (Incorrect vs Correct) */}
              {validationTip && (validationTip.incorrect || validationTip.correct) && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left">
                  {validationTip.incorrect && (
                    <div className="flex items-start gap-1.5 px-2 py-1 rounded bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-[11px] font-mono text-rose-700 dark:text-rose-300">
                      <span className="font-sans font-bold text-rose-500 shrink-0">✕</span>
                      <div className="min-w-0">
                        <span className="font-sans text-[10px] uppercase font-semibold text-rose-500 mr-1.5">Incorrect:</span>
                        <span className="break-all">{validationTip.incorrect}</span>
                      </div>
                    </div>
                  )}
                  {validationTip.correct && (
                    <div className="flex items-start gap-1.5 px-2 py-1 rounded bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                      <span className="font-sans font-bold text-emerald-500 shrink-0">✓</span>
                      <div className="min-w-0">
                        <span className="font-sans text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 mr-1.5">Correct:</span>
                        <span className="break-all">{validationTip.correct}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Contextual Suggestions */}
              {aiSuggestion && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2 text-left">
                  {/* Header Title with Edit Toggle */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{aiSuggestion.title || "AI Suggestions:"}</span>
                    </span>
                    {aiSuggestion.onEdit && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCustom(!isEditingCustom)}
                        className="text-[10px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        {isEditingCustom ? "Preview" : "Edit"}
                      </button>
                    )}
                  </div>

                  {/* Tag List for Skills (Example 1: HTML5, CSS3, JavaScript (ES6+)) */}
                  {aiSuggestion.items && aiSuggestion.items.length > 0 && !isEditingCustom && (
                    <div className="flex flex-wrap gap-1.5 my-1.5">
                      {aiSuggestion.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80 shadow-xs"
                        >
                          <span className="text-emerald-500 mr-1 font-bold">+</span> {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggestion Text Box or Inline Editor */}
                  {aiSuggestion.suggestedText && !aiSuggestion.items && (
                    <>
                      {isEditingCustom ? (
                        <textarea
                          rows={3}
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="w-full text-xs p-2 rounded-md border border-emerald-400 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      ) : (
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                          {aiSuggestion.suggestedText}
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons: Accept / Edit / Dismiss */}
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    {aiSuggestion.onReject && (
                      <button
                        type="button"
                        onClick={aiSuggestion.onReject}
                        className="text-xs font-medium px-2.5 py-1 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Dismiss
                      </button>
                    )}

                    {aiSuggestion.onEdit && !isEditingCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCustom(true);
                          setCustomText(aiSuggestion.suggestedText || "");
                        }}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                    )}

                    {aiSuggestion.onAccept && (
                      <button
                        type="button"
                        onClick={() => {
                          const appliedVal = isEditingCustom
                            ? customText
                            : (aiSuggestion.items ?? aiSuggestion.suggestedText ?? "");
                          aiSuggestion.onAccept?.(appliedVal);
                        }}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Speech Actions (if no aiSuggestion) */}
              {!aiSuggestion && actions && actions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
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

        {/* 3 Thought Dots Connecting Bubble to Antenna Tip */}
        {position === "top" && (
          <div
            className={cn(
              "flex flex-col -space-y-0.5 mt-0.5 pointer-events-none",
              align === "right" ? "items-end pr-10" : align === "left" ? "items-start pl-10" : "items-center",
            )}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
          </div>
        )}

        {position === "bottom" && (
          <div
            className={cn(
              "flex flex-col-reverse -space-y-0.5 mb-0.5 pointer-events-none",
              align === "right" ? "items-end pr-10" : align === "left" ? "items-start pl-10" : "items-center",
            )}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm" />
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Backward-compatible alias
export { MascotSpeechBubble as SpeechBubble };
