/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { GuestOnlyRoute, ProtectedRoute } from "@/routes/ProtectedRoute";

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
const ResumeEditPage = lazy(() => import("@/pages/ResumeEditPage"));
const JDsPage = lazy(() => import("@/pages/JDsPage"));
const JDPreviewPage = lazy(() => import("@/pages/JDPreviewPage"));
const JDEditPage = lazy(() => import("@/pages/JDEditPage"));
const OptimizationsPage = lazy(() => import("@/pages/OptimizationsPage"));
const OptimizeResultPage = lazy(() => import("@/pages/OptimizeResultPage"));

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/resumes",
        element: (
          <ProtectedRoute>
            <ResumesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/resumes/:id",
        element: (
          <ProtectedRoute>
            <ResumePreviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/resumes/:id/edit",
        element: (
          <ProtectedRoute>
            <ResumeEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/jds",
        element: (
          <ProtectedRoute>
            <JDsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/jds/:id",
        element: (
          <ProtectedRoute>
            <JDPreviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/jds/:id/edit",
        element: (
          <ProtectedRoute>
            <JDEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/optimize",
        element: (
          <ProtectedRoute>
            <OptimizationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/optimize/:id",
        element: (
          <ProtectedRoute>
            <OptimizeResultPage />
          </ProtectedRoute>
        ),
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
