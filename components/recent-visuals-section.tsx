"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { RecentVisualCard } from "@/components/recent-visual-card";
import { Button } from "@/components/ui/button";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { listRecentVisuals, type RecentVisualEntry } from "@/lib/recent-visuals";
import { cn } from "@/lib/utils";

const CAROUSEL_GAP_PX = 16;

/** Four tiles per visible row — 100% is the track content box (inside p-[2px]). */
const CAROUSEL_ITEM_CLASS = "w-[calc((100%-3*1rem)/4)]";

const navButtonClass = cn(
  "size-9 shrink-0 rounded-full border border-white/10 bg-black/45 text-white shadow-md backdrop-blur-sm hover:bg-black/60",
  "disabled:pointer-events-none disabled:opacity-30"
);

/** Home “Recent visuals” — heading, nav controls, and horizontal carousel. */
export function RecentVisualsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visuals, setVisuals] = useState<RecentVisualEntry[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 1);
    setCanScrollNext(el.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [visuals, updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [visuals.length, updateScrollState]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-recent-visual-slide]");
    const step = first
      ? first.offsetWidth + CAROUSEL_GAP_PX
      : el.clientWidth * 0.9;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  if (visuals.length === 0) {
    return null;
  }

  const showNav = canScrollPrev || canScrollNext;

  return (
    <section
      aria-labelledby="recent-visuals-heading"
      className="flex flex-col gap-8 overflow-visible"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1
            id="recent-visuals-heading"
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
          >
            Recent visuals
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Screenshots and exports you have worked on recently will show up
            here.
          </p>
        </div>

        {showNav ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={!canScrollPrev}
              className={navButtonClass}
              aria-label="Previous recent visuals"
              onClick={() => scrollByPage(-1)}
            >
              <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={!canScrollNext}
              className={navButtonClass}
              aria-label="Next recent visuals"
              onClick={() => scrollByPage(1)}
            >
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Recent visuals"
        className="overflow-visible"
      >
        <div
          ref={scrollRef}
          className={cn(
            "flex items-start gap-4 p-[2px]",
            "overflow-x-auto scroll-smooth snap-x snap-mandatory",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {visuals.map((v) => (
            <div
              key={`${v.projectId}:${v.visualId}`}
              data-recent-visual-slide
              className={cn("box-border shrink-0 snap-start", CAROUSEL_ITEM_CLASS)}
            >
              <RecentVisualCard
                title={v.title}
                editedLabel={formatEditedAgo(v.updatedAt)}
                href={v.href}
                previewSlide={v.previewSlide}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
