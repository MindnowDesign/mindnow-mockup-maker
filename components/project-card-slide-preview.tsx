"use client";

import { useEffect, useState } from "react";

import { VisualCanvasPeekBackground } from "@/components/visual-canvas-peek-background";
import { containedCanvasPreviewStyle } from "@/lib/mockup-aspect";
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
 * Project card slide: prefer captured PNG of the canvas; fall back to a
 * canvas-shaped peek when the thumb is missing or mostly black.
 */
export function ProjectCardSlidePreview({
  slide,
  pageLabel,
  className,
}: ProjectCardSlidePreviewProps) {
  const { captureSrc, canvasBackground, mediaDataUrl, aspectPreset } = slide;
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
      <div
        className={cn(
          "flex size-full items-center justify-center",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG data URLs from saved projects */}
        <img
          src={captureSrc}
          alt=""
          aria-label={pageLabel}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setPreferComposed(true)}
          className="block h-auto w-auto max-h-full max-w-full rounded-[6px] object-contain"
        />
      </div>
    );
  }

  const canvasBox = containedCanvasPreviewStyle(aspectPreset);

  return (
    <div
      role="img"
      aria-label={pageLabel}
      className={cn(
        "relative flex size-full items-center justify-center [container-type:size]",
        className
      )}
    >
      <div
        className="relative overflow-hidden rounded-[6px]"
        style={canvasBox}
      >
        <VisualCanvasPeekBackground persisted={canvasBackground} />
        {mediaDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- persisted project media
          <img
            src={mediaDataUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 z-[2] size-full object-contain p-[12%]"
          />
        ) : null}
      </div>
    </div>
  );
}
