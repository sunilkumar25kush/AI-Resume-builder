import { useEffect } from "react";
import type { FieldErrors } from "react-hook-form";
import { useMascotReactions } from "@/hooks/useMascotReactions";
import { DEFAULT_FIELD_TIPS } from "./validationRules";

export interface MascotFormObserverProps {
  errors: FieldErrors;
  customTips?: Record<string, string>;
}

export function MascotFormObserver({ errors, customTips = {} }: MascotFormObserverProps) {
  const { handleFormErrors } = useMascotReactions();

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      handleFormErrors(errors, { ...DEFAULT_FIELD_TIPS, ...customTips });
    }
  }, [errors, customTips, handleFormErrors]);

  return null;
}

