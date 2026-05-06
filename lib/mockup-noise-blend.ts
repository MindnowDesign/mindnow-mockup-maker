import type { CSSProperties } from "react";

/** Stored ids (JSON); map to CSS `mix-blend-mode` via `noiseBlendModeToCss`. */
export const CANVAS_NOISE_BLEND_MODE_IDS = [
  "pass-through",
  "normal",
  "darken",
  "multiply",
  "plus-darker",
  "color-burn",
  "lighten",
  "screen",
  "plus-lighter",
  "color-dodge",
  "overlay",
  "soft-light",
  "hard-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

export type CanvasNoiseBlendModeId =
  (typeof CANVAS_NOISE_BLEND_MODE_IDS)[number];

/** Default blend for new sessions / missing persisted value (maps to CSS `normal`). */
export const DEFAULT_CANVAS_NOISE_BLEND_MODE: CanvasNoiseBlendModeId =
  "pass-through";

const CSS_MIX_MAP: Record<CanvasNoiseBlendModeId, string> = {
  "pass-through": "normal",
  normal: "normal",
  darken: "darken",
  multiply: "multiply",
  "plus-darker": "plus-darker",
  "color-burn": "color-burn",
  lighten: "lighten",
  screen: "screen",
  "plus-lighter": "plus-lighter",
  "color-dodge": "color-dodge",
  overlay: "overlay",
  "soft-light": "soft-light",
  "hard-light": "hard-light",
  difference: "difference",
  exclusion: "exclusion",
  hue: "hue",
  saturation: "saturation",
  color: "color",
  luminosity: "luminosity",
};

export function noiseBlendModeToCss(
  id: CanvasNoiseBlendModeId
): NonNullable<CSSProperties["mixBlendMode"]> {
  return CSS_MIX_MAP[id] as NonNullable<CSSProperties["mixBlendMode"]>;
}

export function parseCanvasNoiseBlendMode(
  raw: unknown
): CanvasNoiseBlendModeId {
  if (typeof raw !== "string") return DEFAULT_CANVAS_NOISE_BLEND_MODE;
  return CANVAS_NOISE_BLEND_MODE_IDS.includes(raw as CanvasNoiseBlendModeId)
    ? (raw as CanvasNoiseBlendModeId)
    : DEFAULT_CANVAS_NOISE_BLEND_MODE;
}

/** Figma-style sections for the noise blend dropdown. */
export const CANVAS_NOISE_BLEND_GROUPS: {
  modes: { id: CanvasNoiseBlendModeId; label: string }[];
}[] = [
  {
    modes: [
      { id: "pass-through", label: "Pass through" },
      { id: "normal", label: "Normal" },
    ],
  },
  {
    modes: [
      { id: "darken", label: "Darken" },
      { id: "multiply", label: "Multiply" },
      { id: "plus-darker", label: "Plus darker" },
      { id: "color-burn", label: "Color burn" },
    ],
  },
  {
    modes: [
      { id: "lighten", label: "Lighten" },
      { id: "screen", label: "Screen" },
      { id: "plus-lighter", label: "Plus lighter" },
      { id: "color-dodge", label: "Color dodge" },
    ],
  },
  {
    modes: [
      { id: "overlay", label: "Overlay" },
      { id: "soft-light", label: "Soft light" },
      { id: "hard-light", label: "Hard light" },
    ],
  },
  {
    modes: [
      { id: "difference", label: "Difference" },
      { id: "exclusion", label: "Exclusion" },
    ],
  },
  {
    modes: [
      { id: "hue", label: "Hue" },
      { id: "saturation", label: "Saturation" },
      { id: "color", label: "Color" },
      { id: "luminosity", label: "Luminosity" },
    ],
  },
];
