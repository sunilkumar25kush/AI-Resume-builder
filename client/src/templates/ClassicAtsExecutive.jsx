import React from "react";
import { normalizeResume } from "./normalizeResume";
import { DateRange, RichText } from "./primitives";

/**
 * T3 - Classic ATS Executive (Reference B)
 * Pure black & white serif, small-caps centered name, 1.5px divider,
 * 3-column bullet grid for skills, tight hanging bullets,
 * 2-column certifications grid, maximum ATS parser safety.
 */
export function ClassicAtsExecutive({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, coursework, certifications, languages, awards, customSections } = resume;

  const fontSizeBase = theme.fontSize || "14px";

  // Build clean contact row according to contactOrder
  const contactMap = {
    location: personal.location ? { text: personal.location, href: null } : null,
    phone: personal.phone ? { text: personal.phone, href: `tel:${personal.phone.replace(/[^0-9+]/g, "")}` } : null,
    email: personal.email ? { text: personal.email, href: `mailto:${personal.email}` } : null,
    linkedin: personal.linkedin ? { text: personal.linkedin, href: personal.linkedinUrl || `https://linkedin.com/in/${personal.linkedin}` } : null,
    github: personal.github ? { text: personal.github, href: personal.githubUrl || `https://github.com/${personal.github}` } : null,
    website: personal.website ? { text: personal.website, href: personal.websiteUrl || (personal.website.startsWith("http") ? personal.website : `https://${personal.website}`) } : null,
  };

  const contactParts = (personal.contactOrder || ["location", "phone", "email", "linkedin", "github", "website"])
    .map((k) => contactMap[k])
    .filter(Boolean);

  if (Array.isArray(personal.customLinks)) {
    personal.customLinks.forEach((l) => {
      if (l?.url) {
        contactParts.push({
          text: l.label || l.url.replace(/^https?:\/\/(www\.)?/, ""),
          href: l.url.startsWith("http") ? l.url : `https://${l.url}`,
        });
      }
    });
  }

  // Flatten all skills for the 3-column grid
  const allSkills = [];
  skills.forEach((cat) => {
    cat.items.forEach((item) => allSkills.push(item));
  });

  const sectionRenderers = {
    summary: summary ? (
      <section key="summary" className="mb-4 break-inside-avoid">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
          Professional Summary
        </h2>
        <p className="text-[10pt] leading-snug text-justify text-black">
          <RichText text={summary} />
        </p>
      </section>
    ) : null,

    skills: allSkills.length > 0 ? (
      <section key="skills" className="mb-4 break-inside-avoid">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
          Key Skills
        </h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[10pt] pl-2">
          {allSkills.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-1.5 leading-tight">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black shrink-0" aria-hidden="true" />
              <span className="truncate">{skill}</span>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    experience: experience.length > 0 ? (
      <section key="experience" className="mb-4 break-inside-avoid-page">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
          Professional Experience
        </h2>
        <div className="space-y-3.5">
          {experience.map((exp, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline text-[10.5pt]">
                <div>
                  <strong className="font-bold text-black">{exp.role}</strong>
                  <span className="text-black"> | {exp.company}{exp.location ? `, ${exp.location}` : ""}</span>
                </div>
                <DateRange
                  startDate={exp.startDate}
                  endDate={exp.endDate}
                  className="font-bold text-black text-[10pt]"
                />
              </div>

              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="list-none p-0 mt-1 space-y-[3px] text-[10pt] leading-tight">
                  {exp.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="relative pl-4 break-inside-avoid">
                      <span className="absolute left-0 top-[0.45em] w-1.5 h-1.5 rounded-full bg-black" aria-hidden="true" />
                      <RichText text={b} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    projects: projects.length > 0 ? (
      <section key="projects" className="mb-4 break-inside-avoid-page">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
          Selected Projects
        </h2>
        <div className="space-y-3">
          {projects.map((proj, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline text-[10.5pt]">
                <div>
                  <strong className="font-bold text-black">{proj.name}</strong>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <span className="italic text-black text-[10pt]"> | {proj.techStack.join(", ")}</span>
                  )}
                </div>
                {proj.date && <span className="font-bold text-[10pt] text-black">{proj.date}</span>}
              </div>

              {proj.bullets && proj.bullets.length > 0 && (
                <ul className="list-none p-0 mt-1 space-y-[3px] text-[10pt] leading-tight">
                  {proj.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="relative pl-4 break-inside-avoid">
                      <span className="absolute left-0 top-[0.45em] w-1.5 h-1.5 rounded-full bg-black" aria-hidden="true" />
                      <RichText text={b} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    education: education.length > 0 ? (
      <section key="education" className="mb-4 break-inside-avoid">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
          Education
        </h2>
        <div className="space-y-2.5">
          {education.map((edu, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline text-[10.5pt]">
                <div>
                  <strong className="font-bold text-black">{edu.degree}</strong>
                  <span className="text-black"> | {edu.institution}{edu.location ? `, ${edu.location}` : ""}</span>
                </div>
                <DateRange
                  startDate={edu.startDate}
                  endDate={edu.endDate}
                  className="font-bold text-black text-[10pt]"
                />
              </div>

              {edu.grade && (
                <p className="text-[9.5pt] italic text-black pl-4 mt-0.5">
                  <strong>Honours / GPA:</strong> {edu.grade}
                </p>
              )}

              {coursework && coursework.length > 0 && idx === 0 && (
                <p className="text-[9.5pt] text-black pl-4 mt-0.5">
                  <strong>Relevant Coursework:</strong> {coursework.join(", ")}
                </p>
              )}

              {edu.details && edu.details.length > 0 && (
                <ul className="list-none p-0 mt-1 space-y-1 text-[9.5pt] pl-4">
                  {edu.details.map((d, dIdx) => (
                    <li key={dIdx} className="relative pl-3">
                      <span className="absolute left-0 top-[0.45em] w-1 h-1 rounded-full bg-black" aria-hidden="true" />
                      <RichText text={d} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    certifications: certifications.length > 0 ? (
      <section key="certifications" className="mb-4 break-inside-avoid">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
          Certifications
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10pt] pl-2">
          {certifications.map((cert, idx) => (
            <div key={idx} className="flex items-baseline gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1" aria-hidden="true" />
              <span>
                <strong>{cert.name}</strong>
                {cert.issuer && <span className="text-neutral-700">, {cert.issuer}</span>}
                {cert.date && <span className="text-neutral-600"> ({cert.date})</span>}
              </span>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    languages: languages.length > 0 ? (
      <section key="languages" className="break-inside-avoid">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
          Languages
        </h2>
        <p className="text-[10pt] text-black pl-2">
          {languages.map((l) => `${l.name} (${l.level || "Proficient"})`).join(" • ")}
        </p>
      </section>
    ) : null,

    awards: awards && awards.length > 0 ? (
      <section key="awards" className="break-inside-avoid mb-4">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
          Honors &amp; Awards
        </h2>
        <ul className="list-none p-0 mt-1 space-y-1 text-[10pt] pl-2">
          {awards.map((a, idx) => (
            <li key={idx} className="flex items-baseline gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1" aria-hidden="true" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>
    ) : null,

    customSections: customSections && customSections.length > 0 ? (
      <React.Fragment key="customSections">
        {customSections.map((sec, idx) => (
          <section key={idx} className="break-inside-avoid mb-4">
            <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
              {sec.title}
            </h2>
            <p className="text-[10pt] text-black whitespace-pre-line leading-relaxed pl-2">{sec.content}</p>
          </section>
        ))}
      </React.Fragment>
    ) : null,
  };

  return (
    <div
      className="resume-a4-page resume-single-col font-serif-classic p-10 text-black bg-white"
      style={{
        fontFamily: "'Latin Modern Roman', Cambria, Georgia, 'Times New Roman', serif",
        fontSize: fontSizeBase,
        color: "#000000",
      }}
    >
      {/* Header */}
      <header className="resume-header text-center mb-4">
        <h1
          className="text-[28pt] font-bold tracking-wider uppercase text-black"
          style={{ fontVariant: "small-caps" }}
        >
          {personal.fullName}
        </h1>

        {contactParts.length > 0 && (
          <p className="text-[10pt] text-black mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            {contactParts.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="opacity-40 select-none">|</span>}
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {item.text}
                  </a>
                ) : (
                  <span>{item.text}</span>
                )}
              </React.Fragment>
            ))}
          </p>
        )}

        {/* Heavy 1.5px black divider */}
        <div className="w-full h-[1.5px] bg-black mt-2.5 mb-3" />
      </header>

      {/* Render sections dynamically in sectionOrder */}
      {resume.sectionOrder.map((key) => sectionRenderers[key] || null)}
    </div>
  );
}
