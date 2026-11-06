import React, { useEffect, useRef, useState } from "react";

export interface HalftoneRevealProps {
  src: string;
  mode?: "mono" | "color";
  shape?: "dot" | "circle" | "square";
  cellSize?: number;
  angle?: number;
  inkColor?: string;
  paperColor?: string;
  revealRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HalftoneReveal: Renders an image with high-aesthetic newspaper/editorial halftone raster dots.
 * Interactive cursor reveals the photographic image with a smooth radial lens.
 */
export default function HalftoneReveal({
  src,
  mode = "mono",
  shape = "dot",
  cellSize = 6,
  angle = 45,
  inkColor = "#f4f1ea",
  paperColor = "#120f17",
  revealRadius = 160,
  className = "",
  style = {},
}: HalftoneRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; currentX: number; currentY: number }>({
    x: 0,
    y: 0,
    active: false,
    currentX: 0,
    currentY: 0,
  });

  // Preload and cache source image
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback placeholder if image fails to load
      imgRef.current = null;
      setImageLoaded(false);
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    // Offscreen buffer for pixel luminance extraction
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

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

      offscreen.width = width;
      offscreen.height = height;

      // Initialize cursor to center if not interacted yet
      if (!mouseRef.current.active) {
        mouseRef.current.currentX = width * 0.5;
        mouseRef.current.currentY = height * 0.5;
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

      // Smooth cursor lerping
      if (mouseRef.current.active) {
        mouseRef.current.currentX += (mouseRef.current.x - mouseRef.current.currentX) * 0.12;
        mouseRef.current.currentY += (mouseRef.current.y - mouseRef.current.currentY) * 0.12;
      } else {
        // Idle gentle float movement
        const idleX = width * 0.5 + Math.sin(step * 0.02) * (width * 0.2);
        const idleY = height * 0.5 + Math.cos(step * 0.025) * (height * 0.2);
        mouseRef.current.currentX += (idleX - mouseRef.current.currentX) * 0.05;
        mouseRef.current.currentY += (idleY - mouseRef.current.currentY) * 0.05;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw paper background
      ctx.fillStyle = paperColor;
      ctx.fillRect(0, 0, width, height);

      const img = imgRef.current;
      if (img && img.complete && img.naturalWidth > 0 && offCtx) {
        // Draw image cover-fit onto offscreen canvas
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;
        let sWidth = width;
        let sHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
          sHeight = width / imgRatio;
          offsetY = (height - sHeight) / 2;
        } else {
          sWidth = height * imgRatio;
          offsetX = (width - sWidth) / 2;
        }

        offCtx.clearRect(0, 0, width, height);
        offCtx.drawImage(img, offsetX, offsetY, sWidth, sHeight);

        // Get image pixel buffer
        let imgData: ImageData | null = null;
        try {
          imgData = offCtx.getImageData(0, 0, width, height);
        } catch {
          // If tainted by CORS, skip canvas read
          imgData = null;
        }

        const data = imgData ? imgData.data : null;
        const cell = Math.max(cellSize, 4);

        ctx.fillStyle = inkColor;

        if (data) {
          for (let y = 0; y < height; y += cell) {
            for (let x = 0; x < width; x += cell) {
              const idx = (y * width + x) * 4;
              const r = data[idx] || 0;
              const g = data[idx + 1] || 0;
              const b = data[idx + 2] || 0;

              // Perceived luminance
              const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              const dotRadius = (lum * cell * 0.58);

              if (dotRadius > 0.5) {
                if (mode === "color") {
                  ctx.fillStyle = `rgb(${r},${g},${b})`;
                }
                ctx.beginPath();
                if (shape === "square") {
                  ctx.rect(x - dotRadius, y - dotRadius, dotRadius * 2, dotRadius * 2);
                } else {
                  ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                }
                ctx.fill();
              }
            }
          }
        }

        // Draw the interactive full-color reveal lens around cursor
        const cx = mouseRef.current.currentX;
        const cy = mouseRef.current.currentY;
        const radius = revealRadius;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        // Draw original real image in reveal zone
        ctx.drawImage(img, offsetX, offsetY, sWidth, sHeight);

        // Feathered edge vignette for organic reveal
        const vignette = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius);
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, paperColor);
        ctx.fillStyle = vignette;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

        // Thin elegant accent ring around reveal lens
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      } else {
        // Fallback procedural dot matrix if no image
        const cell = Math.max(cellSize, 6);
        ctx.fillStyle = inkColor;
        for (let y = 0; y < height; y += cell) {
          for (let x = 0; x < width; x += cell) {
            const dist = Math.hypot(x - mouseRef.current.currentX, y - mouseRef.current.currentY);
            const r = Math.max(1, (cell * 0.4) * (1 - Math.min(dist / 300, 1)));
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
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

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [imageLoaded, shape, cellSize, angle, inkColor, paperColor, revealRadius, mode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: paperColor,
        ...style,
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
}
