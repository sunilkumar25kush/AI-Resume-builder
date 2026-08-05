const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ringTone(score: number): string {
  if (score >= 80) return "stroke-emerald-500";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-red-500";
}

/** Circular 0-100 score indicator — emerald/amber/red by threshold. */
export function ScoreRing({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);
  return (
    <div className="relative h-32 w-32" role="img" aria-label={`ATS score ${clamped} out of 100`}>
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={RING_RADIUS} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="64"
          cy="64"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={ringTone(clamped)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{clamped}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
