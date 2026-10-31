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
import {
  type MascotMood,
  MASCOT_TIMINGS,
} from "@/config/mascotBehaviors";
import type { SpeechAction } from "@/components/ResumeBuddy/SpeechBubble";

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
  say: (text: string, options?: SayOptions) => void;
  think: (durationMs?: number, snapTarget?: HTMLElement | string) => void;
  react: (mood: MascotMood, durationMs?: number) => void;
  pulseExpression: (expr: MicroExpression, durationMs?: number) => void;
  triggerGesture: (gesture: MascotGestureType) => void;
  dismissSpeech: () => void;
  toggleVisibility: () => void;
  setCharacterId: (id: string) => void;
  wakeUp: () => void;
}

const ResumeBuddyContext = createContext<ResumeBuddyContextValue | null>(null);

export function ResumeBuddyProvider({ children }: { children: ReactNode }) {
  const positionEngineRef = useRef<MascotPositionEngine>(new MascotPositionEngine(96, 96));
  const animationControllerRef = useRef<MascotAnimationController>(new MascotAnimationController());
  const expressionControllerRef = useRef<MascotExpressionController>(new MascotExpressionController());

  const currentTargetRef = useRef<HTMLElement | null>(null);
  const currentTargetOptionsRef = useRef<MascotTargetOptions>({});

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

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize controllers
  useEffect(() => {
    animationControllerRef.current.setListener((newSeq, newMood) => {
      setSequence(newSeq);
      setMood(newMood);
    });

    expressionControllerRef.current.setListener((newExpr) => {
      setExpression(newExpr);
    });
  }, []);

  // Update target coordinates
  const updateTargetPosition = useCallback(() => {
    const coords = positionEngineRef.current.calculateTargetCoordinates(
      currentTargetRef.current,
      currentTargetOptionsRef.current,
    );
    setCoordinates(coords);
  }, []);

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
    currentTargetOptionsRef.current = {};
    const coords = positionEngineRef.current.getDockedCoordinates();
    setCoordinates(coords);
    setActiveGesture("none");
  }, [wakeUp]);

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
    say,
    think,
    react,
    pulseExpression,
    triggerGesture,
    dismissSpeech,
    toggleVisibility,
    setCharacterId,
    wakeUp,
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

