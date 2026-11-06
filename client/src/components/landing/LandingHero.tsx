import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Code2, ExternalLink, FileText, Gauge, Globe, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Category Pill */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/60 text-xs font-medium text-foreground select-none"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Applicant Tracking System and Developer Portfolio Suite</span>
      </motion.div>

      {/* Heading with required B5 text gradient */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        className="max-w-[680px] mx-auto text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] [text-wrap:balance] bg-gradient-to-r from-black to-[#666666] dark:from-white dark:to-[#9B9B9B] bg-clip-text text-transparent"
      >
        Build an interview winning resume
        <br className="hidden sm:inline" />
        and live portfolio in minutes
      </motion.h1>

      {/* Subheading capped at 680px */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
        className="mt-6 max-w-[680px] mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed [text-wrap:pretty]"
      >
        Optimize your qualifications against target job descriptions with instant keyword analysis,
        then publish an interactive developer portfolio website with one click.
      </motion.p>

      {/* Primary CTA & Secondary Action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
      >
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <Link to="/register" className="flex items-center justify-center gap-2">
            <span>Start building free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-semibold border-border bg-background hover:bg-muted/60 active:scale-95 transition-all"
        >
          <a href="#templates" className="flex items-center justify-center gap-2">
            <span>Explore templates</span>
          </a>
        </Button>
      </motion.div>

      {/* Proof Signal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium"
      >
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Zero credit card required
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Instant PDF and Word export
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Deterministic ATS validation
        </span>
      </motion.div>

      {/* Hero Visual Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
        className="mt-14 w-full max-w-5xl rounded-3xl border border-border/80 bg-card dark:bg-[#181818] p-3 sm:p-5 shadow-xl text-left select-none"
      >
        {/* Top Window Bar */}
        <div className="flex items-center justify-between pb-3 px-2 border-b border-border/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground hidden sm:inline">
              resumebuddy.app/editor/alex-mercer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
              ATS Score 96%
            </Badge>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30 hidden sm:inline-flex">
              Portfolio Live
            </Badge>
          </div>
        </div>

        {/* Dual Pane Showcase */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left: Resume Editor Preview */}
          <div className="lg:col-span-7 rounded-2xl border border-border/70 bg-background dark:bg-[#1F1F1F] p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Senior Full Stack Engineer
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Alex Mercer · 6 years experience
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold text-xs border border-emerald-500/20">
                  <Gauge className="h-3.5 w-3.5" />
                  <span>96/100</span>
                </div>
              </div>

              {/* Sample Parsed Resume Sections */}
              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex items-center justify-between font-medium text-foreground">
                    <span>Staff Platform Engineer at Vercel</span>
                    <span className="text-[11px] text-muted-foreground font-mono">2022 to Present</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    Architected edge deployment pipeline reducing p95 cold start latency by 42% across 14 global regions.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex items-center justify-between font-medium text-foreground">
                    <span>Frontend Systems Lead at Stripe</span>
                    <span className="text-[11px] text-muted-foreground font-mono">2019 to 2022</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    Authored accessible component architecture adopted by 180 engineers across customer checkout surfaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Keyword Match Tags */}
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground font-medium mr-1">ATS Keywords:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">TypeScript</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">React 19</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">Node.js</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">Distributed Systems</span>
            </div>
          </div>

          {/* Right: Portfolio Generator Preview */}
          <div className="lg:col-span-5 rounded-2xl border border-border/70 bg-background dark:bg-[#1F1F1F] p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Portfolio Website
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[140px] sm:max-w-[180px]">
                      resumebuddy.app/p/alex-mercer
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline">
                  <span>Live</span>
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>

              {/* Mini Portfolio Preview Display */}
              <div className="mt-3.5 rounded-xl border border-border/60 p-3 bg-card dark:bg-[#272727] text-center space-y-2.5">
                <div className="h-12 w-12 rounded-full mx-auto bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
                  <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-xs font-bold text-foreground">
                    AM
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Alex Mercer</p>
                  <p className="text-[10px] text-muted-foreground">Systems Architect & OSS Contributor</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground pt-1">
                  <span className="px-1.5 py-0.5 rounded bg-muted">14 Projects</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted">6 Articles</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted">GitHub 4.2k★</span>
                </div>
              </div>
            </div>

            {/* Template Selector Mockup */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground font-medium">Selected Theme:</span>
              <span className="px-2 py-1 rounded-md bg-muted text-foreground font-semibold text-[11px] flex items-center gap-1">
                <Code2 className="h-3 w-3 text-primary" />
                <span>DevPort Cosmic</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

