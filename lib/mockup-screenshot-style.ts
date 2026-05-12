/**
 * Per-visual styling applied on top of an uploaded screenshot when no device
 * frame PNG is selected (i.e. `deviceTemplateId === null`).
 */

export type ScreenshotStyleId = "default" | "border" | "glass" | "outline";

export type ScreenshotBorderPosition = "inside" | "center" | "outside";

/**
 * `sharp | curved | round` are presets surfaced as buttons; clicking one snaps
 * the slider to a fixed value. `custom` means the user moved the slider/input
 * freely so no preset is highlighted.
 */
export type ScreenshotCornerType =
  | "sharp"
  | "curved"
  | "round"
  | "custom";

export type ScreenshotCornerPresetId = Exclude<
  ScreenshotCornerType,
  "custom"
>;

export const DEFAULT_SCREENSHOT_CORNER_TYPE: ScreenshotCornerType = "sharp";
export const DEFAULT_SCREENSHOT_CORNER_RADIUS = 0;
export const SCREENSHOT_CORNER_RADIUS_MIN = 0;
export const SCREENSHOT_CORNER_RADIUS_MAX = 100;
/**
 * The slider/displayed value goes 0–100 (a normalized scale), but the actual
 * border-radius applied to the screenshot caps at half of that. This keeps
 * the maximum visual rounding sensible across image sizes while letting the
 * UI expose a clean 0–100 range.
 */
export const SCREENSHOT_CORNER_RADIUS_DISPLAY_TO_PIXEL = 0.5;

export const SCREENSHOT_CORNER_TYPE_PRESETS: Record<
  ScreenshotCornerPresetId,
  number
> = {
  sharp: 0,
  curved: 40,
  round: SCREENSHOT_CORNER_RADIUS_MAX,
};

export const SCREENSHOT_CORNER_TYPE_OPTIONS: {
  id: ScreenshotCornerPresetId;
  label: string;
}[] = [
  { id: "sharp", label: "Sharp" },
  { id: "curved", label: "Curved" },
  { id: "round", label: "Round" },
];

export function parseScreenshotCornerType(
  value: unknown
): ScreenshotCornerType {
  if (
    value === "sharp" ||
    value === "curved" ||
    value === "round" ||
    value === "custom"
  ) {
    return value;
  }
  return DEFAULT_SCREENSHOT_CORNER_TYPE;
}

export function clampScreenshotCornerRadius(
  value: number | undefined
): number {
  if (value == null || Number.isNaN(value)) {
    return DEFAULT_SCREENSHOT_CORNER_RADIUS;
  }
  return Math.min(
    SCREENSHOT_CORNER_RADIUS_MAX,
    Math.max(SCREENSHOT_CORNER_RADIUS_MIN, Math.round(value))
  );
}

/**
 * Effective `border-radius` (px) applied to the screenshot shell. The slider
 * value (0–100) is scaled down to a sensible pixel range so 100 maps to the
 * visual cap (≈50px). The corner type is purely a UI hint (which preset is
 * highlighted) and does not influence the rendered radius.
 */
export function screenshotEffectiveCornerRadius(radius: number): number {
  return Math.max(0, radius * SCREENSHOT_CORNER_RADIUS_DISPLAY_TO_PIXEL);
}

/**
 * Detached stroke around the screenshot (à la `shots.so` "Outline").
 * Geometry is fixed; only the color is user-editable.
 */
export const SCREENSHOT_OUTLINE = {
  /** Transparent gap between the image edge and the outline (px). */
  gap: 4,
  /** Stroke thickness (px). */
  weight: 2,
} as const;

export const DEFAULT_SCREENSHOT_OUTLINE_COLOR = "#000000";
/** 0–100 — opacity of the outline stroke color (style === "outline"). */
export const DEFAULT_SCREENSHOT_OUTLINE_COLOR_OPACITY = 100;

/**
 * Frosted-glass frame around the screenshot (à la `shots.so` "Glass Light").
 * Tweaked here so designers get a single source of truth for both the canvas
 * stage and the picker preview.
 */
export const SCREENSHOT_GLASS_LIGHT = {
  /** Padding (px) between the image and the outer glass frame. */
  framePadding: 8,
  /** Outer rounded corner radius of the glass frame (px). */
  frameRadius: 0,
  /** Rounded corner of the inner image (px). */
  imageRadius: 0,
  /** Background fill for the glass frame (translucent). */
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.18) 100%)",
  /** `backdrop-filter` value blurring whatever is behind the glass frame. */
  backdropFilter: "blur(20px) saturate(160%)",
} as const;

export const DEFAULT_SCREENSHOT_STYLE: ScreenshotStyleId = "default";
export const DEFAULT_SCREENSHOT_BORDER_COLOR = "#000000";
export const DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY = 100;
export const DEFAULT_SCREENSHOT_BORDER_POSITION: ScreenshotBorderPosition =
  "inside";
export const DEFAULT_SCREENSHOT_BORDER_WEIGHT = 2;
export const SCREENSHOT_BORDER_WEIGHT_MIN = 0;
export const SCREENSHOT_BORDER_WEIGHT_MAX = 64;

export const SCREENSHOT_BORDER_POSITION_OPTIONS: {
  id: ScreenshotBorderPosition;
  label: string;
}[] = [
  { id: "inside", label: "Inside" },
  { id: "center", label: "Center" },
  { id: "outside", label: "Outside" },
];

export type PersistedScreenshotStyle = {
  style: ScreenshotStyleId;
  borderColor?: string;
  /** 0–100 — opacity of the border color. */
  borderColorOpacity?: number;
  borderPosition?: ScreenshotBorderPosition;
  /** Stroke thickness in px. */
  borderWeight?: number;
  /** Hex color for the detached outline (style === "outline"). */
  outlineColor?: string;
  /** 0–100 — opacity of the outline stroke color. */
  outlineColorOpacity?: number;
  /** Corner shape preset for the screenshot shell. */
  cornerType?: ScreenshotCornerType;
  /** Pixel radius for non-sharp corner types. */
  cornerRadius?: number;
};

export function parseScreenshotStyle(value: unknown): ScreenshotStyleId {
  if (value === "border") return "border";
  if (value === "glass") return "glass";
  if (value === "outline") return "outline";
  return "default";
}

export function parseScreenshotBorderPosition(
  value: unknown
): ScreenshotBorderPosition {
  if (value === "outside" || value === "center" || value === "inside") {
    return value;
  }
  return DEFAULT_SCREENSHOT_BORDER_POSITION;
}

export function clampScreenshotBorderWeight(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) {
    return DEFAULT_SCREENSHOT_BORDER_WEIGHT;
  }
  return Math.min(
    SCREENSHOT_BORDER_WEIGHT_MAX,
    Math.max(SCREENSHOT_BORDER_WEIGHT_MIN, Math.round(value))
  );
}

export function clampScreenshotBorderOpacity(
  value: number | undefined
): number {
  if (value == null || Number.isNaN(value)) {
    return DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Outline offset used to align the stroke against the inner / center / outer
 * edge of the screenshot, while keeping a single `outline` declaration.
 */
export function screenshotBorderOutlineOffset(
  position: ScreenshotBorderPosition,
  weight: number
): number {
  if (position === "outside") return 0;
  if (position === "center") return -weight / 2;
  return -weight;
}
