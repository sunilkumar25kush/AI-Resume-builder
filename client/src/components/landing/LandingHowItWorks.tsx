import { motion } from "framer-motion";
import { ArrowRight, Cpu, FileUp, Globe } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      num: "01",
      icon: FileUp,
      title: "Import or start clean",
      desc: "Upload your existing PDF or Word resume to automatically extract contact details, work history, projects, and skills. Or pick a baseline template to draft directly.",
      badge: "30 second import",
    },
    {
      num: "02",
      icon: Cpu,
      title: "Tailor against your target role",
      desc: "Paste any job posting to run instant gap analysis. The system highlights missing keywords, weak verbs, and suggests impact driven metrics to boost your ATS score.",
      badge: "Real time feedback",
    },
    {
      num: "03",
      icon: Globe,
      title: "Deploy portfolio and export files",
      desc: "Publish an interactive developer portfolio website to your custom public link, and export pristine A4 PDF or editable Word files ready for application forms.",
      badge: "Production ready",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20">
      <div className="max-w-[680px] mx-auto text-center mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold block mb-2">
          Simple Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground [text-wrap:balance]">
          From plain text to live portfolio in three steps
        </h2>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground [text-wrap:pretty]">
          No complicated layout tweaking or manual website coding. The pipeline handles data extraction,
          keyword alignment, and web compilation automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: idx * 0.1 }}
              className="rounded-2xl border border-border/80 bg-card dark:bg-[#181818] p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-2xs hover:border-primary/40 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-muted-foreground/40">
                    {s.num}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    {s.badge}
                  </span>
                </div>

                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed [text-wrap:pretty]">
                    {s.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <span>Step {idx + 1} of 3</span>
                <ArrowRight className="h-3 w-3 text-primary" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

