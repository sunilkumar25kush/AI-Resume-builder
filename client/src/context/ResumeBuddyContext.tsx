import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AnimationKey, ExpressionKey } from "@bible-strong/avatar-core";
import {
  MascotPositionEngine,
  type MascotCoordinates,
  type MascotTargetOptions,
} from "@/components/ResumeBuddy/MascotPositionEngine";
import { MascotAnimationController } from "@/components/ResumeBuddy/MascotAnimationController";
import { MascotExpressionController, type MicroExpression } from "@/components/ResumeBuddy/MascotExpressionController";
import type { MascotGestureType } from "@/components/ResumeBuddy/MascotGestureController";
import { MascotInteractionController } from "@/components/ResumeBuddy/MascotInteractionController";
import {
  type MascotMood,
  MASCOT_TIMINGS,
} from "@/config/mascotBehaviors";
import type { SpeechAction } from "@/components/ResumeBuddy/MascotSpeechBubble";

export interface MascotState {
  coordinates: MascotCoordinates;
  placement: MascotCoordinates["placement"];
  targetBearing: MascotCoordinates["targetBearing"];
  characterId: string;
  mood: MascotMood;
  sequence: AnimationKey;
  expression?: ExpressionKey;
  activeGesture: MascotGestureType;
  isThinking: boolean;
  speechText?: string;
  speechActions?: SpeechAction[];
  isVisible: boolean;
  isSleeping: boolean;
}

export interface SayOptions {
  mood?: MascotMood;
  gesture?: MascotGestureType;
  actions?: SpeechAction[];
  autoDismissMs?: number;
  snapTarget?: HTMLElement | string;
  targetOptions?: MascotTargetOptions;
}

export interface ResumeBuddyContextValue {
  state: MascotState;
  snapTo: (target: HTMLElement | string | null, options?: MascotTargetOptions) => void;
  dock: () => void;
  reanchor: () => void;
  say: (text: string, options?: SayOptions) => void;
  think: (durationMs?: number, snapTarget?: HTMLElement | string) => void;
  react: (mood: MascotMood, durationMs?: number) => void;
  pulseExpression: (expr: MicroExpression, durationMs?: number) => void;
  triggerGesture: (gesture: MascotGestureType) => void;
  dismissSpeech: () => void;
  toggleVisibility: () => void;
  setCharacterId: (id: string) => void;
  wakeUp: () => void;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  isMinimized: boolean;
  toggleMinimize: (minimized?: boolean) => void;
  isDisabled: boolean;
  setDisabled: (disabled: boolean) => void;
  isCustomPositioned: boolean;
  setCustomPosition: (pos: { x: number; y: number } | null) => void;
}

const ResumeBuddyContext = createContext<ResumeBuddyContextValue | null>(null);

