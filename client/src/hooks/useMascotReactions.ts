import { useEffect, useRef } from "react";
import type { FieldErrors } from "react-hook-form";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";

export function useMascotReactions() {
  const { snapTo, say, react, triggerGesture } = useResumeBuddy();
  const lastErrorRef = useRef<string | null>(null);

  /**
   * Automatically reacts to React Hook Form errors by moving next to the
   * invalid field with a helpful tip (matching Reference Screenshot 4)
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
    triggerGesture("shake");
    say(errorMessage, {
      mood: "warning",
      gesture: "tiltTowardTarget",
      autoDismissMs: 7000,
    });
  };

  /**
   * Reacts to ATS check score changes
   */
  const handleAtsScore = (score: number, targetElement?: HTMLElement | string) => {
    if (score >= 80) {
      if (targetElement) snapTo(targetElement, { placement: "top-right" });
      react("celebrate", 6000);
      triggerGesture("bounce");
      say(`Outstanding! ${score}% ATS score. Your resume is primed for top recruiter filters!`, {
        mood: "celebrate",
        gesture: "bounce",
        autoDismissMs: 8000,
      });
    } else if (score >= 60) {
      if (targetElement) snapTo(targetElement, { placement: "right" });
      react("happy", 4000);
      say(`Good progress (${score}%). A few targeted keyword additions will push this over 80%!`, {
        mood: "happy",
        gesture: "nod",
      });
    } else {
      if (targetElement) snapTo(targetElement, { placement: "right" });
      react("confused", 5000);
      say(`Your ATS match is currently ${score}%. Let's review the missing keywords to pass the screening.`, {
        mood: "confused",
        gesture: "tiltTowardTarget",
        autoDismissMs: 8000,
      });
    }
  };

  return {
    handleFormErrors,
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

