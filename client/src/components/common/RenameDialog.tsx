import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog heading, e.g. "Rename resume". */
  title: string;
  /** Helper text under the heading, e.g. "Pick a clear name…". */
  description: string;
  /** Current name shown in the input. */
  value: string;
  /** Called with the trimmed new name when the user saves. */
  onSave: (name: string) => void | Promise<void>;
  saving?: boolean;
}

/** Small modal for renaming a resume or job description. */
export function RenameDialog({ open, onOpenChange, title, description, value, onSave, saving }: RenameDialogProps) {
  const [name, setName] = useState(value);

  useEffect(() => {
    if (open) setName(value);
  }, [open, value]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSave(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          maxLength={255}
          autoFocus
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={!name.trim() || saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
