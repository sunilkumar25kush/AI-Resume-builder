import { useState, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Minimize2, EyeOff } from "lucide-react";
import { AvatarRenderer } from "./AvatarRenderer";
import { SpeechBubble } from "./SpeechBubble";
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
    toggleVisibility,
    triggerGesture,
  } = useResumeBuddy();

  const [isHovered, setIsHovered] = useState(false);
  const mascotRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  if (!state.isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-6 right-6 z-50 p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
        title="Open ResumeBuddy"
        aria-label="Open ResumeBuddy"
      >
        <span className="w-3.5 h-3.5 rounded-full bg-slate-900 block group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  // Calculate gesture keyframes (waving, nodding, shaking, tilting)
  const gestureAnimation = MascotGestureController.getGestureAnimation(
    state.activeGesture,
    state.targetBearing,
  );

  return (
    <motion.div
      ref={mascotRef}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      initial={{ x: state.coordinates.x, y: state.coordinates.y, opacity: 0, scale: 0.8 }}
      animate={{
        x: state.coordinates.x,
        y: state.coordinates.y,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 260,
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (state.mood === "idle") {
          triggerGesture("bounce");
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed top-0 left-0 z-[9999] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Speech / Thought Bubble (Top or bottom depending on coordinates) */}
      <SpeechBubble
        text={state.speechText}
        isThinking={state.isThinking}
        actions={state.speechActions}
        onDismiss={dismissSpeech}
        position={state.coordinates.y < 160 ? "bottom" : "top"}
      />

      {/* Hover Control Badges (Dock & Dismiss) - matching Screenshot 3 */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-3 -right-2 z-20 flex items-center gap-1 bg-slate-900/90 text-white rounded-full p-1 shadow-md border border-slate-700/50 backdrop-blur-sm"
        >
          {state.placement !== "docked" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                dock();
              }}
              title="Dock mascot"
              aria-label="Dock mascot"
              className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility();
            }}
            title="Hide assistant"
            aria-label="Hide assistant"
            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Ambient Float Sine-Wave Bobbing + Gestures */}
      <motion.div
        animate={{
          y: state.isSleeping ? [0, 2, 0] : (gestureAnimation.y ?? [0, -6, 0]),
          x: gestureAnimation.x ?? 0,
          rotate: gestureAnimation.rotate ?? 0,
          scale: gestureAnimation.scale ?? 1,
        }}
        transition={{
          duration: gestureAnimation.transition?.duration ?? (state.isSleeping ? 4.5 : 2.8),
          repeat: gestureAnimation.transition ? 0 : Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <AvatarRenderer
          characterId={state.characterId}
          sequence={state.sequence}
          expression={state.expression}
          mood={state.mood}
          size={size}
          isSleeping={state.isSleeping}
        />
      </motion.div>
    </motion.div>
  );
}
