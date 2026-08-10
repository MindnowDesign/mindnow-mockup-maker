"use client";

import { HalftoneDots } from "@paper-design/shaders-react";

import type {
  CanvasHalftoneGridId,
  CanvasHalftoneTypeId,
} from "@/lib/canvas-halftone";

export type CanvasBackgroundHalftoneOverlayProps = {
  enabled: boolean;
  imageUrl: string | null;
  colorBack: string;
  colorFront: string;
  originalColors: boolean;
  inverted: boolean;
  type: CanvasHalftoneTypeId;
  grid: CanvasHalftoneGridId;
  size: number;
  radius: number;
  contrast: number;
};

/**
 * Paper Design HalftoneDots over the canvas background image.
 * Only mounts when enabled and a background image URL is available.
 */
export function CanvasBackgroundHalftoneOverlay({
  enabled,
  imageUrl,
  colorBack,
  colorFront,
  originalColors,
  inverted,
  type,
  grid,
  size,
  radius,
  contrast,
}: CanvasBackgroundHalftoneOverlayProps) {
  if (!enabled || !imageUrl) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:!max-h-none [&_canvas]:!max-w-none"
    >
      <HalftoneDots
        image={imageUrl}
        colorBack={colorBack}
        colorFront={colorFront}
        originalColors={originalColors}
        inverted={inverted}
        type={type}
        grid={grid}
        size={size}
        radius={radius}
        contrast={contrast}
        fit="cover"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
