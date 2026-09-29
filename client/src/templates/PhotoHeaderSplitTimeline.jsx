import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText, Icon } from "./primitives";

/**
 * T4 - Photo Header, Split Timeline (Reference C)
 * Header: 140x140 rounded photo on left, bold Montserrat 700 name on right,
 * contact row between thin rules, dob/address details.
 * Experience: 2-column row layout (Left 28% date & company, Right 72% role & bullets).
 * Skills: 4-column bullet grid.
 * References: 2 blocks side by side at the bottom.
 * Font: Open Sans / Montserrat, dark gray text (#222).
 */
export function PhotoHeaderSplitTimeline({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages, references } = resume;

  const accent = theme.accentColor || "#222222";
  const fontSizeBase = theme.fontSize || "14px";

  // Flatten skills for the 4-column bullet grid
  const allSkills = [];
  skills.forEach((cat) => {
    cat.items.forEach((item) => allSkills.push(item));
  });

  return (
    <div
      className="resume-a4-page resume-single-col font-opensans p-10 text-[#222222] bg-white"
      style={{ fontSize: fontSizeBase }}
    >
      {/* Header: Photo Left, Info Right */}
      <header className="resume-header flex gap-6 items-start mb-6">
        {/* Rounded-corner photo (approx 140x140) */}
        {personal.photoUrl ? (
          <div className="shrink-0">
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-[140px] h-[140px] rounded-2xl object-cover shadow-sm border border-neutral-200"
            />
          </div>
        ) : null}

        {/* Right Info Block */}
        <div className="flex-1 min-w-0">
          <h1
            className="font-montserrat text-[28pt] font-extrabold uppercase tracking-wide leading-none text-[#222222]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {personal.fullName}
          </h1>

          {personal.title && (
            <p className="text-[14px] text-neutral-500 font-normal uppercase tracking-wider mt-1.5">
              {personal.title}
            </p>
          )}

          {/* Thin Rule */}
          <div className="h-[1px] w-full bg-neutral-200 my-2.5" />

          {/* Phone & Email Row in larger text */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13.5px] font-medium text-[#222222]">
            {personal.phone && (
              <a
                href={`tel:${personal.phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-1.5 hover:underline"
              >
                <Icon name="phone" size={14} className="text-neutral-500" />
                <span>{personal.phone}</span>
              </a>
            )}
            {personal.email && (
              <a
                href={`mailto:${personal.email}`}
                className="flex items-center gap-1.5 hover:underline"
              >
                <Icon name="mail" size={14} className="text-neutral-500" />
                <span>{personal.email}</span>
              </a>
            )}
            {personal.website && (
              <a
                href={personal.website.startsWith("http") ? personal.website : `https://${personal.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:underline text-neutral-600"
              >
                <Icon name="website" size={14} className="text-neutral-500" />
                <span>{personal.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </a>
            )}
          </div>

          {/* Second Thin Rule */}
          <div className="h-[1px] w-full bg-neutral-200 my-2.5" />

          {/* Small bold lines: dob, location, availability */}
          <div className="flex flex-wrap items-center gap-x-5 text-[11.5px] font-bold text-neutral-600">
            {personal.location && (
              <div className="flex items-center gap-1">
                <span className="uppercase text-neutral-400 font-semibold">Address:</span>
                <span>{personal.location}</span>
              </div>
            )}
            {personal.dob && (
              <div className="flex items-center gap-1">
                <span className="uppercase text-neutral-400 font-semibold">DOB:</span>
                <span>{personal.dob}</span>
              </div>
            )}
            {personal.availability && (
              <div className="flex items-center gap-1">
                <span className="uppercase text-neutral-400 font-semibold">Availability:</span>
                <span>{personal.availability}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* About Me */}
      {summary && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-montserrat text-[13.5pt] font-extrabold uppercase tracking-wider text-[#222222] border-b border-neutral-300 pb-1 mb-2">
            About Me
          </h2>
          <p className="text-[13px] leading-relaxed text-justify text-[#333333]">
            <RichText text={summary} />
          </p>
        </section>
      )}

      {/* Experience (Split 2-Column: Left 28% Date & Company, Right 72% Role & Bullets) */}
      {experience.length > 0 && (
        <section className="mb-6 break-inside-avoid-page">
          <h2 className="font-montserrat text-[13.5pt] font-extrabold uppercase tracking-wider text-[#222222] border-b border-neutral-300 pb-1 mb-3">
            Experience
          </h2>

          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="grid grid-cols-[28%_72%] gap-4 break-inside-avoid items-start">
                {/* Left 28%: Date Range and Company */}
                <div className="text-[12.5px] text-neutral-600 leading-snug">
                  <DateRange startDate={exp.startDate} endDate={exp.endDate} className="font-medium text-neutral-700 block" />
                  <div className="font-normal text-neutral-500 mt-0.5">{exp.company}</div>
                  {exp.location && <div className="text-[11px] text-neutral-400">{exp.location}</div>}
                </div>

                {/* Right 72%: Role in bold with bullets */}
                <div>
                  <div className="font-bold text-[#222222] text-[14px] mb-1">
                    {exp.role}
                  </div>
                  <BulletList
                    bullets={exp.bullets}
                    bulletStyle="dot"
                    bulletColor={accent}
                    itemClassName="text-[12.5px] text-[#333333] leading-snug"
                  />
                  {exp.technologies && (
                    <div className="text-[11.5px] text-neutral-500 mt-1">
                      <span className="font-medium text-neutral-700">Technologies:</span> {exp.technologies}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6 break-inside-avoid-page">
          <h2 className="font-montserrat text-[13.5pt] font-extrabold uppercase tracking-wider text-[#222222] border-b border-neutral-300 pb-1 mb-3">
            Key Projects
          </h2>
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="grid grid-cols-[28%_72%] gap-4 break-inside-avoid items-start">
                <div className="text-[12.5px] text-neutral-600">
                  {proj.date && <span className="font-medium text-neutral-700 block">{proj.date}</span>}
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="text-[11px] text-neutral-400 mt-0.5">{proj.techStack.slice(0, 3).join(", ")}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[#222222] text-[14px]">{proj.name}</span>
                    {proj.links && proj.links.length > 0 && (
                      <span className="text-[11px] space-x-1.5 text-neutral-500">
                        {proj.links.map((l, lIdx) => (
                          <a
                            key={lIdx}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-black"
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
                    itemClassName="text-[12.5px] text-[#333333] leading-snug"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills: 4-Column Bullet Grid */}
      {allSkills.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-montserrat text-[13.5pt] font-extrabold uppercase tracking-wider text-[#222222] border-b border-neutral-300 pb-1 mb-2.5">
            Skills
          </h2>
          <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-[12.5px] text-[#333333]">
            {allSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1.5 leading-tight truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" aria-hidden="true" />
                <span className="truncate">{skill}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-montserrat text-[13.5pt] font-extrabold uppercase tracking-wider text-[#222222] border-b border-neutral-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="grid grid-cols-[28%_72%] gap-4 break-inside-avoid items-start">
                <div className="text-[12.5px] text-neutral-600">
                  <DateRange startDate={edu.startDate} endDate={edu.endDate} className="font-medium text-neutral-700 block" />
                  <div className="text-[11px] text-neutral-400">{edu.location}</div>
                </div>
                <div>
                  <div className="font-bold text-[#222222] text-[13.5px]">{edu.degree}</div>
                  <div className="text-[12.5px] text-neutral-600">{edu.institution}</div>
                  {edu.grade && <div className="text-[11.5px] italic text-neutral-500 mt-0.5">{edu.grade}</div>}
                  {edu.details && edu.details.length > 0 && (
                    <BulletList bullets={edu.details} bulletStyle="dot" className="mt-1" itemClassName="text-[12px] text-neutral-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* References: 2 Blocks Side by Side */}
      {references.length > 0 && (
        <section className="break-inside-avoid mt-4">
          <h2 className="font-montserrat text-[13.5pt] font-extrabold uppercase tracking-wider text-[#222222] border-b border-neutral-300 pb-1 mb-3">
            References
          </h2>
          <div className="grid grid-cols-2 gap-6 text-[12.5px]">
            {references.slice(0, 2).map((ref, idx) => (
              <div key={idx} className="leading-snug">
                <div className="font-bold text-[#222222] text-[13.5px]">{ref.name}</div>
                <div className="text-neutral-600 font-medium">{ref.position}</div>
                {ref.phone && <div className="text-neutral-500 mt-0.5">Phone: {ref.phone}</div>}
                {ref.email && <div className="text-neutral-500">Email: {ref.email}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
