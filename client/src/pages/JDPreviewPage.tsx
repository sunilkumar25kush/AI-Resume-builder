import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, FileText, Loader2, PenLine, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { jdsApi } from "@/api/jds";
import { RenameDialog } from "@/components/common/RenameDialog";
import { JDSections } from "@/components/jds/JDSections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobDescription } from "@/types";

export default function JDPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    jdsApi
      .get(id)
      .then((data) => {
        if (!cancelled) setJd(data);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        if (!cancelled) navigate("/jds");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const onDelete = async () => {
    if (!jd) return;
    setDeleting(true);
    try {
      await jdsApi.remove(jd._id);
      toast.success("Job description deleted");
      navigate("/jds");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!jd) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Link to="/jds" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All job descriptions
          </Link>
          <h1 className="flex min-w-0 items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{jd.title || jd.fileName || "Untitled role"}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRenameOpen(true)} disabled={renaming} aria-label="Rename job description">
            <PenLine className="mr-1.5 h-4 w-4" aria-hidden />
            Rename
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/jds/${jd._id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
              Edit parsed data
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void onDelete()} disabled={deleting} aria-label="Delete job description">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parsed details</CardTitle>
        </CardHeader>
        <CardContent>
          <JDSections jd={jd} />
        </CardContent>
      </Card>

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename job description"
        description="Give this job description a clear name — it's shown in lists and the wizard."
        value={jd.title || jd.fileName || ""}
        saving={renaming}
        onSave={async (name) => {
          setRenaming(true);
          try {
            const updated = await jdsApi.update(jd._id, { title: name });
            setJd(updated);
            toast.success("Job description renamed");
            setRenameOpen(false);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          } finally {
            setRenaming(false);
          }
        }}
      />
    </div>
  );
}
