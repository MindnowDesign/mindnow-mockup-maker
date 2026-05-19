"use client";

import { useEffect, useState } from "react";

import { VisualCanvasPeekBackground } from "@/components/visual-canvas-peek-background";
import {
  isMostlyBlackPreviewDataUrl,
  isWeakPreviewThumb,
} from "@/lib/preview-thumb-quality";
import { cn } from "@/lib/utils";

import type { ProjectCardPreviewSlide } from "@/lib/project-card-preview-slides";

export type ProjectCardSlidePreviewProps = {
  slide: ProjectCardPreviewSlide;
  pageLabel?: string;
  className?: string;
};

/**
 * Project card slide: prefer captured PNG; fall back to canvas peek + media
 * when the thumb is missing or mostly black (failed backfill capture).
 */
export function ProjectCardSlidePreview({
  slide,
  pageLabel,
  className,
}: ProjectCardSlidePreviewProps) {
  const { captureSrc, canvasBackground, mediaDataUrl } = slide;
  const [preferComposed, setPreferComposed] = useState(
    !captureSrc || isWeakPreviewThumb(captureSrc)
  );

  useEffect(() => {
    if (!captureSrc || isWeakPreviewThumb(captureSrc)) {
      setPreferComposed(true);
      return;
    }
    let cancelled = false;
    void isMostlyBlackPreviewDataUrl(captureSrc).then((black) => {
      if (!cancelled && black) setPreferComposed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [captureSrc]);

  if (!preferComposed && captureSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- PNG data URLs from saved projects
      <img
        src={captureSrc}
        alt=""
        aria-label={pageLabel}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setPreferComposed(true)}
        className={cn(
          "max-h-full max-w-full object-contain object-center rounded-[8px]",
          className
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={pageLabel}
      className={cn(
        "relative max-h-full max-w-full overflow-hidden rounded-[8px]",
        "aspect-square w-[min(100%,14rem)]",
        className
      )}
    >
      <VisualCanvasPeekBackground persisted={canvasBackground} />
      {mediaDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- persisted project media
        <img
          src={mediaDataUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 z-[2] size-full object-contain p-[12%]"
        />
      ) : null}
    </div>
  );
}
