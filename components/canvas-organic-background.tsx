"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { useOrganicImageReady } from "@/components/use-organic-image-ready";
import { getOrganicDisplayPathForTemplateId } from "@/lib/organic-image-cache";
import { cn } from "@/lib/utils";

type CanvasOrganicBackgroundProps = {
  templateId: string | null;
  layerStyle: CSSProperties;
};

export function CanvasOrganicBackground({
  templateId,
  layerStyle,
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
      style={layerStyle}
    >
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
  );
}
