// M10 smoke tests — the export libraries actually produce valid blobs in
// this environment (Node 24, same deps the browser bundle uses).
import React from "react";
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import { Document as PdfDocument, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// --- DOCX: build + pack → blob ---
const docx = new DocxDocument({
  creator: "AI Resume Builder",
  styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
  sections: [
    {
      children: [
        new Paragraph({ children: [new TextRun({ text: "RAHUL SHARMA", bold: true, size: 32, color: "2563EB" })] }),
        new Paragraph({ children: [new TextRun({ text: "react@test.com  ·  Bangalore" })] }),
        new Paragraph({ children: [new TextRun({ text: "SUMMARY", bold: true, color: "2563EB" })] }),
        new Paragraph({ children: [new TextRun({ text: "Engineer with 4 years of experience." })] }),
      ],
    },
  ],
});
const docxBlob = await Packer.toBlob(docx);
check("docx blob produced", docxBlob.size > 1000, `${docxBlob.size} bytes`);
check("docx blob is a Blob", typeof docxBlob.arrayBuffer === "function");

// --- PDF: render element → blob ---
const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10 },
  name: { fontSize: 18, fontWeight: "bold", color: "#2563eb" },
});
const h = React.createElement;
const pdfElement = h(
  PdfDocument,
  { title: "resume — modern" },
  h(
    Page,
    { size: "A4", style: styles.page },
    h(View, null, [
      h(Text, { style: styles.name }, "RAHUL SHARMA"),
      h(Text, null, "react@test.com  ·  Bangalore"),
      h(Text, { style: { marginTop: 10, fontWeight: "bold", color: "#2563eb" } }, "SUMMARY"),
      h(Text, null, "Engineer with 4 years of experience."),
    ]),
  ),
);
const pdfBlob = await pdf(pdfElement).toBlob();
check("pdf blob produced", pdfBlob.size > 1000, `${pdfBlob.size} bytes`);
const head = new TextDecoder().decode((await pdfBlob.slice(0, 5).arrayBuffer()));
check("pdf magic header", head === "%PDF-", head);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
