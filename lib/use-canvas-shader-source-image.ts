"use client";

import { useEffect, useState } from "react";

import { ensureGradientSvgCached } from "@/lib/gradient-svg-cache";
import { getCanvasInlineSvgTemplateById } from "@/lib/canvas-background-inline-svg-template";
import { isCanvasOrganicTemplateId } from "@/lib/canvas-background-organic-templates";
import {
  canvasHasShaderableBackground,
  rasterizeImageUrlToPng,
  resolveInlineSvgShaderDataUrl,
  resolveOrganicShaderSource,
  shaderRasterSize,
} from "@/lib/canvas-shader-source";

export type UseCanvasShaderSourceImageArgs = {
  enabled: boolean;
  mode: string;
  imageUrl: string | null;
  templateId: string | null;
  fillHex: Record<string, string>;
  fillOpacity: Record<string, number>;
  canvasWidth: number;
  canvasHeight: number;
};

/**
 * Image URL fed to Paper Design shaders.
 * - Background image mode: the uploaded image
 * - Organic template: display WebP
 * - Gradient / Waves SVG: rasterized PNG with current fill CSS vars
 */
export function useCanvasShaderSourceImage({
  enabled,
  mode,
  imageUrl,
  templateId,
  fillHex,
  fillOpacity,
  canvasWidth,
  canvasHeight,
}: UseCanvasShaderSourceImageArgs): string | null {
  const [source, setSource] = useState<string | null>(null);

  const canSource = canvasHasShaderableBackground({
    mode,
    imageUrl,
    templateId,
  });

  const fillFingerprint = `${JSON.stringify(fillHex)}|${JSON.stringify(fillOpacity)}`;

  useEffect(() => {
    if (!enabled || !canSource) {
      setSource(null);
      return;
    }

    if (mode === "image" && imageUrl?.trim()) {
      setSource(imageUrl.trim());
      return;
    }

    if (mode !== "template" || !templateId) {
      setSource(null);
      return;
    }

    if (isCanvasOrganicTemplateId(templateId)) {
      setSource(resolveOrganicShaderSource(templateId));
      return;
    }

    const template = getCanvasInlineSvgTemplateById(templateId);
    const path =
      template?.inlineSvgWithCssVars && template.svgPublicPath
        ? template.svgPublicPath
        : null;
    if (!path) {
      setSource(null);
      return;
    }

    let cancelled = false;
    const { width, height } = shaderRasterSize(canvasWidth, canvasHeight);

    void (async () => {
      try {
        await ensureGradientSvgCached(path);
        if (cancelled) return;
        const dataUrl = resolveInlineSvgShaderDataUrl(
          templateId,
          fillHex,
          fillOpacity
        );
        if (!dataUrl) {
          if (!cancelled) setSource(null);
          return;
        }
        const png = await rasterizeImageUrlToPng(dataUrl, width, height);
        if (!cancelled) setSource(png);
      } catch {
        if (!cancelled) setSource(null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // fillFingerprint stands in for fillHex / fillOpacity identity
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional fingerprint
  }, [
    enabled,
    canSource,
    mode,
    imageUrl,
    templateId,
    fillFingerprint,
    canvasWidth,
    canvasHeight,
  ]);

  return source;
}
