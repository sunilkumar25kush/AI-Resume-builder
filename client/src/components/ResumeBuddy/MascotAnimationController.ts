import type { AnimationKey } from "@bible-strong/avatar-core";
import { MASCOT_BEHAVIORS, type MascotMood } from "@/config/mascotBehaviors";

export class MascotAnimationController {
  private currentMood: MascotMood = "idle";
  private currentSequence: AnimationKey = "idle";
  private sequenceTimeout: ReturnType<typeof setTimeout> | null = null;
  private onSequenceChange?: (seq: AnimationKey, mood: MascotMood) => void;

  constructor(onSequenceChange?: (seq: AnimationKey, mood: MascotMood) => void) {
    this.onSequenceChange = onSequenceChange;
  }

  public setListener(onSequenceChange: (seq: AnimationKey, mood: MascotMood) => void) {
    this.onSequenceChange = onSequenceChange;
  }

  public getMood(): MascotMood {
    return this.currentMood;
  }

  public getSequence(): AnimationKey {
    return this.currentSequence;
  }

  public playMood(mood: MascotMood, overrideDurationMs?: number): number {
    this.clearTimer();
    this.currentMood = mood;
    const config = MASCOT_BEHAVIORS[mood] || MASCOT_BEHAVIORS.idle;
    this.currentSequence = config.sequence;
    this.onSequenceChange?.(this.currentSequence, mood);

    const duration = overrideDurationMs ?? config.defaultDurationMs;

    if (duration && duration > 0 && mood !== "idle" && mood !== "sleeping") {
      this.sequenceTimeout = setTimeout(() => {
        this.resetToIdle();
      }, duration);
      return duration;
    }

    return 0;
  }

  public resetToIdle() {
    this.clearTimer();
    this.currentMood = "idle";
    this.currentSequence = "idle";
    this.onSequenceChange?.("idle", "idle");
  }

  public clearTimer() {
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
  }
}

