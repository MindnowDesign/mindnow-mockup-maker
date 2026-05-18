"use client";

import { GripHorizontal } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useCanvasWorkspaceBounds } from "@/components/canvas-workspace-bounds-context";
import { CanvasSolidColorPopoverPanel } from "@/components/canvas-solid-color-popover-panel";
import { OpacityPercentField } from "@/components/opacity-percent-field";
import { hexToRgbaCss } from "@/lib/canvas-gradient-fill-opacity";
import {
  anchorFloatingPanelPosition,
  useDraggableFloatingPanel,
} from "@/lib/use-draggable-floating-panel";
import { cn } from "@/lib/utils";

const panelClass =
  "z-[100] flex w-[min(100vw-2rem,280px)] flex-col gap-2.5 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm shadow-xl ring-1 ring-zinc-700 text-zinc-100";

const footerChrome =
  "rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25";

type DraggableWorkspaceColorPickerProps = {
  displayHex: string;
  onColorChange: (hex: string) => void;
  triggerAriaLabel: string;
  className?: string;
  /** Template fill picker only — opacity for this color stop (0–100). */
  opacityPercent?: number;
  onOpacityPercentChange?: (percent: number) => void;
};

/**
 * Canvas gradient swatch picker — floating panel in a portal (not Radix Popover),
 * so drag/reposition does not trigger dismiss-on-outside.
 */
export function DraggableWorkspaceColorPicker({
  displayHex,
  onColorChange,
  triggerAriaLabel,
  className,
  opacityPercent = 100,
  onOpacityPercentChange,
}: DraggableWorkspaceColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const workspaceBoundsRef = useCanvasWorkspaceBounds();
  const [anchorPosition, setAnchorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const { position, isDragging, isDraggingRef, onDragHandlePointerDown } =
    useDraggableFloatingPanel(
      open,
      anchorPosition,
      workspaceBoundsRef ?? undefined
    );

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setAnchorPosition((prev) => (prev === null ? prev : null));
      return;
    }
    const boundary =
      workspaceBoundsRef?.current?.getBoundingClientRect() ?? null;
    const next = anchorFloatingPanelPosition(
      triggerRef.current.getBoundingClientRect(),
      undefined,
      undefined,
      boundary
    );
    setAnchorPosition((prev) =>
      prev?.x === next.x && prev?.y === next.y ? prev : next
    );
  }, [open, workspaceBoundsRef]);

  useEffect(() => {
    if (!open) return;

    function onDismissPointer(e: PointerEvent) {
      if (isDraggingRef.current) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onDismissPointer);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDismissPointer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isDraggingRef]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-color-picker-trigger
        aria-label={triggerAriaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "box-border size-6 shrink-0 rounded border border-zinc-600 outline-none transition-colors",
          "hover:border-zinc-400 focus-visible:ring-2 focus-visible:ring-white/25",
          className
        )}
        style={{
          backgroundColor: hexToRgbaCss(displayHex, opacityPercent),
        }}
      />
      {mounted && open && position
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={triggerAriaLabel}
              className={cn(
                panelClass,
                isDragging && "cursor-grabbing select-none"
              )}
              style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                margin: 0,
              }}
            >
              <div
                aria-label="Drag to reposition color picker"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onDragHandlePointerDown(e);
                }}
                className={cn(
                  "-mx-1 -mt-1 mb-1.5 flex h-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-zinc-500",
                  "hover:bg-zinc-800/70 active:cursor-grabbing"
                )}
              >
                <GripHorizontal
                  className="size-3.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
              <div
                className="contents"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <CanvasSolidColorPopoverPanel
                  color={displayHex}
                  onChange={onColorChange}
                  popoverOpen={open}
                />
              </div>
              {onOpacityPercentChange ? (
                <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-2.5">
                  <span className="shrink-0 text-xs font-medium text-zinc-400">
                    Opacity
                  </span>
                  <div className={cn(footerChrome, "flex shrink-0 items-center")}>
                    <OpacityPercentField
                      value={opacityPercent}
                      onChange={onOpacityPercentChange}
                      inputAriaLabel={`${triggerAriaLabel} opacity`}
                    />
                  </div>
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
