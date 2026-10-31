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
  flightDeltaX?: number;
  flightDeltaY?: number;
}

export interface MascotTargetOptions {
  placement?: MascotPlacement;
  offsetX?: number;
  offsetY?: number;
  priority?: "low" | "medium" | "high"; // High priority overrides section tracking
}

export class MascotPositionEngine {
  private mascotWidth: number;
  private mascotHeight: number;
  private padding: number;
  private topbarClearance: number;
  private lastX: number;
  private lastY: number;

  constructor(
    mascotWidth = 96,
    mascotHeight = 96,
    padding = 20,
    topbarClearance = 76,
  ) {
    this.mascotWidth = mascotWidth;
    this.mascotHeight = mascotHeight;
    this.padding = padding;
    this.topbarClearance = topbarClearance;
    this.lastX = typeof window !== "undefined" ? window.innerWidth - 120 : 1000;
    this.lastY = typeof window !== "undefined" ? window.innerHeight - 120 : 600;
  }

  public setDimensions(width: number, height: number) {
    this.mascotWidth = width;
    this.mascotHeight = height;
  }

  public getDockedCoordinates(): MascotCoordinates {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    // Mobile / Tablet responsiveness
    const isMobile = vw < 640;
    const isTablet = vw < 1024;

    const rightMargin = isMobile ? 16 : isTablet ? 20 : 28;
    const bottomMargin = isTablet ? 88 : 28; // Clear bottom nav on mobile/tablet

    const x = Math.max(this.padding, vw - this.mascotWidth - rightMargin);
    const y = Math.max(this.topbarClearance, vh - this.mascotHeight - bottomMargin);

    const flightDeltaX = x - this.lastX;
    const flightDeltaY = y - this.lastY;
    this.lastX = x;
    this.lastY = y;

    return {
      x,
      y,
      placement: "docked",
      targetBearing: "center",
      flightDeltaX,
      flightDeltaY,
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
    const isMobile = vw < 640;

    // On mobile, if element occupies most width, dock to bottom-right or top-right safe zone
    if (isMobile) {
      return this.getDockedCoordinates();
    }

    const {
      placement = "right",
      offsetX = 0,
      offsetY = 0,
    } = options;

    let targetX = 0;
    let targetY = 0;
    let activePlacement = placement;
    let bearing: MascotCoordinates["targetBearing"] = "center";

    const spacing = 22;

    switch (placement) {
      case "right":
        targetX = rect.right + spacing + offsetX;
        targetY = rect.top + (rect.height / 2) - (this.mascotHeight / 2) + offsetY;
        bearing = "left";
        // If overflowing right viewport edge, flip to left
        if (targetX + this.mascotWidth > vw - this.padding) {
          targetX = rect.left - this.mascotWidth - spacing - offsetX;
          activePlacement = "left";
          bearing = "right";
        }
        break;

      case "left":
        targetX = rect.left - this.mascotWidth - spacing - offsetX;
        targetY = rect.top + (rect.height / 2) - (this.mascotHeight / 2) + offsetY;
        bearing = "right";
        // If underflowing left viewport edge, flip to right
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
        // Floating atop the right corner of cards/sections (Ref 5 style)
        targetX = rect.right - (this.mascotWidth * 0.7) + offsetX;
        targetY = rect.top - (this.mascotHeight * 0.6) + offsetY;
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

    // Strict viewport boundaries & safe margins
    const clampedX = Math.min(
      Math.max(this.padding, targetX),
      vw - this.mascotWidth - this.padding,
    );
    const clampedY = Math.min(
      Math.max(this.topbarClearance, targetY),
      vh - this.mascotHeight - (vw < 1024 ? 88 : this.padding),
    );

    const flightDeltaX = clampedX - this.lastX;
    const flightDeltaY = clampedY - this.lastY;
    this.lastX = clampedX;
    this.lastY = clampedY;

    return {
      x: clampedX,
      y: clampedY,
      placement: activePlacement,
      targetBearing: bearing,
      flightDeltaX,
      flightDeltaY,
    };
  }
}
