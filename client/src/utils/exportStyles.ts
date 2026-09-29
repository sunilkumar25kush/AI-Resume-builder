/** Per-template export styling shared by the PDF and DOCX builders. */
export interface ExportStyle {
  /** PDF built-in font family (@react-pdf/renderer). */
  pdfFont: string;
  /** Word font name (docx). */
  docxFont: string;
  /** Accent hex color used for headings/name. */
  accent: string;
  headingSize: number;
  bodySize: number;
  /** Classic-style centered header. */
  centered?: boolean;
}

export const EXPORT_STYLES: Record<string, ExportStyle> = {
  "classic-rose-serif": {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#C2185B",
    headingSize: 12,
    bodySize: 10.5,
    centered: true,
  },
  "navy-sidebar-timeline": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#2B3450",
    headingSize: 11,
    bodySize: 10,
  },
  "classic-ats-executive": {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#000000",
    headingSize: 11,
    bodySize: 10,
    centered: true,
  },
  "photo-header-split-timeline": {
    pdfFont: "Helvetica",
    docxFont: "Arial",
    accent: "#222222",
    headingSize: 12,
    bodySize: 10,
  },
  "dense-analyst-serif": {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#000000",
    headingSize: 11,
    bodySize: 9.5,
    centered: true,
  },
  "right-sidebar-light": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#4F46E5",
    headingSize: 11,
    bodySize: 10,
  },
  "banner-header": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#0F4C81",
    headingSize: 11.5,
    bodySize: 10,
  },
  "compact-fresher-ats": {
    pdfFont: "Helvetica",
    docxFont: "Arial",
    accent: "#000000",
    headingSize: 10,
    bodySize: 9.5,
    centered: true,
  },
  "creative-blocks": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#7C3AED",
    headingSize: 11,
    bodySize: 10,
  },
  "elegant-serif-gold": {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#B08D57",
    headingSize: 11.5,
    bodySize: 10,
    centered: true,
  },
  "modern-two-column-pro": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#1D4ED8",
    headingSize: 11,
    bodySize: 10,
  },
  "tech-engineer-clean": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#0F766E",
    headingSize: 11,
    bodySize: 10,
  },
  classic: {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#C2185B",
    headingSize: 12,
    bodySize: 10.5,
    centered: true,
  },
  modern: {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#2563eb",
    headingSize: 11,
    bodySize: 10,
  },
  minimal: {
    pdfFont: "Helvetica",
    docxFont: "Calibri Light",
    accent: "#6b7280",
    headingSize: 10,
    bodySize: 10,
  },
  compact: {
    pdfFont: "Helvetica",
    docxFont: "Arial",
    accent: "#374151",
    headingSize: 9.5,
    bodySize: 8.5,
  },
  executive: {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#b45309",
    headingSize: 12,
    bodySize: 10.5,
  },
  creative: {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#c026d3",
    headingSize: 11,
    bodySize: 10,
  },
  startup: {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#4f46e5",
    headingSize: 11,
    bodySize: 10,
  },
  google: {
    pdfFont: "Helvetica",
    docxFont: "Arial",
    accent: "#4285f4",
    headingSize: 11,
    bodySize: 10,
    centered: true,
  },
  microsoft: {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#0078d4",
    headingSize: 11,
    bodySize: 10,
  },
  harvard: {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#A51C30",
    headingSize: 11.5,
    bodySize: 10.5,
  },
  elegant: {
    pdfFont: "Times-Roman",
    docxFont: "Georgia",
    accent: "#fb7185",
    headingSize: 11,
    bodySize: 10,
  },
  "modern-pro": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#2563eb",
    headingSize: 11,
    bodySize: 10,
  },
  "tech-engineer": {
    pdfFont: "Helvetica",
    docxFont: "Calibri",
    accent: "#0f766e",
    headingSize: 10.5,
    bodySize: 10,
  },
};

export function exportFileName(fileName: string, extension: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  return `${base}-resume.${extension}`;
}
