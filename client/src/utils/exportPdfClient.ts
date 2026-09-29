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

  if (resumeId) {
    try {
      const blob = await resumesApi.exportPdf(resumeId, density, theme);
      downloadBlob(blob, exportFileName(fileName, "pdf"));
      return;
    } catch (err) {
      console.warn("Server PDF export failed, falling back to browser print:", err);
      // Fallback: trigger browser print
      window.print();
      return;
    }
  }

  // Fallback for scratch instances: trigger browser print
  window.print();
}
