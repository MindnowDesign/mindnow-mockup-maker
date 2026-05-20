"use client";

import { useEffect, useRef } from "react";

import { useOrganicImageReady } from "@/components/use-organic-image-ready";
import type { CanvasBackgroundBlurLayerStyles } from "@/lib/canvas-background-blur-layer";
import { getOrganicDisplayPathForTemplateId } from "@/lib/organic-image-cache";
import { cn } from "@/lib/utils";

type CanvasOrganicBackgroundProps = {
  templateId: string | null;
  blurLayers: CanvasBackgroundBlurLayerStyles;
};

export function CanvasOrganicBackground({
  templateId,
  blurLayers,
}: CanvasOrganicBackgroundProps) {
  const path = getOrganicDisplayPathForTemplateId(templateId);
  const ready = useOrganicImageReady(path);
  const committedRef = useRef<string | null>(null);

  useEffect(() => {
    if (ready && path) {
      committedRef.current = path;
    }
  }, [ready, path]);

  const src = ready && path ? path : committedRef.current;
  if (!src) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={blurLayers.container}
    >
      <div style={blurLayers.shell}>
        <div className="h-full w-full" style={blurLayers.content}>
          {/* eslint-disable-next-line @next/next/no-img-element -- optimized display WebP */}
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            draggable={false}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200 ease-out",
              ready ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>
    </div>
  );
}
