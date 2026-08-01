import { downloadBlob } from "@/utils/download";
import type { ParsedResumeData } from "@/types";

/** Download the structured resume data as JSON (spec: export JSON). */
export function exportResumeJson(data: ParsedResumeData, fileName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${fileName.replace(/\.[^.]+$/, "")}-resume.json`);
}
