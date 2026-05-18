import type { CSSProperties } from "react";

import {
  EDITABLE_GRADIENT_TEMPLATE_IDS,
  getGradientTemplateFillKeys,
  type GradientFillKey,
} from "@/lib/canvas-gradient-1-fill";
import {
  noiseBlendModeToCss,
  type CanvasNoiseBlendModeId,
} from "@/lib/mockup-noise-blend";

/** Blend modes available in the template fill color picker only. */
export const TEMPLATE_FILL_BLEND_MODE_IDS = [
  "pass-through",
  "normal",
  "overlay",
  "soft-light",
  "hard-light",
] as const;

export type TemplateFillBlendModeId =
  (typeof TEMPLATE_FILL_BLEND_MODE_IDS)[number];

export const DEFAULT_TEMPLATE_FILL_BLEND_MODE: TemplateFillBlendModeId =
  "pass-through";

export const TEMPLATE_FILL_BLEND_MODE_OPTIONS: {
  id: TemplateFillBlendModeId;
  label: string;
}[] = [
  { id: "pass-through", label: "Pass through" },
  { id: "normal", label: "Normal" },
  { id: "overlay", label: "Overlay" },
  { id: "soft-light", label: "Soft light" },
  { id: "hard-light", label: "Hard light" },
];

export function parseTemplateFillBlendMode(
  raw: unknown
): TemplateFillBlendModeId {
  if (typeof raw !== "string") return DEFAULT_TEMPLATE_FILL_BLEND_MODE;
  return TEMPLATE_FILL_BLEND_MODE_IDS.includes(
    raw as TemplateFillBlendModeId
  )
    ? (raw as TemplateFillBlendModeId)
    : DEFAULT_TEMPLATE_FILL_BLEND_MODE;
}

export function templateFillBlendModeToCss(
  id: TemplateFillBlendModeId
): NonNullable<CSSProperties["mixBlendMode"]> {
  return noiseBlendModeToCss(id as CanvasNoiseBlendModeId);
}

export function normalizeTemplateFillBlendModes(
  templateId: string | null | undefined,
  partial: Record<string, string> | null | undefined
): Record<string, TemplateFillBlendModeId> {
  const keys = getGradientTemplateFillKeys(templateId);
  const out: Record<string, TemplateFillBlendModeId> = {};
  for (const key of keys) {
    out[key] = parseTemplateFillBlendMode(partial?.[key]);
  }
  return out;
}

export function normalizeGradientBlendModesByTemplate(
  partial:
    | Record<string, Record<string, string> | undefined>
    | null
    | undefined
): Record<string, Record<string, TemplateFillBlendModeId>> {
  const out: Record<string, Record<string, TemplateFillBlendModeId>> = {};
  for (const templateId of EDITABLE_GRADIENT_TEMPLATE_IDS) {
    out[templateId] = normalizeTemplateFillBlendModes(
      templateId,
      partial?.[templateId]
    );
  }
  return out;
}

export function resolveActiveTemplateFillBlendModes(
  templateId: string | null | undefined,
  byTemplate: Record<string, Record<string, TemplateFillBlendModeId> | undefined>
): Record<string, TemplateFillBlendModeId> {
  if (!templateId) return {};
  return normalizeTemplateFillBlendModes(templateId, byTemplate[templateId]);
}

/** Scoped CSS for inline SVG paths using `fill="var(--cbg-N, …)"`. */
export function buildInlineSvgFillBlendStyleCss(
  templateId: string | null | undefined,
  blendByKey: Record<string, TemplateFillBlendModeId>
): string | undefined {
  const keys = getGradientTemplateFillKeys(templateId);
  if (!keys.length) return undefined;

  const rules: string[] = [];
  for (const key of keys) {
    const mode = templateFillBlendModeToCss(
      blendByKey[key] ?? DEFAULT_TEMPLATE_FILL_BLEND_MODE
    );
    if (mode === "normal") continue;
    const fillKey = key as GradientFillKey;
    rules.push(
      `[fill^="var(--${fillKey}"]{mix-blend-mode:${mode}}`,
      `[stroke^="var(--${fillKey}"]{mix-blend-mode:${mode}}`
    );
  }

  return rules.length > 0 ? rules.join("") : undefined;
}
