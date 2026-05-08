"use client";

import { Play, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

import type { MockupLibraryItem } from "@/components/mockup-media-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import { VisualCanvasPeekBackground } from "@/components/visual-canvas-peek-background";
import { defaultVisualLabel } from "@/lib/mockup-visual-label";
import { cn } from "@/lib/utils";

export type WorkspaceVisualsFloatingBarProps = {
  className?: string;
};

function VisualCanvasPeek({
  visualId,
  libraryItem,
}: {
  visualId: string;
  libraryItem: MockupLibraryItem | null;
}) {
  const { visualWorkspacePrefs } = useMockupMedia();

  const persisted = useMemo(
    () => visualWorkspacePrefs[visualId]?.canvasBackground ?? null,
    [visualId, visualWorkspacePrefs]
  );

  return (
    <div className="relative size-full overflow-hidden rounded-[3px]">
      <VisualCanvasPeekBackground persisted={persisted} />
      {libraryItem ? (
        libraryItem.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob / data URLs
          <img
            src={libraryItem.url}
            alt=""
            className="absolute inset-0 z-[2] size-full object-cover"
            draggable={false}
          />
        ) : (
          /* Native <video> draws an opaque black surface in many browsers — icon keeps canvas color visible. */
          <div
            className="absolute inset-0 z-[2] flex items-center justify-center"
            aria-hidden
          >
            <Play className="size-6 text-white drop-shadow-md" strokeWidth={2} />
          </div>
        )
      ) : null}
    </div>
  );
}

/**
 * Vertical strip of visual thumbnails + add control (shadcn popover/card tokens).
 * Each tile previews frame fill + assigned media; "+" adds an empty canvas slot.
 */
export function WorkspaceVisualsFloatingBar({
  className,
}: WorkspaceVisualsFloatingBarProps) {
  const {
    library,
    visuals,
    activeVisualId,
    setActiveVisualId,
    addEmptyVisual,
    removeVisual,
  } = useMockupMedia();

  const canRemoveVisual = visuals.length > 1;

  return (
    <aside
      role="toolbar"
      aria-label="Visuals in this project"
      className={cn(
        "pointer-events-auto flex max-h-[calc(100svh-7.5rem)] w-[92px] min-w-[92px] shrink-0 flex-col items-center gap-3 overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-popover/95 p-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10 backdrop-blur-md md:max-h-[calc(100dvh-8rem)]",
        "[scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1",
        className
      )}
    >
      <ul className="flex min-w-0 w-full flex-col items-center gap-3">
        {visuals.map((slot, index) => {
          const oneBased = index + 1;
          const assigned = slot.mediaId
            ? library.find((m) => m.id === slot.mediaId) ?? null
            : null;
          const tooltip =
            slot.label?.trim() ?? defaultVisualLabel(oneBased);
          const isActive = activeVisualId === slot.id;

          return (
            <li
              key={slot.id}
              className="group/item relative flex w-full flex-col items-center justify-center gap-1 text-center"
            >
              <span className="w-full text-center text-[11px] font-semibold tabular-nums leading-none text-foreground">
                {oneBased}
              </span>
              <div className="relative shrink-0">
                <button
                  type="button"
                  title={tooltip}
                  onClick={() => setActiveVisualId(slot.id)}
                  aria-label={`Select ${tooltip}`}
                  aria-pressed={isActive}
                  className={cn(
                    "relative size-[56px] shrink-0 overflow-hidden rounded-md bg-muted outline-none transition-[box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover active:scale-[0.98]",
                    isActive
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-popover"
                      : "ring-2 ring-border hover:ring-muted-foreground/40"
                  )}
                >
                  <VisualCanvasPeek
                    visualId={slot.id}
                    libraryItem={assigned}
                  />
                </button>
                {canRemoveVisual ? (
                  <button
                    type="button"
                    title="Remove visual"
                    aria-label={`Remove ${tooltip}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeVisual(slot.id);
                    }}
                    className={cn(
                      "absolute -right-1 -top-1 z-10 flex size-6 items-center justify-center rounded-md border border-border bg-popover/95 text-red-400 shadow-md backdrop-blur-sm outline-none transition-opacity",
                      "opacity-0 pointer-events-none group-hover/item:pointer-events-auto group-hover/item:opacity-100",
                      "focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
                      "hover:bg-red-500/20 hover:text-red-300"
                    )}
                  >
                    <Trash2 className="size-3.5" strokeWidth={2} aria-hidden />
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div
        role="separator"
        aria-hidden
        className="h-px w-full shrink-0 self-stretch bg-border"
      />

      <button
        type="button"
        title="Add visual"
        aria-label="Add visual"
        onClick={() => addEmptyVisual()}
        className={cn(
          "mx-auto flex size-[56px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-transparent text-foreground outline-none transition-[box-shadow,transform,background-color]",
          "ring-2 ring-border hover:bg-muted/80 hover:ring-muted-foreground/40",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
          "active:scale-[0.98]"
        )}
      >
        <Plus className="size-5 text-foreground" strokeWidth={2} aria-hidden />
      </button>
    </aside>
  );
}
