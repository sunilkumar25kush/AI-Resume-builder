import type { AnimationKey, ExpressionKey } from "@bible-strong/avatar-core";
import {
  MASCOT_BEHAVIORS,
  type MascotExpression,
  type MascotHandGesture,
  AnimationPriority,
  GESTURE_PRIORITY_MAP,
} from "@/config/mascotBehaviors";

export interface ActiveAnimationState {
  expression: MascotExpression;
  sequence: AnimationKey;
  fallbackExpression?: ExpressionKey;
  gesture: MascotHandGesture;
  priority: AnimationPriority;
  startedAt: number;
  durationMs: number;
}

export class MascotAnimationController {
  private currentState: ActiveAnimationState;
  private cooldowns: Map<string, number> = new Map();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onStateChange?: (state: ActiveAnimationState) => void;

  constructor(onStateChange?: (state: ActiveAnimationState) => void) {
    this.currentState = {
      expression: "idle",
      sequence: "idle",
      fallbackExpression: "expression-00",
      gesture: "none",
      priority: AnimationPriority.IDLE,
      startedAt: Date.now(),
      durationMs: 0,
    };
    this.onStateChange = onStateChange;
  }

  public setListener(onStateChange: (state: ActiveAnimationState) => void) {
    this.onStateChange = onStateChange;
  }

  public getState(): ActiveAnimationState {
    return this.currentState;
  }

  /**
   * Triggers an expression and/or gesture with priority and cooldown validation.
   * Returns true if animation was accepted, false if blocked by priority or cooldown.
   */
  public play(
    expression: MascotExpression,
    gesture: MascotHandGesture = "none",
    overrideDurationMs?: number,
    force = false,
  ): boolean {
    const config = MASCOT_BEHAVIORS[expression] || MASCOT_BEHAVIORS.idle;
    const gesturePriority = GESTURE_PRIORITY_MAP[gesture] || AnimationPriority.IDLE;
    const effectivePriority = Math.max(config.priority, gesturePriority) as AnimationPriority;

    const now = Date.now();

    // 1. Check Cooldown (unless forced)
    if (!force) {
      const lastExpTime = this.cooldowns.get(expression) || 0;
      if (now - lastExpTime < config.cooldownMs) {
        return false;
      }
      if (gesture !== "none") {
        const lastGesTime = this.cooldowns.get(gesture) || 0;
        if (now - lastGesTime < 1200) {
          return false;
        }
      }
    }

    // 2. Check Priority Interruption: Lower priority cannot interrupt higher priority
    if (
      !force &&
      this.currentState.expression !== "idle" &&
      effectivePriority < this.currentState.priority
    ) {
      return false;
    }

    // Record cooldowns
    this.cooldowns.set(expression, now);
    if (gesture !== "none") {
      this.cooldowns.set(gesture, now);
    }

    this.clearTimer();

    const duration = overrideDurationMs ?? config.defaultDurationMs ?? 0;

    this.currentState = {
      expression,
      sequence: config.sequence,
      fallbackExpression: config.fallbackExpression,
      gesture,
      priority: effectivePriority,
      startedAt: now,
      durationMs: duration,
    };

    this.onStateChange?.(this.currentState);

    // 3. Set automatic return to idle
    if (duration > 0 && expression !== "idle" && expression !== "sleeping") {
      this.timer = setTimeout(() => {
        this.resetToIdle();
      }, duration);
    }

    return true;
  }

  public resetToIdle() {
    this.clearTimer();
    this.currentState = {
      expression: "idle",
      sequence: "idle",
      fallbackExpression: "expression-00",
      gesture: "none",
      priority: AnimationPriority.IDLE,
      startedAt: Date.now(),
      durationMs: 0,
    };
    this.onStateChange?.(this.currentState);
  }

  public clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
