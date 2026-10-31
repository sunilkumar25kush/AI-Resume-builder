import type { MascotHandGesture } from "@/config/mascotBehaviors";

export type MascotGestureType = MascotHandGesture;

export interface HandKeyframes {
  x?: number | number[];
  y?: number | number[];
  rotate?: number | number[];
  scale?: number | number[];
  opacity?: number;
}

export interface MascotGestureAnimation {
  body: {
    x?: number[];
    y?: number[];
    rotate?: number[];
    scale?: number[];
  };
  leftHand: HandKeyframes;
  rightHand: HandKeyframes;
  pointerCue?: "left" | "right" | "down" | null;
  transition: {
    duration: number;
    repeat?: number;
    ease?: string | number[];
  };
}

export class MascotGestureController {
  public static getGestureAnimation(
    gesture: MascotHandGesture,
    bearing?: "left" | "right" | "above" | "below" | "center",
  ): MascotGestureAnimation {
    switch (gesture) {
      case "waveHello":
      case "wave":
        return {
          body: {
            rotate: [0, 8, -6, 8, -4, 0],
            y: [0, -5, 0, -3, 0],
          },
          leftHand: {
            rotate: -12,
            y: 0,
          },
          rightHand: {
            y: [-12, -22, -14, -22, -14, 0],
            rotate: [12, -35, 20, -35, 15, 12],
          },
          transition: {
            duration: 1.2,
            ease: "easeInOut",
          },
        };

      case "waveGoodbye":
        return {
          body: {
            rotate: [0, -6, 6, -6, 0],
            y: [0, 4, 0],
          },
          leftHand: {
            rotate: -12,
          },
          rightHand: {
            y: [-8, -18, -10, -18, 0],
            rotate: [12, 30, -15, 30, 12],
          },
          transition: {
            duration: 1.4,
            ease: "easeInOut",
          },
        };

      case "pointLeft":
        return {
          body: {
            x: [-6],
            rotate: [-8],
          },
          leftHand: {
            x: -16,
            y: -4,
            rotate: -45,
            scale: 1.25,
          },
          rightHand: {
            rotate: 10,
          },
          pointerCue: "left",
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        };

      case "pointRight":
        return {
          body: {
            x: [6],
            rotate: [8],
          },
          leftHand: {
            rotate: -10,
          },
          rightHand: {
            x: 16,
            y: -4,
            rotate: 45,
            scale: 1.25,
          },
          pointerCue: "right",
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        };

      case "pointDown":
        return {
          body: {
            y: [8],
            rotate: [0],
          },
          leftHand: {
            y: 12,
            rotate: 50,
            scale: 1.15,
          },
          rightHand: {
            y: 12,
            rotate: -50,
            scale: 1.15,
          },
          pointerCue: "down",
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        };

      case "pointAtInput":
        if (bearing === "left") {
          return {
            body: { x: [-8], rotate: [-10] },
            leftHand: { x: -18, y: 0, rotate: -40, scale: 1.3 },
            rightHand: { rotate: 8 },
            pointerCue: "left",
            transition: { duration: 0.5, ease: "easeOut" },
          };
        }
        if (bearing === "right") {
          return {
            body: { x: [8], rotate: [10] },
            leftHand: { rotate: -8 },
            rightHand: { x: 18, y: 0, rotate: 40, scale: 1.3 },
            pointerCue: "right",
            transition: { duration: 0.5, ease: "easeOut" },
          };
        }
        return {
          body: { y: [10], rotate: [0] },
          leftHand: { y: 14, rotate: 55, scale: 1.2 },
          rightHand: { y: 14, rotate: -55, scale: 1.2 },
          pointerCue: "down",
          transition: { duration: 0.5, ease: "easeOut" },
        };

      case "thumbsUp":
        return {
          body: {
            y: [0, -6, 0],
            scale: [1, 1.05, 1],
          },
          leftHand: {
            rotate: -12,
          },
          rightHand: {
            y: -16,
            x: 6,
            rotate: -20,
            scale: 1.3,
          },
          transition: {
            duration: 0.75,
            ease: "backOut",
          },
        };

      case "handsExplaining":
        return {
          body: {
            y: [0, -4, 0, -4, 0],
            rotate: [0, 4, -4, 4, 0],
          },
          leftHand: {
            y: [0, -10, 0, -8, 0],
            rotate: [-12, -30, -12, -26, -12],
          },
          rightHand: {
            y: [0, -8, 0, -10, 0],
            rotate: [12, 26, 12, 30, 12],
          },
          transition: {
            duration: 1.4,
            ease: "easeInOut",
          },
        };

      case "handOnChin":
        return {
          body: {
            rotate: [6],
            y: [2],
          },
          leftHand: {
            y: 0,
            rotate: -12,
          },
          rightHand: {
            y: -14,
            x: -10,
            rotate: -45,
            scale: 1.1,
          },
          transition: {
            duration: 0.7,
            ease: "easeInOut",
          },
        };

      case "clap":
        return {
          body: {
            y: [0, -12, 0, -8, 0],
            scale: [1, 1.06, 1, 1.04, 1],
          },
          leftHand: {
            x: [0, 12, 0, 12, 0],
            rotate: [-12, 30, -12, 30, -12],
          },
          rightHand: {
            x: [0, -12, 0, -12, 0],
            rotate: [12, -30, 12, -30, 12],
          },
          transition: {
            duration: 0.9,
            ease: "easeInOut",
          },
        };

      case "raiseHands":
        return {
          body: {
            y: [0, -18, -4, -14, 0],
            scale: [1, 1.1, 1, 1.06, 1],
          },
          leftHand: {
            y: [-24],
            rotate: [-65],
            scale: 1.2,
          },
          rightHand: {
            y: [-24],
            rotate: [65],
            scale: 1.2,
          },
          transition: {
            duration: 1.1,
            ease: "easeOut",
          },
        };

      case "shrug":
        return {
          body: {
            y: [-4, 0],
            rotate: [6, 0],
          },
          leftHand: {
            y: -12,
            rotate: -35,
          },
          rightHand: {
            y: -12,
            rotate: 35,
          },
          transition: {
            duration: 0.85,
            ease: "easeInOut",
          },
        };

      case "attentionGesture":
        return {
          body: {
            scale: [1, 1.08, 1],
            y: [0, -8, 0],
          },
          leftHand: {
            rotate: [-12, -30, -12],
          },
          rightHand: {
            y: [-12, -20, -12],
            rotate: [12, 40, 12],
          },
          transition: {
            duration: 0.8,
            ease: "easeInOut",
          },
        };

      case "bounce":
        return {
          body: {
            y: [0, -16, 0, -10, 0],
            scale: [1, 1.08, 0.96, 1.04, 1],
          },
          leftHand: { y: [0, -6, 0] },
          rightHand: { y: [0, -6, 0] },
          transition: {
            duration: 0.85,
            ease: "easeOut",
          },
        };

      case "nod":
        return {
          body: {
            y: [0, -10, 0, -6, 0],
            scale: [1, 1.04, 1, 1.02, 1],
          },
          leftHand: { rotate: -12 },
          rightHand: { rotate: 12 },
          transition: { duration: 0.7, ease: "easeInOut" },
        };

      case "shake":
        return {
          body: {
            x: [0, -10, 10, -8, 8, -4, 0],
            rotate: [0, -6, 6, -4, 4, 0],
          },
          leftHand: { rotate: [-12, -22, -4, -18, -12] },
          rightHand: { rotate: [12, 4, 22, 6, 12] },
          transition: { duration: 0.75, ease: "easeInOut" },
        };

      case "tiltTowardTarget":
        if (bearing === "left") {
          return {
            body: { rotate: [-8], x: [-5] },
            leftHand: { rotate: -25 },
            rightHand: { rotate: 8 },
            transition: { duration: 0.4 },
          };
        }
        if (bearing === "right") {
          return {
            body: { rotate: [8], x: [5] },
            leftHand: { rotate: -8 },
            rightHand: { rotate: 25 },
            transition: { duration: 0.4 },
          };
        }
        return {
          body: { rotate: [0], x: [0] },
          leftHand: { rotate: -12 },
          rightHand: { rotate: 12 },
          transition: { duration: 0.3 },
        };

      case "none":
      default:
        return {
          body: { rotate: [0], x: [0], y: [0] },
          leftHand: { rotate: -12, x: 0, y: 0, scale: 1 },
          rightHand: { rotate: 12, x: 0, y: 0, scale: 1 },
          transition: { duration: 0.3 },
        };
    }
  }

  public static calculateCursorGaze(
    mascotCenter: { x: number; y: number },
    cursor: { x: number; y: number },
    maxAngle = 10,
  ) {
    const dx = cursor.x - mascotCenter.x;
    const dy = cursor.y - mascotCenter.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) return { rotateX: 0, rotateY: 0 };

    const angleX = Math.max(-maxAngle, Math.min(maxAngle, (dy / 350) * maxAngle));
    const angleY = Math.max(-maxAngle, Math.min(maxAngle, (dx / 350) * maxAngle));

    return {
      rotateX: -angleX,
      rotateY: angleY,
    };
  }
}
