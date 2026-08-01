import { useEffect } from "react";
import { RouterProvider } from "react-router";

import { Toaster } from "@/components/ui/sonner";
import { router } from "@/routes";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";

export default function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Restore session on first paint.
  useEffect(() => {
    void useAuthStore.getState().fetchMe();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
