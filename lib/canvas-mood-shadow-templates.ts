/** Light gray behind mood shadow SVG previews in the sidebar grid. */
export const MOOD_SHADOW_PREVIEW_FILL = "#CCCCCC";

export type CanvasMoodShadowPlacement = "underlay" | "overlay";

export const DEFAULT_CANVAS_MOOD_SHADOW_PLACEMENT: CanvasMoodShadowPlacement =
  "underlay";

export function parseCanvasMoodShadowPlacement(
  value: unknown
): CanvasMoodShadowPlacement {
  if (value === "overlay") return "overlay";
  return DEFAULT_CANVAS_MOOD_SHADOW_PLACEMENT;
}

export type CanvasMoodShadowTemplateDefinition = {
  id: string;
  label: string;
  svgPublicPath: string;
  previewBackground: string;
};

const SHADOW_VARIANT_COUNT = 20;

const LEGACY_MOOD_SHADOW_ID = /^overlay-shadow-(\d+)$/;

function moodShadowSvgPublicPath(index: number): string {
  const fileName = `mood-shadow ${index}.svg`;
  return `/mood/shadow/${encodeURIComponent(fileName)}`;
}

function moodShadowPreviewBackground(svgPublicPath: string): string {
  return `${MOOD_SHADOW_PREVIEW_FILL} url("${svgPublicPath}") center / cover no-repeat`;
}

export const CANVAS_MOOD_SHADOW_TEMPLATES: CanvasMoodShadowTemplateDefinition[] =
  Array.from({ length: SHADOW_VARIANT_COUNT }, (_, i) => {
    const index = i + 1;
    const id = `mood-shadow-${index}`;
    const svgPublicPath = moodShadowSvgPublicPath(index);
    return {
      id,
      label: `Shadow ${index}`,
      svgPublicPath,
      previewBackground: moodShadowPreviewBackground(svgPublicPath),
    };
  });

const CANVAS_MOOD_SHADOW_TEMPLATE_IDS = new Set(
  CANVAS_MOOD_SHADOW_TEMPLATES.map((t) => t.id)
);

/** Maps legacy `overlay-shadow-N` ids to `mood-shadow-N`. */
export function normalizeCanvasMoodShadowTemplateId(
  id: string | null | undefined
): string | null {
  if (!id) return null;
  const trimmed = id.trim();
  const legacy = LEGACY_MOOD_SHADOW_ID.exec(trimmed);
  if (legacy) return `mood-shadow-${legacy[1]}`;
  return CANVAS_MOOD_SHADOW_TEMPLATE_IDS.has(trimmed) ? trimmed : null;
}

export function getCanvasMoodShadowTemplateById(
  id: string | null | undefined
): CanvasMoodShadowTemplateDefinition | undefined {
  const normalized = normalizeCanvasMoodShadowTemplateId(id);
  if (!normalized) return undefined;
  return CANVAS_MOOD_SHADOW_TEMPLATES.find((t) => t.id === normalized);
}

export function isCanvasMoodShadowTemplateId(
  id: string | null | undefined
): boolean {
  return normalizeCanvasMoodShadowTemplateId(id) !== null;
}
