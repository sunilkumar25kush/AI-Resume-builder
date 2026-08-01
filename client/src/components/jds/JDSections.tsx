import { Building2, CheckCircle2, ListChecks, Briefcase } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { JobDescription } from "@/types";

interface JDSectionsProps {
  jd: JobDescription;
}

/** Read-only rendering of a parsed job description (preview page). */
export function JDSections({ jd }: JDSectionsProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{jd.title || "Untitled role"}</h2>
        {jd.company ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" aria-hidden />
            {jd.company}
          </p>
        ) : null}
      </section>

      {jd.skills.length > 0 ? (
        <Section title="Skills" icon={Briefcase}>
          <div className="flex flex-wrap gap-2">
            {jd.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {jd.qualifications.length > 0 ? (
        <Section title="Qualifications" icon={CheckCircle2}>
          <ul className="flex flex-col gap-2">
            {jd.qualifications.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {jd.responsibilities.length > 0 ? (
        <Section title="Responsibilities" icon={ListChecks}>
          <ul className="flex flex-col gap-2">
            {jd.responsibilities.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}
