import type { AnimationKey, ExpressionKey } from "@bible-strong/avatar-core";

export type MascotExpression =
  | "idle"
  | "happy"
  | "excited"
  | "welcome"
  | "thinking"
  | "confused"
  | "disappointed"
  | "warning"
  | "angry"
  | "explaining"
  | "celebrating"
  | "celebrate" // alias
  | "sad"
  | "sleeping"
  | "curious"
  | "playful"
  | "proud";

// Backward-compatible alias
export type MascotMood = MascotExpression;

export type MascotHandGesture =
  | "none"
  | "waveHello"
  | "waveGoodbye"
  | "pointLeft"
  | "pointRight"
  | "pointDown"
  | "pointAtInput"
  | "thumbsUp"
  | "handsExplaining"
  | "handOnChin"
  | "clap"
  | "raiseHands"
  | "shrug"
  | "attentionGesture"
  | "wave" // alias to waveHello
  | "nod"
  | "shake"
  | "bounce"
  | "tiltTowardTarget";

export const AnimationPriority = {
  IDLE: 0,
  LOW: 1, // e.g. subtle hover, idle look
  MEDIUM: 2, // e.g. typing, thinking, explaining
  HIGH: 3, // e.g. validation warning, error pointing
  CRITICAL: 4, // e.g. celebration, welcome, onboarding complete
} as const;

export type AnimationPriority = (typeof AnimationPriority)[keyof typeof AnimationPriority];

export interface MascotBehaviorConfig {
  sequence: AnimationKey;
  fallbackExpression?: ExpressionKey;
  defaultDurationMs?: number;
  priority: AnimationPriority;
  cooldownMs: number;
  glowColor: string;
  glowIntensity: string;
}

export const MASCOT_BEHAVIORS: Record<MascotExpression, MascotBehaviorConfig> = {
  idle: {
    sequence: "idle",
    fallbackExpression: "expression-00",
    priority: AnimationPriority.IDLE,
    cooldownMs: 0,
    glowColor: "rgba(99, 241, 44, 0.45)",
    glowIntensity: "0 0 18px",
  },
  happy: {
    sequence: "happy",
    fallbackExpression: "expression-08",
    defaultDurationMs: 3800,
    priority: AnimationPriority.MEDIUM,
    cooldownMs: 1500,
    glowColor: "rgba(99, 241, 44, 0.65)",
    glowIntensity: "0 0 24px",
  },
  excited: {
    sequence: "excited",
    fallbackExpression: "expression-09",
    defaultDurationMs: 4000,
    priority: AnimationPriority.HIGH,
    cooldownMs: 2000,
    glowColor: "rgba(56, 239, 125, 0.75)",
    glowIntensity: "0 0 28px",
  },
  welcome: {
    sequence: "happy",
    fallbackExpression: "expression-08",
    defaultDurationMs: 5000,
    priority: AnimationPriority.CRITICAL,
    cooldownMs: 3000,
    glowColor: "rgba(84, 227, 37, 0.8)",
    glowIntensity: "0 0 30px",
  },
  thinking: {
    sequence: "thinking",
    fallbackExpression: "expression-15",
    defaultDurationMs: 3500,
    priority: AnimationPriority.MEDIUM,
    cooldownMs: 1000,
    glowColor: "rgba(78, 205, 196, 0.6)",
    glowIntensity: "0 0 20px",
  },
  confused: {
    sequence: "confused",
    fallbackExpression: "expression-16",
    defaultDurationMs: 4500,
    priority: AnimationPriority.HIGH,
    cooldownMs: 1800,
    glowColor: "rgba(255, 179, 71, 0.65)",
    glowIntensity: "0 0 22px",
  },
  disappointed: {
    sequence: "sad",
    fallbackExpression: "expression-18",
    defaultDurationMs: 4000,
    priority: AnimationPriority.HIGH,
    cooldownMs: 2000,
    glowColor: "rgba(100, 149, 237, 0.55)",
    glowIntensity: "0 0 18px",
  },
  warning: {
    sequence: "angry",
    fallbackExpression: "expression-11",
    defaultDurationMs: 5000,
    priority: AnimationPriority.HIGH,
    cooldownMs: 2000,
    glowColor: "rgba(255, 75, 75, 0.7)",
    glowIntensity: "0 0 26px",
  },
  angry: {
    sequence: "angry",
    fallbackExpression: "expression-11",
    defaultDurationMs: 4000,
    priority: AnimationPriority.HIGH,
    cooldownMs: 2000,
    glowColor: "rgba(255, 50, 50, 0.75)",
    glowIntensity: "0 0 26px",
  },
  explaining: {
    sequence: "curious",
    fallbackExpression: "expression-06",
    defaultDurationMs: 4000,
    priority: AnimationPriority.MEDIUM,
    cooldownMs: 1200,
    glowColor: "rgba(99, 241, 44, 0.6)",
    glowIntensity: "0 0 22px",
  },
  celebrating: {
    sequence: "celebrate",
    fallbackExpression: "expression-23",
    defaultDurationMs: 5500,
    priority: AnimationPriority.CRITICAL,
    cooldownMs: 3000,
    glowColor: "rgba(255, 215, 0, 0.85)",
    glowIntensity: "0 0 34px",
  },
  celebrate: {
    sequence: "celebrate",
    fallbackExpression: "expression-23",
    defaultDurationMs: 5500,
    priority: AnimationPriority.CRITICAL,
    cooldownMs: 3000,
    glowColor: "rgba(255, 215, 0, 0.85)",
    glowIntensity: "0 0 34px",
  },
  sad: {
    sequence: "sad",
    fallbackExpression: "expression-18",
    defaultDurationMs: 4500,
    priority: AnimationPriority.HIGH,
    cooldownMs: 2000,
    glowColor: "rgba(100, 149, 237, 0.5)",
    glowIntensity: "0 0 18px",
  },
  sleeping: {
    sequence: "sleeping",
    fallbackExpression: "expression-13",
    priority: AnimationPriority.LOW,
    cooldownMs: 0,
    glowColor: "rgba(80, 100, 160, 0.25)",
    glowIntensity: "0 0 12px",
  },
  curious: {
    sequence: "curious",
    fallbackExpression: "expression-22",
    defaultDurationMs: 3500,
    priority: AnimationPriority.LOW,
    cooldownMs: 1000,
    glowColor: "rgba(99, 241, 44, 0.55)",
    glowIntensity: "0 0 20px",
  },
  playful: {
    sequence: "excited",
    fallbackExpression: "expression-07",
    defaultDurationMs: 4000,
    priority: AnimationPriority.LOW,
    cooldownMs: 1500,
    glowColor: "rgba(99, 241, 44, 0.65)",
    glowIntensity: "0 0 24px",
  },
  proud: {
    sequence: "celebrate",
    fallbackExpression: "expression-23",
    defaultDurationMs: 5000,
    priority: AnimationPriority.CRITICAL,
    cooldownMs: 3000,
    glowColor: "rgba(255, 215, 0, 0.8)",
    glowIntensity: "0 0 30px",
  },
};

