import { useEffect } from "react";
import type { FieldErrors } from "react-hook-form";
import { useSmartFormValidation } from "./useSmartFormValidation";

export interface MascotFormObserverProps {
  errors?: FieldErrors;
  customTips?: Record<string, { incorrect?: string; correct?: string; message?: string }>;
  enabled?: boolean;
}

/**
 * Headless Observer Component that mounts smart validation on any form.
 * Listens for field blur events, highlights invalid fields, shows incorrect/correct tips,
 * moves the mascot with pointAtInput gesture, and celebrates with thumbsUp upon correction.
 */
export function MascotFormObserver({
  errors,
  customTips,
  enabled = true,
}: MascotFormObserverProps) {
  const { handleRHFValidationErrors } = useSmartFormValidation({
    customTips,
    enabled,
  });

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      handleRHFValidationErrors(errors);
    }
  }, [errors, handleRHFValidationErrors]);

  return null;
}
