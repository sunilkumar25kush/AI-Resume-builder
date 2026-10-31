import { Component, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Avatar as CoreAvatar, type AvatarController, type AvatarRuntimeError } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import type { AvatarDefinition } from "@bible-strong/avatar-core";

interface Props {
  definition: AvatarDefinition;
  animation?: string;
  expression?: string;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  autoplay?: boolean;
}

interface State {
  hasError: boolean;
}

class AvatarErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    console.warn("AvatarView caught an error:", error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-xl font-bold">AI</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AvatarView({
  definition,
  animation,
  expression,
  size = 120,
  className,
  style,
  ariaLabel = "Avatar Assistant",
  autoplay = true,
}: Props) {
  const controllerRef = useRef<AvatarController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Pause avatar when scrolled out of view or tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        controllerRef.current?.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? true);
        if (!entry?.isIntersecting) {
          controllerRef.current?.pause();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  const handleError = (error: AvatarRuntimeError) => {
    console.debug("Avatar runtime warning:", error);
  };

  return (
    <AvatarErrorBoundary>
      <div
        ref={containerRef}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: typeof size === "number" ? `${size}px` : size,
          height: typeof size === "number" ? `${size}px` : size,
          ...style,
        }}
      >
        {isVisible && (
          <CoreAvatar
            ref={controllerRef}
            definition={definition}
            animation={animation}
            expression={expression}
            size="100%"
            autoplay={autoplay}
            ariaLabel={ariaLabel}
            onError={handleError}
          />
        )}
      </div>
    </AvatarErrorBoundary>
  );
}

