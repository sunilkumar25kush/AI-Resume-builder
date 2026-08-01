// M4 smoke test — resume upload + parsing (PDF + DOCX + garbage + oversize + CRUD)
import JSZip from "jszip";

const BASE = "http://localhost:5001/api";
let pass = 0;
let fail = 0;

function check(name, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function api(path, { method = "GET", headers = {}, body, cookie } = {}) {
  const finalHeaders = cookie ? { ...headers, cookie } : headers;
  const res = await fetch(`${BASE}${path}`, { method, headers: finalHeaders, body, redirect: "manual" });
  const setCookie = res.headers.get("set-cookie") ?? "";
  return { status: res.status, json: await res.json().catch(() => ({})), setCookie };
}

// ---- register a fresh user ----
const email = `m4-${Date.now()}@test.com`;
const reg = await api("/auth/register", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M4 Tester", email, password: "password123" }),
});
const cookie = reg.setCookie.split(";")[0];
check("register user", reg.status === 201 && cookie.startsWith("token="));

const auth = { cookie, "content-type": "application/json" };

// ---- build a valid minimal PDF with correct xref offsets ----
function buildPdf(lines) {
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
  const contentLines = lines.map(
    (line, i) => `BT /F1 ${i === 0 ? 12 : 10} Tf 72 ${760 - i * 14} Td (${line}) Tj ET`,
  );
  const stream = contentLines.join("\n");
  objects[4] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const pdfLines = [
  "Arjun Kumar - Senior Full-Stack Engineer",
  "Email: arjun.kumar@example.com",
  "Phone: +91 98765 43210",
  "LinkedIn: linkedin.com/in/arjunkumar",
  "Github: github.com/arjunkumar",
  "SKILLS",
  "JavaScript, React, Node.js, MongoDB, Docker, AWS",
  "EXPERIENCE",
  "Senior Full-Stack Engineer | Acme Corp | Bengaluru",
  "Jan 2022 - Present",
  "Led migration of 12 microservices to Kubernetes.",
  "EDUCATION",
  "B.Tech Computer Science | IIT Delhi",
  "2016 - 2020",
];

// ---- build a valid DOCX with Unicode (Hindi) text ----
function buildDocx(lines) {
  const escapeXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = lines.map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`).join("");
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`,
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

const docxLines = [
  "प्रियांशी शर्मा - Senior Frontend Developer",
  "Email: priyanshi@example.com",
  "SKILLS",
  "TypeScript, React, Tailwind CSS, GraphQL, Jest",
  "EXPERIENCE",
  "Senior Frontend Developer | TechNova | Pune",
  "Mar 2021 - Present",
  "Rebuilt the design system used by 40+ engineers.",
  "EDUCATION",
  "M.Sc Computer Science | Pune University",
  "2018 - 2020",
];

function fd(pdfBuffer, name, type) {
  const form = new FormData();
  form.append("resume", new Blob([pdfBuffer], { type }), name);
  return form;
}

console.log("— PDF upload (expect 201 + parsed fields) —");
const pdfFd = fd(buildPdf(pdfLines), "arjun-resume.pdf", "application/pdf");
const pdfRes = await api("/resumes", { method: "POST", body: pdfFd, cookie });
const pdfData = pdfRes.json.data?.resume?.parsedData ?? {};
check("pdf upload 201", pdfRes.status === 201, `status ${pdfRes.status}`);
check("email extracted", pdfData.contact?.email === "arjun.kumar@example.com", pdfData.contact?.email);
check("phone extracted", (pdfData.contact?.phone ?? "").includes("98765"), pdfData.contact?.phone);
check("experience parsed", pdfData.experience?.[0]?.title === "Senior Full-Stack Engineer", JSON.stringify(pdfData.experience?.[0] ?? {}));
check("company parsed", pdfData.experience?.[0]?.company === "Acme Corp");
check("education parsed", pdfData.education?.[0]?.degree === "B.Tech Computer Science", JSON.stringify(pdfData.education?.[0] ?? {}));
check("skills parsed", pdfData.skills?.includes("React") && pdfData.skills?.includes("MongoDB"), `${(pdfData.skills ?? []).length} skills`);
const pdfId = pdfRes.json.data?.resume?._id;

console.log("— DOCX upload with Unicode (expect 201 + unicode preserved) —");
const docxBuf = await buildDocx(docxLines);
const docxFd = fd(docxBuf, "priyanshi-resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
const docxRes = await api("/resumes", { method: "POST", body: docxFd, cookie });
const docxData = docxRes.json.data?.resume?.parsedData ?? {};
check("docx upload 201", docxRes.status === 201);
check("unicode name preserved", docxData.summary?.includes("प्रियांशी"), docxData.summary?.slice(0, 40));
check("docx experience parsed", docxData.experience?.[0]?.company === "TechNova", JSON.stringify(docxData.experience?.[0] ?? {}));
check("docx dates parsed", docxData.experience?.[0]?.startDate === "Mar 2021" && docxData.experience?.[0]?.endDate === "Present", `${docxData.experience?.[0]?.startDate} – ${docxData.experience?.[0]?.endDate}`);
check("docx skills parsed", docxData.skills?.includes("GraphQL"), `${(docxData.skills ?? []).length} skills`);
const docxId = docxRes.json.data?.resume?._id;

console.log("— Garbage file (expect 400 rejected) —");
const garbageFd = fd(Buffer.from("this is definitely not a pdf document at all"), "garbage.pdf", "application/pdf");
const garbageRes = await api("/resumes", { method: "POST", body: garbageFd, cookie });
check("garbage rejected 400", garbageRes.status === 400, `status ${garbageRes.status} ${garbageRes.json.message ?? ""}`);

console.log("— Oversized file (expect 413) —");
const bigFd = fd(Buffer.alloc(11 * 1024 * 1024, 0), "big.pdf", "application/pdf");
const bigRes = await api("/resumes", { method: "POST", body: bigFd, cookie });
check("oversize rejected 413", bigRes.status === 413, `status ${bigRes.status}`);

console.log("— CRUD —");
const listRes = await api("/resumes", { cookie });
check("list returns 2", listRes.status === 200 && listRes.json.data?.resumes?.length === 2, `count ${listRes.json.data?.resumes?.length}`);

const getRes = await api(`/resumes/${pdfId}`, { cookie });
check("get one 200", getRes.status === 200 && getRes.json.data?.resume?._id === pdfId);

const patchRes = await api(`/resumes/${pdfId}`, {
  method: "PATCH",
  headers: auth,
  cookie,
  body: JSON.stringify({
    parsedData: { skills: ["React", "Node.js", "Docker", "Kubernetes"], summary: "Edited summary line" },
  }),
});
const patched = patchRes.json.data?.resume?.parsedData ?? {};
check("patch saved", patchRes.status === 200 && patched.skills?.length === 4 && patched.summary === "Edited summary line", `skills ${patched.skills?.length}`);

const delRes = await api(`/resumes/${docxId}`, { method: "DELETE", cookie });
check("delete 200", delRes.status === 200 && delRes.json.data?.id === docxId);

const list2 = await api("/resumes", { cookie });
check("list after delete = 1", list2.json.data?.resumes?.length === 1, `count ${list2.json.data?.resumes?.length}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
