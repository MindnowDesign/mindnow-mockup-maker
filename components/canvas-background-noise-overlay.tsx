"use client";

import { hexToRgb } from "@/lib/color-hex-hsv";
import {
  DEFAULT_CANVAS_NOISE_COLOR,
} from "@/lib/mockup-canvas-background";
import type { CanvasNoiseBlendModeId } from "@/lib/mockup-noise-blend";
import { noiseBlendModeToCss } from "@/lib/mockup-noise-blend";
import type { CanvasNoiseTypeId } from "@/lib/mockup-noise";
import { noiseFilterPreset } from "@/lib/mockup-noise";
import { cn } from "@/lib/utils";

export type CanvasBackgroundNoiseOverlayProps = {
  /** 0–1 visual intensity */
  strength: number;
  filterId: string;
  noiseType: CanvasNoiseTypeId;
  noiseColor: string;
  /** 0–100 opacity for the tinted grain layer */
  noiseColorOpacity: number;
  blendMode: CanvasNoiseBlendModeId;
  /** Root clip / rounding (matches background layer). */
  className?: string;
};

/**
 * SVG grain layer — same math as the main mockup canvas (`MockupWorkspaceStage`).
 */
export function CanvasBackgroundNoiseOverlay({
  strength,
  filterId,
  noiseType,
  noiseColor,
  noiseColorOpacity,
  blendMode,
  className = "rounded-[16px]",
}: CanvasBackgroundNoiseOverlayProps) {
  if (strength <= 0) return null;
  const tintOpacity =
    Math.min(100, Math.max(0, noiseColorOpacity)) / 100;
  const opacity = Math.min(1, strength * tintOpacity);
  const preset = noiseFilterPreset(noiseType);
  const rgb =
    hexToRgb(noiseColor) ?? hexToRgb(DEFAULT_CANVAS_NOISE_COLOR)!;
  const tr = rgb.r / 255;
  const tg = rgb.g / 255;
  const tb = rgb.b / 255;
  const tintMatrix = `${tr} 0 0 0 0  0 ${tg} 0 0 0  0 0 ${tb} 0 0  0 0 0 1 0`;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[1] overflow-hidden",
        className
      )}
      style={{
        opacity,
        mixBlendMode: noiseBlendModeToCss(blendMode),
      }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type={preset.turbulenceType}
              baseFrequency={preset.baseFrequency}
              numOctaves={preset.numOctaves}
              seed={preset.seed}
              stitchTiles="stitch"
              result="turb"
            />
            <feColorMatrix
              in="turb"
              type="saturate"
              values="0"
              result="gray"
            />
            <feColorMatrix
              in="gray"
              type="matrix"
              values={tintMatrix}
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
}
