import { Loader2 } from "lucide-react";

/** Full-area loading fallback for lazy-loaded routes. */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center" role="status" aria-label="Loading page">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}
