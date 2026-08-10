/** Canvas HalftoneDots (Paper Design) — defaults match paper.design demo. */

export const CANVAS_HALFTONE_TYPES = [
  "classic",
  "gooey",
  "holes",
  "soft",
] as const;

export const CANVAS_HALFTONE_GRIDS = ["square", "hex"] as const;

export type CanvasHalftoneTypeId = (typeof CANVAS_HALFTONE_TYPES)[number];
export type CanvasHalftoneGridId = (typeof CANVAS_HALFTONE_GRIDS)[number];

export const DEFAULT_CANVAS_HALFTONE_ENABLED = false;
export const DEFAULT_CANVAS_HALFTONE_COLOR_BACK = "#F2F1E8";
export const DEFAULT_CANVAS_HALFTONE_COLOR_FRONT = "#2B2B2B";
export const DEFAULT_CANVAS_HALFTONE_ORIGINAL_COLORS = false;
export const DEFAULT_CANVAS_HALFTONE_INVERTED = false;
export const DEFAULT_CANVAS_HALFTONE_TYPE: CanvasHalftoneTypeId = "gooey";
export const DEFAULT_CANVAS_HALFTONE_GRID: CanvasHalftoneGridId = "hex";
export const DEFAULT_CANVAS_HALFTONE_SIZE = 0.5;
export const DEFAULT_CANVAS_HALFTONE_RADIUS = 1.25;
export const DEFAULT_CANVAS_HALFTONE_CONTRAST = 0.4;

export const CANVAS_HALFTONE_SIZE_MIN = 0;
export const CANVAS_HALFTONE_SIZE_MAX = 1;
export const CANVAS_HALFTONE_RADIUS_MIN = 0;
export const CANVAS_HALFTONE_RADIUS_MAX = 2;
export const CANVAS_HALFTONE_CONTRAST_MIN = 0;
export const CANVAS_HALFTONE_CONTRAST_MAX = 1;

export type PersistedCanvasHalftone = {
  enabled?: boolean;
  colorBack?: string;
  colorFront?: string;
  originalColors?: boolean;
  inverted?: boolean;
  type?: CanvasHalftoneTypeId;
  grid?: CanvasHalftoneGridId;
  size?: number;
  radius?: number;
  contrast?: number;
};

export function parseCanvasHalftoneType(value: unknown): CanvasHalftoneTypeId {
  if (
    value === "classic" ||
    value === "gooey" ||
    value === "holes" ||
    value === "soft"
  ) {
    return value;
  }
  return DEFAULT_CANVAS_HALFTONE_TYPE;
}

export function parseCanvasHalftoneGrid(value: unknown): CanvasHalftoneGridId {
  if (value === "square" || value === "hex") return value;
  return DEFAULT_CANVAS_HALFTONE_GRID;
}

export function normalizeHalftoneHex(
  raw: string | null | undefined,
  fallback: string
): string {
  const trimmed = raw?.trim() ?? "";
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  return fallback;
}

function clamp01Round2(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value)) return fallback;
  const clamped = Math.min(1, Math.max(0, value));
  return Math.round(clamped * 100) / 100;
}

export function clampCanvasHalftoneSize(value: number | undefined): number {
  return clamp01Round2(value, DEFAULT_CANVAS_HALFTONE_SIZE);
}

export function clampCanvasHalftoneRadius(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return DEFAULT_CANVAS_HALFTONE_RADIUS;
  const clamped = Math.min(
    CANVAS_HALFTONE_RADIUS_MAX,
    Math.max(CANVAS_HALFTONE_RADIUS_MIN, value)
  );
  return Math.round(clamped * 100) / 100;
}

export function clampCanvasHalftoneContrast(value: number | undefined): number {
  return clamp01Round2(value, DEFAULT_CANVAS_HALFTONE_CONTRAST);
}
