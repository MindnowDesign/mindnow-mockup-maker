"use client";

import { useEffect, useState } from "react";

import { RecentVisualCard } from "@/components/recent-visual-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
} from "@/components/ui/carousel";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { listRecentVisuals, type RecentVisualEntry } from "@/lib/recent-visuals";
import { cn } from "@/lib/utils";

const navButtonClass = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
  "border border-white/10 bg-black/45 p-0 shadow-md backdrop-blur-sm",
  "hover:bg-black/60 disabled:pointer-events-none disabled:opacity-30",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-white"
);

/** Home “Recent visuals” — heading, nav controls, and animated carousel. */
export function RecentVisualsSection() {
  const [visuals, setVisuals] = useState<RecentVisualEntry[]>([]);

  useEffect(() => {
    function refresh() {
      setVisuals(listRecentVisuals());
    }
    refresh();
    window.addEventListener("mindnow:saved-projects-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindnow:saved-projects-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (visuals.length === 0) {
    return null;
  }

  const showNav = visuals.length > 4;

  return (
    <section
      aria-labelledby="recent-visuals-heading"
      className="flex flex-col gap-8 overflow-visible"
    >
      <Carousel disableDrag step={4}>
        <div className="flex flex-col gap-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h1
              id="recent-visuals-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            >
              Recent visuals
            </h1>
          </div>

          {showNav ? (
            <CarouselNavigation
              className="relative left-auto top-auto ml-auto flex w-auto shrink-0 translate-y-0 items-center justify-end gap-2 px-0"
              classNameButton={navButtonClass}
              alwaysShow
            />
          ) : null}
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Recent visuals"
          className="overflow-visible"
        >
          <CarouselContent className="-ml-4">
            {visuals.map((v) => (
              <CarouselItem
                key={`${v.projectId}:${v.visualId}`}
                className="basis-1/4 pl-4"
              >
                <RecentVisualCard
                  title={v.title}
                  editedLabel={formatEditedAgo(v.updatedAt)}
                  href={v.href}
                  previewSlide={v.previewSlide}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
        </div>
      </Carousel>
    </section>
  );
}
