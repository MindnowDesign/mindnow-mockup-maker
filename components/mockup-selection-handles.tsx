"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

import type { MockupBoundsBox } from "@/lib/mockup-canvas-transform";
import { cn } from "@/lib/utils";

/** Screen-space hit thickness for edge/corner targets (stays constant as mockup scales). */
const EDGE_HIT_PX = 12;

const CORNER_HANDLES = [
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

const EDGE_HANDLES = [
  {
    id: "n",
    ariaLabel: "Resize mockup from top edge",
    className: "left-0 right-0 top-0 cursor-ns-resize",
    style: (hitLocal: number) => ({
      height: hitLocal,
      transform: "translateY(-50%)",
    }),
  },
  {
    id: "s",
    ariaLabel: "Resize mockup from bottom edge",
    className: "bottom-0 left-0 right-0 cursor-ns-resize",
    style: (hitLocal: number) => ({
      height: hitLocal,
      transform: "translateY(50%)",
    }),
  },
  {
    id: "w",
    ariaLabel: "Resize mockup from left edge",
    className: "bottom-0 left-0 top-0 cursor-ew-resize",
    style: (hitLocal: number) => ({
      width: hitLocal,
      transform: "translateX(-50%)",
    }),
  },
  {
    id: "e",
    ariaLabel: "Resize mockup from right edge",
    className: "bottom-0 right-0 top-0 cursor-ew-resize",
    style: (hitLocal: number) => ({
      width: hitLocal,
      transform: "translateX(50%)",
    }),
  },
] as const;

export type MockupResizeHandleId =
  | (typeof CORNER_HANDLES)[number]["id"]
  | (typeof EDGE_HANDLES)[number]["id"];

type MockupSelectionHandlesProps = {
  bounds: MockupBoundsBox;
  mockupScale: number;
  onResizeHandlePointerDown: (
    event: ReactPointerEvent<HTMLElement>,
    handle: MockupResizeHandleId
  ) => void;
};

export function MockupSelectionHandles({
  bounds,
  mockupScale,
  onResizeHandlePointerDown,
}: MockupSelectionHandlesProps) {
  const inverseScale = mockupScale > 0 ? 1 / mockupScale : 1;
  const edgeHitLocal = EDGE_HIT_PX * inverseScale;

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
      {EDGE_HANDLES.map((handle) => (
        <button
          key={handle.id}
          type="button"
          data-mockup-resize-handle={handle.id}
          aria-label={handle.ariaLabel}
          onPointerDown={(event) => onResizeHandlePointerDown(event, handle.id)}
          style={handle.style(edgeHitLocal)}
          className={cn(
            "pointer-events-auto absolute z-0 border-0 bg-transparent p-0",
            handle.className
          )}
        />
      ))}
      {CORNER_HANDLES.map((handle) => (
        <button
          key={handle.id}
          type="button"
          data-mockup-resize-handle={handle.id}
          aria-label={`Resize mockup ${handle.id}`}
          onPointerDown={(event) => onResizeHandlePointerDown(event, handle.id)}
          style={{ transform: handle.transform(inverseScale) }}
          className={cn(
            "pointer-events-auto absolute z-10 size-3 rounded-full border-2 border-white bg-sky-400 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]",
            handle.className
          )}
        />
      ))}
    </div>
  );
}
