"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

import type { MockupBoundsBox } from "@/lib/mockup-canvas-transform";
import { cn } from "@/lib/utils";

const HANDLES = [
  { id: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" },
  { id: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" },
  { id: "sw", className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize" },
  { id: "se", className: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize" },
] as const;

export type MockupResizeHandleId = (typeof HANDLES)[number]["id"];

type MockupSelectionHandlesProps = {
  bounds: MockupBoundsBox;
  onResizeHandlePointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    handle: MockupResizeHandleId
  ) => void;
};

export function MockupSelectionHandles({
  bounds,
  onResizeHandlePointerDown,
}: MockupSelectionHandlesProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-30"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.w,
        height: bounds.h,
      }}
    >
      <div className="absolute inset-0 rounded-sm ring-2 ring-sky-400/90 ring-offset-0" />
      {HANDLES.map((handle) => (
        <button
          key={handle.id}
          type="button"
          data-mockup-resize-handle={handle.id}
          aria-label={`Resize mockup ${handle.id}`}
          onPointerDown={(event) => onResizeHandlePointerDown(event, handle.id)}
          className={cn(
            "pointer-events-auto absolute size-3 rounded-full border-2 border-white bg-sky-400 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]",
            handle.className
          )}
        />
      ))}
    </div>
  );
}
