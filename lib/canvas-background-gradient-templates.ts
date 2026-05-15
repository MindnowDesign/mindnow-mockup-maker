import type { CSSProperties } from "react";

/**
 * Catalog of gradient “templates” for the mockup canvas.
 *
 * - `svgPublicPath`: file under `public/` (URL starts with `/`). Shown with
 *   `background-size: cover` on the canvas when this template is active.
 * - `previewBackground`: CSS for the small square in the sidebar (can reuse
 *   the same SVG via `url("...")` or a simple CSS gradient as a placeholder).
 * - `fallbackCanvasStyle`: used when `svgPublicPath` is null (template not
 *   shipped yet) so the slot still does something predictable.
 */
export type CanvasGradientTemplateDefinition = {
  id: string;
  label: string;
  previewBackground: string;
  svgPublicPath: string | null;
  /**
   * When true, main canvas paints this template as inline SVG so parent CSS
   * variables can drive fills (`gradient-1`). Peek thumbnails still use `svgPublicPath`.
   */
  inlineSvgWithCssVars?: boolean;
  fallbackCanvasStyle?: CSSProperties;
};

export const CANVAS_GRADIENT_TEMPLATES: CanvasGradientTemplateDefinition[] = [
  {
    id: "gradient-1",
    label: "Gradient template 1",
    previewBackground:
      'url("/background-templates/gradients/gradient-1.svg") center / cover no-repeat, rgb(24 24 27)',
    svgPublicPath: "/background-templates/gradients/gradient-1.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "placeholder-b",
    label: "Gradient template 2",
    previewBackground:
      "linear-gradient(180deg, rgb(82 82 91) 0%, rgb(63 63 70) 45%, rgb(39 39 42) 100%)",
    svgPublicPath: null,
    fallbackCanvasStyle: {
      backgroundImage:
        "linear-gradient(180deg, rgb(82 82 91) 0%, rgb(63 63 70) 45%, rgb(39 39 42) 100%)",
    },
  },
  {
    id: "placeholder-c",
    label: "Gradient template 3",
    previewBackground:
      "linear-gradient(90deg, rgb(63 63 70) 0%, rgb(82 82 91) 50%, rgb(63 63 70) 100%)",
    svgPublicPath: null,
    fallbackCanvasStyle: {
      backgroundImage:
        "linear-gradient(90deg, rgb(63 63 70) 0%, rgb(82 82 91) 50%, rgb(63 63 70) 100%)",
    },
  },
];

export function getCanvasGradientTemplateById(
  id: string | null | undefined
): CanvasGradientTemplateDefinition | undefined {
  if (!id) return undefined;
  return CANVAS_GRADIENT_TEMPLATES.find((t) => t.id === id);
}

/** Thumbnail / peek — always uses `background-image` when URL exists. */
export function canvasGradientTemplateToPeekBackgroundStyle(
  templateId: string | null | undefined,
  height: number | string = "100%"
): CSSProperties | null {
  if (!templateId) return null;
  const t = getCanvasGradientTemplateById(templateId);
  if (!t) return null;
  const base: CSSProperties = { width: "100%", height };
  if (t.svgPublicPath) {
    return {
      ...base,
      backgroundImage: `url(${t.svgPublicPath})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  return { ...base, ...(t.fallbackCanvasStyle ?? { backgroundColor: "#27272a" }) };
}

/** Main capture surface: transparent when inline SVG supplies the art. */
export function canvasGradientTemplateToCaptureStyle(
  templateId: string | null | undefined,
  height: number | string
): CSSProperties | null {
  if (!templateId) return null;
  const t = getCanvasGradientTemplateById(templateId);
  if (!t) return null;
  const base: CSSProperties = { width: "100%", height };
  if (t.inlineSvgWithCssVars && t.svgPublicPath) {
    return { ...base, backgroundColor: "transparent" };
  }
  if (t.svgPublicPath) {
    return {
      ...base,
      backgroundImage: `url(${t.svgPublicPath})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  return { ...base, ...(t.fallbackCanvasStyle ?? { backgroundColor: "#27272a" }) };
}
