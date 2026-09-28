import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText } from "./primitives";

/**
 * T10 - Elegant Serif Gold
 * Centered name in Playfair Display, thin gold (#B08D57) divider,
 * headings centered with side lines (— Experience —),
 * body in Lora, muted brown-gray text.
 */
export function ElegantSerifGold({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages } = resume;

  const gold = theme.accentColor || "#B08D57";
  const fontSizeBase = theme.fontSize || "14px";

  const contactParts = [
    personal.location,
    personal.phone,
    personal.email,
    personal.linkedin ? personal.linkedin.replace(/^https?:\/\/(www\.)?/, "") : null,
    personal.github ? personal.github.replace(/^https?:\/\/(www\.)?/, "") : null,
    personal.website ? personal.website.replace(/^https?:\/\/(www\.)?/, "") : null,
  ].filter(Boolean);

  return (
    <div
      className="resume-a4-page resume-single-col font-lora p-10 bg-white"
      style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: fontSizeBase,
        color: "#443E3D",
      }}
    >
      {/* Header: Playfair Display Centered Name */}
      <header className="resume-header text-center mb-6">
        <h1
          className="font-playfair text-[32pt] font-normal tracking-wide leading-tight text-neutral-900"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {personal.fullName}
        </h1>

        {personal.title && (
          <p
            className="text-[13px] uppercase tracking-[0.2em] font-medium mt-1"
            style={{ color: gold }}
          >
            {personal.title}
          </p>
        )}

        {/* Thin Gold Divider */}
        <div
          className="w-24 h-[1px] mx-auto my-2.5"
          style={{ backgroundColor: gold }}
        />

        {contactParts.length > 0 && (
          <p className="text-[12px] text-neutral-600 tracking-wide">
            {contactParts.join("  •  ")}
          </p>
        )}
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6 break-inside-avoid">
          {/* Centered Heading with side lines */}
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: gold }}
            >
              Summary
            </h2>
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
          </div>

          <p className="text-[13px] leading-relaxed text-justify text-neutral-700 px-4">
            <RichText text={summary} />
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6 break-inside-avoid-page space-y-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: gold }}
            >
              Experience
            </h2>
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
          </div>

          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="break-inside-avoid">
                <div className="flex justify-between items-baseline text-[14px]">
                  <span className="font-bold text-neutral-900">{exp.role}</span>
                  <DateRange startDate={exp.startDate} endDate={exp.endDate} className="text-[12px] text-neutral-500 italic" />
                </div>
                <div className="text-[13px] italic text-neutral-600 mb-1.5">
                  {exp.company}{exp.location ? `, ${exp.location}` : ""}
                </div>
                <BulletList
                  bullets={exp.bullets}
                  bulletStyle="dot"
                  bulletColor={gold}
                  itemClassName="text-[13px] text-neutral-700 leading-snug"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6 break-inside-avoid-page">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: gold }}
            >
              Projects
            </h2>
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
          </div>

          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-neutral-900 text-[14px]">
                    {proj.name}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <span className="italic text-neutral-500 font-normal text-[12px]"> ({proj.techStack.join(", ")})</span>
                    )}
                  </span>
                  {proj.date && <span className="text-[12px] text-neutral-500 italic">{proj.date}</span>}
                </div>
                <BulletList
                  bullets={proj.bullets}
                  bulletStyle="dot"
                  bulletColor={gold}
                  itemClassName="text-[13px] text-neutral-700 leading-snug"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: gold }}
            >
              Expertise
            </h2>
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
          </div>

          <div className="space-y-1.5 text-[13px] text-neutral-700 text-center">
            {skills.map((cat, idx) => (
              <div key={idx} className="leading-snug">
                <strong className="font-bold text-neutral-900">{cat.category}: </strong>
                <span>{cat.items.join("  •  ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: gold }}
            >
              Education
            </h2>
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
          </div>

          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="break-inside-avoid text-center">
                <div className="font-bold text-neutral-900 text-[14px]">{edu.degree}</div>
                <div className="text-[13px] italic text-neutral-600">
                  {edu.institution}{edu.location ? `, ${edu.location}` : ""}
                </div>
                <div className="text-[12px] text-neutral-500 mt-0.5">
                  <DateRange startDate={edu.startDate} endDate={edu.endDate} />
                </div>
                {edu.grade && <div className="text-[12px] text-neutral-600 italic mt-0.5">{edu.grade}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages */}
      {(certifications.length > 0 || languages.length > 0) && (
        <section className="break-inside-avoid pt-1">
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: gold }}
            >
              Credentials & Languages
            </h2>
            <span className="h-[1px] w-12" style={{ backgroundColor: gold }} />
          </div>

          <div className="text-center text-[12.5px] text-neutral-700 space-y-1">
            {certifications.map((c, idx) => (
              <div key={idx}>
                <strong>{c.name}</strong>{c.issuer ? ` (${c.issuer})` : ""}
              </div>
            ))}
            {languages.length > 0 && (
              <div className="text-neutral-600 mt-1">
                {languages.map((l) => `${l.name} (${l.level || "fluent"})`).join("  •  ")}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
