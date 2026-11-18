import { GooeyToaster, type GooeyToasterProps, gooeyToast } from "goey-toast";
import { useThemeStore } from "@/stores/theme";

export function Toaster({ ...props }: GooeyToasterProps) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <GooeyToaster
      position="top-center"
      theme={theme === "dark" ? "dark" : "light"}
      closeButton
      richColors
      preset="smooth"
      spring
      {...props}
    />
  );
}

export { gooeyToast as toast };
export default Toaster;
