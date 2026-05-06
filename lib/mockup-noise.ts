/** Grain presets inspired by cinematic / mockup tools (e.g. fine film grain vs TV-style static). */

export const CANVAS_NOISE_TYPE_IDS = [
  "film",
  "fine",
  "soft",
  "static",
] as const;

export type CanvasNoiseTypeId = (typeof CANVAS_NOISE_TYPE_IDS)[number];

export const DEFAULT_CANVAS_NOISE_TYPE: CanvasNoiseTypeId = "film";

export type NoiseFilterPreset = {
  turbulenceType: "fractalNoise" | "turbulence";
  baseFrequency: string;
  numOctaves: number;
  seed: number;
};

const PRESETS: Record<CanvasNoiseTypeId, NoiseFilterPreset> = {
  /** Balanced cinematic grain (previous default). */
  film: {
    turbulenceType: "fractalNoise",
    baseFrequency: "0.52",
    numOctaves: 5,
    seed: 2,
  },
  /** Tight, subtle grain. */
  fine: {
    turbulenceType: "fractalNoise",
    baseFrequency: "0.92",
    numOctaves: 6,
    seed: 11,
  },
  /** Large, soft blobs — diffuse texture. */
  soft: {
    turbulenceType: "fractalNoise",
    baseFrequency: "0.26",
    numOctaves: 4,
    seed: 7,
  },
  /** Sharper turbulence — “electric” / scan-adjacent feel. */
  static: {
    turbulenceType: "turbulence",
    baseFrequency: "0.68",
    numOctaves: 3,
    seed: 19,
  },
};

export function noiseFilterPreset(id: CanvasNoiseTypeId): NoiseFilterPreset {
  return PRESETS[id] ?? PRESETS.film;
}

export function parseCanvasNoiseType(
  raw: string | undefined | null
): CanvasNoiseTypeId {
  const t = raw?.trim().toLowerCase();
  if (t && CANVAS_NOISE_TYPE_IDS.includes(t as CanvasNoiseTypeId)) {
    return t as CanvasNoiseTypeId;
  }
  return DEFAULT_CANVAS_NOISE_TYPE;
}

/** Sidebar labels / tooltips for each preset. */
export const CANVAS_NOISE_TYPE_OPTIONS: {
  id: CanvasNoiseTypeId;
  label: string;
  description: string;
}[] = [
  {
    id: "film",
    label: "Film",
    description: "Balanced cinematic grain",
  },
  {
    id: "fine",
    label: "Fine",
    description: "Tight, subtle grain",
  },
  {
    id: "soft",
    label: "Soft",
    description: "Large, diffuse texture",
  },
  {
    id: "static",
    label: "Static",
    description: "Sharper electronic noise",
  },
];
