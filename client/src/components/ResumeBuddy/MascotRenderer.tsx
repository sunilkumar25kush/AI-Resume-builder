import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@bible-strong/avatar-react";
import type { AnimationKey, ExpressionKey } from "@bible-strong/avatar-core";
import { getAvatarCharacter } from "@/components/avatar/avatarDefinitions";
import { MASCOT_BEHAVIORS, type MascotExpression, type MascotHandGesture } from "@/config/mascotBehaviors";
import { MascotGestureController } from "./MascotGestureController";
import { cn } from "@/lib/utils";

export interface MascotRendererProps {
  characterId?: string;
  sequence?: AnimationKey;
  expression?: ExpressionKey;
  mood?: MascotExpression;
  gesture?: MascotHandGesture;
  targetBearing?: "left" | "right" | "above" | "below" | "center";
  size?: number;
  className?: string;
  isSleeping?: boolean;
  isHovered?: boolean;
}

export function MascotRenderer({
  characterId,
  sequence = "idle",
  expression,
  mood = "idle",
  gesture = "none",
  targetBearing = "center",
  size = 96,
  className,
  isSleeping = false,
  isHovered = false,
}: MascotRendererProps) {
  const [loadError, setLoadError] = useState(false);

  const character = useMemo(() => {
    return getAvatarCharacter(characterId);
  }, [characterId]);

  // Strict lowercase hex color schema: ^#[0-9a-f]{6}$
  const buddyDefinition = useMemo(() => {
    const def = character.definition;
    const isCustomBuddy = !characterId || characterId === "buddy";

    if (!isCustomBuddy) {
      return def;
    }

    return {
      ...def,
      colors: {
        body: "#54e325" as const,
        eyes: "#111827" as const,
      },
    };
  }, [character, characterId]);

  const behaviorConfig = MASCOT_BEHAVIORS[mood] || MASCOT_BEHAVIORS.idle;
  const gestureAnim = MascotGestureController.getGestureAnimation(gesture, targetBearing);

  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Soft neon ambient aura glow */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-500 pointer-events-none"
        style={{
          boxShadow: isSleeping
            ? "0 0 10px rgba(80, 100, 160, 0.2)"
            : isHovered
            ? "0 0 32px rgba(84, 227, 37, 0.85)"
            : `${behaviorConfig.glowIntensity} ${behaviorConfig.glowColor}`,
          opacity: isSleeping ? 0.35 : isHovered ? 1 : 0.85,
        }}
      />

      {/* Signature Antenna matching reference screenshots */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-transform duration-300"
        style={{
          width: size * 0.2,
          height: size * 0.25,
        }}
      >
        <svg
          viewBox="0 0 20 24"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Antenna Stem */}
          <path
            d="M10 24 C 10 18, 10 12, 10 8"
            stroke="#4ade80"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Antenna Glowing Bulb / Tip */}
          <circle
            cx="10"
            cy="7"
            r="4"
            fill="#67f32d"
            className="animate-pulse"
            style={{
              filter: "drop-shadow(0 0 6px #67f32d)",
            }}
          />
        </svg>
      </div>

      {/* Thumbs-Up Floating Badge / Particle */}
      <AnimatePresence>
        {gesture === "thumbsUp" && (
          <motion.div
            initial={{ scale: 0, y: 0, opacity: 0 }}
            animate={{ scale: [0, 1.25, 1], y: -26, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="absolute -top-4 right-1 z-30 text-base drop-shadow-md pointer-events-none"
          >
            👍
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directional Pointer Beacon Ring (when pointing) */}
      <AnimatePresence>
        {gestureAnim.pointerCue && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: [0.8, 1.5, 0.8],
              opacity: [0.4, 1, 0.4],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute z-30 w-4 h-4 rounded-full border-2 border-emerald-400 bg-emerald-400/20 pointer-events-none shadow-sm",
              gestureAnim.pointerCue === "left" && "-left-5 top-[52%]",
              gestureAnim.pointerCue === "right" && "-right-5 top-[52%]",
              gestureAnim.pointerCue === "down" && "bottom-[-10px] left-1/2 -translate-x-1/2",
            )}
            style={{
              filter: "drop-shadow(0 0 8px #67f32d)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Procedural Avatar Core */}
      {!loadError ? (
        <Avatar
          definition={buddyDefinition}
          animation={expression ? undefined : sequence}
          expression={expression}
          size={size}
          className="relative z-0 pointer-events-none"
          onError={() => setLoadError(true)}
        />
      ) : (
        /* Graceful SVG fallback */
        <div
          className="rounded-full flex items-center justify-center shadow-inner"
          style={{
            width: size * 0.85,
            height: size * 0.85,
            backgroundColor: "#54e325",
          }}
        >
          <div className="flex gap-4">
            <div className="w-3.5 h-6 bg-slate-900 rounded-full" />
            <div className="w-3.5 h-6 bg-slate-900 rounded-full" />
          </div>
        </div>
      )}

      {/* Left Hand Nub (Animated by Gesture Controller) */}
      <motion.div
        animate={{
          x: gestureAnim.leftHand.x ?? 0,
          y: gestureAnim.leftHand.y ?? 0,
          rotate: gestureAnim.leftHand.rotate ?? -12,
          scale: gestureAnim.leftHand.scale ?? 1,
        }}
        transition={gestureAnim.transition as any}
        className="absolute -left-1 top-[56%] -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: "#54e325",
          boxShadow: "-2px 2px 6px rgba(0,0,0,0.12)",
        }}
      />

      {/* Right Hand Nub (Animated by Gesture Controller) */}
      <motion.div
        animate={{
          x: gestureAnim.rightHand.x ?? 0,
          y: gestureAnim.rightHand.y ?? 0,
          rotate: gestureAnim.rightHand.rotate ?? 12,
          scale: gestureAnim.rightHand.scale ?? 1,
        }}
        transition={gestureAnim.transition as any}
        className="absolute -right-1 top-[56%] -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: "#54e325",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.12)",
        }}
      />
    </div>
  );
}

// Backward-compatible alias
export { MascotRenderer as AvatarRenderer };
