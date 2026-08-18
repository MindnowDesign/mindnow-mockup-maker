"use client";

import { useEffect, useState } from "react";

import { RecentVisualCard } from "@/components/recent-visual-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
  useCarousel,
} from "@/components/ui/carousel";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { listRecentVisuals, type RecentVisualEntry } from "@/lib/recent-visuals";
import { cn } from "@/lib/utils";

const carouselItemClass =
  "basis-full overflow-visible pl-4 @[420px]:basis-1/2 @[720px]:basis-1/3 @[1100px]:basis-1/4";

const navButtonClass = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
  "border border-white/10 bg-black/45 p-0 shadow-md backdrop-blur-sm",
  "hover:bg-black/60 disabled:pointer-events-none disabled:opacity-30",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-neutral-50"
);

function RecentVisualsNav() {
  const { itemsCount, visibleItemsCount } = useCarousel();
  if (itemsCount <= visibleItemsCount) return null;

  return (
    <CarouselNavigation
      className="relative left-auto top-auto ml-auto flex w-auto shrink-0 translate-y-0 items-center justify-end gap-2 px-0"
      classNameButton={navButtonClass}
      alwaysShow
    />
  );
}

/** Home “Recent visuals” — heading, nav controls, and animated carousel. */
export function RecentVisualsSection() {
  const [visuals, setVisuals] = useState<RecentVisualEntry[]>([]);

  useEffect(() => {
    function refresh() {
      setVisuals(listRecentVisuals(10));
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

  return (
    <section
      aria-labelledby="recent-visuals-heading"
      className="flex flex-col gap-4 overflow-visible"
    >
      <Carousel disableDrag>
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col">
              <h2
                id="recent-visuals-heading"
                className="text-base font-semibold tracking-tight text-foreground"
              >
                Recent visuals
              </h2>
            </div>

            <RecentVisualsNav />
          </div>

          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Recent visuals"
            className="@container min-w-0 overflow-hidden"
          >
            <CarouselContent className="-ml-4 items-stretch">
              {visuals.map((v) => (
                <CarouselItem
                  key={`${v.projectId}:${v.visualId}`}
                  className={carouselItemClass}
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
