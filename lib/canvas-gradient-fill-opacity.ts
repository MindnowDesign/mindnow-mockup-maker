import { hexToRgb } from "@/lib/color-hex-hsv";
import {
  getGradientTemplateFillKeys,
  type GradientFillKey,
} from "@/lib/canvas-gradient-1-fill";

export const DEFAULT_TEMPLATE_FILL_OPACITY = 100;

export function clampTemplateFillOpacity(n: number): number {
  if (Number.isNaN(n)) return DEFAULT_TEMPLATE_FILL_OPACITY;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function hexToRgbaCss(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const a = Math.min(1, Math.max(0, opacityPercent / 100));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

export function normalizeTemplateFillOpacities(
  templateId: string | null | undefined,
  partial: Record<string, number> | null | undefined
): Record<string, number> {
  const keys = getGradientTemplateFillKeys(templateId);
  const out: Record<string, number> = {};
  for (const key of keys) {
    const raw = partial?.[key];
    out[key] =
      raw != null && !Number.isNaN(Number(raw))
        ? clampTemplateFillOpacity(Number(raw))
        : DEFAULT_TEMPLATE_FILL_OPACITY;
  }
  return out;
}

export function normalizeGradientOpacitiesByTemplate(
  partial:
    | Record<string, Record<string, number> | undefined>
    | null
    | undefined
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  if (!partial) return out;
  for (const [templateId, opacities] of Object.entries(partial)) {
    out[templateId] = normalizeTemplateFillOpacities(templateId, opacities);
  }
  return out;
}

export function resolveActiveTemplateFillOpacities(
  templateId: string | null | undefined,
  byTemplate: Record<string, Record<string, number> | undefined>
): Record<string, number> {
  if (!templateId) return {};
  return normalizeTemplateFillOpacities(templateId, byTemplate[templateId]);
}

export function templateFillOpacityCssValue(
  hex: string,
  opacityPercent: number
): string {
  if (opacityPercent >= 100) return hex;
  return hexToRgbaCss(hex, opacityPercent);
}

export type { GradientFillKey };
