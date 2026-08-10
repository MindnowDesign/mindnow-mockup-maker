"use client";

import { ImageDithering } from "@paper-design/shaders-react";

import type { CanvasDitherTypeId } from "@/lib/canvas-dither";

export type CanvasBackgroundDitherOverlayProps = {
  enabled: boolean;
  imageUrl: string | null;
  colorBack: string;
  colorFront: string;
  colorHighlight: string;
  originalColors: boolean;
  inverted: boolean;
  type: CanvasDitherTypeId;
  size: number;
  colorSteps: number;
};

/**
 * Paper Design ImageDithering over the canvas background image.
 * Only mounts when enabled and a background image URL is available.
 */
export function CanvasBackgroundDitherOverlay({
  enabled,
  imageUrl,
  colorBack,
  colorFront,
  colorHighlight,
  originalColors,
  inverted,
  type,
  size,
  colorSteps,
}: CanvasBackgroundDitherOverlayProps) {
  if (!enabled || !imageUrl) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:!max-h-none [&_canvas]:!max-w-none"
    >
      <ImageDithering
        image={imageUrl}
        colorBack={colorBack}
        colorFront={colorFront}
        colorHighlight={colorHighlight}
        originalColors={originalColors}
        inverted={inverted}
        type={type}
        size={size}
        colorSteps={colorSteps}
        fit="cover"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
