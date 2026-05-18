"use client";

import { useEffect, useSyncExternalStore } from "react";

import { getCanvasGradientTemplateById } from "@/lib/canvas-background-gradient-templates";
import {
  ensureGradientSvgCached,
  getCachedGradientSvgHtml,
  subscribeGradientSvgCache,
} from "@/lib/gradient-svg-cache";

/**
 * Returns cached gradient SVG markup for inline rendering so parent CSS
 * variables (`--cbg-*`) can drive fills. Shares a module-level cache across
 * sidebar, canvas, and preloads.
 */
export function useGradientSvgHtml(
  templateId: string | null | undefined
): string | null {
  const template = getCanvasGradientTemplateById(templateId);
  const src =
    template?.inlineSvgWithCssVars && template.svgPublicPath
      ? template.svgPublicPath
      : null;

  const html = useSyncExternalStore(
    subscribeGradientSvgCache,
    () => getCachedGradientSvgHtml(src),
    () => null
  );

  useEffect(() => {
    if (!src) return;
    void ensureGradientSvgCached(src);
  }, [src]);

  return src ? html : null;
}
