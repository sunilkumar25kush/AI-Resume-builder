import { useMemo, useState } from "react";
import { Avatar } from "@bible-strong/avatar-react";
import type { AnimationKey, ExpressionKey } from "@bible-strong/avatar-core";
import { getAvatarCharacter } from "@/components/avatar/avatarDefinitions";
import { MASCOT_BEHAVIORS, type MascotMood } from "@/config/mascotBehaviors";
import { cn } from "@/lib/utils";

export interface MascotRendererProps {
  characterId?: string;
  sequence?: AnimationKey;
  expression?: ExpressionKey;
  mood?: MascotMood;
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

      {/* Side stubby nubs / hands matching Kirby & Reference style */}
      <div
        className="absolute -left-1 top-[56%] -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-300"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: "#54e325",
          boxShadow: "-2px 2px 6px rgba(0,0,0,0.12)",
          transform: isHovered ? "rotate(-24deg) scale(1.1)" : "rotate(-12deg)",
        }}
      />
      <div
        className="absolute -right-1 top-[56%] -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-300"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: "#54e325",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.12)",
          transform: isHovered ? "rotate(24deg) scale(1.1)" : "rotate(12deg)",
        }}
      />
    </div>
  );
}

// Backward-compatible alias
export { MascotRenderer as AvatarRenderer };
