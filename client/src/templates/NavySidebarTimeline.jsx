import React from "react";
import { normalizeResume } from "./normalizeResume";
import { BulletList, DateRange, RichText, ContactItem } from "./primitives";

/**
 * T2 - Navy Sidebar Timeline (Reference A)
 * Left 33% dark navy (#2B3450), Right 67% white.
 * Full-height gradient background for multi-page continuity.
 * Circular 140px photo, white icon badges, // Category skills.
 * Right: Raleway name, timeline nodes with hollow circles, references block.
 */
export function NavySidebarTimeline({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages, references } = resume;

  const navyBg = theme.accentColor || "#2B3450";
  const fontSizeBase = theme.fontSize || "14px";

  // Split full name into first name (bold) and surname (lighter weight)
  const nameParts = personal.fullName.split(" ");
  const firstName = nameParts[0] || personal.fullName;
  const lastName = nameParts.slice(1).join(" ");

  return (
    <div
      className="resume-a4-page resume-full-bleed font-raleway flex text-neutral-800"
      style={{
        background: `linear-gradient(to right, ${navyBg} 33%, #ffffff 33%)`,
        fontSize: fontSizeBase,
      }}
    >
      {/* Left Sidebar: 33% Dark Navy */}
      <aside className="resume-sidebar w-[33%] shrink-0 text-white p-6 pt-8 flex flex-col gap-6">
        {/* Photo (Circular 140px) with graceful fallback */}
        {personal.photoUrl ? (
          <div className="flex justify-center mb-2">
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-[140px] h-[140px] rounded-full object-cover border-4 border-white/20 shadow-md"
            />
          </div>
        ) : null}

        {/* Contact Section */}
        <div className="break-inside-avoid">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white pb-1.5 border-b border-white/20">
            Contact
          </h2>
          <div className="mt-3 space-y-2.5 text-[12px] text-white/90">
            {personal.phone && (
              <ContactItem
                type="phone"
                value={personal.phone}
                iconBadge
                badgeClassName="w-5 h-5 bg-white/10 text-white"
                linkClassName="text-white hover:text-white/80"
              />
            )}
            {personal.email && (
              <ContactItem
                type="email"
                value={personal.email}
                iconBadge
                badgeClassName="w-5 h-5 bg-white/10 text-white"
                linkClassName="text-white hover:text-white/80"
              />
            )}
            {personal.location && (
              <ContactItem
                type="location"
                value={personal.location}
                iconBadge
                badgeClassName="w-5 h-5 bg-white/10 text-white"
              />
            )}
            {personal.linkedin && (
              <ContactItem
                type="linkedin"
                value={personal.linkedin}
                iconBadge
                badgeClassName="w-5 h-5 bg-white/10 text-white"
                linkClassName="text-white hover:text-white/80"
              />
            )}
            {personal.github && (
              <ContactItem
                type="github"
                value={personal.github}
                iconBadge
                badgeClassName="w-5 h-5 bg-white/10 text-white"
                linkClassName="text-white hover:text-white/80"
              />
            )}
            {personal.website && (
              <ContactItem
                type="website"
                value={personal.website}
                iconBadge
                badgeClassName="w-5 h-5 bg-white/10 text-white"
                linkClassName="text-white hover:text-white/80"
              />
            )}
          </div>
        </div>

        {/* Education Section in Sidebar */}
        {education.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white pb-1.5 border-b border-white/20">
              Education
            </h2>
            <div className="mt-3 space-y-3.5">
              {education.map((edu, idx) => (
                <div key={idx} className="text-[12px] leading-snug">
                  <div className="font-bold text-white text-[13px]">{edu.degree}</div>
                  <div className="text-white/80">{edu.institution}</div>
                  <div className="text-white/60 text-[11px] mt-0.5">
                    <DateRange startDate={edu.startDate} endDate={edu.endDate} format="dash" />
                  </div>
                  {edu.grade && <div className="text-white/70 text-[11px] italic mt-0.5">{edu.grade}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section with // Category */}
        {skills.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white pb-1.5 border-b border-white/20">
              Skills
            </h2>
            <div className="mt-3 space-y-3 text-[12px]">
              {skills.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-bold italic text-white text-[12.5px] tracking-wide">
                    // {cat.category}
                  </div>
                  <ul className="list-none space-y-0.5 text-white/80 pl-2">
                    {cat.items.map((item, i) => (
                      <li key={i} className="leading-tight">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages in Sidebar */}
        {languages.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white pb-1.5 border-b border-white/20">
              Languages
            </h2>
            <div className="mt-2 space-y-1 text-[12px] text-white/80">
              {languages.map((l, i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-medium text-white">{l.name}</span>
                  <span className="text-white/60 text-[11px]">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Right Column: 67% White */}
      <main className="w-[67%] p-8 pt-8 flex flex-col gap-5 text-neutral-800 bg-white">
        {/* Header */}
        <header className="resume-header">
          <h1 className="text-[34px] uppercase tracking-[0.06em] text-neutral-900 leading-none">
            <span className="font-bold">{firstName}</span>{" "}
            {lastName && <span className="font-light text-neutral-700">{lastName}</span>}
          </h1>

          {personal.title && (
            <p
              className="text-[13px] font-semibold uppercase tracking-[0.18em] mt-1.5"
              style={{ color: navyBg }}
            >
              {personal.title}
            </p>
          )}

          {summary && (
            <div className="mt-3 text-[13.5px] text-neutral-700 leading-relaxed border-t border-neutral-200 pt-3">
              <RichText text={summary} />
            </div>
          )}
        </header>

        {/* Work Experience Timeline */}
        {experience.length > 0 && (
          <section className="break-inside-avoid-page">
            <h2
              className="text-[14px] font-bold uppercase tracking-[0.14em] pb-1 mb-4"
              style={{ color: navyBg, borderBottom: `1.5px solid ${navyBg}` }}
            >
              Work Experience
            </h2>

            {/* Timeline container */}
            <div className="relative pl-6 space-y-5">
              {/* Thin vertical timeline line */}
              <div
                className="absolute left-[7px] top-2 bottom-2 w-[1.5px]"
                style={{ backgroundColor: navyBg, opacity: 0.35 }}
              />

              {experience.map((exp, idx) => (
                <div key={idx} className="relative break-inside-avoid">
                  {/* Hollow circle node */}
                  <span
                    className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2"
                    style={{ borderColor: navyBg }}
                    aria-hidden="true"
                  />

                  <div className="flex items-baseline justify-between text-[14px]">
                    <span className="font-bold text-neutral-900">
                      {exp.company} <span className="font-normal text-neutral-500">/</span> {exp.role}
                    </span>
                    {exp.location && <span className="text-[12px] text-neutral-500">{exp.location}</span>}
                  </div>

                  <div className="text-[12px] font-medium text-neutral-500 mb-1.5">
                    <DateRange startDate={exp.startDate} endDate={exp.endDate} format="from-to" />
                  </div>

                  <BulletList
                    bullets={exp.bullets}
                    bulletStyle="dot"
                    bulletColor={navyBg}
                    itemClassName="text-[13px] text-neutral-700 leading-snug"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="break-inside-avoid-page">
            <h2
              className="text-[14px] font-bold uppercase tracking-[0.14em] pb-1 mb-3"
              style={{ color: navyBg, borderBottom: `1.5px solid ${navyBg}` }}
            >
              Key Projects
            </h2>

            <div className="space-y-3.5">
              {projects.map((proj, idx) => (
                <div key={idx} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-neutral-900 text-[14px]">
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
                            style={{ color: navyBg }}
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
                    bulletColor={navyBg}
                    itemClassName="text-[13px] text-neutral-700"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications (if present) */}
        {certifications.length > 0 && (
          <section className="break-inside-avoid">
            <h2
              className="text-[14px] font-bold uppercase tracking-[0.14em] pb-1 mb-2"
              style={{ color: navyBg, borderBottom: `1.5px solid ${navyBg}` }}
            >
              Certifications
            </h2>
            <div className="space-y-1 text-[13px] text-neutral-700">
              {certifications.map((c, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                  {c.date && <span className="text-neutral-500 text-[12px]">{c.date}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* References in 2 Columns */}
        {references.length > 0 && (
          <section className="break-inside-avoid mt-2 border-t border-neutral-200 pt-3">
            <h2
              className="text-[13px] font-bold uppercase tracking-[0.14em] mb-2"
              style={{ color: navyBg }}
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
    </div>
  );
}
