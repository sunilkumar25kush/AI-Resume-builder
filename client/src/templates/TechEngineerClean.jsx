import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText } from "./primitives";

/**
 * T5 - Tech Engineer Clean (Reference D, tpl-tech-engineer-preview.png)
 * Teal/emerald accent, solid header line, single column,
 * inline skills, right-aligned tech stack for projects, dash bullets.
 */
export function TechEngineerClean({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages } = resume;

  const tealAccent = theme.accentColor || "#0F766E";
  const fontSizeBase = theme.fontSize || "14px";

  const contactItems = [
    personal.email ? { text: personal.email, href: `mailto:${personal.email}` } : null,
    personal.phone ? { text: personal.phone, href: `tel:${personal.phone.replace(/[^0-9+]/g, "")}` } : null,
    personal.location ? { text: personal.location } : null,
    personal.linkedin ? { text: personal.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}` } : null,
    personal.github ? { text: personal.github.replace(/^https?:\/\/(www\.)?/, ""), href: personal.github.startsWith("http") ? personal.github : `https://${personal.github}` } : null,
  ].filter(Boolean);

  // Flatten all skills into a clean inline list
  const skillList = [];
  skills.forEach((cat) => {
    cat.items.forEach((item) => skillList.push(item));
  });

  return (
    <div
      className="resume-a4-page p-10 font-sans text-neutral-800"
      style={{ fontSize: fontSizeBase }}
    >
      {/* Header */}
      <header className="resume-header mb-4">
        <h1
          className="text-[30px] font-bold tracking-tight leading-none"
          style={{ color: tealAccent }}
        >
          {personal.fullName}
        </h1>

        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-neutral-600 mt-2">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-neutral-400">·</span>}
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {item.text}
                  </a>
                ) : (
                  <span>{item.text}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="h-[2.5px] w-full mt-3 mb-4" style={{ backgroundColor: tealAccent }} />
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-4 break-inside-avoid">
          <h2
            className="text-[13.5px] font-bold uppercase tracking-wider mb-1.5"
            style={{ color: tealAccent }}
          >
            Summary
          </h2>
          <p className="text-[13px] text-neutral-700 leading-relaxed text-justify">
            <RichText text={summary} />
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-4 break-inside-avoid-page space-y-3">
          <h2
            className="text-[13.5px] font-bold uppercase tracking-wider mb-1.5"
            style={{ color: tealAccent }}
          >
            Experience
          </h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-neutral-900 text-[14px]">{exp.role}</span>
                <DateRange startDate={exp.startDate} endDate={exp.endDate} className="text-[12.5px] text-neutral-500" />
              </div>
              <div className="text-[12.5px] text-neutral-600 mb-1">
                {exp.company}{exp.location ? ` · ${exp.location}` : ""}
              </div>
              <BulletList
                bullets={exp.bullets}
                bulletStyle="dash"
                itemClassName="text-[12.5px] text-neutral-700"
              />
              {exp.technologies && (
                <div className="text-[12px] text-neutral-600 mt-1">
                  <span className="font-medium text-neutral-700">Technologies: </span>
                  {exp.technologies}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-4 break-inside-avoid space-y-2">
          <h2
            className="text-[13.5px] font-bold uppercase tracking-wider mb-1.5"
            style={{ color: tealAccent }}
          >
            Education
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-neutral-900 text-[13.5px]">{edu.degree}</span>
                <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-[12.5px] text-neutral-500" />
              </div>
              <div className="text-[12.5px] text-neutral-600">
                {edu.institution}{edu.location ? `, ${edu.location}` : ""}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-4 break-inside-avoid-page space-y-3">
          <h2
            className="text-[13.5px] font-bold uppercase tracking-wider mb-1.5"
            style={{ color: tealAccent }}
          >
            Projects
          </h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-neutral-900 text-[13.5px]">{proj.name}</span>
                {proj.techStack && proj.techStack.length > 0 && (
                  <span className="text-[12px] text-neutral-500 font-normal">
                    | {proj.techStack.join(", ")}
                  </span>
                )}
              </div>
              <BulletList
                bullets={proj.bullets}
                bulletStyle="dash"
                itemClassName="text-[12.5px] text-neutral-700"
              />
            </div>
          ))}
        </section>
      )}

      {/* Skills (inline comma-separated paragraph) */}
      {skillList.length > 0 && (
        <section className="mb-4 break-inside-avoid">
          <h2
            className="text-[13.5px] font-bold uppercase tracking-wider mb-1"
            style={{ color: tealAccent }}
          >
            Skills
          </h2>
          <p className="text-[13px] text-neutral-700 leading-relaxed">
            {skillList.join(", ")}
          </p>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="mb-4 break-inside-avoid">
          <h2
            className="text-[13.5px] font-bold uppercase tracking-wider mb-1"
            style={{ color: tealAccent }}
          >
            Certifications
          </h2>
          <div className="space-y-1 text-[13px] text-neutral-700">
            {certifications.map((c, idx) => (
              <div key={idx}>
                <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="mb-4 break-inside-avoid">
          <h2
            className="text-[13.5px] font-bold uppercase tracking-wider mb-1"
            style={{ color: tealAccent }}
          >
            Languages
          </h2>
          <p className="text-[13px] text-neutral-700">
            {languages.map((l) => `${l.name} (${l.level || "fluent"})`).join(", ")}
          </p>
        </section>
      )}
    </div>
  );
}
