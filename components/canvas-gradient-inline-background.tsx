"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { useGradientSvgHtml } from "@/components/use-gradient-svg-html";
import type { CanvasBackgroundBlurLayerStyles } from "@/lib/canvas-background-blur-layer";
import { getCanvasInlineSvgTemplateById } from "@/lib/canvas-background-inline-svg-template";
import { cn } from "@/lib/utils";

const INLINE_SVG_INTERACTION_STYLE =
  "svg,svg *{pointer-events:none!important}";

const INLINE_SVG_CLASS =
  "pointer-events-none [&_svg]:pointer-events-none [&_svg_*]:pointer-events-none [&>svg]:block [&>svg]:h-full [&>svg]:w-full";

type CanvasGradientInlineBackgroundProps = {
  templateId: string | null;
  cssVarStyle: CSSProperties;
  blurLayers: CanvasBackgroundBlurLayerStyles;
  fallback: ReactNode;
};

export function CanvasGradientInlineBackground({
  templateId,
  cssVarStyle,
  blurLayers,
  fallback,
}: CanvasGradientInlineBackgroundProps) {
  const wantsInline = Boolean(
    getCanvasInlineSvgTemplateById(templateId)?.inlineSvgWithCssVars
  );
  const svgHtml = useGradientSvgHtml(templateId);

  const committedRef = useRef<{ id: string; html: string } | null>(null);

  const htmlForTemplate =
    svgHtml ??
    (committedRef.current?.id === templateId
      ? committedRef.current.html
      : null);

  useEffect(() => {
    if (svgHtml && templateId) {
      committedRef.current = { id: templateId, html: svgHtml };
    }
  }, [svgHtml, templateId]);

  if (!wantsInline || !htmlForTemplate) {
    return <>{fallback}</>;
  }

  return (
    <div className="pointer-events-none absolute inset-0" style={cssVarStyle}>
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: INLINE_SVG_INTERACTION_STYLE,
        }}
      />
      <div style={blurLayers.container}>
        <div style={blurLayers.shell}>
          <div
            key={templateId}
            className={cn(
              INLINE_SVG_CLASS,
              "animate-in fade-in-0 duration-150"
            )}
            style={blurLayers.content}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: htmlForTemplate }}
          />
        </div>
      </div>
    </div>
  );
}
