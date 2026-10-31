import {
  getPageMascotConfig,
  type PageMascotAnchorConfig,
} from "@/config/mascotPageAnchors";
import type { MascotPositionEngine, MascotTargetOptions } from "./MascotPositionEngine";

export type ScrollPositionCallback = (
  target: HTMLElement | null,
  options?: MascotTargetOptions,
  sectionKey?: string,
) => void;

export type ModalStateCallback = (isOpen: boolean) => void;

/**
 * Centralized, route-aware, scroll-aware position and landmark manager for ResumeBuddy.
 * Handles nested scroll containers, IntersectionObserver section tracking,
 * hysteresis deadbands, orientation changes, and modal lifecycle.
 */
export class MascotScrollManager {
  private positionEngine: MascotPositionEngine;
  private currentPathname = "";
  private currentConfig?: PageMascotAnchorConfig;
  private intersectionObserver: IntersectionObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private onPositionUpdate: ScrollPositionCallback;
  private onModalChange?: ModalStateCallback;
  private currentActiveSection: string | null = null;
  private currentTargetElement: HTMLElement | null = null;
  private rafId: number | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isDestroyed = false;

  constructor(
    positionEngine: MascotPositionEngine,
    onPositionUpdate: ScrollPositionCallback,
    onModalChange?: ModalStateCallback,
  ) {
    this.positionEngine = positionEngine;
    this.onPositionUpdate = onPositionUpdate;
    this.onModalChange = onModalChange;

    this.initGlobalListeners();
  }

  /**
   * Throttled scroll, resize, and orientation handler using requestAnimationFrame
   */
  private handleScrollOrResize = () => {
    if (this.isDestroyed) return;
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (this.currentTargetElement) {
        this.onPositionUpdate(
          this.currentTargetElement,
          { placement: this.currentConfig?.preferredPlacement ?? "top-right" },
          this.currentActiveSection ?? undefined,
        );
      }
    });
  };

  /**
   * Global listeners: window resize, orientationchange, and nested container scroll
   */
  private initGlobalListeners() {
    if (typeof window === "undefined") return;

    // `capture: true` captures scroll events dispatched on nested scroll containers
    window.addEventListener("scroll", this.handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener("resize", this.handleScrollOrResize, { passive: true });
    window.addEventListener("orientationchange", this.handleScrollOrResize, { passive: true });

    // MutationObserver to detect opening/closing of Radix modals / dialogs and dynamic landmarks
    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.isDestroyed) return;

      let dialogFound = false;
      for (const m of mutations) {
        if (m.type === "childList" || m.type === "attributes") {
          if (this.positionEngine.isModalOpen()) {
            dialogFound = true;
            break;
          }
        }
      }

      this.onModalChange?.(dialogFound);
    });

    if (typeof document !== "undefined" && document.body) {
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-state", "class", "role"],
      });
    }
  }

  /**
   * Handle route transition: update page config and refresh landmark observers
   */
  public handleRouteChange(pathname: string) {
    if (this.isDestroyed) return;

    this.currentPathname = pathname;
    this.currentConfig = getPageMascotConfig(pathname);
    this.currentActiveSection = null;
    this.currentTargetElement = null;

    // Small delay to allow DOM nodes of newly routed page to mount
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (this.isDestroyed) return;
      this.setupLandmarkObservers();
    }, 150);
  }

  public getCurrentPathname(): string {
    return this.currentPathname;
  }

  /**
   * Build IntersectionObserver for active section landmarks
   */
  public setupLandmarkObservers() {
    if (this.isDestroyed || typeof document === "undefined") return;

    this.intersectionObserver?.disconnect();

    const selectors = this.currentConfig?.sectionSelectors || [
      "[data-mascot-section]",
      "[data-mascot-target]",
      "section",
      "form",
      "main",
    ];

    const elements: HTMLElement[] = [];
    selectors.forEach((sel: string) => {
      try {
        const found = document.querySelectorAll<HTMLElement>(sel);
        found.forEach((el) => {
          if (!elements.includes(el)) elements.push(el);
        });
      } catch {
        // Safe query selector
      }
    });

    if (elements.length === 0) {
      this.onPositionUpdate(null, { placement: "docked" });
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (this.isDestroyed) return;

        let bestEntry: IntersectionObserverEntry | null = null;
        let highestScore = -Infinity;

        const viewportCenter = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const rect = entry.boundingClientRect;
          const elementCenter = rect.top + rect.height / 2;
          const distToCenter = Math.abs(viewportCenter - elementCenter);
          const distanceScore = Math.max(0, 1 - distToCenter / (viewportCenter * 1.5));

          const score = entry.intersectionRatio * 0.4 + distanceScore * 0.6;
          if (score > highestScore) {
            highestScore = score;
            bestEntry = entry;
          }
        }

        if (bestEntry) {
          const targetEl = bestEntry.target as HTMLElement;
          const sectionKey =
            targetEl.getAttribute("data-mascot-section") ||
            targetEl.getAttribute("data-mascot-target") ||
            targetEl.id ||
            targetEl.tagName.toLowerCase();

          this.currentActiveSection = sectionKey;
          this.currentTargetElement = targetEl;

          this.onPositionUpdate(
            targetEl,
            { placement: this.currentConfig?.preferredPlacement ?? "top-right" },
            sectionKey,
          );
        }
      },
      {
        rootMargin: "-60px 0px -90px 0px",
        threshold: [0.2, 0.5, 0.8],
      },
    );

    elements.forEach((el) => this.intersectionObserver?.observe(el));

    // If we have a default initial selector for this page, snap to it immediately
    if (!this.currentTargetElement && this.currentConfig?.defaultSelector) {
      const defaultEl = document.querySelector<HTMLElement>(this.currentConfig.defaultSelector);
      if (defaultEl) {
        this.currentTargetElement = defaultEl;
        this.onPositionUpdate(defaultEl, {
          placement: this.currentConfig.preferredPlacement,
        });
      }
    }
  }

  public getCurrentConfig(): PageMascotAnchorConfig | undefined {
    return this.currentConfig;
  }

  public getActiveSection(): string | null {
    return this.currentActiveSection;
  }

  /**
   * Cleanup all observers, listeners, and timers to prevent memory leaks
   */
  public destroy() {
    this.isDestroyed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.handleScrollOrResize, true);
      window.removeEventListener("resize", this.handleScrollOrResize);
      window.removeEventListener("orientationchange", this.handleScrollOrResize);
    }

    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }
}
