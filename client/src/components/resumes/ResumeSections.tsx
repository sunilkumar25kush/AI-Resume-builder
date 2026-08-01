import { Briefcase, ExternalLink, GraduationCap, FolderGit2, Mail, MapPin, Phone, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ParsedResumeData } from "@/types";

interface ResumeSectionsProps {
  data: ParsedResumeData;
}

/** Read-only rendering of parsed resume sections (preview page). */
export function ResumeSections({ data }: ResumeSectionsProps) {
  const { contact } = data;
  const hidden = (key: string) => data.hiddenSections?.includes(key) ?? false;
  const contactItems = [
    { icon: Mail, value: contact.email },
    { icon: Phone, value: contact.phone },
    { icon: MapPin, value: contact.location },
  ].filter((item) => item.value);
  const links = [contact.linkedin, contact.github].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {data.name ? (
        <section className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <UserRound className="h-4 w-4" aria-hidden />
            Name
          </h2>
          <p className="text-base font-semibold">{data.name}</p>
        </section>
      ) : null}
      {contactItems.length > 0 || links.length > 0 ? (
        <section className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {contactItems.map(({ icon: Icon, value }) => (
            <span key={value} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" aria-hidden />
              {value}
            </span>
          ))}
          {links.map((link) => (
            <a
              key={link}
              href={link.startsWith("http") ? link : `https://${link}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {link}
            </a>
          ))}
        </section>
      ) : null}

      {!hidden("summary") && data.summary ? (
        <Section title="Summary">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </Section>
      ) : null}

      {!hidden("skills") && data.skills.length > 0 ? (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {!hidden("experience") && data.experience.length > 0 ? (
        <Section title="Experience">
          <div className="flex flex-col gap-4">
            {data.experience.map((entry, i) => (
              <article key={i} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <h3 className="font-semibold">{entry.title || "—"}</h3>
                  {(entry.startDate || entry.endDate) && (
                    <span className="text-xs text-muted-foreground">
                      {entry.startDate} – {entry.endDate}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {[entry.company, entry.location].filter(Boolean).join(" · ") || " "}
                </p>
                {entry.achievements ? (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground/90">{entry.achievements}</p>
                ) : null}
                {entry.technologies ? (
                  <p className="mt-1 text-xs text-muted-foreground/80">Technologies: {entry.technologies}</p>
                ) : null}
                {entry.description ? (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground/90">{entry.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {!hidden("education") && data.education.length > 0 ? (
        <Section title="Education">
          <div className="flex flex-col gap-4">
            {data.education.map((entry, i) => (
              <article key={i} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <h3 className="font-semibold">{entry.degree || "—"}</h3>
                  {(entry.startDate || entry.endDate) && (
                    <span className="text-xs text-muted-foreground">
                      {entry.startDate} – {entry.endDate}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{entry.institution || " "}</p>
                {entry.description ? (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground/90">{entry.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {!hidden("projects") && data.projects.length > 0 ? (
        <Section title="Projects">
          <div className="flex flex-col gap-4">
            {data.projects.map((entry, i) => (
              <article key={i} className="flex flex-col gap-1">
                <h3 className="font-semibold">{entry.name || "—"}</h3>
                {entry.technologies ? (
                  <p className="text-xs text-muted-foreground/80">Technologies: {entry.technologies}</p>
                ) : null}
                {entry.description ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground/90">{entry.description}</p>
                ) : null}
                {[entry.link, entry.liveDemo].filter(Boolean).map((link) => (
                  <a
                    key={link}
                    href={link.startsWith("http") ? link : `https://${link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {link}
                  </a>
                ))}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {!hidden("certifications") && data.certifications.length > 0 ? (
        <Section title="Certifications">
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {!hidden("languages") && data.languages.length > 0 ? (
        <Section title="Languages">
          <div className="flex flex-wrap gap-2">
            {data.languages.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {!hidden("awards") && data.awards.length > 0 ? (
        <Section title="Awards">
          <ul className="flex flex-col gap-1.5">
            {data.awards.map((item) => (
              <li key={item} className="text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      {(data.customSections ?? []).length > 0
        ? data.customSections.map((section, i) =>
            section.title || section.content ? (
              <Section key={i} title={section.title || "Custom"}>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{section.content}</p>
              </Section>
            ) : null,
          )
        : null}
    </div>
  );
}

const SECTION_ICONS = {
  Summary: UserRound,
  Skills: Briefcase,
  Experience: Briefcase,
  Education: GraduationCap,
  Projects: FolderGit2,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const Icon = SECTION_ICONS[title as keyof typeof SECTION_ICONS] ?? Briefcase;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}
