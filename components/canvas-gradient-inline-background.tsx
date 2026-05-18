"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { useGradientSvgHtml } from "@/components/use-gradient-svg-html";
import { getCanvasGradientTemplateById } from "@/lib/canvas-background-gradient-templates";
import { cn } from "@/lib/utils";

const INLINE_SVG_CLASS =
  "[&>svg]:pointer-events-none [&>svg]:block [&>svg]:h-full [&>svg]:w-full";

type CanvasGradientInlineBackgroundProps = {
  templateId: string | null;
  cssVarStyle: CSSProperties;
  blurLayerStyle: CSSProperties;
  fallback: ReactNode;
};

export function CanvasGradientInlineBackground({
  templateId,
  cssVarStyle,
  blurLayerStyle,
  fallback,
}: CanvasGradientInlineBackgroundProps) {
  const wantsInline = Boolean(
    getCanvasGradientTemplateById(templateId)?.inlineSvgWithCssVars
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
    <div className="absolute inset-0" style={cssVarStyle}>
      <div
        key={templateId}
        className={cn(
          INLINE_SVG_CLASS,
          "animate-in fade-in-0 duration-150"
        )}
        style={blurLayerStyle}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: htmlForTemplate }}
      />
    </div>
  );
}