export const GESTURE_PRIORITY_MAP: Record<MascotHandGesture, AnimationPriority> = {
  none: AnimationPriority.IDLE,
  waveHello: AnimationPriority.HIGH,
  waveGoodbye: AnimationPriority.HIGH,
  pointLeft: AnimationPriority.HIGH,
  pointRight: AnimationPriority.HIGH,
  pointDown: AnimationPriority.HIGH,
  pointAtInput: AnimationPriority.HIGH,
  thumbsUp: AnimationPriority.MEDIUM,
  handsExplaining: AnimationPriority.MEDIUM,
  handOnChin: AnimationPriority.MEDIUM,
  clap: AnimationPriority.CRITICAL,
  raiseHands: AnimationPriority.CRITICAL,
  shrug: AnimationPriority.MEDIUM,
  attentionGesture: AnimationPriority.HIGH,
  wave: AnimationPriority.HIGH,
  nod: AnimationPriority.LOW,
  shake: AnimationPriority.HIGH,
  bounce: AnimationPriority.LOW,
  tiltTowardTarget: AnimationPriority.LOW,
};

export type MascotInteractionScenario =
  | "visit"
  | "startOnboarding"
  | "enterInfo"
  | "invalidInfo"
  | "missingField"
  | "validInfo"
  | "completeSection"
  | "navigateSection"
  | "completeOnboarding";

export interface InteractionRule {
  expression: MascotExpression;
  gesture: MascotHandGesture;
  durationMs?: number;
}

export const INTERACTION_MAPPINGS: Record<MascotInteractionScenario, InteractionRule> = {
  visit: {
    expression: "welcome",
    gesture: "waveHello",
    durationMs: 5000,
  },
  startOnboarding: {
    expression: "excited",
    gesture: "waveHello",
    durationMs: 4500,
  },
  enterInfo: {
    expression: "thinking",
    gesture: "handOnChin",
    durationMs: 3500,
  },
  invalidInfo: {
    expression: "confused",
    gesture: "pointAtInput",
    durationMs: 5000,
  },
  missingField: {
    expression: "warning",
    gesture: "pointDown",
    durationMs: 5000,
  },
  validInfo: {
    expression: "happy",
    gesture: "thumbsUp",
    durationMs: 3000,
  },
  completeSection: {
    expression: "celebrating",
    gesture: "clap",
    durationMs: 5000,
  },
  navigateSection: {
    expression: "curious",
    gesture: "handsExplaining",
    durationMs: 3500,
  },
  completeOnboarding: {
    expression: "excited",
    gesture: "raiseHands",
    durationMs: 6000,
  },
};

export const MASCOT_TIMINGS = {
  typewriterSpeedMs: 22,
  thinkingDotsIntervalMs: 350,
  autoDismissDefaultMs: 6500,
  sleepInactivityMs: 90000,
  springStiffness: 260,
  springDamping: 24,
};

export const MASCOT_DEFAULT_DOCK = {
  right: 28,
  bottom: 28,
};
