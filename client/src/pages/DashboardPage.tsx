import { useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  FileCheck2,
  FilePlus2,
  FileText,
  Gauge,
  PenLine,
  ScanSearch,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth";
import { useResumesStore } from "@/stores/resumes";
import { useJdsStore } from "@/stores/jds";
import { useOptimizationsStore } from "@/stores/optimizations";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const resumes = useResumesStore((state) => state.items);
  const fetchResumes = useResumesStore((state) => state.fetch);
  const jds = useJdsStore((state) => state.items);
  const fetchJds = useJdsStore((state) => state.fetch);
  const optimizations = useOptimizationsStore((state) => state.items);
  const fetchOptimizations = useOptimizationsStore((state) => state.fetch);

  useEffect(() => {
    void fetchResumes();
    void fetchJds();
    void fetchOptimizations();
  }, [fetchResumes, fetchJds, fetchOptimizations]);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* Editorial Workspace Header */}
      <section className="relative overflow-hidden rounded-3xl border bg-card/60 p-6 sm:p-8 backdrop-blur-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              <span>Executive Career Studio</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {greeting()}, {firstName}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Craft recruiter-ready resumes tailored to specific roles. Audit ATS keyword density,
              auto-fit standard A4 pages, and export verified PDF &amp; DOCX files.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-semibold text-foreground">{resumes.length}</span>
                <span>saved {resumes.length === 1 ? "resume" : "resumes"}</span>
              </div>
              <span className="text-border" aria-hidden>•</span>
              <div className="flex items-center gap-1.5">
                <ScanSearch className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-semibold text-foreground">{jds.length}</span>
                <span>target {jds.length === 1 ? "role" : "roles"}</span>
              </div>
              <span className="text-border" aria-hidden>•</span>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <span className="font-semibold text-foreground">{optimizations.length}</span>
                <span>optimization {optimizations.length === 1 ? "run" : "runs"}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button asChild size="default" className="shadow-xs font-medium">
              <Link to="/build">
                <FilePlus2 className="mr-1.5 h-4 w-4" aria-hidden />
                Build from Scratch
              </Link>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link to="/resumes">
                <Upload className="mr-1.5 h-4 w-4" aria-hidden />
                Upload Resume
              </Link>
            </Button>
            <Button asChild variant="secondary" size="default">
              <Link to="/ats-check">
                <Gauge className="mr-1.5 h-4 w-4" aria-hidden />
                Scan ATS Score
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Guided Workflow Banner */}
      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 transition-all hover:border-primary/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary text-primary-foreground font-semibold px-2 py-0.5 text-xs">
                Recommended Flow
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">8-Step End-to-End Pipeline</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Targeted AI Resume Wizard
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Match your resume against an exact job description. Our guided workflow extracts core competencies,
              enhances bullet point impact, preserves employment facts, and renders 10 recruiter-tested templates.
            </p>
            <div className="hidden sm:flex items-center gap-1.5 pt-2 text-xs font-medium text-muted-foreground">
              <span>Target Role</span>
              <ChevronRight className="h-3 w-3" />
              <span>Resume &amp; JD</span>
              <ChevronRight className="h-3 w-3" />
              <span>Keyword Audit</span>
              <ChevronRight className="h-3 w-3" />
              <span>Tailored Generation</span>
              <ChevronRight className="h-3 w-3" />
              <span>A4 Live Editor</span>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2 font-semibold">
            <Link to="/wizard">
              Start Wizard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* Creation & Design Studio */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Creation &amp; Design Studio</h2>
            <p className="text-xs text-muted-foreground">Assemble, reorder, and style standard single-page or multi-page resumes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/resumes"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                  {resumes.length} Saved
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Resume Workspace</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Upload PDF or DOCX files. Parse structured personal details, work history, projects, and skills.
                </p>
              </div>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
              View Resumes <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/build"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <FilePlus2 className="h-5 w-5" aria-hidden />
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  Ready
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Scratch Builder</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Build without an existing file. Pick from 10 executive templates with auto-populated profile contacts.
                </p>
              </div>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
              Create New Draft <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/profile"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <SlidersHorizontal className="h-5 w-5" aria-hidden />
                </span>
                <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                  Autofill Source
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Profile &amp; Links Vault</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Save your target role, GitHub, LinkedIn, portfolio links, and contact info to auto-populate any resume.
                </p>
              </div>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
              Edit Master Profile <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Optimization & ATS Verification Suite */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">ATS &amp; Market Alignment Suite</h2>
          <p className="text-xs text-muted-foreground">Deterministic algorithms and keyword coverage to pass automated screening.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/ats-check"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Gauge className="h-5 w-5" aria-hidden />
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  Instant
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Deterministic ATS Scanner</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Instant zero-latency audit. Check formatting traps, word counts, contact fields, and keyword density.
                </p>
              </div>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
              Scan Document <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/jds"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <ScanSearch className="h-5 w-5" aria-hidden />
                </span>
                <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                  {jds.length} Parsed
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Job Description Parser</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Paste or upload target job posts. Automatically extract technical requirements, soft skills, and qualifications.
                </p>
              </div>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
              Manage Job Targets <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/optimize"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Wand2 className="h-5 w-5" aria-hidden />
                </span>
                <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                  Detailed Report
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Role Comparison Analyzer</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Head-to-head resume vs job description comparison. Get missing skill checklists and bullet impact suggestions.
                </p>
              </div>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
              Run Role Match <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Career Expansion Tools */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Upcoming Career Suite</h2>
          <p className="text-xs text-muted-foreground">Integrated job search collateral under active development.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: PenLine,
              title: "Tailored Cover Letters",
              description: "Customized narratives aligned to each employer’s company mission and role requirements.",
            },
            {
              icon: Briefcase,
              title: "LinkedIn Headline & About",
              description: "Recruiter-optimized bio headlines and keyword-rich executive summaries.",
            },
            {
              icon: Sparkles,
              title: "Technical Interview Prep",
              description: "Practice questions tailored to the exact technologies identified in your target job descriptions.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex flex-col justify-between rounded-2xl border bg-muted/20 p-5 opacity-80"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    In Development
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">{title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
