import { LandingBenefits } from "@/components/landing/LandingBenefits";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingShowcase } from "@/components/landing/LandingShowcase";
import { TaglineReveal } from "@/components/landing/TaglineReveal";

/**
 * Everything on the landing page that sits below the hero.
 *
 * Shipped as its own lazily-loaded chunk so the hero can paint without
 * waiting for framer-motion and the heavier interactive sections
 * (showcase, scroll-linked tagline, FAQ accordion) to download & execute.
 */
export default function LandingBelowFold() {
  return (
    <>
      {/* Mandatory Tagline Reveal Section with Scroll Animation */}
      <TaglineReveal />

      {/* Outcome Driven Benefits */}
      <LandingBenefits />

      {/* 3 Step Workflow */}
      <LandingHowItWorks />

      {/* Template Showcase Gallery */}
      <LandingShowcase />

      {/* Frequently Asked Questions */}
      <LandingFaq />

      {/* Bottom Conversion Banner */}
      <LandingCta />
    </>
  );
}

export { LandingFooter };

