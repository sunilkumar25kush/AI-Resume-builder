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
 * Split a free-text field into trimmed bullet lines (newline-separated).
 * Falls back to a single-item array so a plain paragraph renders as one
 * bullet-less line via `renderParagraph`.
 */
function bulletLines(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Template-aware PDF document builder. The renderer library is injected
 * (dynamic import at export time) so @react-pdf/renderer stays out of the
 * main bundle — nothing here imports it at runtime.
 *
 * Layout modes:
 * - `modern-pro` renders a two-column body: main content (summary,
 *   experience, projects, education) plus a light-blue sidebar holding
 *   skills, certifications, languages and awards.
 * - every other template renders the classic single column.
 */
export function createResumePdfElement(
  renderer: typeof PdfRendererModule,
  { data, template, title }: ResumePdfProps,
): ReactElement {
  const { Document, Page, StyleSheet, Text, View } = renderer;
  const h = createElement;
  const style = EXPORT_STYLES[template];
  const isSidebar = template === "modern-pro";
  const styles = StyleSheet.create({
    page: {
      padding: 32,
      fontFamily: style.pdfFont,
      fontSize: style.bodySize,
      color: "#111827",
      lineHeight: 1.35,
    },
    header: {
      marginBottom: 10,
      ...(style.centered ? { textAlign: "center" as const } : {}),
      ...(template === "modern" ? { borderBottomWidth: 3, borderBottomColor: style.accent, paddingBottom: 6 } : {}),
      ...(template === "classic" ? { borderBottomWidth: 1.5, borderBottomColor: "#9ca3af", paddingBottom: 6 } : {}),
      ...(template === "modern-pro" || template === "tech-engineer"
        ? { borderBottomWidth: 2, borderBottomColor: style.accent, paddingBottom: 6 }
        : {}),
    },
    name: {
      fontSize: style.headingSize + 8,
      fontFamily: style.pdfFont,
      fontWeight: "bold" as const,
      color: template === "modern" || template === "modern-pro" || template === "tech-engineer" ? style.accent : "#111827",
      ...(template === "classic" ? { textTransform: "uppercase" as const, letterSpacing: 1 } : {}),
    },
    contact: { marginTop: 4, fontSize: style.bodySize - 1, color: "#4b5563" },
    heading: {
      marginTop: 9,
      marginBottom: 3,
      fontSize: style.headingSize,
      fontWeight: "bold" as const,
      color: style.accent,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
      ...(template === "classic" ? { borderBottomWidth: 0.5, borderBottomColor: "#9ca3af", paddingBottom: 2 } : {}),
    },
    row: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "baseline" as const },
    title: { fontWeight: "bold" as const, fontSize: style.bodySize + 0.5 },
    techInline: { color: "#4b5563", fontSize: style.bodySize - 0.5 },
    meta: { color: "#4b5563", fontSize: style.bodySize - 0.5 },
    dates: { color: "#6b7280", fontSize: style.bodySize - 1 },
    entry: { marginBottom: 5 },
    bulletRow: { flexDirection: "row" as const, marginTop: 1 },
    bulletMark: { width: 11, color: "#374151" },
    bulletText: { flex: 1, color: "#374151" },
    paragraph: { marginTop: 1, color: "#374151" },
    inlineList: { marginTop: 1, color: "#374151" },
    link: { color: "#2563eb", fontSize: style.bodySize - 1, marginTop: 1 },
    /* modern-pro two-column layout */
    sidebarBody: { flexDirection: "row" as const, alignItems: "flex-start" as const, gap: 10 },
    mainCol: { flex: 1, minWidth: 0 },
    sideCol: {
      width: "33%",
      backgroundColor: "#eff6ff",
      borderRadius: 4,
      padding: 10,
    },
    sideHeading: {
      marginBottom: 3,
      marginTop: 6,
      fontSize: style.headingSize - 1.5,
      fontWeight: "bold" as const,
      color: style.accent,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    },
    sideItem: { color: "#374151", fontSize: style.bodySize - 0.5, marginBottom: 2 },
    sideList: { color: "#374151", fontSize: style.bodySize - 0.5, marginTop: 1 },
  });

  const hidden = (key: string) => data.hiddenSections?.includes(key) ?? false;
  const contact = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
    data.contact.github,
  ].filter(Boolean);

  /** Bulleted list from a newline-separated field (hanging indent). */
  const bulletList = (text: string | undefined, keyPrefix: string) =>
    bulletLines(text).map((line, i) =>
      h(View, { key: `${keyPrefix}-b${i}`, style: styles.bulletRow }, [
        h(Text, { key: "m", style: styles.bulletMark }, "\u2013"),
        h(Text, { key: "t", style: styles.bulletText }, line),
      ]),
    );

  /** Newline-separated field rendered as bullets, or a single paragraph. */
  const richText = (text: string | undefined, keyPrefix: string) => {
    const items = bulletLines(text);
    if (items.length === 0) return null;
    if (items.length === 1) {
      return h(Text, { key: `${keyPrefix}-p`, style: styles.paragraph }, items[0]);
    }
    return bulletList(items.join("\n"), keyPrefix);
  };

  // ------------------------------------------------------------------
  // Section builders (single-column variants)
  // ------------------------------------------------------------------
  const headerEl = h(View, { key: "header", style: styles.header }, [
    data.name && data.name.trim()
      ? h(Text, { key: "name", style: styles.name }, data.name.trim())
      : null,
    contact.length > 0 ? h(Text, { key: "contact", style: styles.contact }, contact.join("  \u00b7  ")) : null,
  ]);

  const summaryEl = !hidden("summary") && data.summary
    ? h(View, { key: "summary" }, [
        h(Text, { key: "h", style: styles.heading }, "Summary"),
        h(Text, { key: "b", style: styles.paragraph }, data.summary),
      ])
    : null;

  const skillsEl = !hidden("skills") && data.skills.length > 0
    ? h(View, { key: "skills" }, [
        h(Text, { key: "h", style: styles.heading }, "Skills"),
        h(Text, { key: "l", style: styles.inlineList }, data.skills.join(", ")),
      ])
    : null;

  const experienceEl = !hidden("experience") && data.experience.length > 0
    ? h(View, { key: "experience" }, [
        h(Text, { key: "h", style: styles.heading }, "Experience"),
        ...data.experience.flatMap((entry, i) => {
          const achievementLines = bulletLines(entry.achievements);
          const descriptionLines = bulletLines(entry.description);
          const descriptionDiffers =
            descriptionLines.length > 0 &&
            entry.description?.trim() !== (entry.achievements ?? "").trim();
          const bullets =
            achievementLines.length > 0
              ? entry.achievements
              : descriptionLines.length > 0
                ? entry.description
                : "";
          const extraParagraph =
            achievementLines.length > 0 && descriptionDiffers && descriptionLines.length > 1
              ? h(Text, { key: "extra", style: styles.paragraph }, entry.description)
              : null;
          return [
            h(View, { key: i, style: styles.entry }, [
              h(View, { key: "row", style: styles.row }, [
                h(Text, { key: "t", style: styles.title }, entry.title || "Untitled role"),
                entry.startDate || entry.endDate
                  ? h(Text, { key: "d", style: styles.dates }, `${entry.startDate} \u2013 ${entry.endDate}`)
                  : null,
              ]),
              [entry.company, entry.location].filter(Boolean).length > 0
                ? h(Text, { key: "m", style: styles.meta }, [entry.company, entry.location].filter(Boolean).join(" \u00b7 "))
                : null,
              bulletList(bullets, `exp${i}`),
              extraParagraph,
              entry.technologies
                ? h(Text, { key: "t2", style: styles.meta }, `Technologies: ${entry.technologies}`)
                : null,
            ]),
          ];
        }),
      ])
    : null;

  const educationEl = !hidden("education") && data.education.length > 0
    ? h(View, { key: "education" }, [
        h(Text, { key: "h", style: styles.heading }, "Education"),
        ...data.education.map((entry, i) =>
          h(View, { key: i, style: styles.entry }, [
            h(View, { key: "row", style: styles.row }, [
              h(Text, { key: "t", style: styles.title }, entry.degree || "Untitled degree"),
              entry.startDate || entry.endDate
                ? h(Text, { key: "d", style: styles.dates }, `${entry.startDate} \u2013 ${entry.endDate}`)
                : null,
            ]),
            entry.institution ? h(Text, { key: "m", style: styles.meta }, entry.institution) : null,
            richText(entry.description, `edu${i}`),
          ]),
        ),
      ])
    : null;

  const projectsEl = !hidden("projects") && data.projects.length > 0
    ? h(View, { key: "projects" }, [
        h(Text, { key: "h", style: styles.heading }, "Projects"),
        ...data.projects.map((entry, i) =>
          h(View, { key: i, style: styles.entry }, [
            h(View, { key: "row", style: styles.row }, [
              h(Text, { key: "t", style: styles.title }, entry.name || "Untitled project"),
              entry.technologies
                ? h(Text, { key: "tech", style: styles.techInline }, ` | ${entry.technologies}`)
                : null,
            ]),
            richText(entry.description, `proj${i}`),
            [entry.link, entry.liveDemo].filter(Boolean).map((link) =>
              h(Text, { key: link, style: styles.link }, link),
            ),
          ]),
        ),
      ])
    : null;

  const certificationsEl = !hidden("certifications") && data.certifications.length > 0
    ? h(View, { key: "certifications" }, [
        h(Text, { key: "h", style: styles.heading }, "Certifications"),
        h(Text, { key: "l", style: styles.inlineList }, data.certifications.join(", ")),
      ])
    : null;

  const languagesEl = !hidden("languages") && data.languages.length > 0
    ? h(View, { key: "languages" }, [
        h(Text, { key: "h", style: styles.heading }, "Languages"),
        h(Text, { key: "l", style: styles.inlineList }, data.languages.join(", ")),
      ])
    : null;

  const awardsEl = !hidden("awards") && data.awards.length > 0
    ? h(View, { key: "awards" }, [
        h(Text, { key: "h", style: styles.heading }, "Awards"),
        h(Text, { key: "l", style: styles.inlineList }, data.awards.join(", ")),
      ])
    : null;

  const customEls = (data.customSections ?? []).map((section, i) =>
    section.title || section.content
      ? h(View, { key: `custom-${i}` }, [
          h(Text, { key: "h", style: styles.heading }, section.title || "Custom"),
          h(Text, { key: "b", style: styles.paragraph }, section.content),
        ])
      : null,
  );

  // ------------------------------------------------------------------
  // Sidebar variants (modern-pro): compact headings, stacked items
  // ------------------------------------------------------------------
  const skillsSideEl = !hidden("skills") && data.skills.length > 0
    ? h(View, { key: "skills" }, [
        h(Text, { key: "h", style: styles.sideHeading }, "Skills"),
        ...data.skills.map((skill, i) => h(Text, { key: i, style: styles.sideItem }, skill)),
      ])
    : null;

  const certificationsSideEl = !hidden("certifications") && data.certifications.length > 0
    ? h(View, { key: "certifications" }, [
        h(Text, { key: "h", style: styles.sideHeading }, "Certifications"),
        h(Text, { key: "l", style: styles.sideList }, data.certifications.join(", ")),
      ])
    : null;

  const languagesSideEl = !hidden("languages") && data.languages.length > 0
    ? h(View, { key: "languages" }, [
        h(Text, { key: "h", style: styles.sideHeading }, "Languages"),
        h(Text, { key: "l", style: styles.sideList }, data.languages.join(", ")),
      ])
    : null;

  const awardsSideEl = !hidden("awards") && data.awards.length > 0
    ? h(View, { key: "awards" }, [
        h(Text, { key: "h", style: styles.sideHeading }, "Awards"),
        h(Text, { key: "l", style: styles.sideList }, data.awards.join(", ")),
      ])
    : null;

  const mainEls: Array<ReactElement | null> = [summaryEl, experienceEl, educationEl, projectsEl, ...customEls];
  const mainSideEls: Array<ReactElement | null> = [skillsEl, certificationsEl, languagesEl, awardsEl];
  const sideEls: Array<ReactElement | null> = [skillsSideEl, certificationsSideEl, languagesSideEl, awardsSideEl];

  // ------------------------------------------------------------------
  // Compose: sidebar layout or plain single column
  // ------------------------------------------------------------------
  const children: ReactElement[] = [headerEl];
  if (isSidebar && sideEls.some((el) => el !== null)) {
    children.push(
      h(View, { key: "body", style: styles.sidebarBody }, [
        h(View, { key: "main", style: styles.mainCol }, mainEls.filter((el): el is ReactElement => el !== null)),
        h(View, { key: "side", style: styles.sideCol }, sideEls.filter((el): el is ReactElement => el !== null)),
      ]),
    );
  } else {
    children.push(
      ...mainEls.filter((el): el is ReactElement => el !== null),
      ...mainSideEls.filter((el): el is ReactElement => el !== null),
    );
  }

  return h(
    Document,
    { title: `${title || data.name?.trim() || "resume"} \u2014 ${template}`, author: "AI Resume Builder" },
    h(Page, { size: "A4", style: styles.page }, children),
  );
}
