import { useEffect, useRef } from "react";
import type { FieldErrors } from "react-hook-form";
import { useAvatarAssistant } from "./useAvatarAssistant";

/**
 * Automatically binds React Hook Form validation states to avatar expressions and guidance speech.
 */
export function useFormValidationMood<T extends Record<string, any>>(
  errors: FieldErrors<T>,
  isSubmitting?: boolean,
  isDirty?: boolean
) {
  const { setMood, resetToIdle, warn, think, cheer } = useAvatarAssistant();
  const prevErrorCount = useRef(0);
  const wasSubmitting = useRef(false);

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    const errorCount = errorKeys.length;

    // 1. Submitting state
    if (isSubmitting) {
      wasSubmitting.current = true;
      think("Validating your information and updating your resume preview...");
      return;
    }

    // 2. Submission just finished without errors
    if (wasSubmitting.current && !isSubmitting && errorCount === 0) {
      wasSubmitting.current = false;
      cheer("All fields validated and updated cleanly!", 4000);
      return;
    }

    // 3. New validation errors occurred
    if (errorCount > 0 && errorCount !== prevErrorCount.current) {
      prevErrorCount.current = errorCount;
      const firstKey = errorKeys[0];
      const firstError = errors[firstKey as keyof T];
      const errorMessage =
        typeof firstError?.message === "string"
          ? firstError.message
          : `Please review ${String(firstKey)}: ensure required information is provided.`;

      warn(errorMessage, 8000);
      return;
    }

    // 4. Errors cleared
    if (errorCount === 0 && prevErrorCount.current > 0) {
      prevErrorCount.current = 0;
      cheer("Validation issues resolved! Looks good.", 3500);
      return;
    }

    prevErrorCount.current = errorCount;
  }, [errors, isSubmitting, isDirty, setMood, resetToIdle, warn, think, cheer]);
}

