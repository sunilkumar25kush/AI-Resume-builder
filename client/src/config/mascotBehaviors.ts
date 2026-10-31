import type { AnimationKey, ExpressionKey } from "@bible-strong/avatar-core";

export type MascotMood =
  | "idle"
  | "happy"
  | "excited"
  | "celebrate"
  | "thinking"
  | "confused"
  | "sad"
  | "warning"
  | "curious"
  | "suspicious"
  | "listening"
  | "searching"
  | "working"
  | "proud"
  | "shy"
  | "laughing"
  | "scared"
  | "bored"
  | "drowsy"
  | "sleeping"
  | "waking"
  | "playful";

export interface MascotBehaviorConfig {
  sequence: AnimationKey;
  fallbackExpression?: ExpressionKey;
  defaultDurationMs?: number;
  glowColor: string;
  glowIntensity: string;
}

export const MASCOT_BEHAVIORS: Record<MascotMood, MascotBehaviorConfig> = {
  idle: {
    sequence: "idle",
    glowColor: "rgba(99, 241, 44, 0.45)",
    glowIntensity: "0 0 18px",
  },
  happy: {
    sequence: "happy",
    defaultDurationMs: 4000,
    glowColor: "rgba(99, 241, 44, 0.6)",
    glowIntensity: "0 0 24px",
  },
  excited: {
    sequence: "excited",
    defaultDurationMs: 4000,
    glowColor: "rgba(56, 239, 125, 0.75)",
    glowIntensity: "0 0 28px",
  },
  celebrate: {
    sequence: "celebrate",
    defaultDurationMs: 5000,
    glowColor: "rgba(255, 215, 0, 0.8)",
    glowIntensity: "0 0 32px",
  },
  thinking: {
    sequence: "thinking",
    glowColor: "rgba(78, 205, 196, 0.6)",
    glowIntensity: "0 0 20px",
  },
  confused: {
    sequence: "confused",
    defaultDurationMs: 4500,
    glowColor: "rgba(255, 179, 71, 0.6)",
    glowIntensity: "0 0 22px",
  },
  sad: {
    sequence: "sad",
    defaultDurationMs: 4500,
    glowColor: "rgba(100, 149, 237, 0.5)",
    glowIntensity: "0 0 16px",
  },
  warning: {
    sequence: "angry",
    defaultDurationMs: 4500,
    glowColor: "rgba(255, 75, 75, 0.65)",
    glowIntensity: "0 0 24px",
  },
  curious: {
    sequence: "curious",
    defaultDurationMs: 4000,
    glowColor: "rgba(99, 241, 44, 0.5)",
    glowIntensity: "0 0 20px",
  },
  suspicious: {
    sequence: "suspicious",
    defaultDurationMs: 4000,
    glowColor: "rgba(255, 193, 7, 0.6)",
    glowIntensity: "0 0 20px",
  },
  listening: {
    sequence: "listening",
    glowColor: "rgba(99, 241, 44, 0.55)",
    glowIntensity: "0 0 22px",
  },
  searching: {
    sequence: "searching",
    glowColor: "rgba(0, 210, 255, 0.6)",
    glowIntensity: "0 0 24px",
  },
  working: {
    sequence: "working",
    glowColor: "rgba(99, 241, 44, 0.6)",
    glowIntensity: "0 0 22px",
  },
  proud: {
    sequence: "proud",
    defaultDurationMs: 4500,
    glowColor: "rgba(46, 213, 115, 0.7)",
    glowIntensity: "0 0 26px",
  },
  shy: {
    sequence: "shy",
    defaultDurationMs: 3500,
    glowColor: "rgba(255, 182, 193, 0.6)",
    glowIntensity: "0 0 18px",
  },
  laughing: {
    sequence: "laughing",
    defaultDurationMs: 4000,
    glowColor: "rgba(99, 241, 44, 0.7)",
    glowIntensity: "0 0 26px",
  },
  scared: {
    sequence: "scared",
    defaultDurationMs: 3500,
    glowColor: "rgba(255, 107, 129, 0.7)",
    glowIntensity: "0 0 24px",
  },
  bored: {
    sequence: "bored",
    glowColor: "rgba(160, 160, 160, 0.4)",
    glowIntensity: "0 0 14px",
  },
  drowsy: {
    sequence: "drowsy",
    glowColor: "rgba(120, 140, 180, 0.35)",
    glowIntensity: "0 0 14px",
  },
  sleeping: {
    sequence: "sleeping",
    glowColor: "rgba(80, 100, 160, 0.25)",
    glowIntensity: "0 0 12px",
  },
  waking: {
    sequence: "waking",
    defaultDurationMs: 2000,
    glowColor: "rgba(99, 241, 44, 0.6)",
    glowIntensity: "0 0 22px",
  },
  playful: {
    sequence: "playful",
    defaultDurationMs: 4000,
    glowColor: "rgba(99, 241, 44, 0.65)",
    glowIntensity: "0 0 26px",
  },
};

export const MASCOT_TIMINGS = {
  typewriterSpeedMs: 22,
  thinkingDotsIntervalMs: 350,
  autoDismissDefaultMs: 6500,
  sleepInactivityMs: 90000, // 90 seconds before drowsy/sleep
  springStiffness: 260,
  springDamping: 24,
};

export const MASCOT_DEFAULT_DOCK = {
  right: 28,
  bottom: 28,
};

