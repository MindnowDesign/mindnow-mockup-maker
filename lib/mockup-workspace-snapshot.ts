import type { FrameAspectPresetId } from "@/lib/mockup-aspect";
import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";

/** Matches `MockupMediaItem` — kept here to avoid lib ↔ component cycles. */
export type WorkspaceMediaEntry = {
  id: string;
  kind: "image" | "video";
  url: string;
  label?: string;
};

/** Serializable workspace state for undo/redo. */
export type WorkspaceSnapshot = {
  aspectPreset: FrameAspectPresetId;
  /** `null` matches `hydrateCanvasBackground(null)` defaults. */
  canvasBackground: PersistedCanvasBackground | null;
  mediaItems: WorkspaceMediaEntry[];
  activeMediaId: string | null;
};

type FrameLike = {
  aspectPreset: FrameAspectPresetId;
  canvasBackgroundMode: "transparent" | "solid" | "image";
  canvasSolidColor: string;
  canvasBackgroundImageUrl: string | null;
  canvasNoisePercent: number;
  canvasBlurPercent: number;
  canvasNoiseType: import("@/lib/mockup-noise").CanvasNoiseTypeId;
  canvasNoiseColor: string;
  canvasNoiseColorOpacity: number;
  canvasNoiseBlendMode: import("@/lib/mockup-noise-blend").CanvasNoiseBlendModeId;
};

export function frameLikeToPersistedCanvasBackground(
  f: FrameLike
): PersistedCanvasBackground {
  const effects = {
    noisePercent: f.canvasNoisePercent,
    blurPercent: f.canvasBlurPercent,
    noiseType: f.canvasNoiseType,
    noiseColor: f.canvasNoiseColor.trim().toUpperCase(),
    noiseColorOpacity: f.canvasNoiseColorOpacity,
    noiseBlendMode: f.canvasNoiseBlendMode,
  };
  if (f.canvasBackgroundMode === "transparent") {
    return { mode: "transparent", ...effects };
  }
  if (f.canvasBackgroundMode === "solid") {
    return { mode: "solid", solidColor: f.canvasSolidColor, ...effects };
  }
  const trimmed = f.canvasBackgroundImageUrl?.trim();
  return {
    mode: "image",
    ...(trimmed ? { imageDataUrl: trimmed } : {}),
    solidColor: f.canvasSolidColor,
    ...effects,
  };
}

export function captureWorkspaceSnapshot(
  frame: FrameLike,
  media: { items: WorkspaceMediaEntry[]; activeId: string | null }
): WorkspaceSnapshot {
  return {
    aspectPreset: frame.aspectPreset,
    canvasBackground: frameLikeToPersistedCanvasBackground(frame),
    mediaItems: media.items.map((i) => ({ ...i })),
    activeMediaId: media.activeId,
  };
}

export function serializeWorkspaceSnapshot(s: WorkspaceSnapshot): string {
  return JSON.stringify({
    aspectPreset: s.aspectPreset,
    canvasBackground: s.canvasBackground,
    activeMediaId: s.activeMediaId,
    mediaItems: s.mediaItems.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      label: m.label,
    })),
  });
}

/** Default workspace — matches new-project hydrate + empty library. */
export const DEFAULT_WORKSPACE_SNAPSHOT: WorkspaceSnapshot = {
  aspectPreset: "square-1-1",
  canvasBackground: null,
  mediaItems: [],
  activeMediaId: null,
};
