import React from "react";
import { normalizeResume } from "./normalizeResume";
import { DateRange, RichText } from "./primitives";

/**
 * T8 - Compact Fresher ATS
 * Pure black & white, standard Arial/Helvetica font, ultra-compact.
 * Education and Projects placed BEFORE experience (fresher-optimized order).
 * Skills as one-line `Label: items` rows.
 * Maximum ATS parser compliance.
 */
export function CompactFresherAts({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages } = resume;

  const fontSizeBase = theme.fontSize || "13px";

  const contactParts = [
    personal.phone,
    personal.email,
    personal.location,
    personal.linkedin ? personal.linkedin.replace(/^https?:\/\/(www\.)?/, "") : null,
    personal.github ? personal.github.replace(/^https?:\/\/(www\.)?/, "") : null,
    personal.website ? personal.website.replace(/^https?:\/\/(www\.)?/, "") : null,
  ].filter(Boolean);

  return (
    <div
      className="resume-a4-page resume-single-col p-8 text-black bg-white"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: fontSizeBase,
        lineHeight: 1.3,
        color: "#000000",
      }}
    >
      {/* Header */}
      <header className="resume-header text-center mb-3">
        <h1 className="text-[24pt] font-bold uppercase tracking-tight text-black leading-none">
          {personal.fullName}
        </h1>

        {contactParts.length > 0 && (
          <p className="text-[9.5pt] text-black mt-1">
            {contactParts.join(" | ")}
          </p>
        )}

        <div className="w-full h-[1px] bg-black mt-2 mb-2" />
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-2.5 break-inside-avoid">
          <h2 className="text-[10pt] font-bold uppercase text-black border-b border-black pb-0.5 mb-1">
            Summary
          </h2>
          <p className="text-[9.5pt] leading-tight text-justify text-black">
            <RichText text={summary} />
          </p>
        </section>
      )}

      {/* 1. Education (FIRST for freshers) */}
      {education.length > 0 && (
        <section className="mb-2.5 break-inside-avoid">
          <h2 className="text-[10pt] font-bold uppercase text-black border-b border-black pb-0.5 mb-1">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu, idx) => (
              <div key={idx} className="break-inside-avoid text-[9.5pt]">
                <div className="flex justify-between items-baseline font-bold text-black">
                  <span>{edu.institution}{edu.location ? `, ${edu.location}` : ""}</span>
                  <DateRange startDate={edu.startDate} endDate={edu.endDate} />
                </div>
                <div className="flex justify-between items-baseline text-black">
                  <span>{edu.degree}</span>
                  {edu.grade && <span className="italic">{edu.grade}</span>}
                </div>
                {edu.details && edu.details.length > 0 && (
                  <ul className="list-disc pl-4 mt-0.5 space-y-[2px] text-[9pt]">
                    {edu.details.map((d, dIdx) => (
                      <li key={dIdx}><RichText text={d} /></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Projects (SECOND for freshers) */}
      {projects.length > 0 && (
        <section className="mb-2.5 break-inside-avoid-page">
          <h2 className="text-[10pt] font-bold uppercase text-black border-b border-black pb-0.5 mb-1">
            Academic & Personal Projects
          </h2>
          <div className="space-y-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="break-inside-avoid text-[9.5pt]">
                <div className="flex justify-between items-baseline">
                  <div>
                    <strong className="font-bold text-black">{proj.name}</strong>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <span className="text-black"> | <em>{proj.techStack.join(", ")}</em></span>
                    )}
                  </div>
                  {proj.date && <span className="text-black font-semibold text-[9pt]">{proj.date}</span>}
                </div>

                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc pl-4 mt-0.5 space-y-[2px] text-[9pt] leading-tight">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}><RichText text={b} /></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Experience (THIRD for freshers) */}
      {experience.length > 0 && (
        <section className="mb-2.5 break-inside-avoid-page">
          <h2 className="text-[10pt] font-bold uppercase text-black border-b border-black pb-0.5 mb-1">
            Experience / Internships
          </h2>
          <div className="space-y-2">
            {experience.map((exp, idx) => (
              <div key={idx} className="break-inside-avoid text-[9.5pt]">
                <div className="flex justify-between items-baseline font-bold text-black">
                  <span>{exp.company}{exp.location ? `, ${exp.location}` : ""}</span>
                  <DateRange startDate={exp.startDate} endDate={exp.endDate} />
                </div>
                <div className="font-semibold text-black italic text-[9.5pt] mb-0.5">
                  {exp.role}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc pl-4 mt-0.5 space-y-[2px] text-[9pt] leading-tight">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}><RichText text={b} /></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Skills as one-line `Label: items` rows */}
      {skills.length > 0 && (
        <section className="mb-2.5 break-inside-avoid">
          <h2 className="text-[10pt] font-bold uppercase text-black border-b border-black pb-0.5 mb-1">
            Technical Skills
          </h2>
          <div className="space-y-0.5 text-[9.5pt] text-black">
            {skills.map((cat, idx) => (
              <div key={idx} className="leading-tight">
                <strong>{cat.category}: </strong>
                <span>{cat.items.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Certifications & Languages */}
      {certifications.length > 0 && (
        <section className="mb-2.5 break-inside-avoid">
          <h2 className="text-[10pt] font-bold uppercase text-black border-b border-black pb-0.5 mb-1">
            Certifications
          </h2>
          <ul className="list-disc pl-4 space-y-[2px] text-[9pt]">
            {certifications.map((c, idx) => (
              <li key={idx}>
                <strong>{c.name}</strong>{c.issuer ? ` – ${c.issuer}` : ""}{c.date ? ` (${c.date})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {languages.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="text-[10pt] font-bold uppercase text-black border-b border-black pb-0.5 mb-1">
            Languages
          </h2>
          <p className="text-[9pt] text-black">
            {languages.map((l) => `${l.name} (${l.level || "basic"})`).join(" | ")}
          </p>
        </section>
      )}
    </div>
  );
}
