import React from "react";
import { normalizeResume } from "./normalizeResume";
import { Section, BulletList, DateRange, RichText, CandidateName, HeaderContactRow } from "./primitives/index.js";

/**
 * T1 - Classic Rose Serif (Reference E)
 * Centered header, crimson accent (#C2185B), thin underline headings,
 * justified summary, role bold on left, company right-aligned,
 * skills as `Label: a | b | c` wrapped under the label.
 */
export function ClassicRoseSerif({ data, theme = {} }) {
  const resume = normalizeResume(data);
  const { personal, summary, experience, education, projects, skills, certifications, languages, awards, customSections } = resume;

  const accent = theme.accentColor || "#C2185B";
  const fontSizeBase = theme.fontSize || "14px";

  // Build contact items row according to contactOrder
  const contactMap = {
    email: personal.email ? { type: "email", text: personal.email, href: `mailto:${personal.email}` } : null,
    phone: personal.phone ? { type: "phone", text: personal.phone, href: `tel:${personal.phone.replace(/[^0-9+]/g, "")}` } : null,
    location: personal.location ? { type: "location", text: personal.location, href: null } : null,
    linkedin: personal.linkedin ? { type: "linkedin", text: personal.linkedin, href: personal.linkedinUrl || `https://linkedin.com/in/${personal.linkedin}` } : null,
    github: personal.github ? { type: "github", text: personal.github, href: personal.githubUrl || `https://github.com/${personal.github}` } : null,
    website: personal.website ? { type: "website", text: personal.website, href: personal.websiteUrl || (personal.website.startsWith("http") ? personal.website : `https://${personal.website}`) } : null,
  };

  const contactParts = (personal.contactOrder || ["email", "phone", "location", "linkedin", "github", "website"])
    .map((k) => contactMap[k])
    .filter(Boolean);

  if (Array.isArray(personal.customLinks)) {
    personal.customLinks.forEach((l) => {
      if (l?.url) {
        contactParts.push({
          type: "link",
          text: l.label || l.url.replace(/^https?:\/\/(www\.)?/, ""),
          href: l.url.startsWith("http") ? l.url : `https://${l.url}`,
        });
      }
    });
  }

  const sectionRenderers = {
    summary: summary ? (
      <Section
        key="summary"
        title="Summary"
        titleClassName="text-[15px] font-bold tracking-wide uppercase"
        headerClassName="mb-1"
        style={{ color: accent }}
        underline
        underlineClassName="h-[1px] w-full mb-2"
      >
        <div
          style={{ borderBottom: `1px solid ${accent}` }}
          className="-mt-2 mb-2 w-full"
        />
        <p className="text-neutral-800 leading-relaxed text-justify">
          <RichText text={summary} />
        </p>
      </Section>
    ) : null,

    experience: experience.length > 0 ? (
      <Section
        key="experience"
        title="Work Experience"
        titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
        headerClassName="mb-1"
        style={{ color: accent }}
      >
        <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-3 w-full" />
        <div className="space-y-4 text-neutral-800">
          {experience.map((exp, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex items-baseline justify-between text-[14.5px]">
                <span className="font-bold text-neutral-900">
                  {exp.role}
                  {exp.location ? <span className="font-normal text-neutral-600 text-[13px]"> — {exp.location}</span> : null}
                </span>
                <span className="font-semibold text-neutral-800 text-[13.5px]">
                  {exp.company}
                </span>
              </div>

              <div className="flex justify-between items-center text-[12.5px] text-neutral-500 mb-1.5">
                <DateRange startDate={exp.startDate} endDate={exp.endDate} />
              </div>

              <BulletList
                bullets={exp.bullets}
                bulletStyle="dot"
                bulletColor={accent}
                itemClassName="text-[13.5px] text-neutral-800"
              />
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    projects: projects.length > 0 ? (
      <Section
        key="projects"
        title="Projects"
        titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
        headerClassName="mb-1"
        style={{ color: accent }}
      >
        <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-3 w-full" />
        <div className="space-y-3.5 text-neutral-800">
          {projects.map((proj, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-neutral-900 text-[14.5px]">{proj.name}</span>
                  {proj.links && proj.links.length > 0 && (
                    <span className="text-[12px] space-x-2" style={{ color: accent }}>
                      {proj.links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:opacity-80"
                        >
                          [{link.label || "Link"}]
                        </a>
                      ))}
                    </span>
                  )}
                </div>
                {proj.date && <span className="text-[12.5px] text-neutral-500">{proj.date}</span>}
              </div>

              {proj.techStack && proj.techStack.length > 0 && (
                <p className="text-[12.5px] text-neutral-600 italic mb-1">
                  Technologies: {proj.techStack.join(", ")}
                </p>
              )}

              <BulletList
                bullets={proj.bullets}
                bulletStyle="dot"
                bulletColor={accent}
                itemClassName="text-[13.5px] text-neutral-800"
              />
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    skills: skills.length > 0 ? (
      <Section
        key="skills"
        title="Technical Skills"
        titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
        headerClassName="mb-1"
        style={{ color: accent }}
      >
        <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-3 w-full" />
        <div className="space-y-1.5 text-neutral-800 text-[13.5px]">
          {skills.map((cat, idx) => (
            <div key={idx} className="leading-snug">
              <strong className="font-bold text-neutral-900">{cat.category}: </strong>
              <span>{cat.items.join(" | ")}</span>
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    education: education.length > 0 ? (
      <Section
        key="education"
        title="Education"
        titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
        headerClassName="mb-1"
        style={{ color: accent }}
      >
        <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-3 w-full" />
        <div className="space-y-3 text-neutral-800">
          {education.map((edu, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex items-baseline justify-between text-[14.5px]">
                <span className="font-bold text-neutral-900">{edu.degree}</span>
                <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-[12.5px] text-neutral-500 font-normal" />
              </div>
              <div className="flex items-baseline justify-between text-[13.5px] text-neutral-700">
                <span>{edu.institution}{edu.location ? `, ${edu.location}` : ""}</span>
                {edu.grade && <span className="text-[12.5px] italic text-neutral-600">{edu.grade}</span>}
              </div>
              {edu.details && edu.details.length > 0 && (
                <BulletList
                  bullets={edu.details}
                  bulletStyle="dot"
                  bulletColor={accent}
                  className="mt-1"
                  itemClassName="text-[13px] text-neutral-700"
                />
              )}
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    certifications: certifications.length > 0 ? (
      <Section
        key="certifications"
        title="Certifications"
        titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
        headerClassName="mb-1"
        style={{ color: accent }}
      >
        <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-2 w-full" />
        <ul className="list-none space-y-1 text-[13.5px] text-neutral-800">
          {certifications.map((cert, idx) => (
            <li key={idx} className="flex justify-between items-baseline">
              <span>
                <strong className="font-semibold text-neutral-900">{cert.name}</strong>
                {cert.issuer && <span className="text-neutral-600"> — {cert.issuer}</span>}
              </span>
              {cert.date && <span className="text-[12.5px] text-neutral-500">{cert.date}</span>}
            </li>
          ))}
        </ul>
      </Section>
    ) : null,

    languages: languages.length > 0 ? (
      <Section
        key="languages"
        title="Languages"
        titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
        headerClassName="mb-1"
        style={{ color: accent }}
      >
        <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-2 w-full" />
        <p className="text-[13.5px] text-neutral-800">
          {languages.map((l, i) => (
            <span key={i}>
              {i > 0 && " • "}
              <strong className="font-semibold text-neutral-900">{l.name}</strong>
              {l.level ? ` (${l.level})` : ""}
            </span>
          ))}
        </p>
      </Section>
    ) : null,

    awards: awards && awards.length > 0 ? (
      <Section
        key="awards"
        title="Honors & Awards"
        titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
        headerClassName="mb-1"
        style={{ color: accent }}
      >
        <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-2 w-full" />
        <BulletList
          bullets={awards}
          bulletStyle="dot"
          bulletColor={accent}
          itemClassName="text-[13.5px] text-neutral-800"
        />
      </Section>
    ) : null,

    customSections: customSections && customSections.length > 0 ? (
      <React.Fragment key="customSections">
        {customSections.map((sec, idx) => (
          <Section
            key={idx}
            title={sec.title}
            titleClassName="text-[15px] font-bold tracking-wide uppercase mt-4"
            headerClassName="mb-1"
            style={{ color: accent }}
          >
            <div style={{ borderBottom: `1px solid ${accent}` }} className="mb-2 w-full" />
            <p className="text-[13.5px] text-neutral-800 whitespace-pre-line leading-relaxed">{sec.content}</p>
          </Section>
        ))}
      </React.Fragment>
    ) : null,
  };

  return (
    <div
      className="resume-a4-page resume-single-col font-garamond p-10 text-neutral-800"
      style={{ fontSize: fontSizeBase }}
    >
      {/* Centered Header */}
      <header className="resume-header text-center mb-6">
        <h1
          className="text-[32px] font-normal tracking-wide text-neutral-900 leading-tight"
          style={{ fontFamily: "'EB Garamond', Garamond, Georgia, serif" }}
        >
          <CandidateName personal={personal}>{personal.fullName}</CandidateName>
        </h1>

        {personal.title && (
          <p className="text-[15px] italic text-neutral-700 mt-1">
            {personal.title}
          </p>
        )}

        <HeaderContactRow
          personal={personal}
          className="mt-1 text-[13px] font-medium"
          defaultSeparator="•"
        />
      </header>

      {/* Render sections in user-defined sectionOrder */}
      {resume.sectionOrder.map((secKey) => (
        <React.Fragment key={secKey}>
          {sectionRenderers[secKey] || null}
        </React.Fragment>
      ))}
    </div>
  );
}
