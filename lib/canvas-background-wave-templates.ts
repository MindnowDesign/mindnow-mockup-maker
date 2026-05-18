import type { CSSProperties } from "react";

import { getGradientTemplatePreviewColor } from "@/lib/canvas-gradient-1-fill";

/**
 * Wave line templates under `public/background-templates/wave/`.
 * SVGs must use `var(--cbg-*)` — run `npm run prepare:wave-svgs` after updating sources.
 */
const WAVE_SLUGS = [
  "wave-1",
  "wave-2",
  "wave-3",
  "wave-4",
  "wave-5",
  "wave-6",
  "wave-7",
  "wave-8",
  "wave-9",
] as const;

export type CanvasWaveTemplateDefinition = {
  id: string;
  label: string;
  previewBackground: string;
  svgPublicPath: string;
  inlineSvgWithCssVars: true;
};

function previewForWave(
  id: string,
  svgPath: string,
  fallbackRgb: string
): string {
  const base = getGradientTemplatePreviewColor(id) ?? fallbackRgb;
  return `url("${svgPath}") center / cover no-repeat, ${base}`;
}

export const CANVAS_WAVE_TEMPLATES: CanvasWaveTemplateDefinition[] =
  WAVE_SLUGS.map((slug) => {
    const svgPublicPath = `/background-templates/wave/${slug}.svg`;
    return {
      id: slug,
      label: `Wave template ${slug.replace("wave-", "")}`,
      previewBackground: previewForWave(slug, svgPublicPath, "rgb(15 15 15)"),
      svgPublicPath,
      inlineSvgWithCssVars: true as const,
    };
  });

export function getCanvasWaveTemplateById(
  id: string | null | undefined
): CanvasWaveTemplateDefinition | undefined {
  if (!id) return undefined;
  return CANVAS_WAVE_TEMPLATES.find((t) => t.id === id);
}

export function isCanvasWaveTemplateId(
  id: string | null | undefined
): boolean {
  return Boolean(getCanvasWaveTemplateById(id));
}

export function canvasWaveTemplateToPeekBackgroundStyle(
  templateId: string | null | undefined,
  height: number | string = "100%"
): CSSProperties | null {
  if (!templateId) return null;
  const t = getCanvasWaveTemplateById(templateId);
  if (!t) return null;
  return {
    width: "100%",
    height,
    backgroundImage: `url(${t.svgPublicPath})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

export function canvasWaveTemplateToCaptureStyle(
  templateId: string | null | undefined,
  height: number | string
): CSSProperties | null {
  if (!templateId) return null;
  const t = getCanvasWaveTemplateById(templateId);
  if (!t) return null;
  return { width: "100%", height, backgroundColor: "transparent" };
}
