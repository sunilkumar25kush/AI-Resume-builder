import { useEffect, useRef } from "react";
import type { FieldErrors } from "react-hook-form";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import type { SpeechValidationTip } from "@/components/ResumeBuddy/MascotSpeechBubble";
import { evaluateFieldRule } from "@/features/validation/MascotValidationRules";

export function useMascotReactions() {
  const { snapTo, say, playAnimation, triggerInteraction } = useResumeBuddy();
  const lastErrorRef = useRef<string | null>(null);

  /**
   * Automatically reacts to React Hook Form errors by moving next to the
   * invalid field with exact expression and gesture (confused + pointAtInput, or warning + pointDown),
   * highlighting the problematic field, and displaying incorrect vs correct examples.
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
      (document.querySelector(`[name="${firstField}"]`) as HTMLElement | null) ||
      (document.querySelector(`#${firstField}`) as HTMLElement | null) ||
      (document.querySelector(`[data-field="${firstField}"]`) as HTMLElement | null) ||
      (document.querySelector(`[id*="${firstField}" i]`) as HTMLElement | null);

    let tip: SpeechValidationTip | undefined = undefined;

    if (targetEl) {
      // Scroll into view if needed
      const rect = targetEl.getBoundingClientRect();
      if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      // Highlight the field with pulsating ring
      targetEl.classList.remove("mascot-valid-field");
      targetEl.classList.add("mascot-invalid-field");

      // Snap mascot to element safely
      snapTo(targetEl, { placement: "right", offsetX: 16 });

      // If it's an input or textarea, check if rule engine has specific incorrect/correct examples
      if (targetEl instanceof HTMLInputElement || targetEl instanceof HTMLTextAreaElement) {
        const evaluated = evaluateFieldRule(targetEl);
        if (evaluated?.tip) {
          tip = evaluated.tip;
        }
      }
    }

    // Default tip fallbacks for common fields if not already populated
    if (!tip) {
      const lowerField = firstField.toLowerCase();
      if (lowerField.includes("email")) {
        tip = { fieldLabel: "Email", incorrect: "sunil123gmail.com", correct: "sunil123@gmail.com" };
      } else if (lowerField.includes("name")) {
        tip = { fieldLabel: "Full Name", incorrect: "123456", correct: "Sunil Kumar" };
      } else if (lowerField.includes("phone")) {
        tip = { fieldLabel: "Phone", incorrect: "abc123456", correct: "+91 98765 43210" };
      } else if (lowerField.includes("linkedin")) {
        tip = { fieldLabel: "LinkedIn", incorrect: "linkedinprofile", correct: "https://www.linkedin.com/in/username/" };
      } else if (lowerField.includes("github")) {
        tip = { fieldLabel: "GitHub", incorrect: "github", correct: "https://github.com/username" };
      } else if (lowerField.includes("enddate") || lowerField.includes("startdate")) {
        tip = { fieldLabel: "Dates", incorrect: "End date earlier than start date", correct: "End date must be after start date" };
      } else if (lowerField.includes("institution")) {
        tip = { fieldLabel: "Education", incorrect: "Missing institution name", correct: "Enter your school, college, or university name" };
      }
    }

    // User ignores required field vs invalid info
    const isRequired =
      errorMessage.toLowerCase().includes("required") ||
      errorMessage.toLowerCase().includes("missing");

    if (isRequired) {
      triggerInteraction("missingField");
      say(errorMessage, {
        mood: "warning",
        gesture: "pointDown",
        validationTip: tip,
        autoDismissMs: 7500,
      });
    } else {
      triggerInteraction("invalidInfo");
      say(errorMessage, {
        mood: "confused",
        gesture: "pointAtInput",
        validationTip: tip,
        autoDismissMs: 7500,
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
   * Called when user enters valid information or corrects an input
   * Expression: happy, Gesture: thumbsUp
   */
  const handleValidField = (fieldName?: string) => {
    triggerInteraction("validInfo");
    say(fieldName ? `${fieldName} looks great! ✓` : "Looks great! That looks correct now. ✓", {
      mood: "happy",
      gesture: "thumbsUp",
      autoDismissMs: 2500,
    });
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
