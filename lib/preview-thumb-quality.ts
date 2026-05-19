/** PNG data URLs shorter than this are usually failed / empty captures. */
const WEAK_PREVIEW_MIN_LENGTH = 12_000;

export function isWeakPreviewThumb(dataUrl: string | null | undefined): boolean {
  const trimmed = dataUrl?.trim();
  if (!trimmed) return true;
  if (!trimmed.startsWith("data:image/")) return true;
  return trimmed.length < WEAK_PREVIEW_MIN_LENGTH;
}

/**
 * Samples a tiny downscale — returns true when the image is almost entirely black
 * (typical failed html-to-image capture during visual switch).
 */
export function isMostlyBlackPreviewDataUrl(
  dataUrl: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(false);
          return;
        }
        ctx.drawImage(img, 0, 0, 32, 32);
        const pixels = ctx.getImageData(0, 0, 32, 32).data;
        let sum = 0;
        const count = pixels.length / 4;
        for (let i = 0; i < pixels.length; i += 4) {
          sum += pixels[i]! + pixels[i + 1]! + pixels[i + 2]!;
        }
        const avg = sum / count / 3;
        resolve(avg < 10);
      } catch {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}
