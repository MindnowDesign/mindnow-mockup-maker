import { hexToRgb } from "@/lib/color-hex-hsv";

export type FrameShadowPresetId = "custom" | "sharp" | "soft" | "floating";

export type FrameShadowNumbers = {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  colorOpacity: number;
};

export type PersistedFrameShadow = {
  preset: FrameShadowPresetId;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  spread?: number;
  color?: string;
  colorOpacity?: number;
};

const DEFAULT_COLOR = "#000000";

export const FRAME_SHADOW_PRESET_SPECS: Record<
  FrameShadowPresetId,
  FrameShadowNumbers
> = {
  custom: {
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    spread: 0,
    color: DEFAULT_COLOR,
    colorOpacity: 100,
  },
  sharp: {
    offsetX: 15,
    offsetY: 15,
    blur: 5,
    spread: 0,
    color: DEFAULT_COLOR,
    colorOpacity: 60,
  },
  soft: {
    offsetX: 0,
    offsetY: 15,
    blur: 35,
    spread: 0,
    color: DEFAULT_COLOR,
    colorOpacity: 40,
  },
  floating: {
    offsetX: 30,
    offsetY: 30,
    blur: 30,
    spread: 0,
    color: DEFAULT_COLOR,
    colorOpacity: 65,
  },
};

export const DEFAULT_FRAME_SHADOW_PRESET: FrameShadowPresetId = "soft";

export function defaultFrameShadowNumbers(): FrameShadowNumbers {
  return { ...FRAME_SHADOW_PRESET_SPECS.soft };
}

export function parseFrameShadowPreset(value: unknown): FrameShadowPresetId {
  if (value === "custom" || value === "sharp" || value === "soft" || value === "floating") {
    return value;
  }
  return DEFAULT_FRAME_SHADOW_PRESET;
}

function clampInt(n: number | undefined, min: number, max: number, fallback: number) {
  if (n == null || Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizeHex6(raw: string | undefined, fallback: string): string {
  const t = raw?.trim() ?? "";
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase();
  return fallback.toUpperCase();
}

export function normalizePersistedFrameShadow(
  partial: PersistedFrameShadow | null | undefined
): { preset: FrameShadowPresetId; numbers: FrameShadowNumbers } {
  const preset = parseFrameShadowPreset(partial?.preset);
  const base = { ...FRAME_SHADOW_PRESET_SPECS[preset] };

  return {
    preset,
    numbers: {
      offsetX: clampInt(partial?.offsetX, -128, 128, base.offsetX),
      offsetY: clampInt(partial?.offsetY, -128, 128, base.offsetY),
      blur: clampInt(partial?.blur, 0, 128, base.blur),
      spread: clampInt(partial?.spread, -64, 64, base.spread),
      color: normalizeHex6(partial?.color, base.color),
      colorOpacity: clampInt(partial?.colorOpacity, 0, 100, base.colorOpacity),
    },
  };
}

export function frameShadowToPersisted(
  preset: FrameShadowPresetId,
  n: FrameShadowNumbers
): PersistedFrameShadow {
  return {
    preset,
    offsetX: n.offsetX,
    offsetY: n.offsetY,
    blur: n.blur,
    spread: n.spread,
    color: n.color.trim().toUpperCase(),
    colorOpacity: n.colorOpacity,
  };
}

function rgbaFromHex(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const a = Math.min(1, Math.max(0, opacityPercent / 100));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

/** Rectangular `box-shadow` for screenshot / browser chrome shells. */
export function buildFrameShadowBoxShadow(n: FrameShadowNumbers): string {
  const color = rgbaFromHex(n.color, n.colorOpacity);
  return `${n.offsetX}px ${n.offsetY}px ${n.blur}px ${n.spread}px ${color}`;
}

/**
 * Alpha-aware shadow for PNG device frames (iPhone, MacBook, etc.).
 * `drop-shadow()` follows the frame silhouette; spread is not supported in CSS filters.
 */
export function buildFrameShadowDropShadow(n: FrameShadowNumbers): string {
  const color = rgbaFromHex(n.color, n.colorOpacity);
  return `drop-shadow(${n.offsetX}px ${n.offsetY}px ${n.blur}px ${color})`;
}

/** Inset from the canvas clip so `drop-shadow()` can fall off before hitting `overflow: hidden`. */
export function computeDeviceShadowBleedPx(
  n: FrameShadowNumbers,
  mockupScale = 1
): number {
  const spread = Math.max(0, n.spread);
  const scale = Math.max(1, mockupScale);
  const blurReach = Math.ceil(n.blur * 3 * scale);
  const right = Math.max(0, n.offsetX) * scale + blurReach + spread + 24;
  const left = Math.max(0, -n.offsetX) * scale + blurReach + spread + 24;
  const bottom = Math.max(0, n.offsetY) * scale + blurReach + spread + 28;
  const top = Math.max(0, -n.offsetY) * scale + blurReach + spread + 24;
  return Math.max(right, left, bottom, top);
}
