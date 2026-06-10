export type FrameAspectPresetId =
  | "landscape-16-9"
  | "standard-4-3"
  | "square-1-1"
  | "portrait-4-5"
  | "vertical-9-16"
  /** @deprecated Legacy saves only — not offered in the aspect ratio picker. */
  | "custom";

export type SelectableFrameAspectPresetId = Exclude<
  FrameAspectPresetId,
  "custom"
>;

/** Maps legacy `custom` to the former default proportions (9:16). */
export function normalizeAspectPreset(
  id: FrameAspectPresetId
): SelectableFrameAspectPresetId {
  if (id === "custom") return "vertical-9-16";
  return id;
}

/** Logical canvas size for export / metadata (matches each preset’s aspect ratio). */
export type FrameDimensions = {
  width: number;
  height: number;
};

/** Authoritative pixel dimensions per preset (design resolution). */
export const FRAME_PRESET_DIMENSIONS: Record<
  Exclude<FrameAspectPresetId, "custom">,
  FrameDimensions
> = {
  "landscape-16-9": { width: 1920, height: 1080 },
  "standard-4-3": { width: 1600, height: 1200 },
  "square-1-1": { width: 1080, height: 1080 },
  "portrait-4-5": { width: 1080, height: 1350 },
  "vertical-9-16": { width: 1080, height: 1920 },
};

export function dimensionsForPreset(
  id: FrameAspectPresetId
): FrameDimensions | null {
  if (id === "custom") return null;
  return FRAME_PRESET_DIMENSIONS[id];
}

export function formatPresetDimensions(d: FrameDimensions): string {
  return `${d.width} × ${d.height}`;
}

const CUSTOM_DIMENSION_FALLBACK: FrameDimensions = {
  width: 1080,
  height: 1920,
};

/**
 * Pixel size for the frame on screen: same proportions as `FRAME_PRESET_DIMENSIONS`,
 * uniformly scaled to fit inside `maxOuterW` × `maxOuterH` (border box).
 */
export function scaledFramePixelSize(
  id: FrameAspectPresetId,
  maxOuterW: number,
  maxOuterH: number
): FrameDimensions {
  const base = dimensionsForPreset(id) ?? CUSTOM_DIMENSION_FALLBACK;
  const scale = Math.min(maxOuterW / base.width, maxOuterH / base.height);
  return {
    width: Math.max(1, Math.round(base.width * scale)),
    height: Math.max(1, Math.round(base.height * scale)),
  };
}

/**
 * CSS `aspect-ratio` for the frame (same proportions as `FRAME_PRESET_DIMENSIONS`).
 * Uses reduced ratios — identical math, better browser behavior than huge pixel fractions.
 */
export function cssAspectRatioForPreset(id: FrameAspectPresetId): string {
  switch (id) {
    case "landscape-16-9":
      return "16 / 9";
    case "standard-4-3":
      return "4 / 3";
    case "square-1-1":
      return "1 / 1";
    case "portrait-4-5":
      return "4 / 5";
    case "vertical-9-16":
      return "9 / 16";
    case "custom":
      return "9 / 16";
    default:
      return "1 / 1";
  }
}

/** Tailwind `aspect-*` utility classes for mockup screen sizing. */
export function aspectClassForPreset(id: FrameAspectPresetId): string {
  switch (id) {
    case "landscape-16-9":
      return "aspect-[16/9]";
    case "standard-4-3":
      return "aspect-[4/3]";
    case "square-1-1":
      return "aspect-square";
    case "portrait-4-5":
      return "aspect-[4/5]";
    case "vertical-9-16":
      return "aspect-[9/16]";
    case "custom":
      return "aspect-[9/16]";
    default:
      return "aspect-[9/16]";
  }
}
