import { gooeyToast, type GooeyToastOptions, type GooeyPromiseData } from "goey-toast";

function toMessageString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val instanceof Error) return val.message;
  if (val && typeof val === "object" && "message" in val && typeof (val as { message: unknown }).message === "string") {
    return (val as { message: string }).message;
  }
  return String(val ?? "");
}

/**
 * Universal gooey toast notification utility powered by `goey-toast`.
 * Works seamlessly across both light and dark modes with fluid blob morphing animations.
 */
export const toast = Object.assign(
  (title: unknown, options?: GooeyToastOptions) => gooeyToast(toMessageString(title), options),
  {
    success: (title: unknown, options?: GooeyToastOptions) =>
      gooeyToast.success(toMessageString(title), options),
    error: (title: unknown, options?: GooeyToastOptions) =>
      gooeyToast.error(toMessageString(title), options),
    warning: (title: unknown, options?: GooeyToastOptions) =>
      gooeyToast.warning(toMessageString(title), options),
    info: (title: unknown, options?: GooeyToastOptions) =>
      gooeyToast.info(toMessageString(title), options),
    promise: <T>(promise: Promise<T>, data: GooeyPromiseData<T>) =>
      gooeyToast.promise(promise, data),
    dismiss: gooeyToast.dismiss,
    update: gooeyToast.update,
  },
);

export { gooeyToast };
export default toast;
