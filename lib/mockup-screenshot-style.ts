/**
 * Per-visual styling applied on top of an uploaded screenshot when no device
 * frame PNG is selected (i.e. `deviceTemplateId === null`).
 */

export type ScreenshotStyleId =
  | "default"
  | "border"
  | "glass"
  | "liquidGlass"
  | "outline";

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
 * stage and the picker preview. The stage applies the outer wrapper radius as
 * `screenshotEffectiveCornerRadius(cornerRadius) + framePadding` so the glass
 * band follows the same Corner radius controls as the image.
 */
export const SCREENSHOT_GLASS_LIGHT = {
  /** Padding (px) between the image and the outer glass frame. */
  framePadding: 8,
  /** Background fill for the glass frame (translucent). */
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.18) 100%)",
  /** `backdrop-filter` value blurring whatever is behind the glass frame. */
  backdropFilter: "blur(20px) saturate(160%)",
} as const;

/**
 * Stronger “liquid” glass (à la `shots.so` Liquid Glass) — cooler tint, higher
 * saturation/blur, and a soft specular rim so it reads wet vs frosted glass.
 */
export const SCREENSHOT_LIQUID_GLASS = {
  framePadding: 10,
  background:
    "linear-gradient(155deg, rgba(255, 255, 255, 0.5) 0%, rgba(186, 230, 253, 0.32) 42%, rgba(255, 255, 255, 0.1) 68%, rgba(165, 210, 255, 0.22) 100%)",
  backdropFilter: "blur(28px) saturate(210%) brightness(1.06)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 255, 255, 0.55), inset 0 -1px 0 rgba(56, 120, 200, 0.14), 0 4px 20px -6px rgba(30, 100, 200, 0.18)",
} as const;

export const DEFAULT_SCREENSHOT_STYLE: ScreenshotStyleId = "default";
export const DEFAULT_SCREENSHOT_BORDER_COLOR = "#000000";
export const DEFAULT_SCREENSHOT_BORDER_COLOR_OPACITY = 100;
export const DEFAULT_SCREENSHOT_BORDER_POSITION: ScreenshotBorderPosition =
  "outside";
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
  if (value === "liquidGlass") return "liquidGlass";
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
 * @deprecated Prefer `screenshotBorderBoxShadow` — outline ignores border-radius.
 */
export function screenshotBorderOutlineOffset(
  position: ScreenshotBorderPosition,
  weight: number
): number {
  if (position === "outside") return 0;
  if (position === "center") return -weight / 2;
  return -weight;
}

/**
 * Box dimensions for `object-contain` inside a viewport while preserving the
 * bitmap aspect ratio (rounding width and height independently causes ~1px gaps).
 */
export function fitScreenshotDimensions(
  natural: { w: number; h: number },
  viewport: { w: number; h: number }
): { w: number; h: number } {
  const s = Math.min(viewport.w / natural.w, viewport.h / natural.h);
  const ar = natural.w / natural.h;
  let w = Math.round(natural.w * s);
  let h = Math.round(natural.h * s);
  if (w / h > ar) {
    w = Math.max(1, Math.round(h * ar));
  } else if (w / h < ar) {
    h = Math.max(1, Math.round(w / ar));
  }
  return {
    w: Math.min(viewport.w, Math.max(1, w)),
    h: Math.min(viewport.h, Math.max(1, h)),
  };
}

/** Border stroke that follows `border-radius` (unlike CSS `outline`). */
export function screenshotBorderBoxShadow(
  position: ScreenshotBorderPosition,
  weight: number,
  color: string
): string {
  if (weight <= 0) return "none";
  if (position === "inside") {
    return `inset 0 0 0 ${weight}px ${color}`;
  }
  if (position === "center") {
    const half = weight / 2;
    return `inset 0 0 0 ${half}px ${color}, 0 0 0 ${half}px ${color}`;
  }
  return `0 0 0 ${weight}px ${color}`;
}
