"use client";

import { DotGrid } from "@paper-design/shaders-react";

import type { CanvasBackgroundBlurLayerStyles } from "@/lib/canvas-background-blur-layer";
import type { CanvasDotGridShapeId } from "@/lib/canvas-dot-grid";

export type CanvasBackgroundDotGridOverlayProps = {
  strength: number;
  colorBack: string;
  colorFill: string;
  shape: CanvasDotGridShapeId;
  size: number;
  gapX: number;
  gapY: number;
  sizeRange: number;
  opacityRange: number;
  blurLayers: CanvasBackgroundBlurLayerStyles;
};

/**
 * Paper Design DotGrid on the canvas background stack (before shaders/noise).
 * `strength` is 0–1 (from canvas dot-grid percent).
 */
export function CanvasBackgroundDotGridOverlay({
  strength,
  colorBack,
  colorFill,
  shape,
  size,
  gapX,
  gapY,
  sizeRange,
  opacityRange,
  blurLayers,
}: CanvasBackgroundDotGridOverlayProps) {
  if (strength <= 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:!max-h-none [&_canvas]:!max-w-none"
      style={{ ...blurLayers.container, opacity: strength }}
    >
      <div style={blurLayers.shell}>
        <div className="h-full w-full" style={blurLayers.content}>
          <DotGrid
            colorBack={colorBack}
            colorFill={colorFill}
            shape={shape}
            size={size}
            gapX={gapX}
            gapY={gapY}
            sizeRange={sizeRange}
            opacityRange={opacityRange}
            fit="cover"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
