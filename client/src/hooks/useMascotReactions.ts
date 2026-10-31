import { useEffect, useRef } from "react";
import type { FieldErrors } from "react-hook-form";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";

export function useMascotReactions() {
  const { snapTo, say, playAnimation, triggerInteraction } = useResumeBuddy();
  const lastErrorRef = useRef<string | null>(null);

  /**
   * Automatically reacts to React Hook Form errors by moving next to the
   * invalid field with exact expression and gesture (confused + pointAtInput, or warning + pointDown)
   */
  const handleFormErrors = (
    errors: FieldErrors,
    customFieldMessages?: Record<string, string>,
  ) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

    const firstField = errorKeys[0];
    const fieldError = errors[firstField];
    const errorMessage =
      customFieldMessages?.[firstField] ||
      (typeof fieldError?.message === "string" ? fieldError.message : undefined) ||
      `Could you check this field?`;

    // Avoid repeatedly speaking the exact same error on re-renders
    if (lastErrorRef.current === `${firstField}:${errorMessage}`) {
      return;
    }
    lastErrorRef.current = `${firstField}:${errorMessage}`;

    // Look for target DOM element by name, id, or data attribute
    const targetEl =
      document.querySelector(`[name="${firstField}"]`) ||
      document.querySelector(`#${firstField}`) ||
      document.querySelector(`[data-field="${firstField}"]`);

    snapTo(targetEl as HTMLElement | null, { placement: "right" });

    // User ignores required field vs invalid info
    const isRequired =
      errorMessage.toLowerCase().includes("required") ||
      errorMessage.toLowerCase().includes("missing");

    if (isRequired) {
      triggerInteraction("missingField");
      say(errorMessage, {
        mood: "warning",
        gesture: "pointDown",
        autoDismissMs: 6500,
      });
    } else {
      triggerInteraction("invalidInfo");
      say(errorMessage, {
        mood: "confused",
        gesture: "pointAtInput",
        autoDismissMs: 6500,
      });
    }
  };

  /**
   * Called when a section is saved or completed
   * Expression: celebrating, Gesture: clap
   */
  const handleSectionComplete = (sectionName?: string) => {
    triggerInteraction("completeSection");
    say(sectionName ? `${sectionName} saved and verified!` : "Section saved successfully!", {
      mood: "celebrating",
      gesture: "clap",
      autoDismissMs: 4000,
    });
  };

  /**
   * Called when full onboarding or resume generation is complete
   * Expression: excited, Gesture: raiseHands
   */
  const handleOnboardingComplete = () => {
    triggerInteraction("completeOnboarding");
    say("Congratulations! Your resume is ready and fully optimized!", {
      mood: "excited",
      gesture: "raiseHands",
      autoDismissMs: 6000,
    });
  };

  /**
   * Called when user enters valid information
   * Expression: happy, Gesture: thumbsUp
   */
  const handleValidField = () => {
    triggerInteraction("validInfo");
  };

  /**
   * Reacts to ATS check score changes
   */
  const handleAtsScore = (score: number, targetElement?: HTMLElement | string) => {
    if (score >= 80) {
      if (targetElement) snapTo(targetElement, { placement: "top-right" });
      playAnimation("celebrating", "clap", 6000);
      say(`Outstanding! ${score}% ATS score. Your resume is primed for top recruiter filters!`, {
        mood: "celebrating",
        gesture: "clap",
        autoDismissMs: 8000,
      });
    } else if (score >= 60) {
      if (targetElement) snapTo(targetElement, { placement: "right" });
      playAnimation("happy", "thumbsUp", 4000);
      say(`Good progress (${score}%). A few targeted keyword additions will push this over 80%!`, {
        mood: "happy",
        gesture: "thumbsUp",
        autoDismissMs: 6000,
      });
    } else {
      if (targetElement) snapTo(targetElement, { placement: "right" });
      playAnimation("confused", "pointAtInput", 5000);
      say(`Your ATS match is currently ${score}%. Let's review the missing keywords to pass the screening.`, {
        mood: "confused",
        gesture: "pointAtInput",
        autoDismissMs: 8000,
      });
    }
  };

  return {
    handleFormErrors,
    handleSectionComplete,
    handleOnboardingComplete,
    handleValidField,
    handleAtsScore,
  };
}

/**
 * Convenient hook that observes react-hook-form errors directly
 */
export function useFormValidationObserver(
  errors: FieldErrors,
  fieldTips?: Record<string, string>,
) {
  const { handleFormErrors } = useMascotReactions();

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      handleFormErrors(errors, fieldTips);
    }
  }, [errors]);
}
