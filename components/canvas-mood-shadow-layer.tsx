"use client";

import {
  getCanvasMoodShadowTemplateById,
  type CanvasMoodShadowPlacement,
} from "@/lib/canvas-mood-shadow-templates";
import { cn } from "@/lib/utils";

export type CanvasMoodShadowLayerProps = {
  templateId: string | null;
  /** 0–100 */
  opacityPercent: number;
  placement?: CanvasMoodShadowPlacement;
  className?: string;
};

export function CanvasMoodShadowLayer({
  templateId,
  opacityPercent,
  placement = "underlay",
  className = "rounded-[16px]",
}: CanvasMoodShadowLayerProps) {
  const template = getCanvasMoodShadowTemplateById(templateId);
  if (!template) return null;

  const opacity = Math.min(100, Math.max(0, opacityPercent)) / 100;
  if (opacity <= 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        placement === "overlay" ? "z-[20]" : "z-[2]",
        className
      )}
      style={{ opacity }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG mood */}
      <img
        src={template.svgPublicPath}
        alt=""
        decoding="async"
        className="block h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}