export function ResumeBuddyProvider({ children }: { children: ReactNode }) {
  const positionEngineRef = useRef<MascotPositionEngine>(new MascotPositionEngine(96, 96));
  const animationControllerRef = useRef<MascotAnimationController>(new MascotAnimationController());
  const expressionControllerRef = useRef<MascotExpressionController>(new MascotExpressionController());
  const interactionControllerRef = useRef<MascotInteractionController>(new MascotInteractionController());

  const currentTargetRef = useRef<HTMLElement | null>(null);
  const currentTargetOptionsRef = useRef<MascotTargetOptions>({});
  const activeFocusedElementRef = useRef<HTMLElement | null>(null);

  const [coordinates, setCoordinates] = useState<MascotCoordinates>(() =>
    positionEngineRef.current.getDockedCoordinates(),
  );

  const [characterId, setCharacterId] = useState<string>("buddy");
  const [mood, setMood] = useState<MascotMood>("idle");
  const [sequence, setSequence] = useState<AnimationKey>("idle");
  const [expression, setExpression] = useState<ExpressionKey | undefined>(undefined);
  const [activeGesture, setActiveGesture] = useState<MascotGestureType>("none");
  const [isThinking, setIsThinking] = useState(false);
  const [speechText, setSpeechText] = useState<string | undefined>(undefined);
  const [speechActions, setSpeechActions] = useState<SpeechAction[] | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(true);
  const [isSleeping, setIsSleeping] = useState(false);

  // Interaction states
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDisabled, setIsDisabled] = useState(() =>
    typeof localStorage !== "undefined"
      ? localStorage.getItem("resumebuddy_disabled") === "true"
      : false,
  );
  const [customPosition, setCustomPositionState] = useState<{ x: number; y: number } | null>(null);

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize listeners
  useEffect(() => {
    animationControllerRef.current.setListener((newSeq, newMood) => {
      setSequence(newSeq);
      setMood(newMood);
    });

    expressionControllerRef.current.setListener((newExpr) => {
      setExpression(newExpr);
    });

    interactionControllerRef.current.setListener((interState) => {
      setIsPanelOpen(interState.isPanelOpen);
      setIsMinimized(interState.isMinimized);
      setIsDisabled(interState.isDisabled);
      setCustomPositionState(interState.customDragPosition);
    });
  }, []);

  // Update target coordinates
  const updateTargetPosition = useCallback(() => {
    // If user has custom drag position, honor it
    if (customPosition) {
      setCoordinates((prev) => ({
        ...prev,
        x: customPosition.x,
        y: customPosition.y,
        flightDeltaX: 0,
        flightDeltaY: 0,
      }));
      return;
    }

    // Otherwise calculate relative to current target (focused field or active section)
    const activeTarget = activeFocusedElementRef.current || currentTargetRef.current;
    const coords = positionEngineRef.current.calculateTargetCoordinates(
      activeTarget,
      currentTargetOptionsRef.current,
    );
    setCoordinates(coords);
  }, [customPosition]);

  // Window scroll & resize listeners (passive & throttled via RAF)
  useEffect(() => {
    let rafId: number | null = null;

    const handleWindowChange = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updateTargetPosition();
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleWindowChange, { passive: true });
    window.addEventListener("resize", handleWindowChange, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleWindowChange);
      window.removeEventListener("resize", handleWindowChange);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [updateTargetPosition]);

  // Activity detection: reset sleep timer on mouse/keyboard activity
  const wakeUp = useCallback(() => {
    if (isSleeping) {
      setIsSleeping(false);
      animationControllerRef.current.playMood("waking", 1800);
    }

    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }

    sleepTimerRef.current = setTimeout(() => {
      setIsSleeping(true);
      animationControllerRef.current.playMood("sleeping");
    }, MASCOT_TIMINGS.sleepInactivityMs);
  }, [isSleeping]);

  useEffect(() => {
    window.addEventListener("pointermove", wakeUp, { passive: true });
    window.addEventListener("keydown", wakeUp, { passive: true });

    wakeUp();

    return () => {
      window.removeEventListener("pointermove", wakeUp);
      window.removeEventListener("keydown", wakeUp);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [wakeUp]);

  // Snap to target element
  const snapTo = useCallback(
    (target: HTMLElement | string | null, options: MascotTargetOptions = {}) => {
      wakeUp();
      let element: HTMLElement | null = null;

      if (typeof target === "string") {
        element = document.querySelector(target) as HTMLElement | null;
      } else {
        element = target;
      }

      currentTargetRef.current = element;
      currentTargetOptionsRef.current = options;

      // Clear any manual drag offset when programmatically snapped
      setCustomPositionState(null);
      interactionControllerRef.current.resetPosition();

      const coords = positionEngineRef.current.calculateTargetCoordinates(element, options);
      setCoordinates(coords);

      if (coords.targetBearing !== "center") {
        setActiveGesture("tiltTowardTarget");
      }
    },
    [wakeUp],
  );

  // Return to dock
  const dock = useCallback(() => {
    wakeUp();
    currentTargetRef.current = null;
    activeFocusedElementRef.current = null;
    currentTargetOptionsRef.current = {};
    setCustomPositionState(null);
    interactionControllerRef.current.resetPosition();
    const coords = positionEngineRef.current.getDockedCoordinates();
    setCoordinates(coords);
    setActiveGesture("none");
  }, [wakeUp]);

  // Re-anchor to active section
  const reanchor = useCallback(() => {
    setCustomPositionState(null);
    interactionControllerRef.current.resetPosition();
    updateTargetPosition();
  }, [updateTargetPosition]);

  // Dismiss speech bubble
  const dismissSpeech = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setSpeechText(undefined);
    setSpeechActions(undefined);
    setIsThinking(false);
  }, []);

  // Trigger simulated gesture
  const triggerGesture = useCallback((gesture: MascotGestureType) => {
    setActiveGesture(gesture);
    if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);

    if (gesture !== "none" && gesture !== "tiltTowardTarget") {
      gestureTimerRef.current = setTimeout(() => {
        setActiveGesture(currentTargetRef.current ? "tiltTowardTarget" : "none");
      }, 1200);
    }
  }, []);

  // Speak dialogue
  const say = useCallback(
    (text: string, options: SayOptions = {}) => {
      wakeUp();
      dismissSpeech();

      const {
        mood: newMood,
        gesture = "bounce",
        actions,
        autoDismissMs = MASCOT_TIMINGS.autoDismissDefaultMs,
        snapTarget,
        targetOptions,
      } = options;

      if (snapTarget) {
        snapTo(snapTarget, targetOptions);
      }

      if (newMood) {
        animationControllerRef.current.playMood(newMood);
      }

      if (gesture) {
        triggerGesture(gesture);
      }

      setSpeechText(text);
      setSpeechActions(actions);
      setIsThinking(false);

      if (autoDismissMs && autoDismissMs > 0 && (!actions || actions.length === 0)) {
        dismissTimerRef.current = setTimeout(() => {
          dismissSpeech();
        }, autoDismissMs);
      }
    },
    [wakeUp, dismissSpeech, snapTo, triggerGesture],
  );

  // Think state with 3 pulsating dots
  const think = useCallback(
    (durationMs = 2500, snapTarget?: HTMLElement | string) => {
      wakeUp();
      dismissSpeech();

      if (snapTarget) {
        snapTo(snapTarget);
      }

      animationControllerRef.current.playMood("thinking", durationMs);
      setIsThinking(true);

      if (durationMs > 0) {
        dismissTimerRef.current = setTimeout(() => {
          setIsThinking(false);
        }, durationMs);
      }
    },
    [wakeUp, dismissSpeech, snapTo],
  );

  // Mood reaction
  const react = useCallback(
    (targetMood: MascotMood, durationMs?: number) => {
      wakeUp();
      animationControllerRef.current.playMood(targetMood, durationMs);
    },
    [wakeUp],
  );

  // Micro expression pulse
  const pulseExpression = useCallback((expr: MicroExpression, durationMs = 1200) => {
    wakeUp();
    expressionControllerRef.current.pulseMicroExpression(expr, durationMs, () => {
      setExpression(undefined);
    });
  }, [wakeUp]);

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  // Custom position from drag
  const setCustomPosition = useCallback((pos: { x: number; y: number } | null) => {
    setCustomPositionState(pos);
    interactionControllerRef.current.setCustomDragPosition(pos);
    if (pos) {
      setCoordinates((prev) => ({
        ...prev,
        x: pos.x,
        y: pos.y,
        flightDeltaX: 0,
        flightDeltaY: 0,
      }));
    }
  }, []);

  // Autonomous Section Observer & Navigation Tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    let observer: IntersectionObserver | null = null;

    const setupSectionObserver = () => {
      if (observer) observer.disconnect();

      // Query section landmarks on the page
      const landmarks = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-mascot-section], [data-mascot-target], main > section, .editor-form-card, #dashboard-features, #score-ring-card, form",
        ),
      );

      if (landmarks.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          // If user dragged to custom spot or panel is open, do not auto-override
          if (customPosition || isPanelOpen) return;

          // Find the most prominent intersecting landmark
          const intersecting = entries
            .filter((e) => e.isIntersecting && e.intersectionRatio > 0.25)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (intersecting.length > 0 && !activeFocusedElementRef.current) {
            const targetEl = intersecting[0].target as HTMLElement;
            currentTargetRef.current = targetEl;
            currentTargetOptionsRef.current = { placement: "right" };
            updateTargetPosition();
          }
        },
        {
          rootMargin: "-80px 0px -120px 0px",
          threshold: [0.3, 0.6],
        },
      );

      landmarks.forEach((el) => observer?.observe(el));
    };

    // Initial setup with slight delay for dynamic page hydration
    const timer = setTimeout(setupSectionObserver, 300);

    // Watch for route / DOM changes
    const mutationObserver = new MutationObserver(() => {
      setupSectionObserver();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: false,
    });

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      mutationObserver.disconnect();
    };
  }, [customPosition, isPanelOpen, updateTargetPosition]);

  // Input Focus Tracking: Follows active form input when user is typing
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")
      ) {
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

        activeFocusedElementRef.current = target;
        updateTargetPosition();

        if (mood === "idle") {
          animationControllerRef.current.playMood("listening", 3000);
        }
      }
    };

    const handleFocusOut = () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

      // Gentle delay before returning to section landmark
      blurTimerRef.current = setTimeout(() => {
        activeFocusedElementRef.current = null;
        updateTargetPosition();
      }, 700);
    };

    document.addEventListener("focusin", handleFocusIn, { passive: true });
    document.addEventListener("focusout", handleFocusOut, { passive: true });

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, [mood, updateTargetPosition]);

  // Route change detection: reset custom position and dock/re-anchor to new page
  useEffect(() => {
    const handleNavigation = () => {
      setCustomPositionState(null);
      interactionControllerRef.current.resetPosition();
      currentTargetRef.current = null;
      activeFocusedElementRef.current = null;
      updateTargetPosition();
    };

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, [updateTargetPosition]);

  const value: ResumeBuddyContextValue = {
    state: {
      coordinates,
      placement: coordinates.placement,
      targetBearing: coordinates.targetBearing,
      characterId,
      mood,
      sequence,
      expression,
      activeGesture,
      isThinking,
      speechText,
      speechActions,
      isVisible,
      isSleeping,
    },
    snapTo,
    dock,
    reanchor,
    say,
    think,
    react,
    pulseExpression,
    triggerGesture,
    dismissSpeech,
    toggleVisibility,
    setCharacterId,
    wakeUp,
    isPanelOpen,
    openPanel: () => interactionControllerRef.current.togglePanel(true),
    closePanel: () => interactionControllerRef.current.togglePanel(false),
    isMinimized,
    toggleMinimize: (val) => interactionControllerRef.current.toggleMinimize(val),
    isDisabled,
    setDisabled: (val) => interactionControllerRef.current.setDisabled(val),
    isCustomPositioned: Boolean(customPosition),
    setCustomPosition,
  };

  return (
    <ResumeBuddyContext.Provider value={value}>
      {children}
    </ResumeBuddyContext.Provider>
  );
}

export function useResumeBuddy(): ResumeBuddyContextValue {
  const context = useContext(ResumeBuddyContext);
  if (!context) {
    throw new Error("useResumeBuddy must be used within a ResumeBuddyProvider");
  }
  return context;
}
