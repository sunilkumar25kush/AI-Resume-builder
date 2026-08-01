import { useEffect, useState } from "react";
import { ArrowLeft, Copy, GitCompareArrows, History, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { versionsApi } from "@/api/versions";
import { ResumePreview } from "@/components/resumes/ResumePreview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getTemplate } from "@/templates/resumeTemplates";
import type { Resume, ResumeVersion } from "@/types";

interface VersionDrawerProps {
  resume: Resume;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored: (updated: Resume) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function VersionRow({
  version,
  onCompare,
  onRestore,
  onDuplicate,
}: {
  version: ResumeVersion;
  onCompare: () => void;
  onRestore: () => void;
  onDuplicate: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <span className="w-12 shrink-0 rounded-md bg-muted px-2 py-1 text-center text-xs font-semibold text-muted-foreground">
        v{version.version}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{getTemplate(version.template).name}</p>
        <p className="truncate text-xs text-muted-foreground">{formatDate(version.createdAt)}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onCompare} aria-label={`Compare version ${version.version}`}>
        <GitCompareArrows className="mr-1.5 h-4 w-4" aria-hidden />
        Compare
      </Button>
      <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={onRestore} aria-label={`Restore version ${version.version}`}>
        <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
        Restore
      </Button>
      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={onDuplicate} aria-label={`Duplicate version ${version.version}`}>
        <Copy className="mr-1.5 h-4 w-4" aria-hidden />
        Duplicate
      </Button>
    </li>
  );
}

/** History drawer: version list, side-by-side compare, restore with confirm. */
export function VersionDrawer({ resume, open, onOpenChange, onRestored }: VersionDrawerProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [compare, setCompare] = useState<ResumeVersion | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ResumeVersion | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setCompare(null);
    versionsApi
      .list(resume._id)
      .then((data) => {
        if (!cancelled) setVersions(data);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, resume._id]);

  const onRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const updated = await versionsApi.restore(resume._id, restoreTarget._id);
      onRestored(updated);
      toast.success(`Restored v${restoreTarget.version}`);
      setRestoreTarget(null);
      setCompare(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setRestoring(false);
    }
  };

  const onDuplicate = async (version: ResumeVersion) => {
    try {
      await versionsApi.duplicate(resume._id, version._id);
      toast.success(`Duplicated v${version.version} as a new version`);
      const data = await versionsApi.list(resume._id);
      setVersions(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const title = resume.fileName.replace(/\.[^.]+$/, "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" aria-hidden />
            {compare ? `Comparing v${compare.version}` : "Version history"}
          </SheetTitle>
          <SheetDescription>
            {compare ? "Side-by-side against the currently saved state." : "Every save creates a snapshot — restore or compare any of them."}
          </SheetDescription>
        </SheetHeader>

        {compare ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setCompare(null)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
              Back to versions
            </Button>
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current — saved</p>
                  <div className="overflow-hidden rounded-sm border bg-white shadow-sm">
                    <ResumePreview data={resume.parsedData} template={resume.template} title={title} className="min-h-[480px]" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    v{compare.version} — {formatDate(compare.createdAt)}
                  </p>
                  <div className="overflow-hidden rounded-sm border bg-white shadow-sm">
                    <ResumePreview data={compare.parsedData} template={compare.template} title={title} className="min-h-[480px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trash2 className="h-4 w-4" aria-hidden />
            No versions yet — save the resume once to create the first snapshot.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <ul className="flex flex-col gap-2">
              {versions.map((version) => (
                <VersionRow
                  key={version._id}
                  version={version}
                  onCompare={() => setCompare(version)}
                  onRestore={() => setRestoreTarget(version)}
                  onDuplicate={() => void onDuplicate(version)}
                />
              ))}
            </ul>
          </div>
        )}
      </SheetContent>

      <Dialog open={restoreTarget !== null} onOpenChange={(openNow) => !openNow && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore v{restoreTarget?.version}?</DialogTitle>
            <DialogDescription>
              This replaces the current resume content with the snapshot from {restoreTarget ? formatDate(restoreTarget.createdAt) : ""}. Undo
              is possible by restoring the newest version again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreTarget(null)} disabled={restoring}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void onRestore()} disabled={restoring}>
              {restoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <RotateCcw className="mr-2 h-4 w-4" aria-hidden />}
              {restoring ? "Restoring…" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
