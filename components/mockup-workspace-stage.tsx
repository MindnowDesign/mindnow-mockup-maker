"use client";

import { Plus } from "lucide-react";
import { useLayoutEffect, useMemo, useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { scaledFramePixelSize } from "@/lib/mockup-aspect";
import { cn } from "@/lib/utils";

/** Max border-box size for the orange frame (fits main canvas). */
function useFrameViewportCaps() {
  const [caps, setCaps] = useState({ maxW: 920, maxH: 820 });

  useLayoutEffect(() => {
    function measure() {
      setCaps({
        maxW: Math.min(920, window.innerWidth * 0.92),
        maxH: Math.min(820, window.innerHeight * 0.7),
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return caps;
}

/**
 * Canvas frame: dimensions from design presets, scaled to viewport.
 * Parent page uses `grid place-items-center` so this block stays visually centered.
 */
export function MockupWorkspaceStage() {
  const { aspectPreset } = useMockupFrame();
  const { maxW, maxH } = useFrameViewportCaps();

  const { width, height } = useMemo(
    () => scaledFramePixelSize(aspectPreset, maxW, maxH),
    [aspectPreset, maxW, maxH]
  );

  return (
    <div
      key={aspectPreset}
      data-mockup-capture-target
      style={{ width, height }}
      className={cn(
        "group relative box-border grid shrink-0 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[16px] bg-[#F28345] p-8 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.75)] md:p-12",
        "min-h-0 min-w-0"
      )}
    >
      <div className="flex min-h-0 min-w-0 items-center justify-center">
        <div
          className={cn(
            "flex aspect-square max-h-full max-w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[16px]",
            "border border-zinc-900/80 bg-zinc-950 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9)]"
          )}
        >
          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center"
            role="region"
            aria-label="Media upload area"
          >
            <div className="relative flex items-center justify-center">
              <span
                className="flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-500 bg-zinc-900/35 transition-colors group-hover:border-zinc-400"
                aria-hidden
              >
                <Plus
                  className="size-7 text-foreground transition-transform group-hover:scale-105"
                  strokeWidth={2}
                  aria-hidden
                />
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                Drop or Paste
              </p>
              <p className="text-sm font-medium text-zinc-500">
                Images &amp; Videos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
