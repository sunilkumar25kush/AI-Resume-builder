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
 * hysteresis deadbands, and modal lifecycle.
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
   * Global listeners: window resize and nested container scroll (captured at window)
   */
  private initGlobalListeners() {
    if (typeof window === "undefined") return;

    const handleScrollOrResize = () => {
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

    // Note: `capture: true` captures scroll events dispatched on nested scroll containers (.overflow-y-auto, etc.)
    window.addEventListener("scroll", handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

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

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state", "class", "role"],
    });
  }

  /**
   * Handle route transition: update page config and refresh landmark observers
   */
  public handleRouteChange(pathname: string) {
    if (this.isDestroyed || this.currentPathname === pathname) return;

    this.currentPathname = pathname;
    this.currentConfig = getPageMascotConfig(pathname);
    this.currentActiveSection = null;
    this.currentTargetElement = null;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    // Initial scan with quick delays to allow React DOM mounting
    this.scheduleLandmarkScan(60);
    this.scheduleLandmarkScan(300);
  }

  private scheduleLandmarkScan(delayMs: number) {
    setTimeout(() => {
      if (this.isDestroyed) return;
      this.refreshLandmarks();
    }, delayMs);
  }

  /**
   * Re-queries all section landmarks on the page and observes them with IntersectionObserver
   */
  public refreshLandmarks() {
    if (typeof document === "undefined" || this.isDestroyed) return;

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // Build landmark query list from route config + generic standard attributes
    const selectors = new Set<string>([
      "[data-mascot-section]",
      "[data-mascot-target]",
      ".editor-form-card",
      "main > section",
      "form",
    ]);

    if (this.currentConfig) {
      this.currentConfig.sectionSelectors.forEach((sel) => selectors.add(sel));
      if (this.currentConfig.defaultSelector) {
        selectors.add(this.currentConfig.defaultSelector);
      }
    }

    const queryStr = Array.from(selectors).join(", ");
    const elements = Array.from(document.querySelectorAll<HTMLElement>(queryStr)).filter(
      (el) => el.offsetParent !== null, // Only visible elements
    );

    if (elements.length === 0) {
      // If no landmarks on page, dock safely
      this.onPositionUpdate(null);
      return;
    }

    // Set up IntersectionObserver with viewport threshold
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (this.isDestroyed) return;

        // Find the most visible/relevant section closest to viewport center
        let bestEntry: IntersectionObserverEntry | null = null;
        let highestScore = -1;

        const vh = window.innerHeight;
        const viewportCenter = vh / 2;

        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.15) continue;

          const rect = entry.boundingClientRect;
          const elementCenter = rect.top + rect.height / 2;
          const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
          const distanceScore = Math.max(0, 1 - distanceFromCenter / vh);

          // Weight intersection ratio and screen focus
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
   * Cleanup all observers, listeners, and timers
   */
  public destroy() {
    this.isDestroyed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }
}
