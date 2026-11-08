/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

import { PageLoader } from "@/components/common/PageLoader";
import { GuestOnlyRoute, ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/stores/auth";

/*
 * Layouts are lazy too: guests on the landing page never download the app shell
 * (sidebar, radix tooltip/sheet/dropdown), and signed-in users never download
 * the marketing page.
 */
const loadAppLayout = () => import("@/layouts/AppLayout");
const loadDashboard = () => import("@/pages/DashboardPage");
const loadLanding = () => import("@/pages/LandingPage");

const AppLayoutLazy = lazy(() => loadAppLayout().then((m) => ({ default: m.AppLayout })));
const AuthLayoutLazy = lazy(() =>
  import("@/layouts/AuthLayout").then((m) => ({ default: m.AuthLayout })),
);

const LandingPage = lazy(loadLanding);
const DashboardPage = lazy(loadDashboard);
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ResumesPage = lazy(() => import("@/pages/ResumesPage"));
const ResumePreviewPage = lazy(() => import("@/pages/ResumePreviewPage"));
const ResumeEditorPage = lazy(() => import("@/pages/ResumeEditorPage"));
const JDsPage = lazy(() => import("@/pages/JDsPage"));
const JDPreviewPage = lazy(() => import("@/pages/JDPreviewPage"));
const JDEditPage = lazy(() => import("@/pages/JDEditPage"));
const OptimizationsPage = lazy(() => import("@/pages/OptimizationsPage"));
const OptimizeResultPage = lazy(() => import("@/pages/OptimizeResultPage"));
const ResumeWizardPage = lazy(() => import("@/pages/ResumeWizardPage"));
const AtsCheckPage = lazy(() => import("@/pages/AtsCheckPage"));
const ScratchBuildPage = lazy(() => import("@/pages/ScratchBuildPage"));
const PrintResumePage = lazy(() => import("@/pages/PrintResumePage"));
const PortfoliosPage = lazy(() => import("@/pages/PortfoliosPage"));
const PortfolioPreviewPage = lazy(() => import("@/pages/PortfolioPreviewPage"));
const PortfolioEditorPage = lazy(() => import("@/pages/PortfolioEditorPage"));
const PublicPortfolioPage = lazy(() => import("@/pages/PublicPortfolioPage"));

/*
 * Kick off the most likely first-screen chunks in parallel with the entry
 * bundle, instead of discovering them one level at a time (layout → page).
 * A persisted user from a previous visit means we will almost certainly show
 * the dashboard; otherwise the landing page.
 */
if (typeof window !== "undefined" && window.location.pathname === "/") {
  if (useAuthStore.getState().user) {
    void loadAppLayout();
    void loadDashboard();
  } else {
    void loadLanding();
  }
}

/** App shell with its own Suspense boundary so the shell can stream in. */
function AppLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AppLayoutLazy />
    </Suspense>
  );
}

function AuthLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthLayoutLazy />
    </Suspense>
  );
}

function LandingRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LandingPage />
    </Suspense>
  );
}

function RootGate() {
  const status = useAuthStore((state) => state.status);
  const hasPersistedUser = useAuthStore((state) => state.user !== null);

  // Render optimistically while /auth/me is in flight: returning users get the
  // dashboard shell, first-time visitors get the landing page right away.
  if (status === "guest" || (status === "loading" && !hasPersistedUser)) {
    return <LandingRoute />;
  }
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootGate />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: "/landing",
    element: <LandingRoute />,
  },
  {
    path: "/p/:slug",
    element: <PublicPortfolioPage />,
  },
  {
    path: "/portfolios/:id",
    element: (
      <ProtectedRoute>
        <PortfolioPreviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/portfolio-templates/:templateId",
    element: <PortfolioPreviewPage />,
  },
  {
    path: "/print/:id",
    element: <PrintResumePage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      {
        path: "/wizard",
        element: <ResumeWizardPage />,
      },
      {
        path: "/ats-check",
        element: <AtsCheckPage />,
      },
      {
        path: "/build",
        element: <ScratchBuildPage />,
      },
      {
        path: "/resumes",
        element: <ResumesPage />,
      },
      {
        path: "/resumes/:id",
        element: <ResumePreviewPage />,
      },
      {
        path: "/resumes/:id/edit",
        element: <ResumeEditorPage />,
      },
      {
        path: "/jds",
        element: <JDsPage />,
      },
      {
        path: "/jds/:id",
        element: <JDPreviewPage />,
      },
      {
        path: "/jds/:id/edit",
        element: <JDEditPage />,
      },
      {
        path: "/optimize",
        element: <OptimizationsPage />,
      },
      {
        path: "/optimize/:id",
        element: <OptimizeResultPage />,
      },
      {
        path: "/portfolios",
        element: <PortfoliosPage />,
      },
      {
        path: "/portfolios/:id/edit",
        element: <PortfolioEditorPage />,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: (
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <GuestOnlyRoute>
            <ForgotPasswordPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <GuestOnlyRoute>
            <ResetPasswordPage />
          </GuestOnlyRoute>
        ),
      },
    ],
  },
]);
