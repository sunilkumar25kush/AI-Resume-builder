import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  CheckCircle2,
  Briefcase,
  MapPin,
  Phone,
  Rocket,
  Check,
} from "lucide-react";
import { useResumeBuddy } from "@/context/ResumeBuddyContext";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PLATFORM_FEATURES,
  RESUME_CREATION_SECTIONS,
} from "./onboardingData";
import { useOnboardingState } from "./useOnboardingState";

export function MascotOnboardingFlow() {
  const navigate = useNavigate();
  const { say, snapTo, dock, playAnimation } = useResumeBuddy();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const {
    isActive,
    currentStep,
    subStepIndex,
    next,
    prev,
    skip,
    complete,
  } = useOnboardingState();

  // Profile form state for Step 3
  const [targetJobTitle, setTargetJobTitle] = useState(user?.targetJobTitle || "");
  const [location, setLocation] = useState(user?.location || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile defaults when user loads
  useEffect(() => {
    if (user) {
      if (user.targetJobTitle && !targetJobTitle) setTargetJobTitle(user.targetJobTitle);
      if (user.location && !location) setLocation(user.location);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  // Synchronize Mascot position, expression, gesture, and speech for each step
  useEffect(() => {
    if (!isActive) return;

    switch (currentStep) {
      case 1: {
        // STEP 1: Welcome
        snapTo('[data-mascot-section="welcome"], #dashboard-welcome, main', {
          placement: "top-right",
        });
        playAnimation("welcome", "waveHello", 7000);
        say(
          "Hey! Welcome to your AI Resume Builder. I'm your personal assistant. I'll help you create an amazing professional resume.",
          {
            mood: "welcome",
            gesture: "waveHello",
            autoDismissMs: 0,
            actions: [
              {
                label: "Let's Get Started →",
                onClick: next,
              },
              {
                label: "Skip Introduction",
                onClick: skip,
                variant: "secondary",
              },
            ],
          },
        );
        break;
      }

      case 2: {
        // STEP 2: Platform Introduction (7 Features)
        const feature = PLATFORM_FEATURES[subStepIndex];
        if (feature) {
          snapTo(feature.targetSelector, { placement: "top-right" });
          playAnimation(feature.mood, feature.gesture, 6000);
          say(feature.message, {
            mood: feature.mood,
            gesture: feature.gesture,
            autoDismissMs: 0,
            actions: [
              {
                label:
                  subStepIndex === PLATFORM_FEATURES.length - 1
                    ? "Continue to Profile →"
                    : "Next Feature →",
                onClick: next,
              },
            ],
          });
        }
        break;
      }

      case 3: {
        // STEP 3: User Profile
        snapTo("#onboarding-profile-card", { placement: "right" });
        playAnimation("thinking", "handOnChin", 6000);
        say("Let's start with a few basic details so I can guide you better.", {
          mood: "thinking",
          gesture: "handOnChin",
          autoDismissMs: 0,
        });
        break;
      }

      case 4: {
        // STEP 4: Resume Creation (8 Sections)
        const section = RESUME_CREATION_SECTIONS[subStepIndex];
        if (section) {
          snapTo("#onboarding-resume-section-card", { placement: "top-right" });
          playAnimation(section.mood, section.gesture, 5000);
          say(section.message, {
            mood: section.mood,
            gesture: section.gesture,
            autoDismissMs: 0,
            actions: [
              {
                label:
                  subStepIndex === RESUME_CREATION_SECTIONS.length - 1
                    ? "Finish Tour →"
                    : "Next Section →",
                onClick: next,
              },
            ],
          });
        }
        break;
      }

      case 5: {
        // STEP 5: Completion
        dock();
        playAnimation("celebrating", "raiseHands", 8000);
        say("You're all set! Your journey to a professional resume starts here.", {
          mood: "celebrating",
          gesture: "raiseHands",
          autoDismissMs: 0,
          actions: [
            {
              label: "Start Building My Resume 🚀",
              onClick: () => {
                void complete();
                navigate("/wizard");
              },
            },
          ],
        });
        break;
      }
    }
  }, [isActive, currentStep, subStepIndex, next, skip, snapTo, dock, playAnimation, say, complete, navigate]);

  if (!isActive) return null;

  // Handle saving profile in Step 3
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      if (user) {
        await updateProfile({
          name: user.name,
          targetJobTitle: targetJobTitle.trim() || undefined,
          location: location.trim() || undefined,
          phone: phone.trim() || undefined,
        });
      }
      next();
    } catch (err) {
      console.error("Profile save error:", err);
      next();
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header: Step Indicator & Skip Option */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between rounded-2xl border border-emerald-500/20 bg-background/90 px-4 py-3 shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Onboarding Tour
              </span>
              <span className="text-xs text-muted-foreground">• Step {currentStep} of 5</span>
            </div>
            <p className="text-xs font-medium text-foreground">
              {currentStep === 1 && "Welcome & Overview"}
              {currentStep === 2 && `Platform Tour (${subStepIndex + 1} of ${PLATFORM_FEATURES.length})`}
              {currentStep === 3 && "Personalize Your Experience"}
              {currentStep === 4 && `Resume Sections (${subStepIndex + 1} of ${RESUME_CREATION_SECTIONS.length})`}
              {currentStep === 5 && "Ready to Build!"}
            </p>
          </div>
        </div>

        {/* 5-Step Segmented Progress Bar */}
        <div className="hidden sm:flex items-center gap-1.5 px-3">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div
              key={stepNum}
              className={`h-2 rounded-full transition-all duration-300 ${
                stepNum < currentStep
                  ? "w-5 bg-emerald-500"
                  : stepNum === currentStep
                  ? "w-8 bg-emerald-500 animate-pulse"
                  : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>

        <button
          onClick={skip}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Skip Introduction"
        >
          <span>Skip</span>
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>

      {/* Middle Interactive Cards for Specific Steps */}
      <div className="pointer-events-auto mx-auto my-auto w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* STEP 3: User Profile Lightweight Card */}
          {currentStep === 3 && (
            <motion.div
              id="onboarding-profile-card"
              key="step-3-profile"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="rounded-2xl border border-emerald-500/30 bg-card/95 p-6 shadow-2xl backdrop-blur-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Quick Profile Setup</h3>
                  <p className="text-xs text-muted-foreground">
                    Optional basics to help ResumeBuddy tailor keywords and suggestions.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Optional
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <Label htmlFor="ob-job-title" className="text-xs font-medium flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                    Target Job Title
                  </Label>
                  <Input
                    id="ob-job-title"
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ob-location" className="text-xs font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      Location
                    </Label>
                    <Input
                      id="ob-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote / New York"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ob-phone" className="text-xs font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-500" />
                      Phone Number
                    </Label>
                    <Input
                      id="ob-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={next}
                    className="text-xs text-muted-foreground"
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    {isSavingProfile ? "Saving…" : "Save & Continue →"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Resume Creation Sections Showcase */}
          {currentStep === 4 && (
            <motion.div
              id="onboarding-resume-section-card"
              key={`step-4-section-${subStepIndex}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="rounded-2xl border border-emerald-500/30 bg-card/95 p-6 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {subStepIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {RESUME_CREATION_SECTIONS[subStepIndex].name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Section {subStepIndex + 1} of {RESUME_CREATION_SECTIONS.length}
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="py-4">
                <p className="text-sm font-medium text-foreground">
                  {RESUME_CREATION_SECTIONS[subStepIndex].description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {RESUME_CREATION_SECTIONS.map((sec, idx) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        // Jump directly to that section in tour
                      }}
                      className={`h-2 rounded-full transition-all ${
                        idx === subStepIndex
                          ? "w-6 bg-emerald-500"
                          : idx < subStepIndex
                          ? "w-2.5 bg-emerald-400/60"
                          : "w-2.5 bg-muted"
                      }`}
                      title={sec.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={prev}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={next}
                  className="gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  {subStepIndex === RESUME_CREATION_SECTIONS.length - 1 ? "Complete →" : "Next Section"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Final Celebration Completion Card */}
          {currentStep === 5 && (
            <motion.div
              id="onboarding-celebration"
              key="step-5-complete"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="text-center rounded-3xl border border-emerald-500/40 bg-card/95 p-8 shadow-2xl backdrop-blur-md"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/30">
                <Rocket className="h-7 w-7 animate-bounce" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">You&apos;re All Set!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your journey to a high-scoring, professional resume starts here. I&apos;ll be right beside you whenever you need feedback or ATS checks.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <Button
                  size="lg"
                  onClick={() => {
                    void complete();
                    navigate("/wizard");
                  }}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/25 text-sm py-5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start Building My Resume</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void complete();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Navigation HUD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto mx-auto flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-4 py-2 shadow-lg backdrop-blur-md"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={prev}
          disabled={currentStep === 1 && subStepIndex === 0}
          className="h-8 gap-1 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </Button>

        <span className="h-4 w-[1px] bg-border" />

        <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
          <span>Step {currentStep} of 5</span>
          {currentStep === 2 && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ({subStepIndex + 1}/{PLATFORM_FEATURES.length})
            </span>
          )}
          {currentStep === 4 && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ({subStepIndex + 1}/{RESUME_CREATION_SECTIONS.length})
            </span>
          )}
        </div>

        <span className="h-4 w-[1px] bg-border" />

        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (currentStep === 5) {
              void complete();
              navigate("/wizard");
            } else {
              next();
            }
          }}
          className="h-8 gap-1 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 text-xs font-bold text-white shadow-sm"
        >
          <span>{currentStep === 5 ? "Start Wizard" : "Next"}</span>
          {currentStep === 5 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </Button>
      </motion.div>
    </div>
  );
}

