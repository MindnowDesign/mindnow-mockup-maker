/** Build a shader-ready image source from canvas background (image or template). */

import { getGradientTemplateFillKeys } from "@/lib/canvas-gradient-1-fill";
import { getCachedGradientSvgHtml } from "@/lib/gradient-svg-cache";
import { getCanvasInlineSvgTemplateById } from "@/lib/canvas-background-inline-svg-template";
import { getOrganicDisplayPathForTemplateId } from "@/lib/organic-image-cache";
import { hexToRgb } from "@/lib/color-hex-hsv";

const SHADER_RASTER_MAX_SIDE = 1280;

export function canvasHasShaderableBackground(options: {
  mode: string;
  imageUrl: string | null | undefined;
  templateId: string | null | undefined;
}): boolean {
  if (options.mode === "image" && options.imageUrl?.trim()) return true;
  if (options.mode === "template" && options.templateId?.trim()) return true;
  return false;
}

function rgbaFromHex(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const a = Math.min(1, Math.max(0, opacityPercent / 100));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

export function buildGradientCssVarMap(
  templateId: string | null | undefined,
  fillHex: Record<string, string>,
  fillOpacity: Record<string, number>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of getGradientTemplateFillKeys(templateId)) {
    const hex = fillHex[key];
    if (!hex) continue;
    const opacity = fillOpacity[key] ?? 100;
    out[`--${key}`] = rgbaFromHex(hex, opacity);
  }
  return out;
}

/** Embed CSS variables on the root `<svg>` so `var(--cbg-*)` resolves in an image. */
export function styleSvgHtmlWithCssVars(
  svgHtml: string,
  cssVars: Record<string, string>
): string {
  const style = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  if (!style) return svgHtml;
  if (/\sstyle="/i.test(svgHtml)) {
    return svgHtml.replace(
      /\sstyle="([^"]*)"/i,
      (_m, existing: string) => ` style="${existing};${style}"`
    );
  }
  return svgHtml.replace(/<svg\b/i, `<svg style="${style}"`);
}

export function svgHtmlToDataUrl(svgHtml: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgHtml)}`;
}

export function shaderRasterSize(
  canvasWidth: number,
  canvasHeight: number
): { width: number; height: number } {
  const w = Math.max(1, Math.round(canvasWidth));
  const h = Math.max(1, Math.round(canvasHeight));
  const maxSide = Math.max(w, h);
  if (maxSide <= SHADER_RASTER_MAX_SIDE) return { width: w, height: h };
  const scale = SHADER_RASTER_MAX_SIDE / maxSide;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/** Cover-fit SVG/image into a PNG data URL for WebGL shaders. */
export function rasterizeImageUrlToPng(
  imageUrl: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("2d context unavailable"));
          return;
        }
        const scale = Math.max(
          width / Math.max(1, img.naturalWidth),
          height / Math.max(1, img.naturalHeight)
        );
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for shader"));
    img.src = imageUrl;
  });
}

export function resolveOrganicShaderSource(
  templateId: string | null | undefined
): string | null {
  return getOrganicDisplayPathForTemplateId(templateId);
}

export function resolveInlineSvgShaderDataUrl(
  templateId: string | null | undefined,
  fillHex: Record<string, string>,
  fillOpacity: Record<string, number>
): string | null {
  const template = getCanvasInlineSvgTemplateById(templateId);
  const path =
    template?.inlineSvgWithCssVars && template.svgPublicPath
      ? template.svgPublicPath
      : null;
  if (!path) return null;
  const html = getCachedGradientSvgHtml(path);
  if (!html) return null;
  const cssVars = buildGradientCssVarMap(templateId, fillHex, fillOpacity);
  return svgHtmlToDataUrl(styleSvgHtmlWithCssVars(html, cssVars));
}
