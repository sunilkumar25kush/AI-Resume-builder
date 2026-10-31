export type MascotGestureType =
  | "none"
  | "wave"
  | "nod"
  | "shake"
  | "bounce"
  | "tiltTowardTarget";

export interface GestureKeyframes {
  x?: number[];
  y?: number[];
  rotate?: number[];
  scale?: number[];
  transition?: {
    duration: number;
    repeat?: number;
    ease?: string | number[];
  };
}

export class MascotGestureController {
  public static getGestureAnimation(
    gesture: MascotGestureType,
    bearing?: "left" | "right" | "above" | "below" | "center",
  ): GestureKeyframes {
    switch (gesture) {
      case "wave":
        return {
          rotate: [0, 15, -12, 14, -8, 5, 0],
          y: [0, -6, 0, -4, 0],
          transition: {
            duration: 1.1,
            ease: "easeInOut",
          },
        };

      case "nod":
        return {
          y: [0, -10, 0, -6, 0],
          scale: [1, 1.05, 1, 1.03, 1],
          transition: {
            duration: 0.8,
            ease: "easeInOut",
          },
        };

      case "shake":
        return {
          x: [0, -10, 10, -8, 8, -4, 0],
          rotate: [0, -6, 6, -4, 4, 0],
          transition: {
            duration: 0.75,
            ease: "easeInOut",
          },
        };

      case "bounce":
        return {
          y: [0, -16, 0, -10, 0],
          scale: [1, 1.08, 0.96, 1.04, 1],
          transition: {
            duration: 0.9,
            ease: "easeOut",
          },
        };

      case "tiltTowardTarget":
        if (bearing === "left") {
          return {
            rotate: [-7],
            x: [-4],
            transition: { duration: 0.4 },
          };
        }
        if (bearing === "right") {
          return {
            rotate: [7],
            x: [4],
            transition: { duration: 0.4 },
          };
        }
        if (bearing === "below") {
          return {
            y: [4],
            rotate: [2],
            transition: { duration: 0.4 },
          };
        }
        return {
          rotate: [0],
          x: [0],
          y: [0],
          transition: { duration: 0.4 },
        };

      case "none":
      default:
        return {
          rotate: [0],
          x: [0],
          y: [0],
          transition: { duration: 0.3 },
        };
    }
  }

  /**
   * Calculates 3D tilt coordinates based on mascot position and cursor position
   */
  public static calculateCursorGaze(
    mascotCenter: { x: number; y: number },
    cursor: { x: number; y: number },
    maxAngle = 12,
  ) {
    const dx = cursor.x - mascotCenter.x;
    const dy = cursor.y - mascotCenter.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) return { rotateX: 0, rotateY: 0 };

    const angleX = Math.max(-maxAngle, Math.min(maxAngle, (dy / 400) * maxAngle));
    const angleY = Math.max(-maxAngle, Math.min(maxAngle, (dx / 400) * maxAngle));

    return {
      rotateX: -angleX,
      rotateY: angleY,
    };
  }
}

