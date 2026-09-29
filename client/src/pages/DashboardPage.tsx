import { ChevronRight, FilePlus2, FileText, Gauge, Route, ScanSearch, Wand2, Briefcase } from "lucide-react";
import { Link } from "react-router";

import { useAuthStore } from "@/stores/auth";

const features = [
  { icon: Route, title: "AI Resume Wizard", description: "8-step guided flow: target → resume → JD → analysis → generate → template → edit → export.", stage: "Live", to: "/wizard", primary: true },
  { icon: Gauge, title: "ATS Checker", description: "Koi bhi resume check karo — instant ATS score aur fix checklist.", stage: "Live", to: "/ats-check" },
  { icon: FilePlus2, title: "Scratch Builder", description: "Bina JD ke — template chuno aur apne details se resume banao.", stage: "Live", to: "/build" },
  { icon: FileText, title: "Resume Builder", description: "Upload, parse, edit with templates and live preview.", stage: "Live", to: "/resumes" },
  { icon: ScanSearch, title: "JD Parser", description: "Parse job descriptions and extract skills.", stage: "Live", to: "/jds" },
  { icon: Wand2, title: "AI Optimization", description: "ATS score, match %, missing skills, keywords.", stage: "Live", to: "/optimize" },
  { icon: Briefcase, title: "Generators", description: "Cover letters, LinkedIn summaries, interview questions.", stage: "Soon" },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {greeting()}, {user?.name.split(" ")[0]} 👋
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Your AI-powered resume optimization workspace. Build, parse, and optimize resumes against real job
          descriptions — all in one place.
        </p>
      </section>

      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {features.map(({ icon: Icon, title, description, stage, to, primary }) => {
            const isLive = stage === "Live";

            const content = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-primary ${primary ? "bg-primary/20" : "bg-primary/10"}`}>
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  {/* Issue 4 fix: Live → green badge; Soon → muted grey */}
                  <span
                    className={`mt-auto w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isLive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold">{title}</h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {/* Issue 3 fix: trailing chevron signals clickability */}
                {to && (
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                    Get started <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                )}
              </>
            );

            // Issue 2 fix: primary card (Wizard) gets a promoted visual treatment
            const baseClass =
              "flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-colors";
            const className = primary
              ? `${baseClass} border-primary/40 bg-primary/5 ring-1 ring-primary/20 hover:border-primary hover:bg-primary/10 col-span-full sm:col-span-2 xl:col-span-2`
              : `${baseClass} bg-card hover:border-primary/50`;

            return to ? (
              <Link key={title} to={to} className={className}>
                {content}
              </Link>
            ) : (
              <article key={title} className={className}>
                {content}
              </article>
            );
          })}
      </section>
    </div>
  );
}
