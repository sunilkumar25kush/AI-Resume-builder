import { useEffect } from "react";
import { RouterProvider } from "react-router";

import { Toaster } from "@/components/ui/sonner";
import { router } from "@/routes";
import { useAuthStore } from "@/stores/auth";
import { useNotificationsStore } from "@/stores/notifications";
import { useThemeStore } from "@/stores/theme";

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const authStatus = useAuthStore((state) => state.status);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Restore session on first paint.
  useEffect(() => {
    void useAuthStore.getState().fetchMe();
  }, []);

  // Load notifications once authenticated; drop them when signed out.
  useEffect(() => {
    if (authStatus === "authenticated") {
      void useNotificationsStore.getState().fetch();
    } else {
      useNotificationsStore.getState().reset();
    }
  }, [authStatus]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
