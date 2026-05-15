/** CSS custom-property names (without `--`) used by `gradient-1.svg`. */
export const GRADIENT_1_FILL_KEYS = [
  "cbg-base",
  "cbg-strip",
  "cbg-glow-a",
  "cbg-glow-b",
  "cbg-accent",
] as const;

export type Gradient1FillKey = (typeof GRADIENT_1_FILL_KEYS)[number];

export const GRADIENT_1_FILL_DEFAULTS: Record<Gradient1FillKey, string> = {
  "cbg-base": "#F8F8F8",
  "cbg-strip": "#FDFF85",
  "cbg-glow-a": "#A63DA3",
  "cbg-glow-b": "#FF7D45",
  "cbg-accent": "#FF530A",
};

export const GRADIENT_1_FILL_LABELS: Record<Gradient1FillKey, string> = {
  "cbg-base": "Background base",
  "cbg-strip": "Accent strip",
  "cbg-glow-a": "Glow layer A",
  "cbg-glow-b": "Glow layer B",
  "cbg-accent": "Accent shape",
};

export function normalizeGradient1FillHex(
  partial: Record<string, string> | null | undefined
): Record<Gradient1FillKey, string> {
  const out = { ...GRADIENT_1_FILL_DEFAULTS };
  if (!partial) return out;
  for (const key of GRADIENT_1_FILL_KEYS) {
    const raw = partial[key]?.trim();
    if (raw && /^#[0-9A-Fa-f]{6}$/.test(raw)) {
      out[key] = raw.toUpperCase();
    }
  }
  return out;
}
