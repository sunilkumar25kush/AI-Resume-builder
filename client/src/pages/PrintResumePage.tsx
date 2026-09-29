import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import axios from "axios";
import { getTemplateById } from "@/templates";
import type { Resume } from "@/types";

export default function PrintResumePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const densityParam = searchParams.get("density") || "density-1";
  const autoPrint = searchParams.get("autoPrint") === "true";

  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Parse optional theme overrides
  let theme: { accentColor?: string; fontSize?: string } = {};
  const themeParam = searchParams.get("theme");
  if (themeParam) {
    try {
      theme = JSON.parse(decodeURIComponent(themeParam));
    } catch {
      theme = {};
    }
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const url = `/api/resumes/${id}/print-data${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    axios
      .get(url, { withCredentials: true })
      .then((res) => {
        if (!cancelled) {
          setResume(res.data.data.resume);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Failed to load resume for printing");
        }
      });

    // Wait for fonts to be ready
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (!cancelled) setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  useEffect(() => {
    if (autoPrint && resume && fontsLoaded) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, resume, fontsLoaded]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 font-sans">
        <h2 className="text-xl font-bold mb-2">Print Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-8 text-center text-neutral-500 font-sans">
        <p>Loading resume for print...</p>
      </div>
    );
  }

  const templateDef = getTemplateById(resume.template);
  const TemplateComponent = templateDef.component;
  const mergedTheme = {
    ...templateDef.defaultTheme,
    ...theme,
  };

  return (
    <div
      id="print-root"
      className={`resume-print-canvas ${densityParam}`}
      style={{
        width: "210mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        minHeight: "auto",
        position: "relative",
      }}
    >
      <TemplateComponent data={resume.parsedData} theme={mergedTheme} />

      {/* Puppeteer wait marker: rendered when fonts and data are completely loaded */}
      {fontsLoaded && <div id="print-ready" style={{ display: "none" }} data-status="ready" />}
    </div>
  );
}
