"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

import type { MockupBoundsBox } from "@/lib/mockup-canvas-transform";
import { cn } from "@/lib/utils";

const HANDLES = [
  {
    id: "nw",
    className: "left-0 top-0 cursor-nwse-resize",
    transform: (inverseScale: number) =>
      `translate(-50%, -50%) scale(${inverseScale})`,
  },
  {
    id: "ne",
    className: "right-0 top-0 cursor-nesw-resize",
    transform: (inverseScale: number) =>
      `translate(50%, -50%) scale(${inverseScale})`,
  },
  {
    id: "sw",
    className: "bottom-0 left-0 cursor-nesw-resize",
    transform: (inverseScale: number) =>
      `translate(-50%, 50%) scale(${inverseScale})`,
  },
  {
    id: "se",
    className: "bottom-0 right-0 cursor-nwse-resize",
    transform: (inverseScale: number) =>
      `translate(50%, 50%) scale(${inverseScale})`,
  },
] as const;

export type MockupResizeHandleId = (typeof HANDLES)[number]["id"];

type MockupSelectionHandlesProps = {
  bounds: MockupBoundsBox;
  mockupScale: number;
  onResizeHandlePointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    handle: MockupResizeHandleId
  ) => void;
};

export function MockupSelectionHandles({
  bounds,
  mockupScale,
  onResizeHandlePointerDown,
}: MockupSelectionHandlesProps) {
  const inverseScale = mockupScale > 0 ? 1 / mockupScale : 1;

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
          style={{ transform: handle.transform(inverseScale) }}
          className={cn(
            "pointer-events-auto absolute size-3 rounded-full border-2 border-white bg-sky-400 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]",
            handle.className
          )}
        />
      ))}
    </div>
  );
}
