import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ASSISTANT_MOODS, type AssistantMood } from "./assistantMoods";
import type { AssistantAction } from "./useAvatarStore";

interface Props {
  mood: AssistantMood;
  message: string | null;
  action?: AssistantAction | null;
  onDismiss: () => void;
  className?: string;
}

export function AvatarBubble({ mood, message, action, onDismiss, className }: Props) {
  const config = ASSISTANT_MOODS[mood] || ASSISTANT_MOODS.idle;
  const displayMessage = message || config.defaultMessage;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${mood}-${displayMessage}`}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 5, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`relative z-50 flex max-w-sm flex-col gap-2 rounded-2xl border bg-card/95 p-4 shadow-xl backdrop-blur-md dark:bg-card/90 ${config.accentBorder} ${className || ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badgeColor}`}
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            {config.label}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss assistant message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-sm font-medium leading-relaxed text-foreground">
          {displayMessage}
        </p>

        {action && (
          <div className="mt-1 flex items-center justify-end gap-2 pt-1">
            <Button
              size="sm"
              variant={action.variant || "default"}
              onClick={() => {
                action.onClick();
              }}
              className="h-7 text-xs font-semibold"
            >
              {action.label}
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

