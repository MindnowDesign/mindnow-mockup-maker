import type { CSSProperties } from "react";

import { getGradientTemplatePreviewColor } from "@/lib/canvas-gradient-1-fill";

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
   * variables can drive fills. Peek thumbnails still use `svgPublicPath`.
   */
  inlineSvgWithCssVars?: boolean;
  fallbackCanvasStyle?: CSSProperties;
};

function previewForTemplate(
  id: string,
  svgPath: string,
  fallbackRgb: string
): string {
  const base = getGradientTemplatePreviewColor(id) ?? fallbackRgb;
  return `url("${svgPath}") center / cover no-repeat, ${base}`;
}

export const CANVAS_GRADIENT_TEMPLATES: CanvasGradientTemplateDefinition[] = [
  {
    id: "gradient-1",
    label: "Gradient template 1",
    previewBackground: previewForTemplate(
      "gradient-1",
      "/background-templates/gradients/gradient-1.svg",
      "rgb(253 255 133)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-1.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-2",
    label: "Gradient template 2",
    previewBackground: previewForTemplate(
      "gradient-2",
      "/background-templates/gradients/gradient-2.svg",
      "rgb(2 16 16)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-2.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-3",
    label: "Gradient template 3",
    previewBackground: previewForTemplate(
      "gradient-3",
      "/background-templates/gradients/gradient-3.svg",
      "rgb(254 170 230)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-3.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-4",
    label: "Gradient template 4",
    previewBackground: previewForTemplate(
      "gradient-4",
      "/background-templates/gradients/gradient-4.svg",
      "rgb(253 255 175)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-4.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-5",
    label: "Gradient template 5",
    previewBackground: previewForTemplate(
      "gradient-5",
      "/background-templates/gradients/gradient-5.svg",
      "rgb(254 255 199)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-5.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-6",
    label: "Gradient template 6",
    previewBackground: previewForTemplate(
      "gradient-6",
      "/background-templates/gradients/gradient-6.svg",
      "rgb(92 40 223)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-6.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-7",
    label: "Gradient template 7",
    previewBackground: previewForTemplate(
      "gradient-7",
      "/background-templates/gradients/gradient-7.svg",
      "rgb(255 255 255)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-7.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-8",
    label: "Gradient template 8",
    previewBackground: previewForTemplate(
      "gradient-8",
      "/background-templates/gradients/gradient-8.svg",
      "rgb(248 248 248)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-8.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-9",
    label: "Gradient template 9",
    previewBackground: previewForTemplate(
      "gradient-9",
      "/background-templates/gradients/gradient-9.svg",
      "rgb(255 255 255)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-9.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-10",
    label: "Gradient template 10",
    previewBackground: previewForTemplate(
      "gradient-10",
      "/background-templates/gradients/gradient-10.svg",
      "rgb(248 248 248)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-10.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-11",
    label: "Gradient template 11",
    previewBackground: previewForTemplate(
      "gradient-11",
      "/background-templates/gradients/gradient-11.svg",
      "rgb(248 248 248)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-11.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-12",
    label: "Gradient template 12",
    previewBackground: previewForTemplate(
      "gradient-12",
      "/background-templates/gradients/gradient-12.svg",
      "rgb(255 255 255)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-12.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-13",
    label: "Gradient template 13",
    previewBackground: previewForTemplate(
      "gradient-13",
      "/background-templates/gradients/gradient-13.svg",
      "rgb(255 255 255)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-13.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-14",
    label: "Gradient template 14",
    previewBackground: previewForTemplate(
      "gradient-14",
      "/background-templates/gradients/gradient-14.svg",
      "rgb(248 248 248)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-14.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-15",
    label: "Gradient template 15",
    previewBackground: previewForTemplate(
      "gradient-15",
      "/background-templates/gradients/gradient-15.svg",
      "rgb(25 8 112)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-15.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-16",
    label: "Gradient template 16",
    previewBackground: previewForTemplate(
      "gradient-16",
      "/background-templates/gradients/gradient-16.svg",
      "rgb(0 25 114)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-16.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-17",
    label: "Gradient template 17",
    previewBackground: previewForTemplate(
      "gradient-17",
      "/background-templates/gradients/gradient-17.svg",
      "rgb(0 201 210)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-17.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-18",
    label: "Gradient template 18",
    previewBackground: previewForTemplate(
      "gradient-18",
      "/background-templates/gradients/gradient-18.svg",
      "rgb(250 193 255)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-18.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-19",
    label: "Gradient template 19",
    previewBackground: previewForTemplate(
      "gradient-19",
      "/background-templates/gradients/gradient-19.svg",
      "rgb(223 12 12)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-19.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-20",
    label: "Gradient template 20",
    previewBackground: previewForTemplate(
      "gradient-20",
      "/background-templates/gradients/gradient-20.svg",
      "rgb(255 209 189)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-20.svg",
    inlineSvgWithCssVars: true,
  },
  {
    id: "gradient-21",
    label: "Gradient template 21",
    previewBackground: previewForTemplate(
      "gradient-21",
      "/background-templates/gradients/gradient-21.svg",
      "rgb(223 12 12)"
    ),
    svgPublicPath: "/background-templates/gradients/gradient-21.svg",
    inlineSvgWithCssVars: true,
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
