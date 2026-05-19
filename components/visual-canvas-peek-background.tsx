"use client";

import { useId, useMemo, type CSSProperties } from "react";

import { CanvasBackgroundNoiseOverlay } from "@/components/canvas-background-noise-overlay";
import type { PersistedCanvasBackground } from "@/lib/mockup-canvas-background";
import {
  DEFAULT_CANVAS_NOISE_COLOR,
  DEFAULT_CANVAS_NOISE_COLOR_OPACITY,
  persistedCanvasBackgroundToPeekStyle,
} from "@/lib/mockup-canvas-background";
import { canvasBackgroundBlurLayerStyles } from "@/lib/canvas-background-blur-layer";
import { parseCanvasNoiseType } from "@/lib/mockup-noise";
import { parseCanvasNoiseBlendMode } from "@/lib/mockup-noise-blend";

function clampPercent(n: number | undefined): number {
  if (n == null || Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export type VisualCanvasPeekBackgroundProps = {
  persisted: PersistedCanvasBackground | null;
};

/**
 * Mini replica of the canvas fill stack in `MockupWorkspaceStage`: base color/image,
 * optional blur, SVG grain — without the inner drop-zone card / chrome.
 */
export function VisualCanvasPeekBackground({
  persisted,
}: VisualCanvasPeekBackgroundProps) {
  const filterId = `peek-noise-${useId().replace(/:/g, "")}`;

  const baseStyle = useMemo(
    () => persistedCanvasBackgroundToPeekStyle(persisted),
    [persisted]
  );

  const blurPx = useMemo(
    () => (clampPercent(persisted?.blurPercent) / 100) * 28,
    [persisted?.blurPercent]
  );

  const blurLayers = useMemo(
    () => canvasBackgroundBlurLayerStyles(blurPx),
    [blurPx]
  );

  const noiseStrength = clampPercent(persisted?.noisePercent) / 100;
  const noiseType = parseCanvasNoiseType(persisted?.noiseType);
  const noiseColorRaw = persisted?.noiseColor?.trim();
  const noiseColor =
    noiseColorRaw && /^#[0-9A-Fa-f]{6}$/.test(noiseColorRaw)
      ? noiseColorRaw.toUpperCase()
      : DEFAULT_CANVAS_NOISE_COLOR;

  let noiseColorOpacity = DEFAULT_CANVAS_NOISE_COLOR_OPACITY;
  if (
    persisted?.noiseColorOpacity != null &&
    !Number.isNaN(Number(persisted.noiseColorOpacity))
  ) {
    noiseColorOpacity = clampPercent(Number(persisted.noiseColorOpacity));
  }

  const blendMode = parseCanvasNoiseBlendMode(persisted?.noiseBlendMode);

  const fillStyle: CSSProperties = useMemo(
    () => ({
      ...blurLayers.content,
      ...baseStyle,
      width: "100%",
      height: "100%",
    }),
    [blurLayers.content, baseStyle]
  );

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[3px]"
      >
        <div style={blurLayers.container}>
          <div style={blurLayers.shell}>
            <div style={fillStyle} />
          </div>
        </div>
      </div>
      <CanvasBackgroundNoiseOverlay
        strength={noiseStrength}
        filterId={filterId}
        noiseType={noiseType}
        noiseColor={noiseColor}
        noiseColorOpacity={noiseColorOpacity}
        blendMode={blendMode}
        className="rounded-[3px]"
      />
    </>
  );
}
