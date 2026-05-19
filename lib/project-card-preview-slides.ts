import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";
import { isWeakPreviewThumb } from "@/lib/preview-thumb-quality";
import type { SavedProject } from "@/lib/saved-projects";
import {
  DEFAULT_NEW_VISUAL_WORKSPACE_PREFS,
  normalizeVisualWorkspacePrefs,
} from "@/lib/mockup-workspace-snapshot";

export type ProjectCardPreviewSlide = {
  visualId: string;
  /** Captured PNG when valid; omitted when weak / missing. */
  captureSrc: string | null;
  canvasBackground: PersistedCanvasBackground | null;
  mediaDataUrl: string | null;
};

function resolveSlots(project: SavedProject) {
  if (project.visualSlots?.length) return project.visualSlots;
  if (project.mediaItems?.length) {
    return project.mediaItems.map((m) => ({
      id: m.id,
      mediaId: m.id,
    }));
  }
  return [];
}

/**
 * One slide per visual slot (workspace order) for project card carousel.
 */
export function projectCardPreviewSlides(
  project: SavedProject
): ProjectCardPreviewSlide[] {
  const slots = resolveSlots(project);
  if (slots.length === 0) {
    const single = project.previewDataUrl?.trim();
    if (single && !isWeakPreviewThumb(single)) {
      return [
        {
          visualId: "__legacy__",
          captureSrc: single,
          canvasBackground: project.canvasBackground ?? null,
          mediaDataUrl: null,
        },
      ];
    }
    return [];
  }

  return slots.map((slot, index) => {
    const rawCapture =
      project.previewThumbByVisualId?.[slot.id]?.trim() ??
      project.previewDataUrls?.[index]?.trim() ??
      null;
    const captureSrc =
      rawCapture && !isWeakPreviewThumb(rawCapture) ? rawCapture : null;

    const prefs = normalizeVisualWorkspacePrefs(
      project.visualWorkspacePrefs?.[slot.id] ??
        (index === 0 && !project.visualWorkspacePrefs
          ? {
              aspectPreset: project.aspectPreset,
              canvasBackground: project.canvasBackground ?? null,
            }
          : undefined)
    );

    const media = slot.mediaId
      ? project.mediaItems?.find((m) => m.id === slot.mediaId)
      : null;

    return {
      visualId: slot.id,
      captureSrc,
      canvasBackground:
        prefs.canvasBackground ??
        project.canvasBackground ??
        DEFAULT_NEW_VISUAL_WORKSPACE_PREFS.canvasBackground,
      mediaDataUrl: media?.dataUrl ?? null,
    };
  });
}
