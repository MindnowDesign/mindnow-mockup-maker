import {
  getCanvasGradientTemplateById,
  type CanvasGradientTemplateDefinition,
} from "@/lib/canvas-background-gradient-templates";
import {
  getCanvasWaveTemplateById,
  type CanvasWaveTemplateDefinition,
} from "@/lib/canvas-background-wave-templates";

export type CanvasInlineSvgTemplateDefinition =
  | CanvasGradientTemplateDefinition
  | CanvasWaveTemplateDefinition;

export function getCanvasInlineSvgTemplateById(
  id: string | null | undefined
): CanvasInlineSvgTemplateDefinition | undefined {
  if (!id) return undefined;
  return (
    getCanvasGradientTemplateById(id) ?? getCanvasWaveTemplateById(id)
  );
}

export function isCanvasInlineSvgTemplateId(
  id: string | null | undefined
): boolean {
  const t = getCanvasInlineSvgTemplateById(id);
  return Boolean(t?.inlineSvgWithCssVars && t.svgPublicPath);
}
