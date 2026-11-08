import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { PageLoader } from "@/components/common/PageLoader";
import { useAuthStore } from "@/stores/auth";

/**
 * Blocks guests from protected pages.
 *
 * While the session is still being verified (`status === "loading"`) we render
 * optimistically when a user was persisted from a previous visit, so the app
 * shell paints immediately instead of waiting on the `/auth/me` round-trip
 * (which can take seconds on a cold backend). If verification fails the store
 * flips to "guest" and this redirects to /login.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const hasPersistedUser = useAuthStore((state) => state.user !== null);
  const location = useLocation();

  if (status === "loading" && !hasPersistedUser) return <PageLoader />;
  if (status === "guest") return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

/**
 * Keeps authenticated users away from auth pages (login/register/...).
 * Visitors without a persisted session see the form immediately.
 */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const hasPersistedUser = useAuthStore((state) => state.user !== null);

  if (status === "loading" && hasPersistedUser) return <PageLoader />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <>{children}</>;
}
