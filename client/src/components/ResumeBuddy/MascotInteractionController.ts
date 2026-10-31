export interface MascotInteractionState {
  isPanelOpen: boolean;
  isMinimized: boolean;
  isDisabled: boolean;
  isDragging: boolean;
  customDragPosition: { x: number; y: number } | null;
}

export class MascotInteractionController {
  private state: MascotInteractionState;
  private onStateChange?: (state: MascotInteractionState) => void;

  constructor(onStateChange?: (state: MascotInteractionState) => void) {
    const savedDisabled =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("resumebuddy_disabled") === "true"
        : false;

    this.state = {
      isPanelOpen: false,
      isMinimized: false,
      isDisabled: savedDisabled,
      isDragging: false,
      customDragPosition: null,
    };
    this.onStateChange = onStateChange;
  }

  public setListener(onStateChange: (state: MascotInteractionState) => void) {
    this.onStateChange = onStateChange;
  }

  public getState(): MascotInteractionState {
    return this.state;
  }

  public togglePanel(open?: boolean) {
    this.state = {
      ...this.state,
      isPanelOpen: open !== undefined ? open : !this.state.isPanelOpen,
    };
    this.notify();
  }

  public toggleMinimize(minimized?: boolean) {
    this.state = {
      ...this.state,
      isMinimized: minimized !== undefined ? minimized : !this.state.isMinimized,
      isPanelOpen: false,
    };
    this.notify();
  }

  public setDisabled(disabled: boolean) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("resumebuddy_disabled", String(disabled));
    }
    this.state = {
      ...this.state,
      isDisabled: disabled,
      isPanelOpen: false,
    };
    this.notify();
  }

  public setDragging(dragging: boolean) {
    this.state = {
      ...this.state,
      isDragging: dragging,
    };
    this.notify();
  }

  public setCustomDragPosition(pos: { x: number; y: number } | null) {
    this.state = {
      ...this.state,
      customDragPosition: pos,
    };
    this.notify();
  }

  public resetPosition() {
    this.state = {
      ...this.state,
      customDragPosition: null,
    };
    this.notify();
  }

  private notify() {
    this.onStateChange?.(this.state);
  }
}

