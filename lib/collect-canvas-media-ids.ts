import type { MockupLibraryItem } from "@/components/mockup-media-context";
import type {
  FrameLike,
  VisualWorkspacePrefs,
} from "@/lib/mockup-workspace-snapshot";

/** Every library id referenced on canvas layers (all visuals + live frame). */
export function collectCanvasMediaIdsForSave(
  library: MockupLibraryItem[],
  visualWorkspacePrefs: Record<string, VisualWorkspacePrefs>,
  frame: FrameLike
): string[] {
  const ids = new Set<string>(library.map((item) => item.id));
  for (const layer of frame.canvasLayers) {
    if (layer.mediaId) ids.add(layer.mediaId);
  }
  for (const prefs of Object.values(visualWorkspacePrefs)) {
    for (const layer of prefs.canvasLayers ?? []) {
      if (layer.mediaId) ids.add(layer.mediaId);
    }
  }
  return [...ids];
}
