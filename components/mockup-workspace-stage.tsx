"use client";

import { Plus } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
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
  const { activeItem, addFromFileList } = useMockupMedia();
  const { maxW, maxH } = useFrameViewportCaps();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { width, height } = useMemo(
    () => scaledFramePixelSize(aspectPreset, maxW, maxH),
    [aspectPreset, maxW, maxH]
  );

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div
      key={aspectPreset}
      data-mockup-capture-target
      style={{ width, height }}
      role="region"
      aria-label="Mockup canvas"
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addFromFileList(e.dataTransfer.files);
      }}
      onPaste={(e) => {
        const files = e.clipboardData?.files;
        if (files?.length) {
          e.preventDefault();
          addFromFileList(files);
        }
      }}
      className={cn(
        "group relative box-border grid shrink-0 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[16px] bg-[#F28345] p-8 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.75)] md:p-12",
        "min-h-0 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      )}
    >
      <div className="flex min-h-0 min-w-0 items-center justify-center">
        {activeItem?.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-provided blob URL
          <img
            src={activeItem.url}
            alt=""
            draggable={false}
            className="pointer-events-none select-none block max-h-full max-w-full h-auto w-auto"
          />
        ) : (
          <div
            className={cn(
              "flex aspect-square max-h-full max-w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[16px]",
              activeItem
                ? "bg-zinc-950"
                : "border border-zinc-900/80 bg-zinc-950 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9)]"
            )}
          >
          {activeItem ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <video
                src={activeItem.url}
                controls
                playsInline
                className="h-full w-full min-h-0 min-w-0 object-contain"
              />
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="sr-only"
                onChange={(event) => {
                  addFromFileList(event.target.files);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                className="flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-6 px-6 py-10 text-center outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-inset"
                aria-label="Upload images or videos"
                onClick={openFilePicker}
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
              </button>
            </>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
