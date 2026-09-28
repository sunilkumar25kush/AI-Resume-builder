import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText, ContactItem } from "./primitives";

/**
 * T7 - Banner Header
 * Full-width colored banner (#0F4C81) with name and title in white,
 * contact icons inside the banner;
 * body single column, section headings with a left accent border,
 * projects as bordered cards.
 */
export function BannerHeader({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages } = resume;

  const bannerColor = theme.accentColor || "#0F4C81";
  const fontSizeBase = theme.fontSize || "14px";

  return (
    <div
      className="resume-a4-page resume-full-bleed font-sans text-neutral-800 bg-white"
      style={{ fontSize: fontSizeBase }}
    >
      {/* Full-Width Colored Banner Header */}
      <header
        className="resume-header p-8 text-white"
        style={{ backgroundColor: bannerColor }}
      >
        <h1 className="text-[32px] font-extrabold tracking-tight leading-none text-white">
          {personal.fullName}
        </h1>

        {personal.title && (
          <p className="text-[14px] font-medium text-white/90 uppercase tracking-widest mt-1.5">
            {personal.title}
          </p>
        )}

        {/* Contact Icons Inside the Banner */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-[12.5px] text-white/90">
          {personal.phone && (
            <ContactItem
              type="phone"
              value={personal.phone}
              icon
              className="text-white"
              linkClassName="text-white hover:text-white/80"
            />
          )}
          {personal.email && (
            <ContactItem
              type="email"
              value={personal.email}
              icon
              className="text-white"
              linkClassName="text-white hover:text-white/80"
            />
          )}
          {personal.location && (
            <ContactItem
              type="location"
              value={personal.location}
              icon
              className="text-white"
            />
          )}
          {personal.linkedin && (
            <ContactItem
              type="linkedin"
              value={personal.linkedin}
              icon
              className="text-white"
              linkClassName="text-white hover:text-white/80"
            />
          )}
          {personal.github && (
            <ContactItem
              type="github"
              value={personal.github}
              icon
              className="text-white"
              linkClassName="text-white hover:text-white/80"
            />
          )}
          {personal.website && (
            <ContactItem
              type="website"
              value={personal.website}
              icon
              className="text-white"
              linkClassName="text-white hover:text-white/80"
            />
          )}
        </div>
      </header>

      {/* Body: Single Column */}
      <main className="p-8 pt-6 space-y-5">
        {/* Summary */}
        {summary && (
          <section className="break-inside-avoid">
            <h2
              className="text-[13.5px] font-bold uppercase tracking-wider pl-3 py-0.5 mb-2 border-l-4"
              style={{ borderColor: bannerColor, color: bannerColor }}
            >
              Professional Summary
            </h2>
            <p className="text-[13px] text-neutral-700 leading-relaxed text-justify">
              <RichText text={summary} />
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="break-inside-avoid-page space-y-3.5">
            <h2
              className="text-[13.5px] font-bold uppercase tracking-wider pl-3 py-0.5 mb-2 border-l-4"
              style={{ borderColor: bannerColor, color: bannerColor }}
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
                    bulletColor={bannerColor}
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

        {/* Projects as Bordered Cards */}
        {projects.length > 0 && (
          <section className="break-inside-avoid-page">
            <h2
              className="text-[13.5px] font-bold uppercase tracking-wider pl-3 py-0.5 mb-3 border-l-4"
              style={{ borderColor: bannerColor, color: bannerColor }}
            >
              Key Projects
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-neutral-200 p-3.5 bg-neutral-50/40 break-inside-avoid"
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
                              style={{ color: bannerColor }}
                            >
                              [{l.label}]
                            </a>
                          ))}
                        </span>
                      )}
                    </div>
                    {proj.date && <span className="text-[12px] text-neutral-500">{proj.date}</span>}
                  </div>

                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="text-[12px] font-medium mb-1.5" style={{ color: bannerColor }}>
                      Stack: {proj.techStack.join(", ")}
                    </div>
                  )}

                  <BulletList
                    bullets={proj.bullets}
                    bulletStyle="dot"
                    bulletColor={bannerColor}
                    itemClassName="text-[12.5px] text-neutral-700"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Skills */}
        {skills.length > 0 && (
          <section className="break-inside-avoid">
            <h2
              className="text-[13.5px] font-bold uppercase tracking-wider pl-3 py-0.5 mb-2 border-l-4"
              style={{ borderColor: bannerColor, color: bannerColor }}
            >
              Skills
            </h2>
            <div className="space-y-1.5 text-[13px] text-neutral-800">
              {skills.map((cat, idx) => (
                <div key={idx} className="leading-snug">
                  <strong className="font-bold text-neutral-900">{cat.category}: </strong>
                  <span>{cat.items.join(" · ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="break-inside-avoid">
            <h2
              className="text-[13.5px] font-bold uppercase tracking-wider pl-3 py-0.5 mb-2 border-l-4"
              style={{ borderColor: bannerColor, color: bannerColor }}
            >
              Education
            </h2>
            <div className="space-y-3 text-[13px]">
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
          <div className="grid grid-cols-2 gap-6 break-inside-avoid pt-1">
            {certifications.length > 0 && (
              <section>
                <h2
                  className="text-[13.5px] font-bold uppercase tracking-wider pl-3 py-0.5 mb-2 border-l-4"
                  style={{ borderColor: bannerColor, color: bannerColor }}
                >
                  Certifications
                </h2>
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
                <h2
                  className="text-[13.5px] font-bold uppercase tracking-wider pl-3 py-0.5 mb-2 border-l-4"
                  style={{ borderColor: bannerColor, color: bannerColor }}
                >
                  Languages
                </h2>
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
      </main>
    </div>
  );
}
