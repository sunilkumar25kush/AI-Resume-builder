import { motion } from "framer-motion";
import { CheckCircle2, Download, FileCheck, Layers, Sparkles } from "lucide-react";

export function LandingBenefits() {
  const benefits = [
    {
      icon: FileCheck,
      headline: "Higher interview callback rates",
      detail: "Match your qualifications against any job description with instant keyword analysis and gap verification before submitting.",
      metric: "94% target match rate",
    },
    {
      icon: Sparkles,
      headline: "Live interactive project proof",
      detail: "Transform parsed resume achievements into a responsive developer portfolio website with custom public web links.",
      metric: "1 click generation",
    },
    {
      icon: Layers,
      headline: "Format fidelity preserved across devices",
      detail: "Generate pixel accurate A4 PDF documents and editable Word files without accidental line overflows or broken margins.",
      metric: "100% layout consistency",
    },
    {
      icon: Download,
      headline: "Zero vendor lock in with full code export",
      detail: "Download full standalone React source code or prebuilt static website archives to host on GitHub Pages or Vercel for free.",
      metric: "React 19 & Tailwind v4",
    },
  ];

  return (
    <section id="benefits" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20">
      <div className="max-w-[680px] mx-auto text-center mb-14">
        <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold block mb-2">
          Measurable Outcomes
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground [text-wrap:balance]">
          Engineered for technical careers and verified by hiring teams
        </h2>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground [text-wrap:pretty]">
          Standard templates fail modern applicant filters. Our suite ensures your qualifications
          are accurately indexed while giving engineering managers tangible code proof.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((b, idx) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.headline}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: idx * 0.08 }}
              className="rounded-2xl border border-border/80 bg-card dark:bg-[#181818] p-6 sm:p-8 flex flex-col justify-between gap-6 hover:border-primary/40 transition-colors shadow-2xs group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {b.metric}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">
                    {b.headline}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed [text-wrap:pretty]">
                    {b.detail}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-medium text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Verified across modern Applicant Tracking Systems</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

