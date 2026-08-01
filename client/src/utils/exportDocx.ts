import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";

import { EXPORT_STYLES, exportFileName } from "@/utils/exportStyles";
import { downloadBlob } from "@/utils/download";
import type { ParsedResumeData, ResumeTemplate } from "@/types";

interface BuildDocxOptions {
  data: ParsedResumeData;
  template: ResumeTemplate;
  title?: string;
}

/** Build a template-aware DOCX document from parsed resume data. */
export async function buildResumeDocx({ data, template, title }: BuildDocxOptions): Promise<Blob> {
  const style = EXPORT_STYLES[template];
  const accent = style.accent;
  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 240, after: 80 },
      border: template === "classic" ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: "9CA3AF" } } : undefined,
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: Math.round(style.headingSize * 2),
          color: accent,
          font: style.docxFont,
        }),
      ],
    });
  const entry = (primary: string, secondary: string, dates: string, body: string) => [
    new Paragraph({
      spacing: { before: 80, after: 0 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: primary, bold: true, size: Math.round(style.bodySize * 2), font: style.docxFont }),
        ...(dates ? [new TextRun({ text: `    ${dates}`, size: Math.round((style.bodySize - 1) * 2), color: "6B7280", font: style.docxFont })] : []),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: secondary, size: Math.round(style.bodySize * 2), color: "4B5563", font: style.docxFont })],
    }),
    ...(body
      ? [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: body, size: Math.round(style.bodySize * 2), color: "374151", font: style.docxFont })],
          }),
        ]
      : []),
  ];

  const contact = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
    data.contact.github,
  ].filter(Boolean);
  const hidden = (key: string) => data.hiddenSections?.includes(key) ?? false;

  const children: Paragraph[] = [
    new Paragraph({
      alignment: style.centered ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: title ?? data.name ?? "Resume",
          bold: true,
          size: Math.round((style.headingSize + 8) * 2),
          color: template === "modern" ? accent : "111827",
          font: style.docxFont,
          ...(template === "classic" ? { allCaps: true } : {}),
        }),
      ],
    }),
    ...(contact.length > 0
      ? [
          new Paragraph({
            alignment: style.centered ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [new TextRun({ text: contact.join("  ·  "), size: Math.round((style.bodySize - 1) * 2), color: "4B5563", font: style.docxFont })],
          }),
        ]
      : []),
  ];

  if (!hidden("summary") && data.summary) {
    children.push(heading("Summary"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.summary, size: Math.round(style.bodySize * 2), color: "374151", font: style.docxFont })],
      }),
    );
  }

  if (!hidden("skills") && data.skills.length > 0) {
    children.push(heading("Skills"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: data.skills.join("  ·  "),
            size: Math.round(style.bodySize * 2),
            color: "374151",
            font: style.docxFont,
          }),
        ],
      }),
    );
  }

  if (!hidden("experience") && data.experience.length > 0) {
    children.push(heading("Experience"));
    for (const entryData of data.experience) {
      children.push(
        ...entry(
          entryData.title || "Untitled role",
          [entryData.company, entryData.location].filter(Boolean).join(" · "),
          [entryData.startDate, entryData.endDate].filter(Boolean).join(" – "),
          [entryData.achievements, entryData.technologies ? `Technologies: ${entryData.technologies}` : "", entryData.description].filter(Boolean).join("\n"),
        ),
      );
    }
  }

  if (!hidden("education") && data.education.length > 0) {
    children.push(heading("Education"));
    for (const entryData of data.education) {
      children.push(
        ...entry(
          entryData.degree || "Untitled degree",
          entryData.institution,
          [entryData.startDate, entryData.endDate].filter(Boolean).join(" – "),
          entryData.description,
        ),
      );
    }
  }

  if (!hidden("projects") && data.projects.length > 0) {
    children.push(heading("Projects"));
    for (const entryData of data.projects) {
      children.push(
        ...entry(
          entryData.name || "Untitled project",
          [entryData.technologies ? `Technologies: ${entryData.technologies}` : "", entryData.link, entryData.liveDemo].filter(Boolean).join("\n"),
          "",
          entryData.description,
        ),
      );
    }
  }

  if (!hidden("certifications") && data.certifications.length > 0) {
    children.push(heading("Certifications"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.certifications.join("  ·  "), size: Math.round(style.bodySize * 2), color: "374151", font: style.docxFont })],
      }),
    );
  }

  if (!hidden("languages") && data.languages.length > 0) {
    children.push(heading("Languages"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.languages.join("  ·  "), size: Math.round(style.bodySize * 2), color: "374151", font: style.docxFont })],
      }),
    );
  }

  if (!hidden("awards") && data.awards.length > 0) {
    children.push(heading("Awards"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.awards.join("  ·  "), size: Math.round(style.bodySize * 2), color: "374151", font: style.docxFont })],
      }),
    );
  }

  for (const section of data.customSections ?? []) {
    if (!section.title && !section.content) continue;
    children.push(heading(section.title || "Custom"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: section.content, size: Math.round(style.bodySize * 2), color: "374151", font: style.docxFont })],
      }),
    );
  }

  const doc = new Document({
    creator: "AI Resume Builder",
    title: `${title ?? "resume"} — ${template}`,
    styles: {
      default: {
        document: { run: { font: style.docxFont, size: Math.round(style.bodySize * 2) } },
      },
    },
    sections: [
      {
        properties: { page: { margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.7), right: convertInchesToTwip(0.7) } } },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

/** Build + download the resume as DOCX. */
export async function exportResumeDocx(
  data: ParsedResumeData,
  template: ResumeTemplate,
  fileName: string,
  title?: string,
): Promise<void> {
  const blob = await buildResumeDocx({ data, template, title });
  downloadBlob(blob, exportFileName(fileName, "docx"));
}
