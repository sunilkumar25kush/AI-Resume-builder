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

    let currentIndex = 0;
    setDisplayedText("");
    setIsTyping(true);

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

  // Auto-dismiss management
  useEffect(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

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
          position === "top" && "bottom-full mb-2.5",
          position === "bottom" && "top-full mt-2.5",
          position === "left" && "right-full mr-3 top-1/2 -translate-y-1/2",
          position === "right" && "left-full ml-3 top-1/2 -translate-y-1/2",
          className,
        )}
      >
        {/* Main Thought / Speech Bubble Shell matching user reference screenshots */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            "relative rounded-[24px] px-4 py-3 transition-all duration-200 border",
            // Pastel pale lime-cream background with dark forest-green text
            "bg-[#edf8d8] dark:bg-[#182614] border-[#cdeaa3] dark:border-emerald-600/40 text-[#17270f] dark:text-[#edf9dd]",
            "max-w-[290px] sm:max-w-[360px]",
            isThinking && "rounded-full px-4 py-2",
          )}
          style={{
            boxShadow: "0 12px 30px -4px rgba(0, 0, 0, 0.15), 0 0 16px rgba(84, 227, 37, 0.16)",
          }}
        >
          {/* Subtle Close button in top-right corner */}
          {onDismiss && !isThinking && (
            <button
              onClick={onDismiss}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#edf8d8] dark:bg-[#182614] hover:bg-[#deeebe] dark:hover:bg-[#22351c] text-[#17270f] dark:text-[#edf9dd] shadow-sm border border-[#cdeaa3] dark:border-emerald-600/40 flex items-center justify-center transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Thinking Dots (Reference Screenshot 2) */}
          {isThinking ? (
            <div className="flex items-center gap-1.5 py-0.5 px-1">
              <span className="w-2 h-2 rounded-full bg-[#54e325] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-[#54e325] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-[#54e325] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <>
              {/* Typewriter message text matching Reference Screenshot 3 */}
              {displayedText && (
                <div className="text-[13.5px] leading-relaxed font-medium">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-3 ml-0.5 bg-[#54e325] animate-pulse align-middle" />
                  )}
                </div>
              )}

              {/* Contextual Validation Examples (Incorrect vs Correct) matching Reference Screenshot 4 */}
              {validationTip && (validationTip.incorrect || validationTip.correct) && (
                <div className="mt-2.5 pt-2 border-t border-[#cdeaa3]/70 dark:border-emerald-800/60 space-y-1.5 text-left">
                  {validationTip.incorrect && (
                    <div className="flex items-start gap-1.5 px-2 py-1 rounded-lg bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-[11px] font-mono text-rose-700 dark:text-rose-300">
                      <span className="font-sans font-bold text-rose-500 shrink-0">✕</span>
                      <div className="min-w-0">
                        <span className="font-sans text-[10px] uppercase font-semibold text-rose-500 mr-1.5">Incorrect:</span>
                        <span className="break-all">{validationTip.incorrect}</span>
                      </div>
                    </div>
                  )}
                  {validationTip.correct && (
                    <div className="flex items-start gap-1.5 px-2 py-1 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
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
                <div className="mt-2.5 pt-2 border-t border-[#cdeaa3]/70 dark:border-emerald-800/60 space-y-2 text-left">
                  {/* Header Title with Edit Toggle */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{aiSuggestion.title || "AI Suggestions:"}</span>
                    </span>
                    {aiSuggestion.onEdit && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCustom(!isEditingCustom)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        <span>{isEditingCustom ? "Cancel" : "Edit"}</span>
                      </button>
                    )}
                  </div>

                  {/* Suggestion Content */}
                  {isEditingCustom ? (
                    <div className="space-y-1.5">
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2 rounded-lg border border-[#cdeaa3] dark:border-emerald-800 bg-white/90 dark:bg-slate-900/90 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
                        placeholder="Customize AI suggestion..."
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            aiSuggestion.onEdit?.(customText);
                            aiSuggestion.onAccept?.(customText);
                            setIsEditingCustom(false);
                            onDismiss?.();
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#161616] text-white dark:bg-emerald-500 dark:text-slate-950 hover:opacity-90 active:scale-95 transition-all"
                        >
                          Apply Custom
                        </button>
                      </div>
                    </div>
                  ) : aiSuggestion.items && aiSuggestion.items.length > 0 ? (
                    /* Structured Skill Pills */
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {aiSuggestion.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#def2bd] dark:bg-emerald-950/80 border border-[#c5e694] dark:border-emerald-700/60 text-[#17270f] dark:text-emerald-200 text-xs font-semibold shadow-xs"
                        >
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    /* Text Block suggestion */
                    <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-[#cdeaa3] dark:border-emerald-800/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans shadow-xs">
                      {aiSuggestion.suggestedText}
                    </div>
                  )}

                  {/* AI Actions: Accept, Edit, Reject */}
                  {!isEditingCustom && (
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      {aiSuggestion.onReject && (
                        <button
                          type="button"
                          onClick={() => {
                            aiSuggestion.onReject?.();
                            onDismiss?.();
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition active:scale-95 border border-[#cdeaa3] dark:border-slate-700"
                        >
                          Dismiss
                        </button>
                      )}
                      {aiSuggestion.onAccept && (
                        <button
                          type="button"
                          onClick={() => {
                            const valToApply = aiSuggestion.items && aiSuggestion.items.length > 0
                              ? aiSuggestion.items
                              : aiSuggestion.suggestedText;
                            aiSuggestion.onAccept?.(valToApply);
                            onDismiss?.();
                          }}
                          className="px-3 py-1 text-[11px] font-semibold rounded-full bg-[#161616] hover:bg-[#282828] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 shadow-sm active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons matching Reference Screenshot 1 (solid dark pill button e.g. 'Okay, add my email') */}
              {!aiSuggestion && actions && actions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2 pt-1">
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      className={cn(
                        "text-xs font-semibold px-4 py-2 rounded-full transition-all duration-150 active:scale-95 shadow-sm",
                        action.variant === "secondary"
                          ? "bg-white/80 dark:bg-slate-800 text-[#17270f] dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-[#cdeaa3] dark:border-slate-700"
                          : "bg-[#161616] hover:bg-[#282828] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950",
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

        {/* 3 Connected Thought Circles matching user reference screenshots */}
        {position === "top" && (
          <div
            className={cn(
              "flex flex-col -space-y-0.5 mt-0.5 pointer-events-none",
              align === "right" ? "items-end pr-8" : align === "left" ? "items-start pl-8" : "items-center",
            )}
          >
            {/* Top / largest dot near speech bubble */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#edf8d8] dark:bg-[#182614] border border-[#cdeaa3] dark:border-emerald-600/40 shadow-xs" />
            {/* Middle dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#edf8d8] dark:bg-[#182614] border border-[#cdeaa3] dark:border-emerald-600/40 shadow-xs" />
            {/* Smallest dot near antenna bulb */}
            <div className="w-1 h-1 rounded-full bg-[#54e325]" />
          </div>
        )}

        {position === "bottom" && (
          <div
            className={cn(
              "flex flex-col-reverse -space-y-0.5 mb-0.5 pointer-events-none",
              align === "right" ? "items-end pr-8" : align === "left" ? "items-start pl-8" : "items-center",
            )}
          >
            {/* Largest dot near speech bubble */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#edf8d8] dark:bg-[#182614] border border-[#cdeaa3] dark:border-emerald-600/40 shadow-xs" />
            {/* Middle dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#edf8d8] dark:bg-[#182614] border border-[#cdeaa3] dark:border-emerald-600/40 shadow-xs" />
            {/* Smallest dot near antenna bulb */}
            <div className="w-1 h-1 rounded-full bg-[#54e325]" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Backward-compatible alias
export { MascotSpeechBubble as SpeechBubble };
