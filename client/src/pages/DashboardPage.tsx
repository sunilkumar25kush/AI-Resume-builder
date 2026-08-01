import { FileText, ScanSearch, Wand2, Briefcase } from "lucide-react";

const features = [
  { icon: FileText, title: "Resume Builder", description: "Upload, parse, edit with templates and live preview.", stage: "M4 · M8" },
  { icon: ScanSearch, title: "JD Parser", description: "Parse job descriptions and extract skills.", stage: "M5" },
  { icon: Wand2, title: "AI Optimization", description: "ATS score, match %, missing skills, keywords.", stage: "M7" },
  { icon: Briefcase, title: "Generators", description: "Cover letters, LinkedIn summaries, interview questions.", stage: "M11" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Welcome 👋</h1>
        <p className="max-w-2xl text-muted-foreground">
          Your AI-powered resume optimization workspace. Build, parse, and optimize resumes against real job
          descriptions — all in one place.
        </p>
      </section>

      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, description, stage }) => (
          <article
            key={title}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <span className="mt-auto w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {stage}
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}
