import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useDragControls } from "framer-motion";
import { Minimize2, EyeOff, Sparkles } from "lucide-react";
import { MascotRenderer } from "./MascotRenderer";
import { MascotSpeechBubble } from "./MascotSpeechBubble";
import { MascotAssistantPanel } from "./MascotAssistantPanel";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import { MascotGestureController } from "./MascotGestureController";
import { cn } from "@/lib/utils";

export interface FloatingMascotProps {
  className?: string;
  size?: number;
}

export function FloatingMascot({ className, size = 96 }: FloatingMascotProps) {
  const {
    state,
    dock,
    dismissSpeech,
    triggerGesture,
    isPanelOpen,
    openPanel,
    closePanel,
    isMinimized,
    toggleMinimize,
    isDisabled,
    setDisabled,
    setCustomPosition,
  } = useResumeBuddy();

  const [isHovered, setIsHovered] = useState(false);
  const [cursorGaze, setCursorGaze] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });
  const mascotRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Subtle cursor gaze tracking when hovering nearby (< 250px)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current || state.isSleeping || isMinimized || isDisabled) return;

      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (distance < 240) {
        const gaze = MascotGestureController.calculateCursorGaze(
          { x: centerX, y: centerY },
          { x: e.clientX, y: e.clientY },
          8,
        );
        setCursorGaze(gaze);
      } else {
        setCursorGaze({ rotateX: 0, rotateY: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [state.isSleeping, isMinimized, isDisabled]);

  // If disabled by user in settings / localStorage
  if (isDisabled) {
    return (
      <button
        onClick={() => setDisabled(false)}
        className="fixed bottom-6 right-6 z-50 px-3 py-2 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center gap-1.5"
        title="Enable ResumeBuddy"
        aria-label="Enable ResumeBuddy"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>ResumeBuddy</span>
      </button>
    );
  }

  // If minimized into compact floating pill
  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={() => toggleMinimize(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all group"
        title="Expand ResumeBuddy Assistant"
        aria-label="Expand ResumeBuddy Assistant"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>ResumeBuddy</span>
      </motion.button>
    );
  }

  // Gesture keyframes (wave, nod, shake, bounce, tilt)
  const gestureAnimation = MascotGestureController.getGestureAnimation(
    state.activeGesture,
    state.targetBearing,
  );

  // Dynamic flight tilt (leans into flight direction when gliding)
  const flightTilt = useMemo(() => {
    const deltaX = state.coordinates.flightDeltaX || 0;
    if (Math.abs(deltaX) > 15) {
      return Math.max(-12, Math.min(12, deltaX * 0.08));
    }
    return 0;
  }, [state.coordinates.flightDeltaX]);

  const effectiveX = state.coordinates.x;
  const effectiveY = state.coordinates.y;

  const isCelebrating =
    state.mood === "celebrating" ||
    state.mood === "celebrate" ||
    state.activeGesture === "clap" ||
    state.activeGesture === "raiseHands";
  const isExplaining = state.mood === "explaining" || state.activeGesture === "handsExplaining";
  const hasBubble = Boolean(state.speechText || state.isThinking);

  // Turn toward active content / input
  const inputTurnY = state.targetBearing === "left" ? -12 : state.targetBearing === "right" ? 12 : 0;
  const inputTurnX = state.targetBearing === "below" ? 8 : state.targetBearing === "above" ? -8 : 0;

  // Lean toward speech bubble
  const bubbleLeanX = hasBubble ? (effectiveY < 180 ? 4 : -4) : 0;

  return (
    <>
      {/* Interactive Assistant Panel Modal */}
      <MascotAssistantPanel isOpen={isPanelOpen} onClose={closePanel} />

      {/* Main Intelligent Floating Mascot Shell */}
      <motion.div
        ref={mascotRef}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        onDragEnd={(_e, info) => {
          // If dragged significantly (> 20px), register custom user drag position
          if (Math.abs(info.offset.x) > 20 || Math.abs(info.offset.y) > 20) {
            setCustomPosition({
              x: effectiveX + info.offset.x,
              y: effectiveY + info.offset.y,
            });
          }
        }}
        initial={{ x: effectiveX, y: effectiveY, opacity: 0, scale: 0.8 }}
        animate={{
          x: effectiveX,
          y: effectiveY,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: "spring",
          damping: 24,
          stiffness: 220,
          mass: 0.85,
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          if (state.mood === "idle") {
            triggerGesture("bounce");
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed top-0 left-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none",
          className,
        )}
        style={{
          width: size,
          height: size,
          perspective: 600,
        }}
      >
        {/* Animated Speech Bubble attached near mascot */}
        <MascotSpeechBubble
          text={state.speechText}
          isThinking={state.isThinking}
          actions={state.speechActions}
          onDismiss={dismissSpeech}
          position={effectiveY < 180 ? "bottom" : "top"}
        />

        {/* Hover Quick Badges (Dock & Minimize & Re-anchor) */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute -top-3.5 -right-2 z-20 flex items-center gap-1 bg-slate-900/90 text-white rounded-full p-1 shadow-md border border-slate-700/50 backdrop-blur-sm"
          >
            {state.placement !== "docked" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dock();
                }}
                title="Dock to bottom corner"
                aria-label="Dock to bottom corner"
                className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimize(true);
              }}
              title="Minimize to pill"
              aria-label="Minimize to pill"
              className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Living Character Multi-Layer Motion Wrapper */}
        <motion.div
          onClick={(e) => {
            e.stopPropagation();
            triggerGesture("bounce");
            openPanel();
          }}
          animate={{
            y: state.isSleeping
              ? [0, 2, 0]
              : isCelebrating
              ? [0, -22, 0, -14, 0]
              : isExplaining
              ? [0, -4, 0, -4, 0]
              : (gestureAnimation.body.y ?? [0, -7, 0]),
            x: gestureAnimation.body.x ?? 0,
            rotate: (gestureAnimation.body.rotate?.[0] ?? 0) + flightTilt,
            scale: gestureAnimation.body.scale ?? (isHovered ? 1.05 : 1),
            rotateX: cursorGaze.rotateX + inputTurnX + bubbleLeanX,
            rotateY: cursorGaze.rotateY + inputTurnY,
          }}
          transition={{
            y: {
              duration: state.isSleeping ? 4.5 : isCelebrating ? 0.9 : 2.8,
              repeat: gestureAnimation.transition ? 0 : Infinity,
              ease: "easeInOut",
            },
            rotate: { duration: 0.4 },
            scale: { duration: 0.2 },
          }}
          className="w-full h-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <MascotRenderer
            characterId={state.characterId}
            sequence={state.sequence}
            expression={state.expression}
            mood={state.mood}
            gesture={state.activeGesture}
            targetBearing={state.targetBearing}
            size={size}
            isSleeping={state.isSleeping}
            isHovered={isHovered}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
