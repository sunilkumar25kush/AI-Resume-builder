import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How accurate is the deterministic ATS scoring algorithm?",
    answer:
      "Our parser checks the exact criteria used by modern Applicant Tracking Systems such as Greenhouse, Lever, and Workday. It evaluates section hierarchy, standard job title conventions, contact data completeness, measurable metric density, and keyword frequency. Because it uses deterministic rules alongside AI semantic analysis, you get repeatable and actionable scores instead of random guesses.",
  },
  {
    question: "Can I export my developer portfolio to raw code?",
    answer:
      "Yes. Every portfolio can be published to an instant public URL or exported as a production clean React and Tailwind bundle. You retain complete ownership of your code, markup, and assets with zero vendor lock in.",
  },
  {
    question: "What file formats can I download for my resumes?",
    answer:
      "You can export clean vector PDF documents optimized for automated ATS parsers as well as formatted DOCX files. Both export engines preserve font metrics, margins, and column layouts without visual degradation.",
  },
  {
    question: "Do you sell or share my resume data with recruiters or third parties?",
    answer:
      "No. Your resume data, contact information, career history, and portfolio content remain strictly private. We do not monetize candidate data, we do not train public models on your personal documents, and we never share your profile without your explicit action.",
  },
  {
    question: "How does the AI tailor my resume to specific job descriptions?",
    answer:
      "You paste a job description or select an existing target role. The system extracts hard technical skills, tools, required certifications, and core competencies. It then suggests measurable bullet points and rephrased achievements tailored to those exact requirements while preserving your true experience.",
  },
  {
    question: "Can I connect a custom web slug to my live portfolio?",
    answer:
      "Yes. You can claim a unique handle such as /p/yourname immediately. You can update your custom slug, toggle public indexation, configure Open Graph social preview cards, and customize SEO titles directly from your portfolio settings.",
  },
  {
    question: "What is included in the free plan forever?",
    answer:
      "The free plan includes complete access to create and download ATS resumes, live portfolio website generation, access to multiple design templates, and unlimited deterministic ATS score audits. No credit card is required to sign up.",
  },
  {
    question: "How does live portfolio hosting work?",
    answer:
      "Every generated portfolio is immediately hosted on high speed global edge servers. When you update your projects, skills, or bio in the editor, your live site refreshes instantly with sub 100 millisecond response times.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-muted-foreground text-xs font-medium mb-4">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Frequently Asked Questions</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-center max-w-2xl text-balance">
          Everything you need to know before you build
        </h2>

        <p className="mt-4 text-sm sm:text-base text-muted-foreground text-center max-w-xl text-pretty">
          Clear answers about ATS compatibility, developer portfolio hosting, code export, and privacy standards.
        </p>

        {/* FAQ Accordion List */}
        <div className="mt-12 w-full flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card/60 dark:bg-[#181818] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer hover:bg-muted/30 focus:outline-hidden focus-visible:bg-muted/40 transition-colors"
                >
                  <span className="text-base sm:text-lg font-medium text-foreground pr-4 text-balance">
                    {faq.question}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background dark:bg-[#272727] text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
