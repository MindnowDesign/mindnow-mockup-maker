/** Canvas image-dithering (Paper Design ImageDithering) — defaults match paper.design demo. */

export const CANVAS_DITHER_TYPES = ["random", "2x2", "4x4", "8x8"] as const;

export type CanvasDitherTypeId = (typeof CANVAS_DITHER_TYPES)[number];

export const DEFAULT_CANVAS_DITHER_ENABLED = false;
export const DEFAULT_CANVAS_DITHER_COLOR_BACK = "#000C38";
export const DEFAULT_CANVAS_DITHER_COLOR_FRONT = "#94FFAF";
export const DEFAULT_CANVAS_DITHER_COLOR_HIGHLIGHT = "#EAFF94";
export const DEFAULT_CANVAS_DITHER_ORIGINAL_COLORS = false;
export const DEFAULT_CANVAS_DITHER_INVERTED = false;
export const DEFAULT_CANVAS_DITHER_TYPE: CanvasDitherTypeId = "8x8";
export const DEFAULT_CANVAS_DITHER_SIZE = 2;
export const DEFAULT_CANVAS_DITHER_COLOR_STEPS = 2;

export const CANVAS_DITHER_SIZE_MIN = 0.5;
export const CANVAS_DITHER_SIZE_MAX = 20;
export const CANVAS_DITHER_COLOR_STEPS_MIN = 1;
export const CANVAS_DITHER_COLOR_STEPS_MAX = 7;

export type PersistedCanvasDither = {
  enabled?: boolean;
  colorBack?: string;
  colorFront?: string;
  colorHighlight?: string;
  originalColors?: boolean;
  inverted?: boolean;
  type?: CanvasDitherTypeId;
  size?: number;
  colorSteps?: number;
};

export function parseCanvasDitherType(value: unknown): CanvasDitherTypeId {
  if (
    value === "random" ||
    value === "2x2" ||
    value === "4x4" ||
    value === "8x8"
  ) {
    return value;
  }
  return DEFAULT_CANVAS_DITHER_TYPE;
}

export function normalizeDitherHex(
  raw: string | null | undefined,
  fallback: string
): string {
  const trimmed = raw?.trim() ?? "";
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  return fallback;
}

export function clampCanvasDitherSize(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return DEFAULT_CANVAS_DITHER_SIZE;
  const clamped = Math.min(
    CANVAS_DITHER_SIZE_MAX,
    Math.max(CANVAS_DITHER_SIZE_MIN, value)
  );
  return Math.round(clamped * 10) / 10;
}

export function clampCanvasDitherColorSteps(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) {
    return DEFAULT_CANVAS_DITHER_COLOR_STEPS;
  }
  return Math.min(
    CANVAS_DITHER_COLOR_STEPS_MAX,
    Math.max(CANVAS_DITHER_COLOR_STEPS_MIN, Math.round(value))
  );
}

export function canvasDitherTypeLabel(id: CanvasDitherTypeId): string {
  return id;
}
