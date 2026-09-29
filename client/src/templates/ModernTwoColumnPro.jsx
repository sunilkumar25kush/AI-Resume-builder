import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText } from "./primitives";

/**
 * T4 - Modern Two-Column Pro (Reference C, tpl-modern-pro-preview.png)
 * Blue accent theme, top header with full-width blue divider,
 * Left 68% for Summary, Experience, Education, Projects.
 * Right 32% light blue/gray sidebar card for Skills, Certifications, Languages.
 */
export function ModernTwoColumnPro({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages } = resume;

  const blueAccent = theme.accentColor || "#1D4ED8";
  const fontSizeBase = theme.fontSize || "14px";

  const contactItems = [
    personal.email ? { text: personal.email, href: `mailto:${personal.email}` } : null,
    personal.phone ? { text: personal.phone, href: `tel:${personal.phone.replace(/[^0-9+]/g, "")}` } : null,
    personal.location ? { text: personal.location } : null,
    personal.linkedin ? { text: personal.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}` } : null,
    personal.github ? { text: personal.github.replace(/^https?:\/\/(www\.)?/, ""), href: personal.github.startsWith("http") ? personal.github : `https://${personal.github}` } : null,
  ].filter(Boolean);

  // Flatten skills for sidebar
  const allSkills = [];
  skills.forEach((cat) => {
    cat.items.forEach((item) => allSkills.push({ name: item, category: cat.category }));
  });

  return (
    <div
      className="resume-a4-page p-10 font-sans text-neutral-800"
      style={{ fontSize: fontSizeBase }}
    >
      {/* Top Header */}
      <header className="resume-header mb-3">
        <h1
          className="text-[32px] font-bold tracking-tight leading-none"
          style={{ color: blueAccent }}
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

        {/* Thick full-width accent divider */}
        <div className="h-[2.5px] w-full mt-3 mb-4" style={{ backgroundColor: blueAccent }} />
      </header>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-[1fr_32%] gap-6 items-start">
        {/* Left Column: 68% */}
        <main className="space-y-4">
          {/* Summary */}
          {summary && (
            <section className="break-inside-avoid">
              <h2
                className="text-[13px] font-bold uppercase tracking-wider mb-1"
                style={{ color: blueAccent }}
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
            <section className="break-inside-avoid-page space-y-3">
              <h2
                className="text-[13px] font-bold uppercase tracking-wider mb-2"
                style={{ color: blueAccent }}
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
            <section className="break-inside-avoid space-y-2">
              <h2
                className="text-[13px] font-bold uppercase tracking-wider mb-1"
                style={{ color: blueAccent }}
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
                  {edu.details && edu.details.length > 0 && (
                    <BulletList bullets={edu.details} bulletStyle="dash" className="mt-1" itemClassName="text-[12px] text-neutral-600" />
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section className="break-inside-avoid-page space-y-3">
              <h2
                className="text-[13px] font-bold uppercase tracking-wider mb-2"
                style={{ color: blueAccent }}
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
        </main>

        {/* Right Column: 32% Light Blue-Gray Card */}
        <aside
          className="rounded-md p-4 space-y-5 break-inside-avoid"
          style={{ backgroundColor: "#F0F5FA" }}
        >
          {/* Skills */}
          {allSkills.length > 0 && (
            <div>
              <h2
                className="text-[12.5px] font-bold uppercase tracking-wider mb-2"
                style={{ color: blueAccent }}
              >
                Skills
              </h2>
              <div className="space-y-1 text-[13px] text-neutral-800">
                {allSkills.map((s, idx) => (
                  <div key={idx} className="leading-snug">{s.name}</div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2
                className="text-[12.5px] font-bold uppercase tracking-wider mb-2"
                style={{ color: blueAccent }}
              >
                Certifications
              </h2>
              <div className="space-y-2 text-[12.5px] text-neutral-800">
                {certifications.map((c, idx) => (
                  <div key={idx} className="leading-snug">
                    <div className="font-medium">{c.name}</div>
                    {c.issuer && <div className="text-[11px] text-neutral-500">{c.issuer}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <h2
                className="text-[12.5px] font-bold uppercase tracking-wider mb-2"
                style={{ color: blueAccent }}
              >
                Languages
              </h2>
              <div className="space-y-1 text-[12.5px] text-neutral-800">
                {languages.map((l, idx) => (
                  <div key={idx} className="leading-snug">
                    <span className="font-medium">{l.name}</span>
                    {l.level && <span className="text-neutral-600 text-[11.5px]"> ({l.level})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
