import { useState, useCallback, useEffect } from "react";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import type { OnboardingStep } from "./onboardingSteps";

export interface MascotTourGuideProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
  active?: boolean;
}

export function MascotTourGuide({ steps, onComplete, active = false }: MascotTourGuideProps) {
  const { say, dock } = useResumeBuddy();
  const [, setCurrentStepIndex] = useState(0);

  const advanceTour = useCallback(
    (nextIdx: number) => {
      if (nextIdx >= steps.length) {
        dock();
        say("You're all set! I'll be here floating in the corner if you need help.", {
          mood: "happy",
          gesture: "wave",
          autoDismissMs: 5000,
        });
        onComplete?.();
        return;
      }

      setCurrentStepIndex(nextIdx);
      const step = steps[nextIdx];

      say(step.message, {
        mood: step.mood,
        snapTarget: step.targetSelector,
        targetOptions: { placement: step.placement || "right" },
        actions: [
          {
            label: nextIdx === steps.length - 1 ? "Finish ✓" : "Next →",
            onClick: () => advanceTour(nextIdx + 1),
          },
        ],
        autoDismissMs: 0,
      });
    },
    [steps, say, dock, onComplete],
  );

  const startTour = useCallback(() => {
    if (!steps || steps.length === 0) return;
    setCurrentStepIndex(0);
    const step = steps[0];

    say(step.message, {
      mood: step.mood,
      snapTarget: step.targetSelector,
      targetOptions: { placement: step.placement || "right" },
      actions: [
        {
          label: steps.length > 1 ? "Next →" : "Got it!",
          onClick: () => advanceTour(1),
        },
      ],
      autoDismissMs: 0,
    });
  }, [steps, say, advanceTour]);

  useEffect(() => {
    if (active) {
      startTour();
    }
  }, [active, startTour]);

  return null;
}
