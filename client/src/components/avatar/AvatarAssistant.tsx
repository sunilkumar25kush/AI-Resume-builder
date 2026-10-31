import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Settings2, Sparkles } from "lucide-react";

import { useAvatarStore, type AssistantAction } from "./useAvatarStore";
import { ASSISTANT_MOODS, type AssistantMood } from "./assistantMoods";
import { AvatarView } from "./AvatarView";
import { AvatarBubble } from "./AvatarBubble";
import { AvatarSettingsDialog } from "./AvatarSettingsDialog";

interface Props {
  mode?: "floating" | "inline" | "compact";
  mood?: AssistantMood;
  message?: string | null;
  action?: AssistantAction | null;
  size?: number;
  className?: string;
  onDismiss?: () => void;
}

export function AvatarAssistant({
  mode = "floating",
  mood: propMood,
  message: propMessage,
  action: propAction,
  size,
  className = "",
  onDismiss,
}: Props) {
  const storeMood = useAvatarStore((state) => state.mood);
  const storeMessage = useAvatarStore((state) => state.message);
  const storeAction = useAvatarStore((state) => state.action);
  const resetToIdle = useAvatarStore((state) => state.resetToIdle);
  const enabled = useAvatarStore((state) => state.enabled);
  const minimized = useAvatarStore((state) => state.minimized);
  const toggleMinimized = useAvatarStore((state) => state.toggleMinimized);
  const getCharacter = useAvatarStore((state) => state.getCharacter);

  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!enabled) return null;

  const currentMood = propMood || storeMood;
  const currentMessage = propMessage !== undefined ? propMessage : storeMessage;
  const currentAction = propAction !== undefined ? propAction : storeAction;
  const character = getCharacter();
  const config = ASSISTANT_MOODS[currentMood] || ASSISTANT_MOODS.idle;

  const handleDismissBubble = () => {
    if (onDismiss) onDismiss();
    else resetToIdle();
  };

  // 1. INLINE MODE (e.g. Banners inside Wizard, Dashboard, or ATS page)
  if (mode === "inline") {
    const avatarDimension = size || 88;
    return (
      <div
        className={`relative flex items-center gap-4 rounded-2xl border p-4 shadow-sm backdrop-blur-sm transition-all sm:gap-6 sm:p-5 ${config.accentBorder} bg-card/80 ${className}`}
      >
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/30 overflow-hidden sm:h-24 sm:w-24">
            <AvatarView
              definition={character.definition}
              animation={config.animation}
              expression={config.expression}
              size={avatarDimension}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badgeColor}`}
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{character.name} (AI Companion)</span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-foreground sm:text-base">
            {currentMessage || config.defaultMessage}
          </p>
          {currentAction && (
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={currentAction.onClick}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                {currentAction.label}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. COMPACT MODE
  if (mode === "compact") {
    const avatarDimension = size || 48;
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <AvatarView
          definition={character.definition}
          animation={config.animation}
          expression={config.expression}
          size={avatarDimension}
        />
        {currentMessage && (
          <span className="text-xs font-medium text-muted-foreground">
            {currentMessage}
          </span>
        )}
      </div>
    );
  }

  // 3. FLOATING MODE (Global interactive companion in corner)
  const avatarDimension = size || (minimized ? 56 : 76);

  return (
    <>
      <div
        className={`fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6 ${className}`}
      >
        {/* Speech Bubble when message is active and not minimized */}
        {!minimized && currentMessage && (
          <div className="mb-1 w-full max-w-xs sm:max-w-sm">
            <AvatarBubble
              mood={currentMood}
              message={currentMessage}
              action={currentAction}
              onDismiss={handleDismissBubble}
            />
          </div>
        )}

        {/* Floating Avatar Trigger Bar */}
        <div className="relative flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 p-1.5 shadow-2xl backdrop-blur-md transition-all hover:border-primary/50">
          {/* Quick Settings Button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Assistant settings"
            aria-label="Assistant settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>

          {/* Toggle speech / Minimize Button */}
          <button
            type="button"
            onClick={toggleMinimized}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={minimized ? "Expand Assistant" : "Minimize Assistant"}
            aria-label={minimized ? "Expand Assistant" : "Minimize Assistant"}
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* Avatar Icon Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMinimized}
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-primary/10 via-background to-primary/20 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Interactive avatar companion: ${character.name}`}
          >
            <AvatarView
              definition={character.definition}
              animation={config.animation}
              expression={config.expression}
              size={avatarDimension}
            />
            {/* Status dot */}
            <span
              className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-background ${
                currentMood === "warning"
                  ? "bg-red-500 animate-ping"
                  : currentMood === "celebrating"
                  ? "bg-purple-500"
                  : currentMood === "thinking"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
          </motion.button>
        </div>
      </div>

      <AvatarSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
