"use client";

import { getCanvasOverlayShadowTemplateById } from "@/lib/canvas-overlay-shadow-templates";
import { cn } from "@/lib/utils";

export type CanvasOverlayShadowLayerProps = {
  templateId: string | null;
  /** 0–100 */
  opacityPercent: number;
  className?: string;
};

export function CanvasOverlayShadowLayer({
  templateId,
  opacityPercent,
  className = "rounded-[16px]",
}: CanvasOverlayShadowLayerProps) {
  const template = getCanvasOverlayShadowTemplateById(templateId);
  if (!template) return null;

  const opacity = Math.min(100, Math.max(0, opacityPercent)) / 100;
  if (opacity <= 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[2] overflow-hidden",
        className
      )}
      style={{ opacity }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG overlay */}
      <img
        src={template.svgPublicPath}
        alt=""
        className="block h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}
