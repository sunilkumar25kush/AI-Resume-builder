import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText, ContactItem } from "./primitives";

/**
 * T6 - Right Sidebar Light
 * Mirrored layout of T2: 68% White Left Main, 32% Light Gray Right Sidebar (#F3F4F6).
 * Indigo accent (#4F46E5).
 * Skills rendered as pills.
 * Inter sans-serif typography.
 */
export function RightSidebarLight({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages, references } = resume;

  const indigo = theme.accentColor || "#4F46E5";
  const fontSizeBase = theme.fontSize || "14px";

  return (
    <div
      className="resume-a4-page resume-full-bleed font-sans flex text-neutral-800"
      style={{
        background: `linear-gradient(to right, #ffffff 68%, #F3F4F6 68%)`,
        fontSize: fontSizeBase,
      }}
    >
      {/* Left Column: 68% Main Content */}
      <main className="w-[68%] p-8 pt-8 flex flex-col gap-5 text-neutral-800 bg-white">
        {/* Header */}
        <header className="resume-header">
          <h1 className="text-[32px] font-extrabold tracking-tight text-neutral-900 leading-tight">
            {personal.fullName}
          </h1>

          {personal.title && (
            <p
              className="text-[14px] font-semibold tracking-wide uppercase mt-1"
              style={{ color: indigo }}
            >
              {personal.title}
            </p>
          )}

          {summary && (
            <div className="mt-3 text-[13px] text-neutral-700 leading-relaxed border-t border-neutral-200 pt-3 text-justify">
              <RichText text={summary} />
            </div>
          )}
        </header>

        {/* Experience */}
        {experience.length > 0 && (
          <section className="break-inside-avoid-page">
            <h2
              className="text-[13.5px] font-bold uppercase tracking-wider pb-1 mb-3"
              style={{ color: indigo, borderBottom: `2px solid ${indigo}` }}
            >
              Work Experience
            </h2>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline text-[14px]">
                    <span className="font-bold text-neutral-900">{exp.role}</span>
                    <DateRange startDate={exp.startDate} endDate={exp.endDate} className="text-[12.5px] text-neutral-500 font-medium" />
                  </div>
                  <div className="text-[12.5px] font-medium text-neutral-600 mb-1">
                    {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                  </div>
                  <BulletList
                    bullets={exp.bullets}
                    bulletStyle="dot"
                    bulletColor={indigo}
                    itemClassName="text-[13px] text-neutral-700 leading-snug"
                  />
                  {exp.technologies && (
                    <div className="text-[11.5px] text-neutral-500 mt-1">
                      <span className="font-medium text-neutral-700">Technologies: </span>
                      {exp.technologies}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="break-inside-avoid-page">
            <h2
              className="text-[13.5px] font-bold uppercase tracking-wider pb-1 mb-3"
              style={{ color: indigo, borderBottom: `2px solid ${indigo}` }}
            >
              Projects
            </h2>

            <div className="space-y-3.5">
              {projects.map((proj, idx) => (
                <div key={idx} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-neutral-900 text-[13.5px]">
                      {proj.name}
                      {proj.techStack && proj.techStack.length > 0 && (
                        <span className="font-normal text-neutral-500 text-[12px]"> ({proj.techStack.slice(0, 4).join(", ")})</span>
                      )}
                    </span>
                    {proj.links && proj.links.length > 0 && (
                      <span className="text-[11.5px] space-x-1.5">
                        {proj.links.map((l, lIdx) => (
                          <a
                            key={lIdx}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:opacity-80"
                            style={{ color: indigo }}
                          >
                            [{l.label}]
                          </a>
                        ))}
                      </span>
                    )}
                  </div>
                  <BulletList
                    bullets={proj.bullets}
                    bulletStyle="dot"
                    bulletColor={indigo}
                    itemClassName="text-[12.5px] text-neutral-700"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* References (if present) */}
        {references.length > 0 && (
          <section className="break-inside-avoid border-t border-neutral-200 pt-3">
            <h2
              className="text-[13px] font-bold uppercase tracking-wider mb-2"
              style={{ color: indigo }}
            >
              References
            </h2>
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              {references.map((ref, idx) => (
                <div key={idx} className="leading-snug">
                  <div className="font-bold text-neutral-900 text-[13px]">{ref.name}</div>
                  <div className="text-neutral-600">{ref.position}</div>
                  {ref.phone && <div className="text-neutral-500">{ref.phone}</div>}
                  {ref.email && <div className="text-neutral-500">{ref.email}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Right Sidebar: 32% Light Gray (#F3F4F6) */}
      <aside className="resume-sidebar w-[32%] shrink-0 bg-[#F3F4F6] p-6 pt-8 flex flex-col gap-6 text-neutral-800">
        {/* Circular photo (optional) */}
        {personal.photoUrl ? (
          <div className="flex justify-center mb-1">
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-[120px] h-[120px] rounded-full object-cover border-3 border-white shadow-sm"
            />
          </div>
        ) : null}

        {/* Contact Info */}
        <div className="break-inside-avoid">
          <h2
            className="text-[12.5px] font-bold uppercase tracking-wider pb-1 border-b"
            style={{ color: indigo, borderColor: `${indigo}33` }}
          >
            Contact
          </h2>
          <div className="mt-3 space-y-2 text-[12px] text-neutral-700">
            {personal.phone && (
              <ContactItem
                type="phone"
                value={personal.phone}
                iconBadge
                badgeClassName="w-5 h-5 bg-white text-indigo-700 shadow-xs"
              />
            )}
            {personal.email && (
              <ContactItem
                type="email"
                value={personal.email}
                iconBadge
                badgeClassName="w-5 h-5 bg-white text-indigo-700 shadow-xs"
              />
            )}
            {personal.location && (
              <ContactItem
                type="location"
                value={personal.location}
                iconBadge
                badgeClassName="w-5 h-5 bg-white text-indigo-700 shadow-xs"
              />
            )}
            {personal.linkedin && (
              <ContactItem
                type="linkedin"
                value={personal.linkedin}
                iconBadge
                badgeClassName="w-5 h-5 bg-white text-indigo-700 shadow-xs"
              />
            )}
            {personal.github && (
              <ContactItem
                type="github"
                value={personal.github}
                iconBadge
                badgeClassName="w-5 h-5 bg-white text-indigo-700 shadow-xs"
              />
            )}
            {personal.website && (
              <ContactItem
                type="website"
                value={personal.website}
                iconBadge
                badgeClassName="w-5 h-5 bg-white text-indigo-700 shadow-xs"
              />
            )}
          </div>
        </div>

        {/* Skills as Pills */}
        {skills.length > 0 && (
          <div className="break-inside-avoid">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: indigo, borderColor: `${indigo}33` }}
            >
              Skills
            </h2>
            <div className="mt-3 space-y-3">
              {skills.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="text-[11.5px] font-semibold text-neutral-600 uppercase tracking-wider">
                    {cat.category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-white text-indigo-900 border border-indigo-100 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education in Sidebar */}
        {education.length > 0 && (
          <div className="break-inside-avoid">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: indigo, borderColor: `${indigo}33` }}
            >
              Education
            </h2>
            <div className="mt-3 space-y-3 text-[12px]">
              {education.map((edu, idx) => (
                <div key={idx} className="leading-snug">
                  <div className="font-bold text-neutral-900 text-[12.5px]">{edu.degree}</div>
                  <div className="text-neutral-600">{edu.institution}</div>
                  <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-[11px] text-neutral-500 block mt-0.5" />
                  {edu.grade && <div className="text-[11px] italic text-neutral-500 mt-0.5">{edu.grade}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications in Sidebar */}
        {certifications.length > 0 && (
          <div className="break-inside-avoid">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: indigo, borderColor: `${indigo}33` }}
            >
              Certifications
            </h2>
            <div className="mt-2.5 space-y-2 text-[12px]">
              {certifications.map((c, idx) => (
                <div key={idx} className="leading-snug">
                  <div className="font-medium text-neutral-900">{c.name}</div>
                  {c.issuer && <div className="text-[11px] text-neutral-500">{c.issuer}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages in Sidebar */}
        {languages.length > 0 && (
          <div className="break-inside-avoid">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: indigo, borderColor: `${indigo}33` }}
            >
              Languages
            </h2>
            <div className="mt-2 space-y-1 text-[12px] text-neutral-700">
              {languages.map((l, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-medium">{l.name}</span>
                  <span className="text-neutral-500 text-[11px]">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
