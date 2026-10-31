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
  bubblePlacement?: "top" | "bottom";
  bubbleAlign?: "left" | "right" | "center";
  isModalYielding?: boolean;
}

export interface MascotTargetOptions {
  placement?: MascotPlacement;
  offsetX?: number;
  offsetY?: number;
  priority?: "low" | "medium" | "high"; // High priority overrides section tracking
  deadbandThreshold?: number; // Minimum movement delta (default 16px) to avoid scroll micro-jitter
}

export class MascotPositionEngine {
  private mascotWidth: number;
  private mascotHeight: number;
  private padding: number;
  private topbarClearance: number;
  private lastX: number;
  private lastY: number;
  private lastTarget: HTMLElement | null = null;
  private lastCoordinates: MascotCoordinates | null = null;

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

  /**
   * Check if a modal or dialog overlay is currently open in the DOM
   */
  public isModalOpen(): boolean {
    if (typeof document === "undefined") return false;
    const dialog = document.querySelector(
      '[role="dialog"][data-state="open"], [data-radix-portal] [role="dialog"], .modal-content, [data-mascot-modal="true"]',
    );
    return Boolean(dialog);
  }

  public getDockedCoordinates(): MascotCoordinates {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    const isMobile = vw < 640;
    const isTablet = vw < 1024;

    const rightMargin = isMobile ? 16 : isTablet ? 20 : 28;
    const bottomMargin = isTablet ? 88 : 28; // Clear mobile bottom navigation bar

    const x = Math.max(this.padding, vw - this.mascotWidth - rightMargin);
    const y = Math.max(this.topbarClearance, vh - this.mascotHeight - bottomMargin);

    const flightDeltaX = x - this.lastX;
    const flightDeltaY = y - this.lastY;
    this.lastX = x;
    this.lastY = y;
    this.lastTarget = null;

    const coords: MascotCoordinates = {
      x,
      y,
      placement: "docked",
      targetBearing: "center",
      flightDeltaX,
      flightDeltaY,
      bubblePlacement: "top",
      bubbleAlign: "right",
      isModalYielding: this.isModalOpen(),
    };

    this.lastCoordinates = coords;
    return coords;
  }

  /**
   * Check if candidate position collides with interactive buttons or form inputs
   */
  private checkInteractiveCollision(
    candX: number,
    candY: number,
    targetEl: HTMLElement | null,
  ): boolean {
    if (!targetEl || typeof document === "undefined") return false;

    const interactives = targetEl.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input, select, textarea, a[href], [role="button"]',
    );

    const candRight = candX + this.mascotWidth;
    const candBottom = candY + this.mascotHeight;

    for (let i = 0; i < interactives.length; i++) {
      const rect = interactives[i].getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      // Check overlap
      const hasOverlap = !(
        candRight < rect.left ||
        candX > rect.right ||
        candBottom < rect.top ||
        candY > rect.bottom
      );

      if (hasOverlap) return true;
    }

