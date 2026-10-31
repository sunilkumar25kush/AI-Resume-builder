import { useEffect, type RefObject } from "react";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import type { MascotTargetOptions } from "@/components/ResumeBuddy/MascotPositionEngine";

export function useMascotPosition(
  targetRefOrSelector?: RefObject<HTMLElement | null> | string | null,
  options: MascotTargetOptions & { active?: boolean } = {},
) {
  const { snapTo, dock } = useResumeBuddy();
  const { active = true, ...targetOptions } = options;

  useEffect(() => {
    if (!active || !targetRefOrSelector) {
      return;
    }

    const timer = setTimeout(() => {
      if (typeof targetRefOrSelector === "string") {
        snapTo(targetRefOrSelector, targetOptions);
      } else if (targetRefOrSelector.current) {
        snapTo(targetRefOrSelector.current, targetOptions);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [targetRefOrSelector, active, snapTo, JSON.stringify(targetOptions)]);

  return {
    snapNow: () => {
      if (typeof targetRefOrSelector === "string") {
        snapTo(targetRefOrSelector, targetOptions);
      } else if (targetRefOrSelector?.current) {
        snapTo(targetRefOrSelector.current, targetOptions);
      }
    },
    dock,
  };
}

