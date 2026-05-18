import type { FrameAspectPresetId } from "@/lib/mockup-aspect";
import { templateSupportsEditableGradientFills } from "@/lib/canvas-gradient-1-fill";
import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";
import type {
  PersistedScreenshotStyle,
  ScreenshotBorderPosition,
  ScreenshotCornerType,
  ScreenshotStyleId,
} from "@/lib/mockup-screenshot-style";
import {
  DEFAULT_FRAME_SHADOW_PRESET,
  defaultFrameShadowNumbers,
  frameShadowToPersisted,
  type FrameShadowPresetId,
  type PersistedFrameShadow,
} from "@/lib/mockup-frame-shadow";
import {
  DEFAULT_SCREENSHOT_BORDER_COLOR,
  DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY,
  DEFAULT_SCREENSHOT_BORDER_POSITION,
  DEFAULT_SCREENSHOT_BORDER_WEIGHT,
  DEFAULT_SCREENSHOT_CORNER_RADIUS,
  DEFAULT_SCREENSHOT_CORNER_TYPE,
  DEFAULT_SCREENSHOT_OUTLINE_COLOR,
  DEFAULT_SCREENSHOT_OUTLINE_COLOR_OPACITY,
  DEFAULT_SCREENSHOT_STYLE,
} from "@/lib/mockup-screenshot-style";

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
  canvasBackgroundMode: "transparent" | "solid" | "image" | "template";
  canvasSolidColor: string;
  canvasBackgroundImageUrl: string | null;
  /** Active SVG/CSS gradient template id, or null for none. */
  canvasGradientTemplateId: string | null;
  /** Active template inline SVG fills (derived from `canvasGradientFillsByTemplate`). */
  canvasGradientFillHex: Record<string, string>;
  /** Per-template gradient fill overrides. */
  canvasGradientFillsByTemplate: Record<string, Record<string, string>>;
  canvasGradientBlendModesByTemplate: Record<
    string,
    Record<string, import("@/lib/canvas-gradient-fill-blend").TemplateFillBlendModeId>
  >;
  canvasGradientOpacitiesByTemplate: Record<string, Record<string, number>>;
  canvasNoisePercent: number;
  canvasBlurPercent: number;
  canvasNoiseType: import("@/lib/mockup-noise").CanvasNoiseTypeId;
  canvasNoiseColor: string;
  canvasNoiseColorOpacity: number;
  canvasNoiseBlendMode: import("@/lib/mockup-noise-blend").CanvasNoiseBlendModeId;
  deviceTemplateId: string | null;
  screenshotStyle: ScreenshotStyleId;
  screenshotBorderColor: string;
  screenshotBorderColorOpacity: number;
  screenshotBorderPosition: ScreenshotBorderPosition;
  screenshotBorderWeight: number;
  screenshotOutlineColor: string;
  screenshotOutlineColorOpacity: number;
  screenshotCornerType: ScreenshotCornerType;
  screenshotCornerRadius: number;
  frameShadowPreset: FrameShadowPresetId;
  frameShadowOffsetX: number;
  frameShadowOffsetY: number;
  frameShadowBlur: number;
  frameShadowSpread: number;
  frameShadowColor: string;
  frameShadowColorOpacity: number;
};

/**
 * Frame + canvas appearance stored per visual slot (sidebar “Frame” tools).
 * When adding new persisted sidebar fields: extend this type, update
 * `captureVisualWorkspacePrefs`, `normalizeVisualWorkspacePrefs`, frame context,
 * and the sync effect deps in `mockup-media-context.tsx`.
 */
export type VisualWorkspacePrefs = {
  aspectPreset: FrameAspectPresetId;
  canvasBackground: PersistedCanvasBackground | null;
  /** `mockup-device-templates` id, or `null` / omitted for plain canvas (no device PNG). */
  deviceTemplateId?: string | null;
  /** Screenshot styling (only meaningful when `deviceTemplateId` is null). */
  screenshotStyle?: PersistedScreenshotStyle | null;
  /** Drop shadow on plain screenshot media (`deviceTemplateId` null). */
  frameShadow?: PersistedFrameShadow | null;
};

export function frameLikeToPersistedScreenshotStyle(
  f: FrameLike
): PersistedScreenshotStyle {
  return {
    style: f.screenshotStyle,
    borderColor: f.screenshotBorderColor.trim().toUpperCase(),
    borderColorOpacity: f.screenshotBorderColorOpacity,
    borderPosition: f.screenshotBorderPosition,
    borderWeight: f.screenshotBorderWeight,
    outlineColor: f.screenshotOutlineColor.trim().toUpperCase(),
    outlineColorOpacity: f.screenshotOutlineColorOpacity,
    cornerType: f.screenshotCornerType,
    cornerRadius: f.screenshotCornerRadius,
  };
}

export function captureVisualWorkspacePrefs(f: FrameLike): VisualWorkspacePrefs {
  const shadowNums = {
    offsetX: f.frameShadowOffsetX,
    offsetY: f.frameShadowOffsetY,
    blur: f.frameShadowBlur,
    spread: f.frameShadowSpread,
    color: f.frameShadowColor,
    colorOpacity: f.frameShadowColorOpacity,
  };
  return {
    aspectPreset: f.aspectPreset,
    canvasBackground: frameLikeToPersistedCanvasBackground(f),
    deviceTemplateId: f.deviceTemplateId,
    screenshotStyle: frameLikeToPersistedScreenshotStyle(f),
    frameShadow: frameShadowToPersisted(f.frameShadowPreset, shadowNums),
  };
}

