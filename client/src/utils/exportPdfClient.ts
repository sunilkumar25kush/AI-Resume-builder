import { resumesApi } from "@/api/resumes";
import { exportFileName } from "@/utils/exportStyles";
import { downloadBlob } from "@/utils/download";
import type { ParsedResumeData, ResumeTemplate } from "@/types";

/**
 * Render + download the resume as a PDF.
 * Uses the Express backend Puppeteer endpoint (/api/resumes/:id/export/pdf)
 * which visits /print/:id for 100% exact fidelity with the React preview.
 */
export async function exportResumePdf(
  data: ParsedResumeData,
  _template: ResumeTemplate,
  fileName: string,
  _title?: string,
  resumeId?: string,
  density?: string,
  theme?: { accentColor?: string; fontSize?: string },
): Promise<void> {
  // Step 3: Name/header handling
  // If personal.fullName is empty or the placeholder "Your Name", block the download
  const rawName = (
    (data as any)?.personal?.fullName ||
    data.name ||
    ""
  ).trim();

  if (!rawName || rawName.toLowerCase() === "your name") {
    throw new Error("Add your full name before downloading");
  }

  // 1. Primary: Server-side Puppeteer export if resumeId exists (exact preview fidelity)
  if (resumeId) {
    try {
      const blob = await resumesApi.exportPdf(resumeId, density, theme);
      downloadBlob(blob, exportFileName(fileName, "pdf"));
      return;
    } catch (err) {
      console.warn("Server PDF export failed, attempting client-side PDF renderer fallback:", err);
    }
  }

  // 2. Secondary: Client-side @react-pdf/renderer (runs completely in-browser, no server needed)
  try {
    const { pdf } = await import("@react-pdf/renderer");
    const pdfModule = await import("@react-pdf/renderer");
    const { createResumePdfElement } = await import("@/utils/exportPdf");
    const pdfEl = createResumePdfElement(pdfModule, { data, template: _template, title: _title });
    const clientBlob = await pdf(pdfEl as any).toBlob();
    downloadBlob(clientBlob, exportFileName(fileName, "pdf"));
    return;
  } catch (clientErr) {
    console.warn("Client-side PDF renderer failed, falling back to print-ready view:", clientErr);
  }

  // 3. Tertiary: Dedicated print window or native print
  if (resumeId && typeof window !== "undefined") {
    const printUrl = `/print/${resumeId}?autoPrint=true&density=${density || "density-1"}&theme=${encodeURIComponent(JSON.stringify(theme || {}))}`;
    const opened = window.open(printUrl, "_blank");
    if (!opened) {
      window.print();
    }
    return;
  }

  if (typeof window !== "undefined") {
    window.print();
  }
}
