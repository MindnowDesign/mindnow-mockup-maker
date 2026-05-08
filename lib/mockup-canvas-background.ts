import type { CSSProperties } from "react";

import type { CanvasNoiseBlendModeId } from "./mockup-noise-blend";
import type { CanvasNoiseTypeId } from "./mockup-noise";

export type CanvasBackgroundMode = "transparent" | "solid" | "image";

/** Default canvas fill — matches previous fixed orange frame. */
export const DEFAULT_CANVAS_SOLID_COLOR = "#F28345";

/** Default tint for noise grain (hex when none persisted). */
export const DEFAULT_CANVAS_NOISE_COLOR = "#000000";

/** Opacity of the tinted noise layer (0–100), independent of overall Noise amount. */
export const DEFAULT_CANVAS_NOISE_COLOR_OPACITY = 100;

/** Persisted shape for localStorage / saved projects. */
export type PersistedCanvasBackground = {
  mode: CanvasBackgroundMode;
  solidColor?: string;
  imageDataUrl?: string;
  /** 0–100 — grain intensity on the canvas background layer. */
  noisePercent?: number;
  /** 0–100 — blur intensity on the canvas background layer. */
  blurPercent?: number;
  /** Grain algorithm preset for SVG turbulence. */
  noiseType?: CanvasNoiseTypeId;
  /** Hex tint for noise grain. */
  noiseColor?: string;
  /** 0–100 — opacity of the tinted noise layer. */
  noiseColorOpacity?: number;
  /** How the grain layer composites over the canvas background (`mix-blend-mode`). */
  noiseBlendMode?: CanvasNoiseBlendModeId;
};

/** Checkerboard pattern used for “transparency” preview in the canvas frame. */
/** Compact fill for thumbnails / floating-bar previews (noise omitted). */
export function persistedCanvasBackgroundToPeekStyle(
  bg: PersistedCanvasBackground | null | undefined
): CSSProperties {
  if (bg == null || !bg.mode) {
    return { backgroundColor: DEFAULT_CANVAS_SOLID_COLOR };
  }
  if (bg.mode === "transparent") {
    return checkerboardBackgroundStyle();
  }
  if (bg.mode === "solid") {
    return {
      backgroundColor: bg.solidColor?.trim() || DEFAULT_CANVAS_SOLID_COLOR,
    };
  }
  const url = bg.imageDataUrl?.trim();
  if (url) {
    return {
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    backgroundColor: bg.solidColor?.trim() || DEFAULT_CANVAS_SOLID_COLOR,
  };
}

export function checkerboardBackgroundStyle(): CSSProperties {
  return {
    backgroundColor: "#e4e4e4",
    backgroundImage: `
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
  };
}
