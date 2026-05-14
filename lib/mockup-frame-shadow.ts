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
  Exclude<FrameShadowPresetId, "custom">,
  FrameShadowNumbers
> = {
  sharp: {
    offsetX: 0,
    offsetY: 2,
    blur: 6,
    spread: -1,
    color: DEFAULT_COLOR,
    colorOpacity: 18,
  },
  soft: {
    offsetX: 0,
    offsetY: 16,
    blur: 40,
    spread: -12,
    color: DEFAULT_COLOR,
    colorOpacity: 35,
  },
  floating: {
    offsetX: 0,
    offsetY: 4,
    blur: 4,
    spread: 0,
    color: DEFAULT_COLOR,
    colorOpacity: 25,
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
  const base =
    preset === "custom"
      ? defaultFrameShadowNumbers()
      : { ...FRAME_SHADOW_PRESET_SPECS[preset] };

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

/** Single drop-shadow on the screenshot media shell. */
export function buildFrameShadowBoxShadow(n: FrameShadowNumbers): string {
  const color = rgbaFromHex(n.color, n.colorOpacity);
  return `${n.offsetX}px ${n.offsetY}px ${n.blur}px ${n.spread}px ${color}`;
}
