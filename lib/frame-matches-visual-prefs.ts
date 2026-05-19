import {
  DEFAULT_CANVAS_SOLID_COLOR,
  type PersistedCanvasBackground,
} from "@/lib/mockup-canvas-background";
import {
  DEFAULT_NEW_VISUAL_WORKSPACE_PREFS,
  type VisualWorkspacePrefs,
} from "@/lib/mockup-workspace-snapshot";

export type FrameCaptureSnapshot = {
  aspectPreset: string;
  canvasBackgroundMode: "transparent" | "solid" | "image" | "template";
  canvasSolidColor: string;
  canvasGradientTemplateId: string | null;
  deviceTemplateId: string | null;
};

function resolvedCanvasBackground(
  prefs: VisualWorkspacePrefs
): PersistedCanvasBackground | null {
  return prefs.canvasBackground ?? null;
}

/** True when live frame state matches the saved prefs for a visual (post-switch hydrate). */
export function frameMatchesVisualPrefs(
  frame: FrameCaptureSnapshot,
  prefs: VisualWorkspacePrefs | undefined
): boolean {
  const p = prefs ?? DEFAULT_NEW_VISUAL_WORKSPACE_PREFS;
  if (frame.aspectPreset !== p.aspectPreset) return false;
  if ((frame.deviceTemplateId ?? null) !== (p.deviceTemplateId ?? null)) {
    return false;
  }

  const bg = resolvedCanvasBackground(p);
  const mode = bg?.mode ?? "solid";
  if (frame.canvasBackgroundMode !== mode) return false;

  if (mode === "template") {
    const templateId = bg?.gradientTemplateId ?? null;
    if ((frame.canvasGradientTemplateId ?? null) !== templateId) return false;
  }

  if (mode === "solid") {
    const solid = bg?.solidColor ?? DEFAULT_CANVAS_SOLID_COLOR;
    if (frame.canvasSolidColor !== solid) return false;
  }

  return true;
}
