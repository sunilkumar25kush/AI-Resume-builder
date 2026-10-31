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
import { MascotInteractionController } from "@/components/ResumeBuddy/MascotInteractionController";
import { MascotScrollManager } from "@/components/ResumeBuddy/MascotScrollManager";
import { getPageMascotConfig } from "@/config/mascotPageAnchors";
import {
  type MascotExpression,
  type MascotHandGesture,
  type MascotInteractionScenario,
  INTERACTION_MAPPINGS,
  MASCOT_TIMINGS,
} from "@/config/mascotBehaviors";
import type { SpeechAction } from "@/components/ResumeBuddy/MascotSpeechBubble";

export interface MascotState {
  coordinates: MascotCoordinates;
  placement: MascotCoordinates["placement"];
  targetBearing: MascotCoordinates["targetBearing"];
  characterId: string;
  mood: MascotExpression;
  sequence: AnimationKey;
  expression?: ExpressionKey;
  activeGesture: MascotHandGesture;
  isThinking: boolean;
  speechText?: string;
  speechActions?: SpeechAction[];
  isVisible: boolean;
  isSleeping: boolean;
  activeSection?: string | null;
  isModalOpen?: boolean;
}

export interface SayOptions {
  mood?: MascotExpression;
  gesture?: MascotHandGesture;
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
  react: (mood: MascotExpression, durationMs?: number) => void;
  playAnimation: (expression: MascotExpression, gesture?: MascotHandGesture, durationMs?: number) => void;
  triggerInteraction: (scenario: MascotInteractionScenario, snapTarget?: HTMLElement | string) => void;
  pulseExpression: (expr: MicroExpression, durationMs?: number) => void;
  triggerGesture: (gesture: MascotHandGesture) => void;
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
  handleRouteChange: (pathname: string) => void;
  activeSection: string | null;
  isModalOpen: boolean;
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
  const [mood, setMood] = useState<MascotExpression>("idle");
  const [sequence, setSequence] = useState<AnimationKey>("idle");
  const [expression, setExpression] = useState<ExpressionKey | undefined>(undefined);
  const [activeGesture, setActiveGesture] = useState<MascotHandGesture>("none");
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollManagerRef = useRef<MascotScrollManager | null>(null);
  const lastGreetedRouteRef = useRef<string>("");

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize listeners
  useEffect(() => {
    animationControllerRef.current.setListener((animState) => {
      setSequence(animState.sequence);
      setMood(animState.expression);
      setExpression(animState.fallbackExpression);
      setActiveGesture(animState.gesture);
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
      animationControllerRef.current.play("happy", "bounce", 1800);
    }

    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }

    sleepTimerRef.current = setTimeout(() => {
      setIsSleeping(true);
      animationControllerRef.current.play("sleeping", "none");
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

      setCustomPositionState(null);
      interactionControllerRef.current.resetPosition();

      const coords = positionEngineRef.current.calculateTargetCoordinates(element, options);
      setCoordinates(coords);
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
    animationControllerRef.current.resetToIdle();
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

  // Play animation with priority & cooldown management
  const playAnimation = useCallback(
    (targetExpr: MascotExpression, targetGest: MascotHandGesture = "none", durationMs?: number) => {
      wakeUp();
      animationControllerRef.current.play(targetExpr, targetGest, durationMs);
    },
    [wakeUp],
  );

  // Trigger standardized interaction scenario
  const triggerInteraction = useCallback(
    (scenario: MascotInteractionScenario, snapTarget?: HTMLElement | string) => {
      wakeUp();
      const rule = INTERACTION_MAPPINGS[scenario];
      if (!rule) return;

      if (snapTarget) {
        snapTo(snapTarget);
      }

      animationControllerRef.current.play(rule.expression, rule.gesture, rule.durationMs);
    },
    [wakeUp, snapTo],
  );

  // Trigger gesture directly
  const triggerGesture = useCallback(
    (gesture: MascotHandGesture) => {
      wakeUp();
      animationControllerRef.current.play(mood, gesture, 1600);
    },
    [wakeUp, mood],
  );

  // Speak dialogue
  const say = useCallback(
    (text: string, options: SayOptions = {}) => {
      wakeUp();
      dismissSpeech();

      const {
        mood: newMood = "happy",
        gesture = "bounce",
        actions,
        autoDismissMs = MASCOT_TIMINGS.autoDismissDefaultMs,
        snapTarget,
        targetOptions,
      } = options;

      if (snapTarget) {
        snapTo(snapTarget, targetOptions);
      }

      animationControllerRef.current.play(newMood, gesture, autoDismissMs || 4000);

      setSpeechText(text);
      setSpeechActions(actions);
      setIsThinking(false);

      if (autoDismissMs && autoDismissMs > 0 && (!actions || actions.length === 0)) {
        dismissTimerRef.current = setTimeout(() => {
          dismissSpeech();
        }, autoDismissMs);
      }
    },
    [wakeUp, dismissSpeech, snapTo],
  );

  // Think state with 3 pulsating dots
  const think = useCallback(
    (durationMs = 2500, snapTarget?: HTMLElement | string) => {
      wakeUp();
      dismissSpeech();

      if (snapTarget) {
        snapTo(snapTarget);
      }

      animationControllerRef.current.play("thinking", "handOnChin", durationMs);
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
    (targetMood: MascotExpression, durationMs?: number) => {
      wakeUp();
      animationControllerRef.current.play(targetMood, "none", durationMs);
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

  // Centralized Mascot Scroll & Intersection Manager
  useEffect(() => {
    if (typeof window === "undefined") return;

    const manager = new MascotScrollManager(
      positionEngineRef.current,
      (target, options, sectionKey) => {
        if (customPosition || isPanelOpen) return;
        if (activeFocusedElementRef.current) return;

        if (sectionKey) {
          setActiveSection(sectionKey);
        }

        currentTargetRef.current = target;
        if (options) {
          currentTargetOptionsRef.current = options;
        }

        const coords = positionEngineRef.current.calculateTargetCoordinates(
          target,
          currentTargetOptionsRef.current,
        );
        setCoordinates(coords);
      },
      (modalOpen) => {
        setIsModalOpen(modalOpen);
        setCoordinates((prev) => ({
          ...prev,
          isModalYielding: modalOpen,
        }));
      },
    );

    scrollManagerRef.current = manager;

    // Trigger initial scan for current path
    if (window.location.pathname) {
      manager.handleRouteChange(window.location.pathname);
    }

    return () => {
      manager.destroy();
      scrollManagerRef.current = null;
    };
  }, [customPosition, isPanelOpen]);

  // Route change handler: resets overrides and updates page landmark tracking
  const handleRouteChange = useCallback((pathname: string) => {
    wakeUp();
    setCustomPositionState(null);
    interactionControllerRef.current.resetPosition();
    currentTargetRef.current = null;
    activeFocusedElementRef.current = null;

    scrollManagerRef.current?.handleRouteChange(pathname);

    // Initial greeting if configured for this route and not already greeted
    const pageConfig = getPageMascotConfig(pathname);
    if (pageConfig?.greeting && lastGreetedRouteRef.current !== pathname) {
      lastGreetedRouteRef.current = pathname;
      say(pageConfig.greeting.text, {
        mood: pageConfig.greeting.mood,
        gesture: pageConfig.greeting.gesture,
        autoDismissMs: pageConfig.greeting.autoDismissMs,
      });
    }
  }, [wakeUp, say]);

  // Input Focus Tracking: Follows active form input with 'enterInfo' (thinking + handOnChin)
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

        triggerInteraction("enterInfo");
      }
    };

    const handleFocusOut = () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

      blurTimerRef.current = setTimeout(() => {
        activeFocusedElementRef.current = null;
        updateTargetPosition();
        animationControllerRef.current.resetToIdle();
      }, 700);
    };

    document.addEventListener("focusin", handleFocusIn, { passive: true });
    document.addEventListener("focusout", handleFocusOut, { passive: true });

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, [triggerInteraction, updateTargetPosition]);

  // Popstate navigation detection
  useEffect(() => {
    const handleNavigation = () => {
      handleRouteChange(window.location.pathname);
    };

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, [handleRouteChange]);

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
      activeSection,
      isModalOpen,
    },
    snapTo,
    dock,
    reanchor,
    say,
    think,
    react,
    playAnimation,
    triggerInteraction,
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
    handleRouteChange,
    activeSection,
    isModalOpen,
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
