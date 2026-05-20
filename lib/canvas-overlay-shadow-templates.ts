/** Light gray behind shadow SVG previews in the sidebar grid. */
export const OVERLAY_SHADOW_PREVIEW_FILL = "#CCCCCC";

export type CanvasOverlayShadowTemplateDefinition = {
  id: string;
  label: string;
  svgPublicPath: string;
  previewBackground: string;
};

const SHADOW_VARIANT_COUNT = 12;

function overlayShadowSvgPublicPath(index: number): string {
  const fileName = `overlay-shadow ${index}.svg`;
  return `/overlay/shadow/${encodeURIComponent(fileName)}`;
}

function overlayShadowPreviewBackground(svgPublicPath: string): string {
  return `${OVERLAY_SHADOW_PREVIEW_FILL} url("${svgPublicPath}") center / cover no-repeat`;
}

export const CANVAS_OVERLAY_SHADOW_TEMPLATES: CanvasOverlayShadowTemplateDefinition[] =
  Array.from({ length: SHADOW_VARIANT_COUNT }, (_, i) => {
    const index = i + 1;
    const id = `overlay-shadow-${index}`;
    const svgPublicPath = overlayShadowSvgPublicPath(index);
    return {
      id,
      label: `Shadow ${index}`,
      svgPublicPath,
      previewBackground: overlayShadowPreviewBackground(svgPublicPath),
    };
  });

export function getCanvasOverlayShadowTemplateById(
  id: string | null | undefined
): CanvasOverlayShadowTemplateDefinition | undefined {
  if (!id) return undefined;
  return CANVAS_OVERLAY_SHADOW_TEMPLATES.find((t) => t.id === id);
}

export function isCanvasOverlayShadowTemplateId(
  id: string | null | undefined
): boolean {
  return Boolean(getCanvasOverlayShadowTemplateById(id));
}
