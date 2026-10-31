import { useEffect, useRef, useCallback } from "react";
import type { FieldErrors } from "react-hook-form";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import { evaluateFieldRule, type MascotValidationIssue } from "./MascotValidationRules";

export interface SmartValidationOptions {
  /** Optional container ref or selector to restrict validation scope */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Optional custom field tips or overrides */
  customTips?: Record<string, { incorrect?: string; correct?: string; message?: string }>;
  /** Optional flag to enable submission interception */
  enabled?: boolean;
}

export function useSmartFormValidation(options: SmartValidationOptions = {}) {
  const { snapTo, say, playAnimation } = useResumeBuddy();
  const { containerRef, customTips, enabled = true } = options;

  // Track currently marked invalid fields by their ID or name
  const invalidFieldsRef = useRef<Set<string>>(new Set());
  // Prevent repeating identical error dialogues in rapid succession
  const lastSpokenErrorRef = useRef<string | null>(null);
  // Track success timeout to clear valid highlight
  const validTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Handle an identified validation issue:
   * 1. Scrolls into view if needed
   * 2. Moves mascot next to input (without occluding it)
   * 3. Changes expression to confused/warning and points at input
   * 4. Shows contextual speech bubble with incorrect vs correct examples
   * 5. Highlights the problematic field with pulsating border
   */
  const reportValidationIssue = useCallback(
    (targetEl: HTMLElement, issue: MascotValidationIssue) => {
      const fieldKey = issue.fieldId || "field";
      const errorFingerprint = `${fieldKey}:${issue.message}:${issue.tip?.incorrect || ""}`;

      // Mark the DOM element with error pulse ring
      targetEl.classList.remove("mascot-valid-field");
      targetEl.classList.add("mascot-invalid-field");
      invalidFieldsRef.current.add(fieldKey);

      // Prevent redundant speech spam if already displaying this exact error
      if (lastSpokenErrorRef.current === errorFingerprint) {
        return;
      }
      lastSpokenErrorRef.current = errorFingerprint;

      // Scroll field into view safely if outside visible viewport
      const rect = targetEl.getBoundingClientRect();
      const isOutOfView = rect.top < 80 || rect.bottom > window.innerHeight - 80;
      if (isOutOfView) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      // Move mascot near the input field (placement: right, or left if edge)
      snapTo(targetEl, {
        placement: "right",
        offsetX: 16,
      });

      // Override tip if customTips was supplied
      const activeTip = customTips?.[fieldKey]
        ? {
            fieldLabel: issue.tip?.fieldLabel || issue.fieldLabel,
            incorrect: customTips[fieldKey].incorrect ?? issue.tip?.incorrect,
            correct: customTips[fieldKey].correct ?? issue.tip?.correct,
          }
        : issue.tip;

      const activeMessage = customTips?.[fieldKey]?.message || issue.message;

      // Display speech bubble with incorrect/correct examples and trigger gesture
      say(activeMessage, {
        mood: issue.mood,
        gesture: issue.gesture,
        validationTip: activeTip,
        autoDismissMs: 8000,
      });
    },
    [snapTo, say, customTips]
  );

  /**
   * Handle when a previously invalid field is corrected:
   * 1. Removes invalid border, briefly adds valid green border
   * 2. Mascot changes expression to happy
   * 3. Performs thumbsUp gesture
   * 4. Shows short encouraging success message
   * 5. Returns to idle after 2.5s
   */
  const handleFieldCorrected = useCallback(
    (targetEl: HTMLElement, fieldKey: string) => {
      if (!invalidFieldsRef.current.has(fieldKey)) {
        return;
      }

      // Remove from invalid set
      invalidFieldsRef.current.delete(fieldKey);
      lastSpokenErrorRef.current = null;

      // Swap styling to success green ring
      targetEl.classList.remove("mascot-invalid-field");
      targetEl.classList.add("mascot-valid-field");

      if (validTimerRef.current) {
        clearTimeout(validTimerRef.current);
      }
      validTimerRef.current = setTimeout(() => {
        targetEl.classList.remove("mascot-valid-field");
      }, 2500);

      // Happy mascot reaction with thumbsUp
      playAnimation("happy", "thumbsUp", 2500);
      say("Looks great! That looks correct now. ✓", {
        mood: "happy",
        gesture: "thumbsUp",
        autoDismissMs: 2500,
      });
    },
    [playAnimation, say]
  );

  /**
   * Inspect a single form element on focusout (blur)
   */
  const validateElementOnBlur = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement) => {
      const fieldKey = element.id || element.name || "field";
      const issue = evaluateFieldRule(element, containerRef?.current);

      if (issue) {
        reportValidationIssue(element, issue);
      } else if (invalidFieldsRef.current.has(fieldKey)) {
        // Field was previously invalid and is now valid!
        handleFieldCorrected(element, fieldKey);
      }
    },
    [containerRef, reportValidationIssue, handleFieldCorrected]
  );

  /**
   * Set up non-intrusive focusout (blur) event listener on the container or document
   */
  useEffect(() => {
    if (!enabled) return;

    const rootTarget = containerRef?.current || document;

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        // Only validate standard text/email/tel/number inputs, ignore radio/checkbox/hidden
        const ignoredTypes = ["radio", "checkbox", "hidden", "file", "submit", "button"];
        if (target.type && ignoredTypes.includes(target.type.toLowerCase())) {
          return;
        }

        validateElementOnBlur(target);
      }
    };

    rootTarget.addEventListener("focusout", handleFocusOut as EventListener, true);

    return () => {
      rootTarget.removeEventListener("focusout", handleFocusOut as EventListener, true);
      if (validTimerRef.current) {
        clearTimeout(validTimerRef.current);
      }
    };
  }, [enabled, containerRef, validateElementOnBlur]);

  /**
   * Programmatic validation check across all inputs in container (e.g. before submit)
   */
  const validateAllFields = useCallback((): boolean => {
    const root = containerRef?.current || document;
    const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input:not([type='hidden']):not([disabled]), textarea:not([disabled])"
    );

    let firstIssue: { element: HTMLElement; issue: MascotValidationIssue } | null = null;

    inputs.forEach((input) => {
      const issue = evaluateFieldRule(input, containerRef?.current);
      if (issue && !firstIssue) {
        firstIssue = { element: input, issue };
      }
    });

    if (firstIssue) {
      reportValidationIssue((firstIssue as any).element, (firstIssue as any).issue);
      return false;
    }

    return true;
  }, [containerRef, reportValidationIssue]);

  /**
   * Bridge for React Hook Form errors
   */
  const handleRHFValidationErrors = useCallback(
    (errors: FieldErrors) => {
      const keys = Object.keys(errors);
      if (keys.length === 0) return;

      const firstKey = keys[0];
      const err = errors[firstKey];
      const message = typeof err?.message === "string" ? err.message : "Please check this required field.";

      // Query element in DOM
      const targetEl =
        document.querySelector(`[name="${firstKey}"]`) ||
        document.querySelector(`#${firstKey}`) ||
        document.querySelector(`[data-field="${firstKey}"]`);

      if (targetEl instanceof HTMLElement) {
        const isInputOrTextarea =
          targetEl instanceof HTMLInputElement || targetEl instanceof HTMLTextAreaElement;

        // Try evaluating through our rule engine first
        const issue = isInputOrTextarea
          ? evaluateFieldRule(targetEl, containerRef?.current)
          : null;

        if (issue) {
          reportValidationIssue(targetEl, issue);
        } else {
          // Fallback issue from react-hook-form message
          const fallbackIssue: MascotValidationIssue = {
            fieldId: firstKey,
            fieldLabel: firstKey,
            message,
            mood: "warning",
            gesture: "pointAtInput",
          };
          reportValidationIssue(targetEl, fallbackIssue);
        }
      }
    },
    [containerRef, reportValidationIssue]
  );

  return {
    validateAllFields,
    reportValidationIssue,
    handleFieldCorrected,
    handleRHFValidationErrors,
  };
}
