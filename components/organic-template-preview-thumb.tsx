"use client";

import { useEffect, useRef, useState } from "react";

import type { CanvasOrganicTemplateDefinition } from "@/lib/canvas-background-organic-templates";
import {
  cancelOrganicDisplayPreloadSchedule,
  scheduleOrganicDisplayPreload,
} from "@/lib/organic-image-cache";
import { cn } from "@/lib/utils";

type OrganicTemplatePreviewThumbProps = {
  entry: CanvasOrganicTemplateDefinition;
  selected: boolean;
  onSelect: () => void;
  className?: string;
};

export function OrganicTemplatePreviewThumb({
  entry,
  selected,
  onSelect,
  className,
}: OrganicTemplatePreviewThumbProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (cancelled || !entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "120px" }
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <button
      ref={rootRef}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={entry.label}
      onClick={onSelect}
      onPointerEnter={() => {
        scheduleOrganicDisplayPreload(entry.id);
      }}
      onPointerLeave={() => {
        cancelOrganicDisplayPreloadSchedule();
      }}
      onFocus={() => {
        scheduleOrganicDisplayPreload(entry.id);
      }}
      onBlur={() => {
        cancelOrganicDisplayPreloadSchedule();
      }}
      className={cn(
        "relative aspect-square w-full min-w-0 overflow-hidden rounded-lg border text-left outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-white/25",
        selected
          ? "border-zinc-500 shadow-sm ring-2 ring-inset ring-white/20"
          : "border-zinc-700 hover:border-zinc-500",
        className
      )}
    >
      <span className="absolute inset-0 bg-zinc-800" aria-hidden />
      {shouldLoad ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny static preview asset
        <img
          src={entry.previewPublicPath}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </button>
  );
}
