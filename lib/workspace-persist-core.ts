import type {
  MockupLibraryItem,
  MockupVisualSlot,
} from "@/components/mockup-media-context";
import { collectCanvasMediaIdsForSave } from "@/lib/collect-canvas-media-ids";
import { applyVisualUpdatedAt } from "@/lib/apply-visual-updated-at";
import type { FrameAspectPresetId } from "@/lib/mockup-aspect";
import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";
import {
  cloneVisualWorkspacePrefsForSave,
  resolveVisualPrefsForSave,
  type FrameLike,
  type VisualWorkspacePrefs,
} from "@/lib/mockup-workspace-snapshot";
import {
  getSavedProject,
  notifySavedProjectsChanged,
  upsertSavedProject,
  type SavedMediaItem,
  type SavedVisualSlot,
} from "@/lib/saved-projects";

/** Fast path: only persist library items already stored as data URLs. */
export function buildDataUrlMediaItems(
  library: MockupLibraryItem[],
  requiredMediaIds: string[]
): SavedMediaItem[] {
  const byId = new Map(library.map((item) => [item.id, item]));
  const items: SavedMediaItem[] = [];
  for (const id of requiredMediaIds) {
    const item = byId.get(id);
    if (!item?.url.startsWith("data:")) continue;
    items.push({
      id: item.id,
      kind: item.kind,
      dataUrl: item.url,
    });
  }
  return items;
}

export type WorkspacePersistCoreInput = {
  projectId: string;
  title: string;
  library: MockupLibraryItem[];
  visuals: MockupVisualSlot[];
  activeVisualId: string | null;
  visualWorkspacePrefs: Record<string, VisualWorkspacePrefs>;
  frame: FrameLike;
  aspectPreset: FrameAspectPresetId;
  canvasBackground?: PersistedCanvasBackground;
};

/**
 * Synchronous autosave of library + canvas layers (no preview capture).
 * Used when canvas content changes so navigation cannot race async thumbnail saves.
 */
export function persistWorkspaceCore(input: WorkspacePersistCoreInput): boolean {
  const {
    projectId,
    title,
    library,
    visuals,
    activeVisualId,
    visualWorkspacePrefs,
    frame,
    aspectPreset,
    canvasBackground,
  } = input;

  const requiredIds = collectCanvasMediaIdsForSave(
    library,
    visualWorkspacePrefs,
    frame
  );
  let mediaItems = buildDataUrlMediaItems(library, requiredIds);
  const disk = getSavedProject(projectId);
  if (frame.canvasLayers.length > 0 && mediaItems.length === 0) {
    if (disk?.mediaItems?.length) {
      mediaItems = disk.mediaItems;
    } else {
      return false;
    }
  }

  let activeVisual = activeVisualId;
  if (activeVisual && !visuals.some((v) => v.id === activeVisual)) {
    activeVisual = visuals[visuals.length - 1]?.id ?? null;
  }
  if (!activeVisual && visuals.length > 0) {
    activeVisual = visuals[visuals.length - 1]!.id;
  }

  const visualSlots: SavedVisualSlot[] = visuals.map((v) => ({
    id: v.id,
    mediaId:
      v.mediaId && mediaItems.some((m) => m.id === v.mediaId) ? v.mediaId : null,
    ...(v.label?.trim() ? { label: v.label.trim() } : {}),
  }));

  const prefsPayload =
    visualSlots.length > 0
      ? Object.fromEntries(
          visualSlots.map((slot) => [
            slot.id,
            cloneVisualWorkspacePrefsForSave(
              resolveVisualPrefsForSave(
                slot.id,
                activeVisual,
                visualWorkspacePrefs,
                frame
              )
            ),
          ])
        )
      : undefined;

  const savedAt = Date.now();
  const visualSlotsWithTimestamps = applyVisualUpdatedAt(
    visualSlots,
    activeVisual,
    disk,
    savedAt
  );

  const activeResolved =
    activeVisual != null
      ? resolveVisualPrefsForSave(
          activeVisual,
          activeVisual,
          visualWorkspacePrefs,
          frame
        )
      : undefined;

  try {
    upsertSavedProject({
      id: projectId,
      title: title.trim() || "Project",
      updatedAt: savedAt,
      previewDataUrl: disk?.previewDataUrl ?? "",
      ...(disk?.previewThumbByVisualId
        ? { previewThumbByVisualId: { ...disk.previewThumbByVisualId } }
        : {}),
      ...(disk?.previewDataUrls?.length
        ? { previewDataUrls: [...disk.previewDataUrls] }
        : {}),
      aspectPreset: activeResolved?.aspectPreset ?? aspectPreset,
      canvasBackground:
        activeResolved?.canvasBackground ?? canvasBackground ?? disk?.canvasBackground,
      visualCount: visualSlotsWithTimestamps.length,
      mediaItems,
      visualSlots: visualSlotsWithTimestamps,
      activeVisualId: activeVisual,
      activeMediaId: activeVisual,
      ...(prefsPayload ? { visualWorkspacePrefs: prefsPayload } : {}),
    });
    notifySavedProjectsChanged();
    return true;
  } catch (e) {
    console.error("persistWorkspaceCore failed", e);
    return false;
  }
}
