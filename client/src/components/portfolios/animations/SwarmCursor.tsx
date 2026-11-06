import React, { useEffect, useRef } from "react";

export interface SwarmCursorProps {
  count?: number;
  size?: number;
  spread?: number;
  swirl?: number;
  clickEffect?: "burst" | "pulse";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: number;
  angle: number;
  dist: number;
  speed: number;
}

/**
 * SwarmCursor: Interactive fluid swarm particle canvas that follows and swirls around the cursor.
 * Features customizable spread, swirl vortex forces, and click burst dynamics.
 */
export default function SwarmCursor({
  count = 800,
  size = 2.6,
  spread = 90,
  swirl = 0.6,
  clickEffect = "burst",
  children,
  className = "",
  style = {},
  color = "#ffffff",
}: SwarmCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; isDown: boolean }>({
    x: 0,
    y: 0,
    active: false,
    isDown: false,
  });

  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animId: number;

    const initParticles = (w: number, h: number) => {
      const pts: Particle[] = [];
      const cx = w * 0.5;
      const cy = h * 0.5;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * spread * 2.5;
        pts.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: (Math.random() * 0.8 + 0.4) * size,
          alpha: Math.random() * 0.7 + 0.25,
          hue: Math.random() * 40 - 20, // subtle color variance
          angle,
          dist,
          speed: Math.random() * 0.04 + 0.015,
        });
      }
      particlesRef.current = pts;
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (particlesRef.current.length === 0) {
        initParticles(width, height);
      }
      if (!mouseRef.current.active) {
        mouseRef.current.x = width * 0.5;
        mouseRef.current.y = height * 0.5;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let step = 0;

    const render = () => {
      if (width <= 0 || height <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      step++;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      let targetX = mouseRef.current.x;
      let targetY = mouseRef.current.y;

      if (!mouseRef.current.active) {
        // Ambient figure-eight idle floating
        targetX = width * 0.5 + Math.sin(step * 0.018) * (width * 0.22);
        targetY = height * 0.5 + Math.cos(step * 0.024) * (height * 0.18);
      }

      const pts = particlesRef.current;
      const swirlFactor = swirl * 2.2;
      const targetSpread = mouseRef.current.isDown ? spread * 1.8 : spread;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        // Orbit update
        p.angle += p.speed * swirlFactor;
        const desiredX = targetX + Math.cos(p.angle) * p.dist;
        const desiredY = targetY + Math.sin(p.angle) * (p.dist * 0.7);

        // Attraction force
        const dx = desiredX - p.x;
        const dy = desiredY - p.y;
        p.vx = p.vx * 0.88 + dx * 0.08;
        p.vy = p.vy * 0.88 + dy * 0.08;

        p.x += p.vx;
        p.y += p.vy;

        // Keep dist constrained to spread
        p.dist += (Math.random() * targetSpread - p.dist) * 0.03;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    const onPointerDown = () => {
      mouseRef.current.isDown = true;
      if (clickEffect === "burst") {
        // Scatter particles outward violently
        const pts = particlesRef.current;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const blastAngle = Math.atan2(p.y - mouseRef.current.y, p.x - mouseRef.current.x) + (Math.random() - 0.5) * 0.8;
          const blastSpeed = Math.random() * 18 + 8;
          p.vx = Math.cos(blastAngle) * blastSpeed;
          p.vy = Math.sin(blastAngle) * blastSpeed;
          p.dist = Math.random() * spread * 2.2 + spread * 0.5;
        }
      }
    };

    const onPointerUp = () => {
      mouseRef.current.isDown = false;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
    };
  }, [count, size, spread, swirl, clickEffect, color]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  );
}
