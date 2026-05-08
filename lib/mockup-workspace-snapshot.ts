import type { FrameAspectPresetId } from "@/lib/mockup-aspect";
import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";

/** Matches `MockupLibraryItem` — kept here to avoid lib ↔ component cycles. */
export type WorkspaceMediaEntry = {
  id: string;
  kind: "image" | "video";
  url: string;
};

export type WorkspaceVisualSlotEntry = {
  id: string;
  mediaId: string | null;
  label?: string;
};

/** Serializable workspace state for undo/redo. */
export type WorkspaceSnapshot = {
  aspectPreset: FrameAspectPresetId;
  /** `null` matches `hydrateCanvasBackground(null)` defaults. */
  canvasBackground: PersistedCanvasBackground | null;
  /** Media library (blob URLs in session). */
  mediaItems: WorkspaceMediaEntry[];
  /** Canvas slots referencing library ids (absent on snapshots from older builds). */
  visualSlots?: WorkspaceVisualSlotEntry[];
  /** Selected canvas slot id. */
  activeVisualId?: string | null;
  /** Per-visual appearance — absent on older undo stacks. */
  visualWorkspacePrefs?: Record<string, VisualWorkspacePrefs>;
};

export type FrameLike = {
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

/** Frame + canvas appearance stored per visual slot. */
export type VisualWorkspacePrefs = {
  aspectPreset: FrameAspectPresetId;
  canvasBackground: PersistedCanvasBackground | null;
};

export function captureVisualWorkspacePrefs(f: FrameLike): VisualWorkspacePrefs {
  return {
    aspectPreset: f.aspectPreset,
    canvasBackground: frameLikeToPersistedCanvasBackground(f),
  };
}

/** Fresh canvas slot added via “Add visual” — matches `hydrateCanvasBackground(null)` defaults. */
export const DEFAULT_NEW_VISUAL_WORKSPACE_PREFS: VisualWorkspacePrefs = {
  aspectPreset: "square-1-1",
  canvasBackground: null,
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
  media: {
    library: WorkspaceMediaEntry[];
    visuals: WorkspaceVisualSlotEntry[];
    activeVisualId: string | null;
    visualWorkspacePrefs?: Record<string, VisualWorkspacePrefs>;
  }
): WorkspaceSnapshot {
  const prefs = media.visualWorkspacePrefs;
  return {
    aspectPreset: frame.aspectPreset,
    canvasBackground: frameLikeToPersistedCanvasBackground(frame),
    mediaItems: media.library.map((i) => ({ ...i })),
    visualSlots: media.visuals.map((v) => ({ ...v })),
    activeVisualId: media.activeVisualId,
    ...(prefs && Object.keys(prefs).length > 0
      ? {
          visualWorkspacePrefs: Object.fromEntries(
            Object.entries(prefs).map(([k, v]) => [k, { ...v }])
          ),
        }
      : {}),
  };
}

export function serializeWorkspaceSnapshot(s: WorkspaceSnapshot): string {
  const visualSlots = s.visualSlots ?? [];
  return JSON.stringify({
    aspectPreset: s.aspectPreset,
    canvasBackground: s.canvasBackground,
    activeVisualId: s.activeVisualId ?? null,
    visualWorkspacePrefs: s.visualWorkspacePrefs ?? null,
    mediaItems: s.mediaItems.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
    })),
    visualSlots: visualSlots.map((v) => ({
      id: v.id,
      mediaId: v.mediaId,
      label: v.label,
    })),
  });
}

/** Empty workspace — no library, one blank visual (e.g. fresh route hydrate). */
export function createBlankWorkspaceSnapshot(): WorkspaceSnapshot {
  const vid = crypto.randomUUID();
  return {
    aspectPreset: "square-1-1",
    canvasBackground: null,
    mediaItems: [],
    visualSlots: [{ id: vid, mediaId: null }],
    activeVisualId: vid,
  };
}

/**
 * Toolbar “reset canvas”: default frame + single empty visual, but keep all
 * project media in the library so the left panel still lists uploads.
 */
export function createCanvasResetSnapshot(
  preserveLibrary: WorkspaceMediaEntry[]
): WorkspaceSnapshot {
  const vid = crypto.randomUUID();
  return {
    aspectPreset: "square-1-1",
    canvasBackground: null,
    mediaItems: preserveLibrary.map((m) => ({ ...m })),
    visualSlots: [{ id: vid, mediaId: null }],
    activeVisualId: vid,
  };
}
