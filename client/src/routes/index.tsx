/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

import { PageLoader } from "@/components/common/PageLoader";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { GuestOnlyRoute, ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/stores/auth";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
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

function RootGate() {
  const status = useAuthStore((state) => state.status);
  if (status === "loading") return <PageLoader />;
  if (status === "guest") return <LandingPage />;
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
    element: <LandingPage />,
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
