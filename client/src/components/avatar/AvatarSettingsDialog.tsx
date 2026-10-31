import { useState } from "react";
import { Check, Settings2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAllAvatarCharacters } from "./avatarDefinitions";
import { useAvatarStore } from "./useAvatarStore";
import { AvatarView } from "./AvatarView";

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AvatarSettingsDialog({ open, onOpenChange, trigger }: Props) {
  const characters = getAllAvatarCharacters();
  const currentCharacterId = useAvatarStore((state) => state.characterId);
  const setCharacterId = useAvatarStore((state) => state.setCharacterId);
  const enabled = useAvatarStore((state) => state.enabled);
  const setEnabled = useAvatarStore((state) => state.setEnabled);

  const [selectedId, setSelectedId] = useState(currentCharacterId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setCharacterId(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            AI Assistant Companion
          </DialogTitle>
          <DialogDescription>
            Choose your personal interactive avatar companion for onboarding, guidance, and validation checks.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Enabled toggle */}
          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Enable Assistant</span>
              <span className="text-xs text-muted-foreground">Show interactive validation tips and animations</span>
            </div>
            <Button
              size="sm"
              variant={enabled ? "default" : "outline"}
              onClick={() => setEnabled(!enabled)}
              className="h-8"
            >
              {enabled ? "Active" : "Disabled"}
            </Button>
          </div>

          {/* Character Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Choose Character ({characters.length})
            </span>
            <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {characters.map((char) => {
                const isSelected = char.id === selectedId;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => handleSelect(char.id)}
                    className={`relative flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all hover:border-primary/50 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted/40 overflow-hidden">
                      <AvatarView
                        definition={char.definition}
                        animation="idle"
                        size={44}
                        autoplay={false}
                      />
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {char.name}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {char.definition.body.primary.type}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
