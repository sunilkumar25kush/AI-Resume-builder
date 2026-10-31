import { useEffect } from "react";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import { AI_SUGGESTION_PROMPTS } from "./aiTriggers";

export interface MascotAiPrompterProps {
  scenarioKey: keyof typeof AI_SUGGESTION_PROMPTS;
  targetSelector?: string;
  onAction?: () => void;
  active?: boolean;
}

export function MascotAiPrompter({
  scenarioKey,
  targetSelector,
  onAction,
  active = true,
}: MascotAiPrompterProps) {
  const { say } = useResumeBuddy();
  const scenario = AI_SUGGESTION_PROMPTS[scenarioKey];

  useEffect(() => {
    if (!active || !scenario) return;

    say(scenario.message, {
      mood: scenario.triggerMood,
      snapTarget: targetSelector,
      actions: onAction && scenario.actionLabel
        ? [
            {
              label: scenario.actionLabel,
              onClick: onAction,
            },
          ]
        : undefined,
      autoDismissMs: 8000,
    });
  }, [active, scenarioKey, targetSelector, onAction, say, scenario]);

  return null;
}
