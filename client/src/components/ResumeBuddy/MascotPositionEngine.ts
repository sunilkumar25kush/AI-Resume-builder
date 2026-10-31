export type MascotPlacement =
  | "right"
  | "left"
  | "top"
  | "bottom"
  | "top-right"
  | "bottom-right"
  | "docked";

export interface MascotCoordinates {
  x: number;
  y: number;
  placement: MascotPlacement;
  targetBearing: "left" | "right" | "above" | "below" | "center";
}

export interface MascotTargetOptions {
  placement?: MascotPlacement;
  offsetX?: number;
  offsetY?: number;
}

export class MascotPositionEngine {
  private mascotWidth: number;
  private mascotHeight: number;
  private padding: number;
  private topbarClearance: number;

  constructor(
    mascotWidth = 96,
    mascotHeight = 96,
    padding = 16,
    topbarClearance = 72,
  ) {
    this.mascotWidth = mascotWidth;
    this.mascotHeight = mascotHeight;
    this.padding = padding;
    this.topbarClearance = topbarClearance;
  }

  public setDimensions(width: number, height: number) {
    this.mascotWidth = width;
    this.mascotHeight = height;
  }

  public getDockedCoordinates(): MascotCoordinates {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    const x = Math.max(
      this.padding,
      vw - this.mascotWidth - (vw < 640 ? 16 : 28),
    );
    // On small screens, clear bottom nav bar (around 80px)
    const bottomNavHeight = vw < 1024 ? 80 : 28;
    const y = Math.max(
      this.topbarClearance,
      vh - this.mascotHeight - bottomNavHeight,
    );

    return {
      x,
      y,
      placement: "docked",
      targetBearing: "center",
    };
  }

  public calculateTargetCoordinates(
    target: HTMLElement | DOMRect | null,
    options: MascotTargetOptions = {},
  ): MascotCoordinates {
    if (!target) {
      return this.getDockedCoordinates();
    }

    const rect: DOMRect =
      target instanceof HTMLElement ? target.getBoundingClientRect() : target;

    // If target has zero dimensions or is completely offscreen
    if (rect.width === 0 && rect.height === 0) {
      return this.getDockedCoordinates();
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const {
      placement = "right",
      offsetX = 0,
      offsetY = 0,
    } = options;

    let targetX = 0;
    let targetY = 0;
    let activePlacement = placement;
    let bearing: MascotCoordinates["targetBearing"] = "center";

    const spacing = 18;

    // Calculate initial ideal position
    switch (placement) {
      case "right":
        targetX = rect.right + spacing + offsetX;
        targetY = rect.top + (rect.height / 2) - (this.mascotHeight / 2) + offsetY;
        bearing = "left"; // target is to the left of mascot
        // Viewport overflow check: flip to left if overflowing right edge
        if (targetX + this.mascotWidth > vw - this.padding) {
          targetX = rect.left - this.mascotWidth - spacing - offsetX;
          activePlacement = "left";
          bearing = "right";
        }
        break;

      case "left":
        targetX = rect.left - this.mascotWidth - spacing - offsetX;
        targetY = rect.top + (rect.height / 2) - (this.mascotHeight / 2) + offsetY;
        bearing = "right"; // target is to the right of mascot
        // Viewport underflow check: flip to right if overflowing left edge
        if (targetX < this.padding) {
          targetX = rect.right + spacing + offsetX;
          activePlacement = "right";
          bearing = "left";
        }
        break;

      case "top":
        targetX = rect.left + (rect.width / 2) - (this.mascotWidth / 2) + offsetX;
        targetY = rect.top - this.mascotHeight - spacing - offsetY;
        bearing = "below";
        if (targetY < this.topbarClearance) {
          targetY = rect.bottom + spacing + offsetY;
          activePlacement = "bottom";
          bearing = "above";
        }
        break;

      case "bottom":
        targetX = rect.left + (rect.width / 2) - (this.mascotWidth / 2) + offsetX;
        targetY = rect.bottom + spacing + offsetY;
        bearing = "above";
        if (targetY + this.mascotHeight > vh - this.padding) {
          targetY = rect.top - this.mascotHeight - spacing - offsetY;
          activePlacement = "top";
          bearing = "below";
        }
        break;

      case "top-right":
        // Sits hovering slightly on top of the card / metric header
        targetX = rect.right - (this.mascotWidth * 0.75) + offsetX;
        targetY = rect.top - (this.mascotHeight * 0.55) + offsetY;
        bearing = "below";
        break;

      case "bottom-right":
        targetX = rect.right + spacing + offsetX;
        targetY = rect.bottom - this.mascotHeight + offsetY;
        bearing = "left";
        break;

      case "docked":
      default:
        return this.getDockedCoordinates();
    }

    // Clamp inside viewport
    const clampedX = Math.min(
      Math.max(this.padding, targetX),
      vw - this.mascotWidth - this.padding,
    );
    const clampedY = Math.min(
      Math.max(this.topbarClearance, targetY),
      vh - this.mascotHeight - this.padding,
    );

    return {
      x: clampedX,
      y: clampedY,
      placement: activePlacement,
      targetBearing: bearing,
    };
  }
}

