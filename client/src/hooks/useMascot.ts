import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import type { MascotExpression, MascotHandGesture, MascotInteractionScenario } from "@/config/mascotBehaviors";

export function useMascot() {
  const buddy = useResumeBuddy();

  return {
    state: buddy.state,
    say: buddy.say,
    think: buddy.think,
    react: buddy.react,
    pulseExpression: buddy.pulseExpression,
    snapTo: buddy.snapTo,
    dock: buddy.dock,
    reanchor: buddy.reanchor,
    dismissSpeech: buddy.dismissSpeech,
    toggleVisibility: buddy.toggleVisibility,
    openAssistant: buddy.openPanel,
    closeAssistant: buddy.closePanel,
    isPanelOpen: buddy.isPanelOpen,
    isMinimized: buddy.isMinimized,
    toggleMinimize: buddy.toggleMinimize,
    isDisabled: buddy.isDisabled,
    setDisabled: buddy.setDisabled,
    isCustomPositioned: buddy.isCustomPositioned,

    // High-level Priority & Scenario API
    playAnimation: (expression: MascotExpression, gesture: MascotHandGesture = "none", durationMs?: number) =>
      buddy.playAnimation(expression, gesture, durationMs),
    triggerInteraction: (scenario: MascotInteractionScenario, snapTarget?: HTMLElement | string) =>
      buddy.triggerInteraction(scenario, snapTarget),

    // 13 Hand Gesture Shortcuts
    waveHello: () => buddy.triggerGesture("waveHello"),
    waveGoodbye: () => buddy.triggerGesture("waveGoodbye"),
    pointLeft: () => buddy.triggerGesture("pointLeft"),
    pointRight: () => buddy.triggerGesture("pointRight"),
    pointDown: () => buddy.triggerGesture("pointDown"),
    pointAtInput: () => buddy.triggerGesture("pointAtInput"),
    thumbsUp: () => buddy.triggerGesture("thumbsUp"),
    handsExplaining: () => buddy.triggerGesture("handsExplaining"),
    handOnChin: () => buddy.triggerGesture("handOnChin"),
    clap: () => buddy.triggerGesture("clap"),
    raiseHands: () => buddy.triggerGesture("raiseHands"),
    shrug: () => buddy.triggerGesture("shrug"),
    attentionGesture: () => buddy.triggerGesture("attentionGesture"),

    // Backward-compatible gestures
    wave: () => buddy.triggerGesture("waveHello"),
    nod: () => buddy.triggerGesture("nod"),
    shake: () => buddy.triggerGesture("shake"),
    bounce: () => buddy.triggerGesture("bounce"),

    // Convenience Actions
    celebrate: (message?: string) => {
      buddy.playAnimation("celebrating", "clap", 5000);
      if (message) {
        buddy.say(message, { mood: "celebrating", gesture: "clap" });
      }
    },
    warn: (message: string, target?: HTMLElement | string) => {
      buddy.playAnimation("warning", "pointDown", 5000);
      buddy.say(message, { mood: "warning", gesture: "pointDown", snapTarget: target });
    },
    explain: (message: string, target?: HTMLElement | string) => {
      buddy.playAnimation("explaining", "handsExplaining", 4500);
      buddy.say(message, { mood: "explaining", gesture: "handsExplaining", snapTarget: target });
    },
    setCharacter: buddy.setCharacterId,
  };
}
