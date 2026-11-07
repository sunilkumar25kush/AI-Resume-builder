import React, { useEffect, useRef, useState, useCallback } from "react";

export interface LanyardProps {
  frontImage?: string;
  backImage?: string;
  strapImage?: string;
  name?: string;
  subtitle?: string;
  primaryColor?: string;
  className?: string;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80";

export default function Lanyard({
  frontImage = "/card-front.png",
  backImage = "/card-back.png",
  strapImage = "/band.png",
  name,
  subtitle,
  primaryColor = "#8B151B",
  className = "",
}: LanyardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const strapLeftPathRef = useRef<SVGPathElement>(null);
  const strapRightPathRef = useRef<SVGPathElement>(null);
  const strapMainPathRef = useRef<SVGPathElement>(null);
  const strapStitchPathRef = useRef<SVGPathElement>(null);
  const clipGroupRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const [frontError, setFrontError] = useState(false);
  const [backError, setBackError] = useState(false);
  const [strapTextureLoaded, setStrapTextureLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Reset image error state when prop URLs change
  useEffect(() => {
    setFrontError(false);
  }, [frontImage]);

  useEffect(() => {
    setBackError(false);
  }, [backImage]);

  // Preload strapImage only if it's a valid reachable asset; otherwise use woven SVG pattern
  useEffect(() => {
    if (!strapImage || strapImage === "/band.png") {
      setStrapTextureLoaded(false);
      return;
    }
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active) setStrapTextureLoaded(true);
    };
    img.onerror = () => {
      if (active) setStrapTextureLoaded(false);
    };
    img.src = strapImage;
    return () => {
      active = false;
    };
  }, [strapImage]);

  // Physics state stored in ref to run smoothly at 60fps without React re-renders
  const physicsRef = useRef({
    // Displacement of card clip point relative to rest position (0, restLength)
    x: 28, // Initial slight angle so it swings in on mount
    y: -12,
    vx: 0,
    vy: 0,
    // Card rotation & 3D tilt
    angle: 6,
    vAngle: 0,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    // Drag interaction state
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragOriginX: 0,
    dragOriginY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    pointerMoved: false,
    isVisible: true,
    flipAngle: 0,
  });

  useEffect(() => {
    physicsRef.current.flipAngle = isFlipped ? 180 : 0;
  }, [isFlipped]);

