import { waitForCaptureReady } from "@/lib/wait-for-capture-ready";

/**
 * PNG of the full mockup root (`[data-mockup-capture-target]`): orange frame, inner device,
 * media and empty state — matches what the user sees as the canvas.
 */
export async function captureMockupPreview(el: HTMLElement): Promise<string> {
  try {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch {
    /* ignore */
  }
  await waitForCaptureReady(el);

  const maxSide = Math.max(el.offsetWidth, el.offsetHeight, 1);
  /** Readable card thumbnail without huge files — keeps localStorage happy. */
  const pixelRatio = Math.min(2, Math.max(1, 720 / maxSide));

  const { toPng, toCanvas } = await import("html-to-image");

  const baseOptions = {
    cacheBust: true as const,
    pixelRatio,
    skipFonts: true as const,
    /** Outer mockup padding uses this color; avoids transparent seams in some browsers. */
    backgroundColor: "#F28345",
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
