"use client";

import { useEffect, useState } from "react";

import { getCanvasGradientTemplateById } from "@/lib/canvas-background-gradient-templates";

/**
 * Fetches gradient template SVG markup for inline rendering so parent CSS
 * variables (`--cbg-*`) can drive fills.
 */
export function useGradientSvgHtml(
  templateId: string | null | undefined
): string | null {
  const template = getCanvasGradientTemplateById(templateId);
  const src =
    template?.inlineSvgWithCssVars && template.svgPublicPath
      ? template.svgPublicPath
      : null;

  const [cache, setCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    fetch(src)
      .then((r) =>
        r.ok ? r.text() : Promise.reject(new Error(String(r.status)))
      )
      .then((html) => {
        if (!cancelled) {
          setCache((prev) => (prev[src] ? prev : { ...prev, [src]: html }));
        }
      })
      .catch(() => {
        /* keep null until loaded */
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return src ? (cache[src] ?? null) : null;
}