/** Fresh canvas slot added via “Add visual” — matches `hydrateCanvasBackground(null)` defaults. */
export const DEFAULT_NEW_VISUAL_WORKSPACE_PREFS: VisualWorkspacePrefs = {
  aspectPreset: "square-1-1",
  canvasBackground: null,
  deviceTemplateId: null,
  screenshotStyle: {
    style: DEFAULT_SCREENSHOT_STYLE,
    borderColor: DEFAULT_SCREENSHOT_BORDER_COLOR,
    borderColorOpacity: DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY,
    borderPosition: DEFAULT_SCREENSHOT_BORDER_POSITION,
    borderWeight: DEFAULT_SCREENSHOT_BORDER_WEIGHT,
    outlineColor: DEFAULT_SCREENSHOT_OUTLINE_COLOR,
    outlineColorOpacity: DEFAULT_SCREENSHOT_OUTLINE_COLOR_OPACITY,
    cornerType: DEFAULT_SCREENSHOT_CORNER_TYPE,
    cornerRadius: DEFAULT_SCREENSHOT_CORNER_RADIUS,
  },
  frameShadow: frameShadowToPersisted(
    DEFAULT_FRAME_SHADOW_PRESET,
    defaultFrameShadowNumbers()
  ),
};

/**
 * Merge disk / partial prefs with defaults so legacy saves and incomplete objects
 * round-trip safely (autosave + reopen).
 */
export function normalizeVisualWorkspacePrefs(
  partial: Partial<VisualWorkspacePrefs> | null | undefined
): VisualWorkspacePrefs {
  const d = DEFAULT_NEW_VISUAL_WORKSPACE_PREFS;
  if (!partial) {
    return {
      aspectPreset: d.aspectPreset,
      canvasBackground: d.canvasBackground,
      deviceTemplateId: d.deviceTemplateId ?? null,
      screenshotStyle: d.screenshotStyle ? { ...d.screenshotStyle } : null,
      frameShadow: d.frameShadow ? { ...d.frameShadow } : null,
    };
  }
  const screenshotStyle =
    partial.screenshotStyle != null
      ? { ...partial.screenshotStyle }
      : d.screenshotStyle
        ? { ...d.screenshotStyle }
        : null;
  const frameShadow =
    partial.frameShadow !== undefined
      ? partial.frameShadow
        ? { ...partial.frameShadow }
        : null
      : d.frameShadow
        ? { ...d.frameShadow }
        : null;
  return {
    aspectPreset: partial.aspectPreset ?? d.aspectPreset,
    canvasBackground:
      partial.canvasBackground !== undefined
        ? partial.canvasBackground
        : d.canvasBackground,
    deviceTemplateId:
      partial.deviceTemplateId !== undefined
        ? partial.deviceTemplateId
        : d.deviceTemplateId ?? null,
    screenshotStyle,
    frameShadow,
  };
}

/** Resolve prefs for one canvas slot when building a save payload (never drops the active frame). */
export function resolveVisualPrefsForSave(
  visualId: string,
  activeVisualId: string | null,
  prefsMap: Record<string, VisualWorkspacePrefs>,
  frame: FrameLike
): VisualWorkspacePrefs {
  const stored = prefsMap[visualId];
  if (stored !== undefined) {
    return normalizeVisualWorkspacePrefs(stored);
  }
  if (visualId === activeVisualId) {
    return captureVisualWorkspacePrefs(frame);
  }
  return normalizeVisualWorkspacePrefs(null);
}

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
  const gradientTemplateId =
    f.canvasBackgroundMode === "template"
      ? f.canvasGradientTemplateId?.trim() || null
      : null;
  const gradientFillSpread =
    f.canvasBackgroundMode === "template"
      ? {
          gradientFillsByTemplate: Object.fromEntries(
            Object.entries(f.canvasGradientFillsByTemplate).map(([id, fills]) => [
              id,
              { ...fills },
            ])
          ),
          ...(gradientTemplateId &&
          templateSupportsEditableGradientFills(gradientTemplateId)
            ? { gradientFillHex: { ...f.canvasGradientFillHex } }
            : {}),
          gradientBlendModesByTemplate: Object.fromEntries(
            Object.entries(f.canvasGradientBlendModesByTemplate).map(
              ([id, modes]) => [id, { ...modes }]
            )
          ),
          gradientOpacitiesByTemplate: Object.fromEntries(
            Object.entries(f.canvasGradientOpacitiesByTemplate).map(
              ([id, opacities]) => [id, { ...opacities }]
            )
          ),
        }
      : {};
  if (f.canvasBackgroundMode === "transparent") {
    return {
      mode: "transparent",
      ...effects,
    };
  }
  if (f.canvasBackgroundMode === "solid") {
    return {
      mode: "solid",
      solidColor: f.canvasSolidColor,
      ...effects,
    };
  }
  if (f.canvasBackgroundMode === "template") {
    return {
      mode: "template",
      ...(gradientTemplateId ? { gradientTemplateId } : {}),
      ...gradientFillSpread,
      ...effects,
    };
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
