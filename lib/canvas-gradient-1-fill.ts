/** CSS custom-property names (without `--`) used by gradient template SVGs. */
export type GradientFillKey = `cbg-${number}`;

export type GradientTemplateFillConfig = {
  /** Ordered keys matching `fill="var(--cbg-N, …)"` in the SVG. */
  keys: readonly GradientFillKey[];
  defaults: Record<GradientFillKey, string>;
};

function buildConfig(
  hexes: readonly string[]
): GradientTemplateFillConfig {
  const keys = hexes.map((_, i) => `cbg-${i}` as const) as readonly GradientFillKey[];
  const defaults = Object.fromEntries(
    keys.map((key, i) => [key, hexes[i]!.toUpperCase()])
  ) as Record<GradientFillKey, string>;
  return { keys, defaults };
}

/** Per-template editable stops — derived from shipped SVG default colors. */
export const GRADIENT_TEMPLATE_FILL_CONFIG: Record<string, GradientTemplateFillConfig> =
  {
    "gradient-1": buildConfig(["#FDFF85", "#A63DA3", "#FF7D45", "#FF530A"]),
    "gradient-2": buildConfig(["#021010", "#EDBFF5", "#A63DA3", "#062AA9"]),
    "gradient-3": buildConfig(["#FEAAE6", "#A63DA3", "#BA546E", "#D9DBCF"]),
    "gradient-4": buildConfig([
      "#FFFFFF",
      "#FFDED0",
      "#FDFFAF",
      "#00C9D2",
      "#016CEC",
    ]),
    "gradient-5": buildConfig([
      "#FFFFFF",
      "#FEFFC7",
      "#FF7D45",
      "#FF99A8",
    ]),
    "gradient-6": buildConfig([
      "#FFFFFF",
      "#5C28DF",
      "#FDB6CB",
      "#F23861",
    ]),
    "gradient-7": buildConfig([
      "#FFFFFF",
      "#FEFFC8",
      "#FF7D45",
      "#FF396A",
    ]),
  };

/** @deprecated Use per-template keys from `getGradientTemplateFillKeys()` */
export const GRADIENT_FILL_KEYS =
  GRADIENT_TEMPLATE_FILL_CONFIG["gradient-1"]!.keys;

/** @deprecated Use `GRADIENT_FILL_KEYS` */
export const GRADIENT_1_FILL_KEYS = GRADIENT_FILL_KEYS;

/** @deprecated Use `GradientFillKey` */
export type Gradient1FillKey = GradientFillKey;

export function getGradientTemplateFillKeys(
  templateId: string | null | undefined
): readonly GradientFillKey[] {
  if (!templateId) return [];
  return GRADIENT_TEMPLATE_FILL_CONFIG[templateId]?.keys ?? [];
}

export function getGradientFillLabel(
  templateId: string,
  key: GradientFillKey
): string {
  const keys = getGradientTemplateFillKeys(templateId);
  const index = keys.indexOf(key);
  return index >= 0 ? `Color ${index + 1}` : "Color";
}

/** @deprecated Use `getGradientFillLabel(templateId, key)` */
export const GRADIENT_FILL_LABELS: Record<string, string> = {};

/** @deprecated Use `GRADIENT_TEMPLATE_FILL_CONFIG["gradient-1"].defaults` */
export const GRADIENT_1_FILL_DEFAULTS =
  GRADIENT_TEMPLATE_FILL_CONFIG["gradient-1"]!.defaults;

/** @deprecated Use `GRADIENT_TEMPLATE_FILL_CONFIG` */
export const GRADIENT_TEMPLATE_FILL_DEFAULTS: Record<
  string,
  Record<string, string>
> = Object.fromEntries(
  Object.entries(GRADIENT_TEMPLATE_FILL_CONFIG).map(([id, cfg]) => [
    id,
    cfg.defaults,
  ])
);

export const EDITABLE_GRADIENT_TEMPLATE_IDS = Object.keys(
  GRADIENT_TEMPLATE_FILL_CONFIG
) as (keyof typeof GRADIENT_TEMPLATE_FILL_CONFIG)[];

const LEGACY_KEY_MAP: Record<string, Record<string, GradientFillKey>> = {
  "gradient-1": {
    "cbg-base": "cbg-0",
    "cbg-strip": "cbg-0",
    "cbg-glow-a": "cbg-1",
    "cbg-glow-b": "cbg-2",
    "cbg-accent": "cbg-3",
  },
  "gradient-2": {
    "cbg-base": "cbg-0",
    "cbg-strip": "cbg-0",
    "cbg-glow-a": "cbg-1",
    "cbg-glow-b": "cbg-2",
    "cbg-accent": "cbg-3",
  },
  "gradient-3": {
    "cbg-base": "cbg-0",
    "cbg-strip": "cbg-0",
    "cbg-glow-a": "cbg-1",
    "cbg-glow-b": "cbg-2",
    "cbg-accent": "cbg-3",
  },
};

function migrateLegacyPartial(
  templateId: string,
  partial: Record<string, string> | null | undefined
): Record<string, string> | null | undefined {
  if (!partial) return partial;
  const legacy = LEGACY_KEY_MAP[templateId];
  if (!legacy) return partial;
  const out = { ...partial };
  for (const [oldKey, newKey] of Object.entries(legacy)) {
    if (out[oldKey] != null && out[newKey] == null) {
      out[newKey] = out[oldKey];
    }
    delete out[oldKey];
  }
  return out;
}

export function templateSupportsEditableGradientFills(
  templateId: string | null | undefined
): boolean {
  if (!templateId) return false;
  return templateId in GRADIENT_TEMPLATE_FILL_CONFIG;
}

export function normalizeGradientFillHex(
  templateId: string | null | undefined,
  partial: Record<string, string> | null | undefined
): Record<string, string> {
  const cfg =
    (templateId && GRADIENT_TEMPLATE_FILL_CONFIG[templateId]) ||
    GRADIENT_TEMPLATE_FILL_CONFIG["gradient-1"]!;
  const migrated = templateId
    ? migrateLegacyPartial(templateId, partial)
    : partial;
  const out = { ...cfg.defaults };
  if (!migrated) return out;
  for (const key of cfg.keys) {
    const raw = migrated[key]?.trim();
    if (raw && /^#[0-9A-Fa-f]{6}$/.test(raw)) {
      out[key] = raw.toUpperCase();
    }
  }
  return out;
}

/** @deprecated Use `normalizeGradientFillHex(templateId, partial)` */
export function normalizeGradient1FillHex(
  partial: Record<string, string> | null | undefined
): Record<string, string> {
  return normalizeGradientFillHex("gradient-1", partial);
}

export function normalizeGradientFillsByTemplate(
  partial:
    | Record<string, Record<string, string> | undefined>
    | null
    | undefined
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const templateId of EDITABLE_GRADIENT_TEMPLATE_IDS) {
    out[templateId] = normalizeGradientFillHex(
      templateId,
      partial?.[templateId]
    );
  }
  return out;
}

/** Active template fills from the per-template map. */
export function resolveActiveGradientFillHex(
  templateId: string | null | undefined,
  fillsByTemplate: Record<string, Record<string, string> | undefined>
): Record<string, string> {
  if (!templateId) {
    return normalizeGradientFillHex("gradient-1", undefined);
  }
  return normalizeGradientFillHex(templateId, fillsByTemplate[templateId]);
}
