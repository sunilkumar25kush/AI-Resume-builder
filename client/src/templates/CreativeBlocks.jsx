import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText, ContactItem } from "./primitives";

/**
 * T9 - Creative Blocks
 * Section headings inside filled rounded pill/blocks (accent purple #7C3AED, white text).
 * Name large with accent-colored last name.
 * Skills rendered as rounded tags.
 * Projects displayed as light cards with a colored top border.
 */
export function CreativeBlocks({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages } = resume;

  const purple = theme.accentColor || "#7C3AED";
  const fontSizeBase = theme.fontSize || "14px";

  // Split name to color the last name
  const nameParts = personal.fullName.split(" ");
  const firstName = nameParts[0] || personal.fullName;
  const lastName = nameParts.slice(1).join(" ");

  return (
    <div
      className="resume-a4-page resume-single-col p-10 font-sans text-neutral-800 bg-white"
      style={{ fontSize: fontSizeBase }}
    >
      {/* Header: Name with purple surname */}
      <header className="resume-header mb-6">
        <h1 className="text-[34px] font-extrabold tracking-tight leading-none text-neutral-900">
          <span>{firstName} </span>
          {lastName && <span style={{ color: purple }}>{lastName}</span>}
        </h1>

        {personal.title && (
          <p className="text-[14px] font-semibold tracking-wider uppercase text-neutral-500 mt-1.5">
            {personal.title}
          </p>
        )}

        {/* Contact items row with subtle pill backgrounds */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-[12px] text-neutral-600">
          {personal.email && (
            <ContactItem
              type="email"
              value={personal.email}
              iconBadge
              badgeClassName="w-5 h-5 bg-purple-50 text-purple-700"
              linkClassName="hover:underline"
            />
          )}
          {personal.phone && (
            <ContactItem
              type="phone"
              value={personal.phone}
              iconBadge
              badgeClassName="w-5 h-5 bg-purple-50 text-purple-700"
              linkClassName="hover:underline"
            />
          )}
          {personal.location && (
            <ContactItem
              type="location"
              value={personal.location}
              iconBadge
              badgeClassName="w-5 h-5 bg-purple-50 text-purple-700"
            />
          )}
          {personal.linkedin && (
            <ContactItem
              type="linkedin"
              value={personal.linkedin}
              iconBadge
              badgeClassName="w-5 h-5 bg-purple-50 text-purple-700"
              linkClassName="hover:underline"
            />
          )}
          {personal.github && (
            <ContactItem
              type="github"
              value={personal.github}
              iconBadge
              badgeClassName="w-5 h-5 bg-purple-50 text-purple-700"
              linkClassName="hover:underline"
            />
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6 break-inside-avoid">
          <div className="mb-2">
            <span
              className="inline-block rounded-full px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: purple }}
            >
              About Me
            </span>
          </div>
          <p className="text-[13px] text-neutral-700 leading-relaxed text-justify pl-1">
            <RichText text={summary} />
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6 break-inside-avoid-page space-y-4">
          <div className="mb-1">
            <span
              className="inline-block rounded-full px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: purple }}
            >
              Experience
            </span>
          </div>

          <div className="space-y-4 pl-1">
            {experience.map((exp, idx) => (
              <div key={idx} className="break-inside-avoid">
                <div className="flex justify-between items-baseline text-[14px]">
                  <span className="font-bold text-neutral-900">{exp.role}</span>
                  <DateRange startDate={exp.startDate} endDate={exp.endDate} className="text-[12px] text-neutral-500 font-medium" />
                </div>
                <div className="text-[12.5px] font-medium text-neutral-600 mb-1.5">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                </div>
                <BulletList
                  bullets={exp.bullets}
                  bulletStyle="dot"
                  bulletColor={purple}
                  itemClassName="text-[13px] text-neutral-700 leading-snug"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects as Cards with colored top border */}
      {projects.length > 0 && (
        <section className="mb-6 break-inside-avoid-page">
          <div className="mb-3">
            <span
              className="inline-block rounded-full px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: purple }}
            >
              Featured Projects
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 pl-1">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-b-lg border border-neutral-200 border-t-4 p-4 bg-neutral-50/60 shadow-2xs break-inside-avoid"
                style={{ borderTopColor: purple }}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-neutral-900 text-[14px]">{proj.name}</span>
                    {proj.links && proj.links.length > 0 && (
                      <span className="text-[11.5px] space-x-1.5">
                        {proj.links.map((l, lIdx) => (
                          <a
                            key={lIdx}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:opacity-80"
                            style={{ color: purple }}
                          >
                            [{l.label}]
                          </a>
                        ))}
                      </span>
                    )}
                  </div>
                  {proj.date && <span className="text-[12px] text-neutral-500 font-medium">{proj.date}</span>}
                </div>

                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="text-[12px] font-medium mb-2" style={{ color: purple }}>
                    Tech Stack: {proj.techStack.join(", ")}
                  </div>
                )}

                <BulletList
                  bullets={proj.bullets}
                  bulletStyle="dot"
                  bulletColor={purple}
                  itemClassName="text-[12.5px] text-neutral-700 leading-snug"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills as Rounded Tags */}
      {skills.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <div className="mb-3">
            <span
              className="inline-block rounded-full px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: purple }}
            >
              Skills
            </span>
          </div>

          <div className="space-y-2.5 pl-1">
            {skills.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[12px] font-semibold text-neutral-600 uppercase tracking-wider">
                  {cat.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, i) => (
                    <span
                      key={i}
                      className="rounded-lg px-2.5 py-0.5 text-[11.5px] font-medium border"
                      style={{
                        backgroundColor: "#F5F3FF",
                        color: purple,
                        borderColor: "#DDD6FE",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <div className="mb-2.5">
            <span
              className="inline-block rounded-full px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: purple }}
            >
              Education
            </span>
          </div>

          <div className="space-y-3 pl-1 text-[13px]">
            {education.map((edu, idx) => (
              <div key={idx} className="break-inside-avoid">
                <div className="flex justify-between items-baseline text-[13.5px]">
                  <span className="font-bold text-neutral-900">{edu.degree}</span>
                  <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-[12px] text-neutral-500" />
                </div>
                <div className="text-[12.5px] text-neutral-600">
                  {edu.institution}{edu.location ? ` · ${edu.location}` : ""}
                </div>
                {edu.grade && <div className="text-[12px] italic text-neutral-500 mt-0.5">{edu.grade}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages */}
      {(certifications.length > 0 || languages.length > 0) && (
        <div className="grid grid-cols-2 gap-6 break-inside-avoid pl-1">
          {certifications.length > 0 && (
            <section>
              <div className="mb-2">
                <span
                  className="inline-block rounded-full px-3 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-white shadow-xs"
                  style={{ backgroundColor: purple }}
                >
                  Certifications
                </span>
              </div>
              <div className="space-y-1 text-[12.5px] text-neutral-700">
                {certifications.map((c, idx) => (
                  <div key={idx}>
                    <strong>{c.name}</strong>{c.issuer ? ` (${c.issuer})` : ""}
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <div className="mb-2">
                <span
                  className="inline-block rounded-full px-3 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-white shadow-xs"
                  style={{ backgroundColor: purple }}
                >
                  Languages
                </span>
              </div>
              <div className="space-y-1 text-[12.5px] text-neutral-700">
                {languages.map((l, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="font-medium text-neutral-900">{l.name}</span>
                    <span className="text-neutral-500">{l.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
