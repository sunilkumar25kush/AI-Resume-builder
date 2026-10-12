import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, ContactItem, HeaderContactRow } from "./primitives";

/**
 * T5 - Dense Analyst Serif (Reference D)
 * Centered small-caps 30pt name, location below, contact row with icons and underlined links.
 * Profile Summary as bullets.
 * Relevant Coursework as a 4-column bullet grid.
 * Experience: bold role left, bold date right, dense bullets with bold metrics.
 * Projects: **Name** | *tech stack italic* | [blue link] on one line with date right.
 * Technical Skills as **Label**: items lines on their own rows.
 * Education: bold institution + date right, italic degree + location right.
 * Certifications with blue "View Credentials" links.
 * Tight vertical rhythm.
 */
export function DenseAnalystSerif({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const {
    personal,
    summary,
    experience,
    education,
    projects,
    skills,
    coursework,
    certifications,
    languages,
    awards,
    customSections,
  } = resume;

  const fontSizeBase = theme.fontSize || "13.5px";

  // Summary bullets: if summary has newlines, split; otherwise render as bullet
  const summaryBullets = summary
    ? summary.split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean)
    : [];

  const renderContactItem = (key) => {
    switch (key) {
      case "email":
        return personal.email ? (
          <ContactItem
            key="email"
            type="email"
            value={personal.email}
            icon
            className="text-neutral-800"
            linkClassName="underline hover:text-black"
          />
        ) : null;
      case "phone":
        return personal.phone ? (
          <ContactItem
            key="phone"
            type="phone"
            value={personal.phone}
            icon
            className="text-neutral-800"
            linkClassName="underline hover:text-black"
          />
        ) : null;
      case "location":
        return personal.location ? (
          <ContactItem
            key="location"
            type="location"
            value={personal.location}
            icon
            className="text-neutral-800"
          />
        ) : null;
      case "linkedin":
        return personal.linkedin ? (
          <ContactItem
            key="linkedin"
            type="linkedin"
            value={personal.linkedin}
            href={personal.linkedinUrl}
            icon
            className="text-neutral-800"
            linkClassName="underline hover:text-blue-700"
          />
        ) : null;
      case "github":
        return personal.github ? (
          <ContactItem
            key="github"
            type="github"
            value={personal.github}
            href={personal.githubUrl}
            icon
            className="text-neutral-800"
            linkClassName="underline hover:text-blue-700"
          />
        ) : null;
      case "website":
        return personal.website ? (
          <ContactItem
            key="website"
            type="website"
            value={personal.website}
            href={personal.websiteUrl}
            icon
            className="text-neutral-800"
            linkClassName="underline hover:text-blue-700"
          />
        ) : null;
      default:
        return null;
    }
  };

  const contactKeys = personal.contactOrder || ["location", "linkedin", "github", "website", "phone", "email"];

  return (
    <div
      className="resume-a4-page resume-single-col font-garamond p-9 text-neutral-900 bg-white"
      style={{
        fontFamily: "'EB Garamond', Garamond, Georgia, serif",
        fontSize: fontSizeBase,
        lineHeight: 1.35,
      }}
    >
      {/* Centered Small-Caps Header */}
      <header className="resume-header text-center mb-3">
        <h1
          className="text-[30pt] font-semibold tracking-wider text-black leading-none"
          style={{ fontVariant: "small-caps" }}
        >
          {personal.fullName}
        </h1>

        {personal.title && (
          <p className="text-[13pt] italic text-neutral-800 mt-1 font-normal tracking-wide">
            {personal.title}
          </p>
        )}

        <HeaderContactRow
          personal={personal}
          className="mt-1 text-[9.5pt] text-neutral-800"
          defaultSeparator="|"
        />
      </header>

      {/* Dynamic Sections Rendered in User Order */}
      {(() => {
        const sectionRenderers = {
          summary: summaryBullets.length > 0 ? (
            <section key="summary" className="mb-3 break-inside-avoid">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1.5">
                Profile Summary
              </h2>
              <BulletList
                bullets={summaryBullets}
                bulletStyle="dot"
                itemClassName="text-[10pt] text-neutral-800 space-y-0.5"
              />
            </section>
          ) : null,

          education: education.length > 0 ? (
            <section key="education" className="mb-3 break-inside-avoid">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1.5">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="break-inside-avoid text-[10pt]">
                    <div className="flex justify-between items-baseline">
                      <strong className="font-bold text-neutral-900">{edu.institution}</strong>
                      <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-neutral-700 font-medium" />
                    </div>
                    <div className="flex justify-between items-baseline italic text-neutral-700">
                      <span>{edu.degree}</span>
                      {edu.location && <span>{edu.location}</span>}
                    </div>
                    {edu.grade && (
                      <p className="text-[9.5pt] text-neutral-600 mt-0.5">
                        <strong>Honors / GPA:</strong> {edu.grade}
                      </p>
                    )}
                    {edu.details && edu.details.length > 0 && (
                      <BulletList
                        bullets={edu.details}
                        bulletStyle="dot"
                        className="mt-0.5"
                        itemClassName="text-[9.5pt] text-neutral-700"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : null,

          coursework: coursework && coursework.length > 0 ? (
            <section key="coursework" className="mb-3 break-inside-avoid">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1.5">
                Relevant Coursework
              </h2>
              <div className="grid grid-cols-4 gap-x-3 gap-y-0.5 text-[9.5pt] text-neutral-800 pl-1">
                {coursework.map((course, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 rounded-full bg-neutral-800 shrink-0" aria-hidden="true" />
                    <span className="truncate">{course}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null,

          experience: experience.length > 0 ? (
            <section key="experience" className="mb-3 break-inside-avoid-page">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1.5">
                Experience
              </h2>
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div key={idx} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline text-[10.5pt]">
                      <div>
                        <strong className="font-bold text-neutral-900">{exp.company}</strong>
                        <span className="text-neutral-700"> – {exp.role}</span>
                        {exp.location ? <span className="text-neutral-500 text-[9.5pt]"> ({exp.location})</span> : null}
                      </div>
                      <DateRange startDate={exp.startDate} endDate={exp.endDate} className="font-bold text-neutral-800 text-[10pt]" />
                    </div>

                    <BulletList
                      bullets={exp.bullets}
                      bulletStyle="dot"
                      className="mt-0.5 space-y-[2px]"
                      itemClassName="text-[10pt] text-neutral-800 leading-snug"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null,

          projects: projects.length > 0 ? (
            <section key="projects" className="mb-3 break-inside-avoid-page">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1.5">
                Selected Projects
              </h2>
              <div className="space-y-2.5">
                {projects.map((proj, idx) => (
                  <div key={idx} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline text-[10.5pt]">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <strong className="font-bold text-neutral-900">{proj.name}</strong>
                        {proj.techStack && proj.techStack.length > 0 && (
                          <span className="italic text-neutral-600 text-[9.5pt]">
                            | {proj.techStack.join(", ")}
                          </span>
                        )}
                        {proj.links && proj.links.length > 0 && (
                          <span className="space-x-1.5 text-[9.5pt]">
                            {proj.links.map((l, lIdx) => (
                              <a
                                key={lIdx}
                                href={l.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline hover:text-blue-900"
                              >
                                [{l.label || "Link"}]
                              </a>
                            ))}
                          </span>
                        )}
                      </div>
                      {proj.date && <span className="text-neutral-700 font-medium text-[9.5pt]">{proj.date}</span>}
                    </div>

                    <BulletList
                      bullets={proj.bullets}
                      bulletStyle="dot"
                      className="mt-0.5 space-y-[2px]"
                      itemClassName="text-[9.8pt] text-neutral-800 leading-snug"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null,

          skills: skills.length > 0 ? (
            <section key="skills" className="mb-3 break-inside-avoid">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1.5">
                Technical Skills
              </h2>
              <div className="space-y-1 text-[10pt] text-neutral-800">
                {skills.map((cat, idx) => (
                  <div key={idx} className="leading-snug">
                    <strong className="font-bold text-neutral-900">{cat.category}: </strong>
                    <span>{cat.items.join(", ")}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null,

          certifications: certifications.length > 0 ? (
            <section key="certifications" className="mb-3 break-inside-avoid">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1.5">
                Certifications
              </h2>
              <div className="space-y-1 text-[10pt] text-neutral-800">
                {certifications.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-baseline">
                    <span>
                      <strong>{c.name}</strong>
                      {c.issuer ? ` – ${c.issuer}` : ""}
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-700 underline text-[9pt] hover:text-blue-900"
                        >
                          [View Credentials]
                        </a>
                      )}
                    </span>
                    {c.date && <span className="text-neutral-600 text-[9.5pt]">{c.date}</span>}
                  </div>
                ))}
              </div>
            </section>
          ) : null,

          languages: languages.length > 0 ? (
            <section key="languages" className="break-inside-avoid mb-3">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1">
                Languages
              </h2>
              <p className="text-[10pt] text-neutral-800">
                {languages.map((l) => `${l.name} (${l.level || "fluent"})`).join(" • ")}
              </p>
            </section>
          ) : null,

          awards: awards && awards.length > 0 ? (
            <section key="awards" className="break-inside-avoid mb-3">
              <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1">
                Honors &amp; Awards
              </h2>
              <BulletList
                bullets={awards}
                bulletStyle="dot"
                itemClassName="text-[10pt] text-neutral-800 space-y-0.5"
              />
            </section>
          ) : null,

          customSections: customSections && customSections.length > 0 ? (
            <React.Fragment key="customSections">
              {customSections.map((sec, idx) => (
                <section key={idx} className="break-inside-avoid mb-3">
                  <h2 className="text-[13pt] font-semibold tracking-wide text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1">
                    {sec.title}
                  </h2>
                  <p className="text-[10pt] text-neutral-800 whitespace-pre-line leading-relaxed">{sec.content}</p>
                </section>
              ))}
            </React.Fragment>
          ) : null,
        };

        return resume.sectionOrder.map((key) => sectionRenderers[key] || null);
      })()}
    </div>
  );
}
