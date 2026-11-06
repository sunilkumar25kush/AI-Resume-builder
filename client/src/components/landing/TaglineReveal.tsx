import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function TaglineReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position through the tagline container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "center 0.45"],
  });

  const lines = [
    "A targeted resume gets you past the automated screen.",
    "A live portfolio gets you the engineering offer.",
  ];

  const allWords = lines.flatMap((line, lineIndex) =>
    line.split(" ").map((word) => ({ word, lineIndex })),
  );

  return (
    <section
      ref={containerRef}
      className="py-24 sm:py-36 px-4 sm:px-6 max-w-5xl mx-auto text-center select-none"
      aria-label="Core Philosophy"
    >
      <div className="max-w-[720px] mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-6">
          The Engineering Standard
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.2] [text-wrap:balance]">
          {lines.map((line, lIdx) => {
            const lineWords = line.split(" ");
            const startIndex = lIdx === 0 ? 0 : lines[0].split(" ").length;

            return (
              <span key={lIdx} className="block mb-2 sm:mb-3">
                {lineWords.map((word, wIdx) => {
                  const globalIndex = startIndex + wIdx;
                  const total = allWords.length;
                  const start = globalIndex / total;
                  const end = (globalIndex + 1) / total;

                  return (
                    <WordSpan
                      key={`${word}-${wIdx}`}
                      word={word}
                      progress={scrollYProgress}
                      range={[start, end]}
                    />
                  );
                })}
              </span>
            );
          })}
        </h2>

        <p className="mt-8 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto [text-wrap:pretty]">
          Recruiters scan resumes for 6 seconds. Engineering hiring managers open portfolios to verify code architecture, live demos, and real contributions.
        </p>
      </div>
    </section>
  );
}

function WordSpan({
  word,
  progress,
  range,
}: {
  word: string;
  progress: any;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.28, 1]);
  const y = useTransform(progress, range, [4, 0]);

  return (
    <motion.span
      style={{ opacity, y }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="inline-block mr-[0.28em] text-foreground transition-colors"
    >
      {word}
    </motion.span>
  );
}

