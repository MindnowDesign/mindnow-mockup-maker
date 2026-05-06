import { waitForCaptureReady } from "@/lib/wait-for-capture-ready";

function flushPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * PNG of the mockup root (`[data-mockup-capture-target]`): frame fill, inner content,
 * and media — matches the visible canvas (solid/image/transparency preview, aspect ratio, etc.).
 *
 * Does not force a flat underlay color so saved thumbnails match customized backgrounds.
 */
export async function captureMockupPreview(el: HTMLElement): Promise<string> {
  try {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch {
    /* ignore */
  }
  await flushPaint();
  await waitForCaptureReady(el);
  await flushPaint();
  void el.offsetWidth;

  const maxSide = Math.max(el.offsetWidth, el.offsetHeight, 1);
  /** Readable card thumbnail without huge files — keeps localStorage happy. */
  const pixelRatio = Math.min(2, Math.max(1, 720 / maxSide));

  const { toPng, toCanvas } = await import("html-to-image");

  const baseOptions = {
    cacheBust: true as const,
    pixelRatio,
    skipFonts: true as const,
  };

  try {
    return await toPng(el, baseOptions);
  } catch (first) {
    console.warn("toPng preview failed, retrying with smaller scale:", first);
    try {
      return await toPng(el, {
        ...baseOptions,
        pixelRatio: Math.min(1, baseOptions.pixelRatio),
      });
    } catch (second) {
      console.warn("toPng retry failed, trying toCanvas:", second);
      try {
        const canvas = await toCanvas(el, baseOptions);
        return canvas.toDataURL("image/png");
      } catch (third) {
        console.error("Preview capture failed:", third);
        return "";
      }
    }
  }
}
