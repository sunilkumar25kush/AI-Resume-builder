import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { PLATFORM_FEATURES, RESUME_CREATION_SECTIONS } from "./onboardingData";

const STORAGE_KEY_STEP = "arb_onboarding_step";
const STORAGE_KEY_COMPLETED = "arb_onboarding_completed";

export type OnboardingMainStep = 1 | 2 | 3 | 4 | 5;

export interface OnboardingState {
  isActive: boolean;
  currentStep: OnboardingMainStep;
  subStepIndex: number;
  totalSubSteps: number;
}

export function useOnboardingState() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingMainStep>(1);
  const [subStepIndex, setSubStepIndex] = useState(0);

  // Sync step to backend & localStorage
  const persistStep = useCallback(
    async (step: number, completed = false) => {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY_STEP, String(step));
        if (completed) {
          localStorage.setItem(STORAGE_KEY_COMPLETED, "true");
        }
      }
      try {
        if (user) {
          await updateProfile({
            name: user.name,
            onboardingStep: step,
            onboardingCompleted: completed,
          });
        }
      } catch (err) {
        console.error("Failed to persist onboarding step:", err);
      }
    },
    [user, updateProfile],
  );

  // Start or resume onboarding
  const startOnboarding = useCallback(
    (targetStep?: OnboardingMainStep) => {
      let initialStep: OnboardingMainStep = targetStep || 1;

      // Resume from user record or local storage if no explicit step was given
      if (!targetStep && user?.onboardingStep && user.onboardingStep >= 1 && user.onboardingStep <= 5) {
        initialStep = user.onboardingStep as OnboardingMainStep;
      } else if (!targetStep && typeof localStorage !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY_STEP);
        if (saved && !isNaN(Number(saved))) {
          const parsed = Number(saved);
          if (parsed >= 1 && parsed <= 5) {
            initialStep = parsed as OnboardingMainStep;
          }
        }
      }

      setCurrentStep(initialStep);
      setSubStepIndex(0);
      setIsActive(true);
    },
    [user?.onboardingStep],
  );

  // Check auto-start on mount for first-time users
  useEffect(() => {
    if (!user) return;

    const isDone =
      user.onboardingCompleted ||
      (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY_COMPLETED) === "true");

    if (!isDone && !isActive) {
      startOnboarding();
    }
  }, [user, isActive, startOnboarding]);

  // Total sub-steps for current main step
  const totalSubSteps =
    currentStep === 2
      ? PLATFORM_FEATURES.length
      : currentStep === 4
      ? RESUME_CREATION_SECTIONS.length
      : 1;

  // Next navigation
  const next = useCallback(() => {
    if (currentStep === 2 && subStepIndex < PLATFORM_FEATURES.length - 1) {
      setSubStepIndex((prev) => prev + 1);
      return;
    }

    if (currentStep === 4 && subStepIndex < RESUME_CREATION_SECTIONS.length - 1) {
      setSubStepIndex((prev) => prev + 1);
      return;
    }

    if (currentStep < 5) {
      const nextStep = (currentStep + 1) as OnboardingMainStep;
      setCurrentStep(nextStep);
      setSubStepIndex(0);
      void persistStep(nextStep, false);
    }
  }, [currentStep, subStepIndex, persistStep]);

  // Previous navigation
  const prev = useCallback(() => {
    if (currentStep === 2 && subStepIndex > 0) {
      setSubStepIndex((prev) => prev - 1);
      return;
    }

    if (currentStep === 4 && subStepIndex > 0) {
      setSubStepIndex((prev) => prev - 1);
      return;
    }

    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as OnboardingMainStep;
      setCurrentStep(prevStep);
      if (prevStep === 2) {
        setSubStepIndex(PLATFORM_FEATURES.length - 1);
      } else if (prevStep === 4) {
        setSubStepIndex(RESUME_CREATION_SECTIONS.length - 1);
      } else {
        setSubStepIndex(0);
      }
      void persistStep(prevStep, false);
    }
  }, [currentStep, subStepIndex, persistStep]);

  // Skip onboarding
  const skip = useCallback(async () => {
    setIsActive(false);
    await persistStep(5, true);
  }, [persistStep]);

  // Complete onboarding
  const complete = useCallback(async () => {
    setIsActive(false);
    await persistStep(5, true);
  }, [persistStep]);

  // Restart onboarding (e.g. from Settings)
  const restart = useCallback(async () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_COMPLETED);
      localStorage.setItem(STORAGE_KEY_STEP, "1");
    }
    setCurrentStep(1);
    setSubStepIndex(0);
    setIsActive(true);
    await persistStep(1, false);
  }, [persistStep]);

  return {
    isActive,
    currentStep,
    subStepIndex,
    totalSubSteps,
    startOnboarding,
    next,
    prev,
    skip,
    complete,
    restart,
  };
}

