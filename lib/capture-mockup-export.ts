import { waitForCaptureReady } from "@/lib/wait-for-capture-ready";

export type MockupExportFormat = "png" | "jpeg";
export type MockupExportScale = 1 | 2 | 3 | 4;

export const MOCKUP_EXPORT_FORMATS: {
  id: MockupExportFormat;
  label: string;
}[] = [
  { id: "png", label: "PNG" },
  { id: "jpeg", label: "JPG" },
];

export const MOCKUP_EXPORT_SCALES: {
  id: MockupExportScale;
  label: string;
}[] = [
  { id: 1, label: "1x" },
  { id: 2, label: "2x" },
  { id: 3, label: "3x" },
  { id: 4, label: "4x" },
];

export const DEFAULT_MOCKUP_EXPORT_FORMAT: MockupExportFormat = "png";
export const DEFAULT_MOCKUP_EXPORT_SCALE: MockupExportScale = 1;

const JPEG_QUALITY = 0.92;

/**
 * Preview-only canvas rounding (stage chrome). Mark full-bleed background
 * layers with this so download capture can flatten them to a rectangle.
 */
export const MOCKUP_CANVAS_CLIP_ATTR = "data-mockup-canvas-clip";

const EXPORT_SQUARE_STYLE = `[data-mockup-capture-target],[data-mockup-capture-target] [${MOCKUP_CANVAS_CLIP_ATTR}]{border-radius:0!important;box-shadow:none!important;outline:none!important}`;

function flushPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Temporarily square the canvas clip so html-to-image does not bake in UI rounding. */
function beginSquareCanvasExport(): () => void {
  const style = document.createElement("style");
  style.setAttribute("data-mockup-export-square", "");
  style.textContent = EXPORT_SQUARE_STYLE;
  document.head.appendChild(style);
  return () => {
    style.remove();
  };
}

function slugifyExportBasename(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || "mockup";
}

/** Filename like `visual-01-2x.png`. */
export function mockupExportFilename(
  title: string,
  format: MockupExportFormat,
  scale: MockupExportScale
): string {
  const ext = format === "jpeg" ? "jpg" : "png";
  return `${slugifyExportBasename(title)}-${scale}x.${ext}`;
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Full-resolution export of `[data-mockup-capture-target]` at the given
 * pixel density (`scale`) and file format. Canvas UI rounding is flattened
 * so the file is a full rectangle (screenshot/device radii are kept).
 */
export async function captureMockupExport(
  el: HTMLElement,
  options: {
    format: MockupExportFormat;
    scale: MockupExportScale;
  }
): Promise<string> {
  const { format, scale } = options;
  try {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch {
    /* ignore */
  }
  await flushPaint();
  await waitForCaptureReady(el);

  const restoreClip = beginSquareCanvasExport();
  try {
    await flushPaint();
    void el.offsetWidth;

    const { toPng, toJpeg, toCanvas } = await import("html-to-image");

    const baseOptions = {
      cacheBust: true as const,
      pixelRatio: scale,
      skipFonts: true as const,
      style: {
        borderRadius: "0px",
        boxShadow: "none",
        outline: "none",
      } satisfies Partial<CSSStyleDeclaration>,
    };

    try {
      if (format === "jpeg") {
        return await toJpeg(el, { ...baseOptions, quality: JPEG_QUALITY });
      }
      return await toPng(el, baseOptions);
    } catch (first) {
      console.warn("Export capture failed, retrying via canvas:", first);
      try {
        const canvas = await toCanvas(el, baseOptions);
        if (format === "jpeg") {
          return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        }
        return canvas.toDataURL("image/png");
      } catch (second) {
        console.error("Export capture failed:", second);
        return "";
      }
    }
  } finally {
    restoreClip();
  }
}