  // Pause physics loop when scrolled out of viewport to keep TBT = 0
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          physicsRef.current.isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Main spring-pendulum physics loop
  useEffect(() => {
    let rafId: number;
    let startTime = performance.now();

    // Anchor coordinates in the 500x600 SVG coordinate space:
    // Top anchor attaches right beneath "Creative" at (250, 6)
    const ANCHOR_X = 250;
    const ANCHOR_Y = 4;
    const REST_Y = 118; // Length of the hanging strap ("rassi") from "Creative" to card clip

    const step = (now: number) => {
      const p = physicsRef.current;
      if (p.isVisible) {
        const elapsed = (now - startTime) * 0.001;

        if (!p.dragging) {
          // Gentle ambient breeze so the lanyard feels alive
          const ambientForceX = Math.sin(elapsed * 1.6) * 0.18 + Math.cos(elapsed * 0.9) * 0.08;
          const ambientForceY = Math.sin(elapsed * 2.4) * 0.06;

          // Pendulum restoring spring force toward (0, 0) offset from rest point
          const kSpringX = 0.045;
          const kSpringY = 0.085;
          const damping = 0.92;

          const ax = -kSpringX * p.x + ambientForceX;
          const ay = -kSpringY * p.y + ambientForceY;

          p.vx = (p.vx + ax) * damping;
          p.vy = (p.vy + ay) * damping;

          p.x += p.vx;
          p.y += p.vy;

          // Target angle follows horizontal velocity and pendulum deflection
          const targetAngle = -p.x * 0.16 - p.vx * 0.9;
          const angleAccel = (targetAngle - p.angle) * 0.12;
          p.vAngle = (p.vAngle + angleAccel) * 0.86;
          p.angle += p.vAngle;
        } else {
          // While dragging, angle responds to horizontal pull and movement velocity
          const targetAngle = -p.x * 0.11 - p.vx * 0.6;
          p.angle += (targetAngle - p.angle) * 0.25;
        }

        // Smooth 3D tilt interpolation
        p.tiltX += (p.targetTiltX - p.tiltX) * 0.14;
        p.tiltY += (p.targetTiltY - p.tiltY) * 0.14;

        // Current clip position in SVG space (500x600 viewBox)
        const clipX = ANCHOR_X + p.x;
        const clipY = REST_Y + p.y;

        // Control point for natural catenary/rope curve
        const midX = (ANCHOR_X + clipX) * 0.5 + p.vx * 1.8;
        const sag = Math.max(0, (REST_Y - (clipY - ANCHOR_Y)) * 0.35);
        const midY = (ANCHOR_Y + clipY) * 0.5 + sag;

        // Left & right V-strap loops coming out of the "Creative" grommet ring
        const dLeft = `M ${ANCHOR_X - 14} ${ANCHOR_Y} Q ${midX - 10} ${midY}, ${clipX - 3} ${clipY - 12}`;
        const dRight = `M ${ANCHOR_X + 14} ${ANCHOR_Y} Q ${midX + 10} ${midY}, ${clipX + 3} ${clipY - 12}`;
        const dMain = `M ${ANCHOR_X} ${ANCHOR_Y} Q ${midX} ${midY}, ${clipX} ${clipY - 10}`;

        if (strapLeftPathRef.current) strapLeftPathRef.current.setAttribute("d", dLeft);
        if (strapRightPathRef.current) strapRightPathRef.current.setAttribute("d", dRight);
        if (strapMainPathRef.current) strapMainPathRef.current.setAttribute("d", dMain);
        if (strapStitchPathRef.current) strapStitchPathRef.current.setAttribute("d", dMain);

        if (clipGroupRef.current) {
          const ropeAngleDeg =
            (Math.atan2(clipX - ANCHOR_X, Math.max(20, clipY - ANCHOR_Y)) * 180) / Math.PI;
          clipGroupRef.current.setAttribute(
            "transform",
            `translate(${clipX}, ${clipY}) rotate(${-ropeAngleDeg * 0.5})`
          );
        }

        if (cardRef.current) {
          const totalRotateY = p.flipAngle + p.tiltY;
          cardRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotateZ(${p.angle.toFixed(
            2
          )}deg) rotateX(${p.tiltX.toFixed(2)}deg) rotateY(${totalRotateY.toFixed(2)}deg)`;
        }

        if (shadowRef.current) {
          const scale = Math.max(0.75, Math.min(1.15, 1 - p.y * 0.002));
          shadowRef.current.style.transform = `translate3d(${p.x * 0.65}px, 0, 0) scale(${scale.toFixed(
            3
          )})`;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const p = physicsRef.current;
    p.dragging = true;
    p.pointerMoved = false;
    p.dragStartX = e.clientX;
    p.dragStartY = e.clientY;
    p.dragOriginX = p.x;
    p.dragOriginY = p.y;
    p.lastPointerX = e.clientX;
    p.lastPointerY = e.clientY;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (p.dragging) {
      e.stopPropagation();
      const dx = e.clientX - p.dragStartX;
      const dy = e.clientY - p.dragStartY;
      if (Math.hypot(dx, dy) > 5) {
        p.pointerMoved = true;
      }

      // Elastic constraint so the strap feels tethered to "Creative"
      const rawX = p.dragOriginX + dx;
      const rawY = p.dragOriginY + dy;
      const maxPullX = 165;
      const maxPullDown = 115;
      const maxPushUp = -95;

      const clampedX = Math.max(-maxPullX, Math.min(maxPullX, rawX * 0.82));
      const clampedY = Math.max(maxPushUp, Math.min(maxPullDown, rawY * 0.78));

      p.vx = (e.clientX - p.lastPointerX) * 0.45;
      p.vy = (e.clientY - p.lastPointerY) * 0.45;
      p.x = clampedX;
      p.y = clampedY;
      p.lastPointerX = e.clientX;
      p.lastPointerY = e.clientY;
      return;
    }

    // Hover 3D tilt when not dragging
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const relY = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    p.targetTiltY = relX * 18;
    p.targetTiltX = -relY * 14;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (!p.dragging) return;
    p.dragging = false;
    p.targetTiltX = 0;
    p.targetTiltY = 0;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }

    // If user clicked without dragging, flip the card gently or give a playful tug
    if (!p.pointerMoved) {
      p.vy = 4.5;
      p.vAngle = (Math.random() > 0.5 ? 1 : -1) * 3.2;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    const p = physicsRef.current;
    if (!p.dragging) {
      p.targetTiltX = 0;
      p.targetTiltY = 0;
    }
  }, []);

  const resolvedFront =
    !frontImage || frontImage === "/card-front.png" || frontError
      ? DEFAULT_AVATAR
      : frontImage;

  const resolvedBack =
    !backImage || backImage === "/card-back.png" || backError
      ? resolvedFront
      : backImage;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center select-none overflow-visible pointer-events-none ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* SVG Lanyard Rope / Strap ("Rassi") anchored directly at top center ("Creative") */}
      <svg
        viewBox="0 0 500 600"
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          {/* Woven Fabric Strap Gradient */}
          <linearGradient id="lanyard-strap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="45%" stopColor="#27272a" />
            <stop offset="55%" stopColor="#1f1f23" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>

          {/* Optional Custom Strap Image Pattern */}
          {strapTextureLoaded && (
            <pattern
              id="lanyard-custom-band"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              <image
                href={strapImage}
                x="0"
                y="0"
                width="64"
                height="64"
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          )}

          {/* Metallic Hardware Gradient */}
          <linearGradient id="lanyard-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Soft Drop Shadow for the Strap & Clasp */}
          <filter id="lanyard-rope-shadow" x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.42" />
          </filter>
        </defs>

        {/* Top Grommet / Mounting Ring attached right under "Creative" */}
        <g transform="translate(250, 4)" filter="url(#lanyard-rope-shadow)">
          <circle
            cx="0"
            cy="0"
            r="13"
            fill="none"
            stroke="url(#lanyard-metal-grad)"
            strokeWidth="4"
          />
          <circle cx="0" cy="0" r="5" fill="#09090b" opacity="0.65" />
        </g>

        {/* Left & Right Woven Lanyard Straps forming V-neck loop from "Creative" */}
        <g filter="url(#lanyard-rope-shadow)">
          <path
            ref={strapLeftPathRef}
            d="M 236 4 Q 242 62, 247 106"
            fill="none"
            stroke={strapTextureLoaded ? "url(#lanyard-custom-band)" : "url(#lanyard-strap-grad)"}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            ref={strapRightPathRef}
            d="M 264 4 Q 258 62, 253 106"
            fill="none"
            stroke={strapTextureLoaded ? "url(#lanyard-custom-band)" : "url(#lanyard-strap-grad)"}
            strokeWidth="11"
            strokeLinecap="round"
          />
          {/* Central Woven Cord Spine */}
          <path
            ref={strapMainPathRef}
            d="M 250 4 Q 250 62, 250 108"
            fill="none"
            stroke={strapTextureLoaded ? "url(#lanyard-custom-band)" : "url(#lanyard-strap-grad)"}
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Center Accent Stitching Thread */}
          <path
            ref={strapStitchPathRef}
            d="M 250 4 Q 250 62, 250 108"
            fill="none"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </g>

        {/* Metallic Lobster Clasp & Badge Holder Clip at the bottom of the strap */}
        <g ref={clipGroupRef} transform="translate(250, 118)" filter="url(#lanyard-rope-shadow)">
          {/* Leather/Fabric Stitch Tab */}
          <rect
            x="-12"
            y="-22"
            width="24"
            height="14"
            rx="3"
            fill="#18181b"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
          {/* Silver D-Ring */}
          <path
            d="M -10 -8 L 10 -8 L 7 2 L -7 2 Z"
            fill="url(#lanyard-metal-grad)"
          />
          {/* Swivel Pin */}
          <rect x="-4" y="1" width="8" height="7" rx="2" fill="url(#lanyard-metal-grad)" />
          {/* Metal Badge Clip Jaws gripping the card slot */}
          <rect
            x="-14"
            y="7"
            width="28"
            height="14"
            rx="4"
            fill="url(#lanyard-metal-grad)"
            stroke="#475569"
            strokeWidth="1"
          />
          <circle cx="0" cy="14" r="2.5" fill="#334155" />
        </g>
      </svg>

      {/* Interactive Hanging Card anchored to the end of the strap */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsFlipped((prev) => !prev);
        }}
        title="Drag to swing • Double-click to flip"
        style={{
          transformOrigin: "50% 0px",
          transformStyle: "preserve-3d",
          marginTop: "102px",
        }}
        className={`relative z-30 pointer-events-auto touch-none w-[220px] sm:w-[255px] md:w-[278px] aspect-[3/3.75] rounded-[24px] transition-shadow duration-200 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* FRONT FACE OF HANGING CARD */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 rounded-[24px] bg-white/95 p-2.5 sm:p-3 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.5)] flex flex-col justify-between overflow-hidden"
        >
          {/* Top Lanyard Slot Punch Hole */}
          <div className="w-full flex justify-center pt-0.5 pb-2 shrink-0">
            <div
              className="w-12 h-2.5 rounded-full shadow-inner border border-black/20"
              style={{ backgroundColor: primaryColor }}
            />
          </div>

          {/* User Portrait Image Frame */}
          <div className="relative w-full flex-1 rounded-[16px] overflow-hidden bg-neutral-900 shadow-inner">
            <img
              src={resolvedFront}
              alt={name || "Creative Portrait"}
              onError={() => setFrontError(true)}
              draggable={false}
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Subtle Gloss Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/20 pointer-events-none" />

            {/* Optional Name & Role Badge Overlay at bottom of card */}
            {name && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-left pointer-events-none">
                <p className="font-['Bebas_Neue',sans-serif] text-white text-lg sm:text-xl leading-none tracking-wider truncate m-0">
                  {name}
                </p>
                {subtitle && (
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] text-white/80 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest truncate mt-0.5 m-0">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Interactive Hint Footer */}
          <div className="pt-1.5 flex items-center justify-between px-1 text-[9px] font-mono uppercase tracking-widest text-neutral-500 shrink-0">
            <span>ID • CREATIVE</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped((prev) => !prev);
              }}
              className="text-neutral-700 hover:text-black font-bold underline decoration-dotted cursor-pointer"
            >
              Flip ↻
            </button>
          </div>
        </div>

        {/* BACK FACE OF HANGING CARD */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 rounded-[24px] bg-neutral-950 text-white p-2.5 sm:p-3 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden"
        >
          {/* Top Lanyard Slot Punch Hole */}
          <div className="w-full flex justify-center pt-0.5 pb-2 shrink-0">
            <div
              className="w-12 h-2.5 rounded-full shadow-inner border border-white/25"
              style={{ backgroundColor: primaryColor }}
            />
          </div>

          {/* Back Image / Pass Details */}
          <div className="relative w-full flex-1 rounded-[16px] overflow-hidden bg-neutral-900">
            <img
              src={resolvedBack}
              alt={name ? `${name} Back` : "Card Back"}
              onError={() => setBackError(true)}
              draggable={false}
              className="w-full h-full object-cover opacity-85 filter contrast-110 select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
              <span
                className="inline-block w-fit px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest text-white mb-1.5"
                style={{ backgroundColor: primaryColor }}
              >
                Verified Creator
              </span>
              <p className="font-['Bebas_Neue',sans-serif] text-2xl tracking-wide text-white leading-none m-0">
                {name || "CREATIVE PORTFOLIO"}
              </p>
              {subtitle && (
                <p className="text-[11px] text-white/75 font-mono mt-1 line-clamp-2 m-0">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="pt-1.5 flex items-center justify-between px-1 text-[9px] font-mono uppercase tracking-widest text-white/60 shrink-0">
            <span>ALL ACCESS</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped((prev) => !prev);
              }}
              className="text-white/90 hover:text-white font-bold underline decoration-dotted cursor-pointer"
            >
              Flip ↻
            </button>
          </div>
        </div>
      </div>

      {/* Floor / Ambient Shadow underneath the hanging card */}
      <div
        ref={shadowRef}
        className="w-40 h-5 rounded-full bg-black/35 blur-xl pointer-events-none mt-4 transition-transform duration-75"
      />
    </div>
  );
}
