"use client";

import { GripHorizontal } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { useCanvasWorkspaceBounds } from "@/components/canvas-workspace-bounds-context";
import {
  DRAGGABLE_COLOR_PICKER_PANEL_SIZE,
  draggableColorPopoverContentClass,
} from "@/components/solid-color-popover-panel-content";
import {
  anchorFloatingPanelPosition,
  useDraggableFloatingPanel,
} from "@/lib/use-draggable-floating-panel";
import { cn } from "@/lib/utils";

const panelClass = cn(
  "z-[100] flex flex-col gap-2.5 rounded-lg border text-sm",
  draggableColorPopoverContentClass
);

type DraggableFloatingPopoverShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  ariaLabel: string;
  children: ReactNode;
};

/**
 * Portal popover with a drag handle — used only for workspace gradient fill
 * swatches so the panel can move without Radix dismiss-on-outside.
 */
export function DraggableFloatingPopoverShell({
  open,
  onOpenChange,
  triggerRef,
  ariaLabel,
  children,
}: DraggableFloatingPopoverShellProps) {
  const [mounted, setMounted] = useState(false);
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
      workspaceBoundsRef ?? undefined,
      DRAGGABLE_COLOR_PICKER_PANEL_SIZE
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
      DRAGGABLE_COLOR_PICKER_PANEL_SIZE.width,
      DRAGGABLE_COLOR_PICKER_PANEL_SIZE.height,
      boundary
    );
    setAnchorPosition((prev) =>
      prev?.x === next.x && prev?.y === next.y ? prev : next
    );
  }, [open, triggerRef, workspaceBoundsRef]);

  useEffect(() => {
    if (!open) return;

    function onDismissPointer(e: PointerEvent) {
      if (isDraggingRef.current) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("pointerdown", onDismissPointer);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDismissPointer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isDraggingRef, onOpenChange, triggerRef]);

  if (!mounted || !open || !position) {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={ariaLabel}
      className={cn(panelClass, isDragging && "cursor-grabbing select-none")}
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
        <GripHorizontal className="size-3.5" strokeWidth={2} aria-hidden />
      </div>
      <div
        className="contents"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
