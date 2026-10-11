export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CroppedImageResult {
  blob: Blob;
  dataUrl: string;
  file: File;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Extracts and crops an image using an HTML5 Canvas.
 * Supports rotation, zoom scaling, and clamps output dimensions for crisp, lightweight results.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  fileName = "avatar.jpg",
  maxSize = 800
): Promise<CroppedImageResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get 2D canvas context");
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  // Set canvas size to match the rotated bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas center to rotate around center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated source image
  ctx.drawImage(image, 0, 0);

  // Now extract the crop area into the output canvas
  const outputCanvas = document.createElement("canvas");
  const outputCtx = outputCanvas.getContext("2d");

  if (!outputCtx) {
    throw new Error("Could not get output canvas context");
  }

  // Bound output dimension to keep file size reasonable while preserving high DPI
  const targetSize = Math.max(128, Math.min(Math.round(Math.max(pixelCrop.width, pixelCrop.height)), maxSize));
  outputCanvas.width = targetSize;
  outputCanvas.height = targetSize;

  outputCtx.imageSmoothingEnabled = true;
  outputCtx.imageSmoothingQuality = "high";

  outputCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize
  );

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export produced an empty blob"));
          return;
        }
        const dataUrl = outputCanvas.toDataURL("image/jpeg", 0.92);
        const file = new File([blob], fileName.endsWith(".jpg") ? fileName : `${fileName}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve({ blob, dataUrl, file });
      },
      "image/jpeg",
      0.92
    );
  });
}
