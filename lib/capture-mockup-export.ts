import { toCanvas, toJpeg, toPng } from "html-to-image";

import { waitForCaptureReady } from "@/lib/wait-for-capture-ready";
import { beginSquareCanvasClip } from "@/lib/square-canvas-capture";

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

function flushPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
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

function dataUrlToBlob(dataUrl: string): Blob | null {
  const header = /^data:([^;,]*)(;base64)?,/.exec(dataUrl);
  if (!header) return null;
  const type = header[1] || "application/octet-stream";
  const body = dataUrl.slice(header[0].length);
  try {
    if (!header[2]) {
      return new Blob([decodeURIComponent(body)], { type });
    }
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  } catch {
    return null;
  }
}

/**
 * Saves the capture as a file. Browsers refuse or silently drop `data:` URL
 * downloads once they get long (high scales), so the bytes go out as a blob.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const blob = dataUrlToBlob(dataUrl);
  const href = blob ? URL.createObjectURL(blob) : dataUrl;
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  if (blob) {
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
  }
}

/**
 * Full-resolution export of `[data-mockup-capture-target]` at the given
 * pixel density (`scale`) and file format. Canvas UI rounding is flattened
 * so the file is a full rectangle (screenshot/device radii are kept).
 *
 * Rejects when the canvas cannot be rendered, so callers can report it
 * instead of ending up with no file and no feedback.
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

  const restoreClip = beginSquareCanvasClip();
  try {
    await flushPaint();
    void el.offsetWidth;

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
      const canvas = await toCanvas(el, baseOptions);
      if (format === "jpeg") {
        return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      }
      return canvas.toDataURL("image/png");
    }
  } finally {
    restoreClip();
  }
}
