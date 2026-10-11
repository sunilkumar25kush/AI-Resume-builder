import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, Loader2 } from "lucide-react";
import { getCroppedImg, type CroppedImageResult, type PixelCrop } from "@/lib/cropImage";
import { toast } from "sonner";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  fileName?: string;
  title?: string;
  description?: string;
  cropShape?: "round" | "rect";
  aspect?: number;
  onClose: () => void;
  onCropSave: (result: CroppedImageResult) => Promise<void> | void;
}

export function ImageCropModal({
  open,
  imageSrc,
  fileName = "avatar.jpg",
  title = "Crop Profile Picture",
  description = "Drag to choose which part to show. Use the zoom slider to adjust how much fits in the circle.",
  cropShape = "round",
  aspect = 1,
  onClose,
  onCropSave,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset controls whenever a new image is loaded
  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setIsSaving(false);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const result = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, fileName);
      await onCropSave(result);
      onClose();
    } catch (error) {
      console.error("Failed to crop image:", error);
      toast.error("Failed to crop image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Cropper Viewport */}
        <div className="relative w-full h-72 sm:h-80 bg-neutral-950 select-none">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={false}
              minZoom={1}
              maxZoom={3}
              zoomSpeed={0.8}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        {/* Controls Container */}
        <div className="flex flex-col gap-3 p-4 bg-muted/40 border-t">
          {/* Zoom Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(2))))}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              aria-label="Zoom level"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(2))))}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotate & Reset Controls */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2 gap-1"
                onClick={handleRotate}
              >
                <RotateCw className="h-3 w-3" />
                Rotate 90°
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Circle preview
            </span>
          </div>
        </div>

        {/* Dialog Footer Actions */}
        <DialogFooter className="p-4 pt-3 border-t bg-background gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving || !imageSrc}
            onClick={handleSave}
            className="gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Applying…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Set as Picture
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
