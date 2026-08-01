import { getTemplate } from "@/templates/resumeTemplates";
import type { ParsedResumeData, ResumeTemplate } from "@/types";

interface ResumePreviewProps {
  data: ParsedResumeData;
  template?: ResumeTemplate;
  title?: string;
  className?: string;
}

/**
 * ATS-style rendering of parsed resume data. The wrapper picks up the
 * template class (`resume-tpl-*` from index.css) so the same data can be
 * rendered in any of the four built-in layouts.
 */
export function ResumePreview({ data, template, title, className }: ResumePreviewProps) {
  const tpl = getTemplate(template);
  const hidden = (key: string) => data.hiddenSections?.includes(key) ?? false;
  const contact = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
    data.contact.github,
  ].filter(Boolean);

  return (
    <div className={`resume-paper flex h-full w-full flex-col gap-1 p-6 text-left ${tpl.className} ${className ?? ""}`}>
      <header className="rv-header">
        {title || data.name ? <h1 className="rv-name">{title || data.name}</h1> : null}
        {contact.length > 0 ? (
          <p className="rv-contact">
            {contact.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        ) : null}
      </header>

      {!hidden("summary") && data.summary ? (
        <section className="rv-section">
          <h2 className="rv-heading">Summary</h2>
          <p className="rv-summary-text whitespace-pre-line">{data.summary}</p>
        </section>
      ) : null}

      {!hidden("skills") && data.skills.length > 0 ? (
        <section className="rv-section">
          <h2 className="rv-heading">Skills</h2>
          <div className="rv-skills">
            {data.skills.map((skill) => (
              <span key={skill} className="rv-skill">
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {!hidden("experience") && data.experience.length > 0 ? (
        <section className="rv-section">
          <h2 className="rv-heading">Experience</h2>
          {data.experience.map((entry, i) => (
            <article key={i} className="rv-entry">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="rv-title">{entry.title || "Untitled role"}</span>
                {(entry.startDate || entry.endDate) && (
                  <span className="rv-dates">
                    {entry.startDate} – {entry.endDate}
                  </span>
                )}
              </div>
              <span className="rv-meta">{[entry.company, entry.location].filter(Boolean).join(" · ")}</span>
              {entry.description ? <p className="rv-summary-text whitespace-pre-line">{entry.description}</p> : null}
              {entry.achievements ? <p className="rv-summary-text whitespace-pre-line">{entry.achievements}</p> : null}
              {entry.technologies ? <span className="rv-meta">Technologies: {entry.technologies}</span> : null}
            </article>
          ))}
        </section>
      ) : null}

      {!hidden("education") && data.education.length > 0 ? (
        <section className="rv-section">
          <h2 className="rv-heading">Education</h2>
          {data.education.map((entry, i) => (
            <article key={i} className="rv-entry">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="rv-title">{entry.degree || "Untitled degree"}</span>
                {(entry.startDate || entry.endDate) && (
                  <span className="rv-dates">
                    {entry.startDate} – {entry.endDate}
                  </span>
                )}
              </div>
              <span className="rv-meta">{entry.institution}</span>
              {entry.description ? <p className="rv-summary-text whitespace-pre-line">{entry.description}</p> : null}
            </article>
          ))}
        </section>
      ) : null}

      {!hidden("projects") && data.projects.length > 0 ? (
        <section className="rv-section">
          <h2 className="rv-heading">Projects</h2>
          {data.projects.map((entry, i) => (
            <article key={i} className="rv-entry">
              <span className="rv-title">{entry.name || "Untitled project"}</span>
              {entry.description ? <p className="rv-summary-text whitespace-pre-line">{entry.description}</p> : null}
              {entry.technologies ? <span className="rv-meta">Technologies: {entry.technologies}</span> : null}
              {[entry.link, entry.liveDemo].filter(Boolean).map((link) => (
                <span key={link} className="rv-meta">
                  {link}
                </span>
              ))}
            </article>
          ))}
        </section>
      ) : null}

      {!hidden("certifications") && data.certifications.length > 0 ? (
        <section className="rv-section">
          <h2 className="rv-heading">Certifications</h2>
          <div className="rv-skills">
            {data.certifications.map((item) => (
              <span key={item} className="rv-skill">
                {item}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {!hidden("languages") && data.languages.length > 0 ? (
        <section className="rv-section">
          <h2 className="rv-heading">Languages</h2>
          <div className="rv-skills">
            {data.languages.map((item) => (
              <span key={item} className="rv-skill">
                {item}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {!hidden("awards") && data.awards.length > 0 ? (
        <section className="rv-section">
          <h2 className="rv-heading">Awards</h2>
          {data.awards.map((item) => (
            <p key={item} className="rv-meta">
              {item}
            </p>
          ))}
        </section>
      ) : null}

      {(data.customSections ?? []).length > 0
        ? data.customSections.map((section, i) =>
            section.title || section.content ? (
              <section key={i} className="rv-section">
                <h2 className="rv-heading">{section.title || "Custom"}</h2>
                <p className="rv-summary-text whitespace-pre-line">{section.content}</p>
              </section>
            ) : null,
          )
        : null}

      {!title && !data.name && !contact.length && !data.summary && data.skills.length === 0 ? (
        <p className="rv-empty">Nothing parsed yet — edit the sections to fill this resume.</p>
      ) : null}
    </div>
  );
}
