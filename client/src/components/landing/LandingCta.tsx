import { Link } from "react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-border/80 bg-muted/40 dark:bg-[#181818] p-8 sm:p-12 md:p-16 text-center overflow-hidden">
          {/* Subtle accent badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border bg-background/80 dark:bg-[#272727] text-xs font-medium text-foreground mb-6 shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Launch in minutes, not days</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground max-w-2xl mx-auto text-balance leading-tight">
            Build your ATS resume and live developer portfolio today
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            Join thousands of software engineers who pass automated screening filters and impress hiring managers with live interactive proof.
          </p>

          {/* Primary Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 px-6 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-md group"
            >
              <Link to="/register" className="flex items-center gap-2">
                <span>Start building free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Risk Reversal & Guarantees */}
          <div className="mt-8 pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Zero credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Free plan forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Instant PDF and React export</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
