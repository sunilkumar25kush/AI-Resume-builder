import { useCallback, useRef, useEffect } from "react";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import { MascotAiEngine, type MascotAiSuggestion } from "./MascotAiEngine";

export interface UseMascotAiSuggestionsOptions {
  /** Target role for tailored summaries and skills */
  targetRole?: string;
  /** Active resume section name */
  activeSection?: string;
  /** Callback when user accepts a suggestion for a field */
  onApplyField?: (fieldName: string, value: string | string[]) => void;
  /** Optional container element to attach blur listeners */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Whether context-aware suggestions are enabled */
  enabled?: boolean;
}

export function useMascotAiSuggestions(options: UseMascotAiSuggestionsOptions = {}) {
  const { snapTo, say, think, playAnimation, dismissSpeech } = useResumeBuddy();
  const { targetRole, activeSection, onApplyField, containerRef, enabled = true } = options;

  // Track the last suggested text to avoid unnecessary or repetitive AI requests
  const lastProcessedInputRef = useRef<Map<string, string>>(new Map());
  const isAnalyzingRef = useRef(false);

  /**
   * Present an AI suggestion to the user with explaining mascot behavior
   */
  const presentSuggestion = useCallback(
    (
      message: string,
      suggestion: MascotAiSuggestion,
      targetElement?: HTMLElement | null
    ) => {
      if (targetElement) {
        snapTo(targetElement, { placement: "right", offsetX: 16 });
      }

      // Configure Accept / Reject / Edit callbacks
      const activeSuggestion: MascotAiSuggestion = {
        ...suggestion,
        onAccept: (appliedVal) => {
          // 1. Apply to form if fieldId and onApplyField available
          if (suggestion.fieldId && onApplyField) {
            onApplyField(suggestion.fieldId, appliedVal);
          }

          // 2. Mascot expresses happiness with thumbsUp gesture
          playAnimation("happy", "thumbsUp", 2500);
          say("Awesome! Suggestion applied. ✓", {
            mood: "happy",
            gesture: "thumbsUp",
            autoDismissMs: 2500,
          });
        },
        onReject: () => {
          // Dismisses cleanly without modifying text
          dismissSpeech();
          playAnimation("idle", "none", 1500);
        },
        onEdit: (customVal) => {
          if (suggestion.fieldId && onApplyField) {
            onApplyField(suggestion.fieldId, customVal);
          }
          playAnimation("happy", "thumbsUp", 2500);
          say("Customized suggestion applied! ✓", {
            mood: "happy",
            gesture: "thumbsUp",
            autoDismissMs: 2500,
          });
        },
      };

      // Mascot explains while presenting suggestion
      say(message, {
        mood: "explaining",
        gesture: "handsExplaining",
        aiSuggestion: activeSuggestion,
        autoDismissMs: 0, // Keep visible until user acts
      });
    },
    [snapTo, say, playAnimation, dismissSpeech, onApplyField]
  );

  /**
   * Inspect a field and trigger appropriate AI suggestion
   */
  const evaluateFieldForAi = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement) => {
      if (isAnalyzingRef.current) return;

      const id = (element.id || "").toLowerCase();
      const name = (element.name || "").toLowerCase();
      const val = element.value || "";
      const trimmed = val.trim();
      const fieldKey = element.id || element.name || "field";

      if (trimmed.length < 3) return;

      // Avoid redundant AI calls if input text has not changed
      if (lastProcessedInputRef.current.get(fieldKey) === trimmed) {
        return;
      }

      // 1. Skills recommendations (Example 1: "I know HTML CSS and JavaScript.")
      if (id.includes("skill") || name.includes("skill")) {
        const result = MascotAiEngine.analyzeSkills(trimmed);
        if (result) {
          lastProcessedInputRef.current.set(fieldKey, trimmed);
          think(1000, element);
          setTimeout(() => {
            presentSuggestion(result.message, result.suggestion, element);
          }, 1000);
          return;
        }
      }

      // 2. Project description suggestions (Example 2: "I created a website.")
      if (id.includes("project") || name.includes("project")) {
        // Try getting project name from row
        const parentRow = element.closest("[data-rb-row], .grid, div");
        const nameInput = parentRow?.querySelector<HTMLInputElement>(
          'input[id*="name" i], input[name*="name" i]'
        );
        const techInput = parentRow?.querySelector<HTMLInputElement>(
          'input[id*="tech" i], input[name*="tech" i]'
        );

        const result = MascotAiEngine.analyzeProject({
          name: nameInput?.value,
          description: trimmed,
          technologies: techInput?.value,
        });

        if (result) {
          lastProcessedInputRef.current.set(fieldKey, trimmed);
          result.suggestion.fieldId = element.name || element.id;
          think(1200, element);
          setTimeout(() => {
            presentSuggestion(result.message, result.suggestion, element);
          }, 1200);
          return;
        }
      }

      // 3. Summary suggestions (Example 3: Generic summary)
      if (id === "summary" || name === "summary") {
        const result = MascotAiEngine.analyzeSummary(trimmed, targetRole);
        if (result) {
          lastProcessedInputRef.current.set(fieldKey, trimmed);
          think(1200, element);
          setTimeout(() => {
            presentSuggestion(result.message, result.suggestion, element);
          }, 1200);
          return;
        }
      }

      // 4. Experience description improvements ("Responsible for fixing bugs")
      if (id.includes("experience") || name.includes("experience") || (id.includes("desc") && activeSection === "experience")) {
        const parentRow = element.closest("[data-rb-row], .grid, div");
        const titleInput = parentRow?.querySelector<HTMLInputElement>('input[id*="title" i]');
        const companyInput = parentRow?.querySelector<HTMLInputElement>('input[id*="company" i]');

        const result = MascotAiEngine.analyzeExperience({
          title: titleInput?.value,
          company: companyInput?.value,
          description: trimmed,
        });

        if (result) {
          lastProcessedInputRef.current.set(fieldKey, trimmed);
          result.suggestion.fieldId = element.name || element.id;
          think(1200, element);
          setTimeout(() => {
            presentSuggestion(result.message, result.suggestion, element);
          }, 1200);
          return;
        }
      }

      // 5. Education coursework / honors guidance
      if (id.includes("education") || name.includes("education") || (id.includes("desc") && activeSection === "education")) {
        const parentRow = element.closest("[data-rb-row], .grid, div");
        const degreeInput = parentRow?.querySelector<HTMLInputElement>('input[id*="degree" i]');
        const instInput = parentRow?.querySelector<HTMLInputElement>('input[id*="institution" i]');

        const result = MascotAiEngine.analyzeEducation({
          degree: degreeInput?.value,
          institution: instInput?.value,
          description: trimmed,
        });

        if (result) {
          lastProcessedInputRef.current.set(fieldKey, trimmed);
          result.suggestion.fieldId = element.name || element.id;
          think(1000, element);
          setTimeout(() => {
            presentSuggestion(result.message, result.suggestion, element);
          }, 1000);
          return;
        }
      }
    },
    [targetRole, activeSection, think, presentSuggestion]
  );

  /**
   * Listen for blur (focusout) to evaluate contextual suggestions without interrupting typing
   */
  useEffect(() => {
    if (!enabled) return;

    const rootTarget = containerRef?.current || document;

    const handleBlur = (e: FocusEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        evaluateFieldForAi(target);
      }
    };

    rootTarget.addEventListener("focusout", handleBlur as EventListener, true);
    return () => {
      rootTarget.removeEventListener("focusout", handleBlur as EventListener, true);
    };
  }, [enabled, containerRef, evaluateFieldForAi]);

  /**
   * Celebrating reaction when a section is saved or completed
   */
  const handleSectionComplete = useCallback(
    (sectionName?: string) => {
      playAnimation("celebrating", "clap", 4000);
      say(sectionName ? `${sectionName} section completed! Looking sharp!` : "Great progress! Section saved successfully!", {
        mood: "celebrating",
        gesture: "clap",
        autoDismissMs: 4000,
      });
    },
    [playAnimation, say]
  );

  /**
   * Manually trigger an AI check for a given section/content
   */
  const triggerManualSectionAssist = useCallback(
    async (section: "summary" | "skills" | "experience" | "project" | "education" | "portfolio", content: any, fieldId?: string) => {
      think(1500);

      if (section === "skills") {
        const text = typeof content === "string" ? content : (content?.skillsText || "");
        const res = MascotAiEngine.analyzeSkills(text);
        if (res) {
          presentSuggestion(res.message, res.suggestion);
          return;
        }
      } else if (section === "summary") {
        const text = typeof content === "string" ? content : (content?.summary || "");
        const res = MascotAiEngine.analyzeSummary(text, targetRole);
        if (res) {
          presentSuggestion(res.message, res.suggestion);
          return;
        }
      } else if (section === "project") {
        const res = MascotAiEngine.analyzeProject(content);
        if (res) {
          if (fieldId) res.suggestion.fieldId = fieldId;
          presentSuggestion(res.message, res.suggestion);
          return;
        }
      } else if (section === "experience") {
        const res = MascotAiEngine.analyzeExperience(content);
        if (res) {
          if (fieldId) res.suggestion.fieldId = fieldId;
          presentSuggestion(res.message, res.suggestion);
          return;
        }
      }

      // If already good:
      say("Your content in this section looks strong and well-structured!", {
        mood: "happy",
        gesture: "thumbsUp",
        autoDismissMs: 3000,
      });
    },
    [think, targetRole, presentSuggestion, say]
  );

  return {
    presentSuggestion,
    evaluateFieldForAi,
    handleSectionComplete,
    triggerManualSectionAssist,
  };
}
