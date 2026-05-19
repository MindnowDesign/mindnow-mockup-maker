import { captureMockupPreview } from "@/lib/capture-mockup-preview";
import { isWeakPreviewThumb } from "@/lib/preview-thumb-quality";
import { waitForVisualCaptureReady } from "@/lib/wait-for-visual-capture-ready";

export type BackfillVisualThumbnailsOptions = {
  visualSlotIds: string[];
  thumbs: Record<string, string>;
  /** Visual that was already captured in this persist pass. */
  justCapturedVisualId: string | null;
  justCapturedDataUrl: string;
  activeVisualId: string | null;
  switchToVisual: (id: string) => void;
  getCaptureElement: () => HTMLElement | null;
  /** Returns true when frame + DOM reflect the target visual's saved prefs. */
  isFrameSyncedForVisual: (visualId: string) => boolean;
  /** Template id for the visual being captured (template canvas backgrounds). */
  gradientTemplateIdForVisual: (visualId: string) => string | null;
  /** When true, stop switching visuals / capturing (navigation or unmount). */
  shouldAbort?: () => boolean;
};

/**
 * Ensures every canvas slot has a PNG thumbnail for project cards.
 * Switches the workspace to each missing visual, captures, then restores focus.
 */
export async function backfillVisualThumbnails(
  options: BackfillVisualThumbnailsOptions
): Promise<Record<string, string>> {
  const {
    visualSlotIds,
    thumbs,
    justCapturedVisualId,
    justCapturedDataUrl,
    activeVisualId,
    switchToVisual,
    getCaptureElement,
    isFrameSyncedForVisual,
    gradientTemplateIdForVisual,
    shouldAbort,
  } = options;

  const merged = { ...thumbs };

  if (justCapturedVisualId && justCapturedDataUrl) {
    merged[justCapturedVisualId] = justCapturedDataUrl;
  }

  const needsCapture = (id: string) => {
    const existing = merged[id]?.trim();
    if (!existing) return true;
    return isWeakPreviewThumb(existing);
  };

  const missing = visualSlotIds.filter(needsCapture);
  if (missing.length === 0 || shouldAbort?.()) return merged;

  for (const visualId of missing) {
    if (shouldAbort?.()) break;
    if (
      visualId === justCapturedVisualId &&
      justCapturedDataUrl &&
      !isWeakPreviewThumb(justCapturedDataUrl)
    ) {
      continue;
    }

    switchToVisual(visualId);

    const captureEl = await waitForVisualCaptureReady({
      visualId,
      getCaptureElement,
      isFrameSynced: () => isFrameSyncedForVisual(visualId),
      gradientTemplateId: gradientTemplateIdForVisual(visualId),
      shouldAbort,
    });

    if (shouldAbort?.()) break;
    if (!captureEl?.isConnected) break;

    const png = await captureMockupPreview(captureEl);
    if (png && !isWeakPreviewThumb(png)) {
      merged[visualId] = png;
    }
  }

  if (activeVisualId && !shouldAbort?.()) {
    switchToVisual(activeVisualId);
    await waitForVisualCaptureReady({
      visualId: activeVisualId,
      getCaptureElement,
      isFrameSynced: () => isFrameSyncedForVisual(activeVisualId),
      gradientTemplateId: gradientTemplateIdForVisual(activeVisualId),
      shouldAbort,
    });
  }

  return merged;
}
