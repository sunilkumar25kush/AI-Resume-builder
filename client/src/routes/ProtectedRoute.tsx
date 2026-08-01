import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { PageLoader } from "@/components/common/PageLoader";
import { useAuthStore } from "@/stores/auth";

/** Blocks guests from protected pages. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === "loading") return <PageLoader />;
  if (status === "guest") return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

/** Keeps authenticated users away from auth pages (login/register/...). */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);

  if (status === "loading") return <PageLoader />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <>{children}</>;
}
