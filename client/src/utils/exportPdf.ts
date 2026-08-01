import { createElement, type ReactElement } from "react";
import type * as PdfRendererModule from "@react-pdf/renderer";

import { EXPORT_STYLES } from "@/utils/exportStyles";
import type { ParsedResumeData, ResumeTemplate } from "@/types";

interface ResumePdfProps {
  data: ParsedResumeData;
  template: ResumeTemplate;
  title?: string;
}

/**
 * Template-aware PDF document builder. The renderer library is injected
 * (dynamic import at export time) so @react-pdf/renderer stays out of the
 * main bundle — nothing here imports it at runtime.
 */
export function createResumePdfElement(
  renderer: typeof PdfRendererModule,
  { data, template, title }: ResumePdfProps,
): ReactElement {
  const { Document, Page, StyleSheet, Text, View } = renderer;
  const h = createElement;
  const style = EXPORT_STYLES[template];
  const styles = StyleSheet.create({
    page: {
      padding: 36,
      fontFamily: style.pdfFont,
      fontSize: style.bodySize,
      color: "#111827",
      lineHeight: 1.4,
    },
    header: {
      marginBottom: 12,
      ...(style.centered ? { textAlign: "center" as const } : {}),
      ...(template === "modern" ? { borderBottomWidth: 3, borderBottomColor: style.accent, paddingBottom: 6 } : {}),
      ...(template === "classic" ? { borderBottomWidth: 2, paddingBottom: 6 } : {}),
    },
    name: {
      fontSize: style.headingSize + 8,
      fontFamily: style.pdfFont,
      fontWeight: "bold" as const,
      color: template === "modern" ? style.accent : "#111827",
      ...(template === "classic" ? { textTransform: "uppercase" as const, letterSpacing: 1 } : {}),
    },
    contact: { marginTop: 4, fontSize: style.bodySize - 1, color: "#4b5563" },
    heading: {
      marginTop: 10,
      marginBottom: 4,
      fontSize: style.headingSize,
      fontWeight: "bold" as const,
      color: style.accent,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
      ...(template === "classic" ? { borderBottomWidth: 0.5, borderBottomColor: "#9ca3af", paddingBottom: 2 } : {}),
    },
    row: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "baseline" as const },
    title: { fontWeight: "bold" as const, fontSize: style.bodySize + 0.5 },
    meta: { color: "#4b5563", fontSize: style.bodySize - 0.5 },
    dates: { color: "#6b7280", fontSize: style.bodySize - 1 },
    body: { marginTop: 1, color: "#374151" },
    skills: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 4 },
    skill: {
      borderWidth: 0.5,
      borderColor: "#d1d5db",
      paddingHorizontal: 4,
      paddingVertical: 1,
      fontSize: style.bodySize - 1,
      color: "#374151",
    },
  });

  const hidden = (key: string) => data.hiddenSections?.includes(key) ?? false;
  const contact = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
    data.contact.github,
  ].filter(Boolean);

  const children: Array<ReactElement | null> = [
    h(View, { key: "header", style: styles.header }, [
      title || data.name ? h(Text, { key: "name", style: styles.name }, title || data.name) : null,
      contact.length > 0 ? h(Text, { key: "contact", style: styles.contact }, contact.join("  ·  ")) : null,
    ]),
    !hidden("summary") && data.summary
      ? h(View, { key: "summary" }, [
          h(Text, { key: "h", style: styles.heading }, "Summary"),
          h(Text, { key: "b", style: styles.body }, data.summary),
        ])
      : null,
    !hidden("skills") && data.skills.length > 0
      ? h(View, { key: "skills" }, [
          h(Text, { key: "h", style: styles.heading }, "Skills"),
          h(View, { key: "list", style: styles.skills }, data.skills.map((skill) => h(Text, { key: skill, style: styles.skill }, skill))),
        ])
      : null,
    !hidden("experience") && data.experience.length > 0
      ? h(View, { key: "experience" }, [
          h(Text, { key: "h", style: styles.heading }, "Experience"),
          ...data.experience.map((entry, i) =>
            h(View, { key: i, style: { marginBottom: 6 } }, [
              h(View, { key: "row", style: styles.row }, [
                h(Text, { key: "t", style: styles.title }, entry.title || "Untitled role"),
                entry.startDate || entry.endDate
                  ? h(Text, { key: "d", style: styles.dates }, `${entry.startDate} – ${entry.endDate}`)
                  : null,
              ]),
              h(Text, { key: "m", style: styles.meta }, [entry.company, entry.location].filter(Boolean).join(" · ")),
              entry.achievements ? h(Text, { key: "a", style: styles.body }, entry.achievements) : null,
              entry.technologies ? h(Text, { key: "t2", style: styles.meta }, `Technologies: ${entry.technologies}`) : null,
              entry.description ? h(Text, { key: "b", style: styles.body }, entry.description) : null,
            ]),
          ),
        ])
      : null,
    !hidden("education") && data.education.length > 0
      ? h(View, { key: "education" }, [
          h(Text, { key: "h", style: styles.heading }, "Education"),
          ...data.education.map((entry, i) =>
            h(View, { key: i, style: { marginBottom: 6 } }, [
              h(View, { key: "row", style: styles.row }, [
                h(Text, { key: "t", style: styles.title }, entry.degree || "Untitled degree"),
                entry.startDate || entry.endDate
                  ? h(Text, { key: "d", style: styles.dates }, `${entry.startDate} – ${entry.endDate}`)
                  : null,
              ]),
              h(Text, { key: "m", style: styles.meta }, entry.institution),
              entry.description ? h(Text, { key: "b", style: styles.body }, entry.description) : null,
            ]),
          ),
        ])
      : null,
    !hidden("projects") && data.projects.length > 0
      ? h(View, { key: "projects" }, [
          h(Text, { key: "h", style: styles.heading }, "Projects"),
          ...data.projects.map((entry, i) =>
            h(View, { key: i, style: { marginBottom: 6 } }, [
              h(Text, { key: "t", style: styles.title }, entry.name || "Untitled project"),
              entry.description ? h(Text, { key: "b", style: styles.body }, entry.description) : null,
              entry.technologies ? h(Text, { key: "t2", style: styles.meta }, `Technologies: ${entry.technologies}`) : null,
              [entry.link, entry.liveDemo].filter(Boolean).map((link) => h(Text, { key: link, style: styles.meta }, link)),
            ]),
          ),
        ])
      : null,
    !hidden("certifications") && data.certifications.length > 0
      ? h(View, { key: "certifications" }, [
          h(Text, { key: "h", style: styles.heading }, "Certifications"),
          h(View, { key: "list", style: styles.skills }, data.certifications.map((item) => h(Text, { key: item, style: styles.skill }, item))),
        ])
      : null,
    !hidden("languages") && data.languages.length > 0
      ? h(View, { key: "languages" }, [
          h(Text, { key: "h", style: styles.heading }, "Languages"),
          h(View, { key: "list", style: styles.skills }, data.languages.map((item) => h(Text, { key: item, style: styles.skill }, item))),
        ])
      : null,
    !hidden("awards") && data.awards.length > 0
      ? h(View, { key: "awards" }, [
          h(Text, { key: "h", style: styles.heading }, "Awards"),
          ...data.awards.map((item, i) => h(Text, { key: i, style: styles.meta }, item)),
        ])
      : null,
    ...(data.customSections ?? []).map((section, i) =>
      section.title || section.content
        ? h(View, { key: `custom-${i}` }, [
            h(Text, { key: "h", style: styles.heading }, section.title || "Custom"),
            h(Text, { key: "b", style: styles.body }, section.content),
          ])
        : null,
    ),
  ];

  return h(
    Document,
    { title: `${title ?? "resume"} — ${template}`, author: "AI Resume Builder" },
    h(Page, { size: "A4", style: styles.page }, children),
  );
}