    return false;
  }

  public calculateTargetCoordinates(
    target: HTMLElement | DOMRect | null,
    options: MascotTargetOptions = {},
  ): MascotCoordinates {
    const isModalActive = this.isModalOpen();

    if (!target) {
      const docked = this.getDockedCoordinates();
      return { ...docked, isModalYielding: isModalActive };
    }

    const targetEl = target instanceof HTMLElement ? target : null;
    const rect: DOMRect =
      target instanceof HTMLElement ? target.getBoundingClientRect() : target;

    // If target has zero dimensions or is completely offscreen
    if (rect.width === 0 && rect.height === 0) {
      const docked = this.getDockedCoordinates();
      return { ...docked, isModalYielding: isModalActive };
    }

    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const isMobile = vw < 640;
    const isTablet = vw < 1024;
    const bottomNavClearance = isTablet ? 88 : this.padding + 8;

    // On mobile devices, dock to the safe corner to avoid occluding touch targets
    if (isMobile) {
      const docked = this.getDockedCoordinates();
      return { ...docked, isModalYielding: isModalActive };
    }

    const {
      placement = "top-right",
      offsetX = 0,
      offsetY = 0,
      deadbandThreshold = 16,
    } = options;

    let targetX = 0;
    let targetY = 0;
    let activePlacement = placement;
    let bearing: MascotCoordinates["targetBearing"] = "center";

    const spacing = 20;
    const spaceRight = vw - rect.right - this.mascotWidth - this.padding;
    const spaceLeft = rect.left - this.mascotWidth - this.padding;

    switch (placement) {
      case "top-right":
        // Reference screenshots: sits at the top-right shoulder of active card or section
        if (spaceRight >= 12) {
          targetX = rect.right + 14 + offsetX;
          targetY = rect.top + offsetY;
          bearing = "left";
        } else {
          // Card occupies full column: float atop the right border/shoulder
          targetX = rect.right - this.mascotWidth - 8 + offsetX;
          targetY = rect.top - (this.mascotHeight * 0.45) + offsetY;
          bearing = "below";
        }
        break;

      case "right":
        if (spaceRight >= 12) {
          targetX = rect.right + spacing + offsetX;
          targetY = rect.top + (rect.height * 0.25) - (this.mascotHeight / 2) + offsetY;
          bearing = "left";
        } else if (spaceLeft >= 12) {
          targetX = rect.left - this.mascotWidth - spacing - offsetX;
          targetY = rect.top + (rect.height * 0.25) - (this.mascotHeight / 2) + offsetY;
          activePlacement = "left";
          bearing = "right";
        } else {
          targetX = rect.right - this.mascotWidth - 8 + offsetX;
          targetY = rect.top - (this.mascotHeight * 0.45) + offsetY;
          bearing = "below";
        }
        break;

      case "left":
        if (spaceLeft >= 12) {
          targetX = rect.left - this.mascotWidth - spacing - offsetX;
          targetY = rect.top + (rect.height * 0.25) - (this.mascotHeight / 2) + offsetY;
          bearing = "right";
        } else if (spaceRight >= 12) {
          targetX = rect.right + spacing + offsetX;
          targetY = rect.top + (rect.height * 0.25) - (this.mascotHeight / 2) + offsetY;
          activePlacement = "right";
          bearing = "left";
        } else {
          targetX = rect.left + 8 + offsetX;
          targetY = rect.top - (this.mascotHeight * 0.45) + offsetY;
          bearing = "below";
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
        if (targetY + this.mascotHeight > vh - bottomNavClearance) {
          targetY = rect.top - this.mascotHeight - spacing - offsetY;
          activePlacement = "top";
          bearing = "below";
        }
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

    // Collision Avoidance: If position overlaps an active interactive button/input, nudge up
    if (this.checkInteractiveCollision(targetX, targetY, targetEl)) {
      targetY -= 36;
    }

    // Viewport Boundary Constraints & Safe Margins
    const clampedX = Math.min(
      Math.max(this.padding, targetX),
      vw - this.mascotWidth - this.padding,
    );

    // Guaranteed bottom viewport clearance so mascot is NEVER pushed out of sight
    const clampedY = Math.min(
      Math.max(this.topbarClearance, targetY),
      vh - this.mascotHeight - bottomNavClearance,
    );

    // Hysteresis & Deadband: Prevent micro-jitter on subtle scroll changes if target hasn't changed
    const distanceDelta = Math.hypot(clampedX - this.lastX, clampedY - this.lastY);
    if (
      this.lastCoordinates &&
      this.lastTarget === targetEl &&
      distanceDelta < deadbandThreshold
    ) {
      return {
        ...this.lastCoordinates,
        isModalYielding: isModalActive,
      };
    }

    const flightDeltaX = clampedX - this.lastX;
    const flightDeltaY = clampedY - this.lastY;
    this.lastX = clampedX;
    this.lastY = clampedY;
    this.lastTarget = targetEl;

    // Calculate optimal Speech Bubble Placement & Alignment to prevent viewport clipping
    const bubblePlacement: "top" | "bottom" = clampedY < 190 ? "bottom" : "top";
    let bubbleAlign: "left" | "right" | "center" = "center";
    if (clampedX + 240 > vw) {
      bubbleAlign = "right";
    } else if (clampedX - 120 < 0) {
      bubbleAlign = "left";
    }

    const coords: MascotCoordinates = {
      x: clampedX,
      y: clampedY,
      placement: activePlacement,
      targetBearing: bearing,
      flightDeltaX,
      flightDeltaY,
      bubblePlacement,
      bubbleAlign,
      isModalYielding: isModalActive,
    };

    this.lastCoordinates = coords;
    return coords;
  }
}
