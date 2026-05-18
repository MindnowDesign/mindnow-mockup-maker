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
import {
  anchorFloatingPanelPosition,
  useDraggableFloatingPanel,
} from "@/lib/use-draggable-floating-panel";
import { cn } from "@/lib/utils";

const panelClass =
  "z-[100] flex w-[min(100vw-2rem,280px)] flex-col gap-2.5 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm shadow-xl ring-1 ring-zinc-700 text-zinc-100";

type DraggableWorkspaceColorPickerProps = {
  displayHex: string;
  onColorChange: (hex: string) => void;
  triggerAriaLabel: string;
  className?: string;
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
      setAnchorPosition(null);
      return;
    }
    const boundary =
      workspaceBoundsRef?.current?.getBoundingClientRect() ?? null;
    setAnchorPosition(
      anchorFloatingPanelPosition(
        triggerRef.current.getBoundingClientRect(),
        undefined,
        undefined,
        boundary
      )
    );
  }, [open, workspaceBoundsRef]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
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

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
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
        style={{ backgroundColor: displayHex }}
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
                onPointerDown={onDragHandlePointerDown}
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
              <CanvasSolidColorPopoverPanel
                color={displayHex}
                onChange={onColorChange}
                popoverOpen={open}
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
