import { createResumePdfElement } from "@/utils/exportPdf";
import { exportFileName } from "@/utils/exportStyles";
import { downloadBlob } from "@/utils/download";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ParsedResumeData, ResumeTemplate } from "@/types";

/** Render + download the resume as a PDF (renderer loaded on demand). */
export async function exportResumePdf(
  data: ParsedResumeData,
  template: ResumeTemplate,
  fileName: string,
  title?: string,
): Promise<void> {
  const renderer = await import("@react-pdf/renderer");
  const element = createResumePdfElement(renderer, { data, template, title }) as ReactElement<DocumentProps>;
  const blob = await renderer.pdf(element).toBlob();
  downloadBlob(blob, exportFileName(fileName, "pdf"));
}
