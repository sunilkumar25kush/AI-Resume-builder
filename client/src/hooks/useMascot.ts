import { useResumeBuddy } from "@/context/ResumeBuddyContext";

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
    dismissSpeech: buddy.dismissSpeech,
    toggleVisibility: buddy.toggleVisibility,
    wave: () => buddy.triggerGesture("wave"),
    nod: () => buddy.triggerGesture("nod"),
    shake: () => buddy.triggerGesture("shake"),
    bounce: () => buddy.triggerGesture("bounce"),
    celebrate: (message?: string) => {
      buddy.react("celebrate", 5000);
      if (message) {
        buddy.say(message, { mood: "celebrate", gesture: "bounce" });
      }
    },
    warn: (message: string, target?: HTMLElement | string) => {
      buddy.say(message, { mood: "warning", gesture: "shake", snapTarget: target });
    },
    explain: (message: string, target?: HTMLElement | string) => {
      buddy.say(message, { mood: "curious", gesture: "tiltTowardTarget", snapTarget: target });
    },
    setCharacter: buddy.setCharacterId,
  };
}

