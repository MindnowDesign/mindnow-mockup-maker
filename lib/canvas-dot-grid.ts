/** Canvas Dot Grid (Paper Design DotGrid) — defaults match paper.design demo. */

export const CANVAS_DOT_GRID_SHAPES = [
  "circle",
  "diamond",
  "square",
  "triangle",
] as const;

export type CanvasDotGridShapeId = (typeof CANVAS_DOT_GRID_SHAPES)[number];

export const DEFAULT_CANVAS_DOT_GRID_COLOR_BACK = "#000000";
export const DEFAULT_CANVAS_DOT_GRID_COLOR_FILL = "#FFFFFF";
export const DEFAULT_CANVAS_DOT_GRID_SHAPE: CanvasDotGridShapeId = "circle";
export const DEFAULT_CANVAS_DOT_GRID_SIZE = 2;
export const DEFAULT_CANVAS_DOT_GRID_GAP_X = 32;
export const DEFAULT_CANVAS_DOT_GRID_GAP_Y = 32;
export const DEFAULT_CANVAS_DOT_GRID_SIZE_RANGE = 0;
export const DEFAULT_CANVAS_DOT_GRID_OPACITY_RANGE = 0;

export const CANVAS_DOT_GRID_SIZE_MIN = 1;
export const CANVAS_DOT_GRID_SIZE_MAX = 100;
export const CANVAS_DOT_GRID_GAP_MIN = 2;
export const CANVAS_DOT_GRID_GAP_MAX = 500;
export const CANVAS_DOT_GRID_RANGE_MIN = 0;
export const CANVAS_DOT_GRID_RANGE_MAX = 1;

export type PersistedCanvasDotGrid = {
  colorBack?: string;
  colorFill?: string;
  shape?: CanvasDotGridShapeId;
  size?: number;
  gapX?: number;
  gapY?: number;
  sizeRange?: number;
  opacityRange?: number;
};

export function parseCanvasDotGridShape(value: unknown): CanvasDotGridShapeId {
  if (
    value === "circle" ||
    value === "diamond" ||
    value === "square" ||
    value === "triangle"
  ) {
    return value;
  }
  return DEFAULT_CANVAS_DOT_GRID_SHAPE;
}

export function normalizeDotGridHex(
  raw: string | null | undefined,
  fallback: string
): string {
  const trimmed = raw?.trim() ?? "";
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  return fallback;
}

export function clampCanvasDotGridSize(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return DEFAULT_CANVAS_DOT_GRID_SIZE;
  return Math.min(
    CANVAS_DOT_GRID_SIZE_MAX,
    Math.max(CANVAS_DOT_GRID_SIZE_MIN, Math.round(value))
  );
}

export function clampCanvasDotGridGap(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return DEFAULT_CANVAS_DOT_GRID_GAP_X;
  return Math.min(
    CANVAS_DOT_GRID_GAP_MAX,
    Math.max(CANVAS_DOT_GRID_GAP_MIN, Math.round(value))
  );
}

export function clampCanvasDotGridRange(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  const clamped = Math.min(
    CANVAS_DOT_GRID_RANGE_MAX,
    Math.max(CANVAS_DOT_GRID_RANGE_MIN, value)
  );
  return Math.round(clamped * 100) / 100;
}
