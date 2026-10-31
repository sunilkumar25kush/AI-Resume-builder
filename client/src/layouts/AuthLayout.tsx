import { Outlet } from "react-router";
import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { APP_NAME } from "@/constants";

/** Centered, card-based shell for authentication pages. */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-6 w-6" aria-hidden />
        </span>
        <span className="text-xl font-semibold tracking-tight">{APP_NAME}</span>
      </div>
      <main className="w-full max-w-md">
        <Outlet />
      </main>
    </div>
  );
}
