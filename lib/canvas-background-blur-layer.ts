import type { CSSProperties } from "react";

/** Matches `(canvasBlurPercent / 100) * 28` at 100% in `MockupWorkspaceStage`. */
export const CANVAS_BACKGROUND_MAX_BLUR_PX = 28;

/** Extra pixels around the fill so gaussian blur is not clipped into a vignette. */
export function canvasBackgroundBlurBleedPx(blurPx: number): number {
  if (blurPx <= 0) return 0;
  return Math.min(80, Math.ceil(blurPx * 3) + 20);
}

/** Fixed bleed used for layout so toggling blur does not resize the SVG fill box. */
export const CANVAS_BACKGROUND_LAYOUT_BLEED_PX = canvasBackgroundBlurBleedPx(
  CANVAS_BACKGROUND_MAX_BLUR_PX
);

export type CanvasBackgroundBlurLayerStyles = {
  /** Anchored to the canvas clip (`inset: 0`) — never resizes when blur toggles. */
  container: CSSProperties;
  /** Expanded shell that receives `filter: blur()`; bleeds outside the clip. */
  shell: CSSProperties;
  /** Stable fill box (same crop as no blur) inside `shell`. */
  content: CSSProperties;
};

/**
 * Three-layer blur stack: container (fixed) → shell (blur + bleed) → content (stable crop).
 * Layout bleed stays at max so enabling blur only changes the filter, not geometry.
 */
export function canvasBackgroundBlurLayerStyles(
  blurPx: number
): CanvasBackgroundBlurLayerStyles {
  const bleed = CANVAS_BACKGROUND_LAYOUT_BLEED_PX;
  const blurFilter = blurPx > 0 ? `blur(${blurPx}px)` : undefined;

  return {
    container: {
      position: "absolute",
      inset: 0,
    },
    shell: {
      position: "absolute",
      top: -bleed,
      left: -bleed,
      width: `calc(100% + ${bleed * 2}px)`,
      height: `calc(100% + ${bleed * 2}px)`,
    },
    content: {
      position: "absolute",
      top: bleed,
      left: bleed,
      right: bleed,
      bottom: bleed,
      filter: blurFilter,
    },
  };
}
