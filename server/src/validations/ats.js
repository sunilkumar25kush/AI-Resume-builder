import { z } from "zod";

/** POST /api/ats/check body — resumeId always; jdId OR jdText optional. */
export const atsCheckSchema = z.object({
  resumeId: z.string().min(1),
  jdId: z.string().min(1).optional(),
  jdText: z.string().min(20).max(20000).optional(),
});
