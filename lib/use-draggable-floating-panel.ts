"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

const EDGE_PAD = 8;
const DEFAULT_PANEL_W = 280;
const DEFAULT_PANEL_H = 262;

type PanelPosition = { x: number; y: number };

function positionsEqual(
  a: PanelPosition | null,
  b: PanelPosition | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

export function clampFloatingPanelPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  boundary: DOMRect | null
): { x: number; y: number } {
  if (boundary) {
    const minX = boundary.left + EDGE_PAD;
    const minY = boundary.top + EDGE_PAD;
    const maxX = Math.max(minX, boundary.right - width - EDGE_PAD);
    const maxY = Math.max(minY, boundary.bottom - height - EDGE_PAD);
    return {
      x: Math.min(Math.max(minX, x), maxX),
      y: Math.min(Math.max(minY, y), maxY),
    };
  }

  const maxX = Math.max(EDGE_PAD, window.innerWidth - width - EDGE_PAD);
  const maxY = Math.max(EDGE_PAD, window.innerHeight - height - EDGE_PAD);
  return {
    x: Math.min(Math.max(EDGE_PAD, x), maxX),
    y: Math.min(Math.max(EDGE_PAD, y), maxY),
  };
}

export function anchorFloatingPanelPosition(
  trigger: DOMRect,
  panelWidth = DEFAULT_PANEL_W,
  panelHeight = DEFAULT_PANEL_H,
  boundary: DOMRect | null = null
): { x: number; y: number } {
  const aboveY = trigger.top - panelHeight - 8;
  const belowY = trigger.bottom + 8;
  const preferAbove = aboveY >= (boundary?.top ?? 0) + EDGE_PAD;
  const y = preferAbove ? aboveY : belowY;
  const x = trigger.left + trigger.width / 2 - panelWidth / 2;
  return clampFloatingPanelPosition(x, y, panelWidth, panelHeight, boundary);
}

type DragSession = {
  offsetX: number;
  offsetY: number;
  pointerId: number;
};

/**
 * Fixed-position floating panel (portal). No Radix popper — safe to drag.
 */
type PanelDimensions = { width: number; height: number };

export function useDraggableFloatingPanel(
  open: boolean,
  initialPosition: { x: number; y: number } | null,
  boundaryRef?: RefObject<HTMLElement | null>,
  panelDimensions: PanelDimensions = {
    width: DEFAULT_PANEL_W,
    height: DEFAULT_PANEL_H,
  }
) {
  const panelW = panelDimensions.width;
  const panelH = panelDimensions.height;
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragSession = useRef<DragSession | null>(null);

  useEffect(() => {
    if (open && initialPosition) {
      setPosition((prev) =>
        positionsEqual(prev, initialPosition) ? prev : initialPosition
      );
    } else if (!open) {
      setPosition(null);
      setIsDragging(false);
      isDraggingRef.current = false;
      dragSession.current = null;
    }
  }, [open, initialPosition]);

  useEffect(() => {
    if (!isDragging) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    function onPointerMove(e: PointerEvent) {
      const session = dragSession.current;
      if (!session) return;

      const boundary = boundaryRef?.current?.getBoundingClientRect() ?? null;
      const { x, y } = clampFloatingPanelPosition(
        e.clientX - session.offsetX,
        e.clientY - session.offsetY,
        panelW,
        panelH,
        boundary
      );
      setPosition((prev) => {
        const next = { x, y };
        return positionsEqual(prev, next) ? prev : next;
      });
    }

    function endDrag(e: PointerEvent) {
      const session = dragSession.current;
      if (session && e.pointerId === session.pointerId) {
        dragSession.current = null;
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    }

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);
      document.body.style.userSelect = prevUserSelect;
    };
  }, [isDragging, boundaryRef, panelW, panelH]);

  const onDragHandlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || !position) return;

      e.preventDefault();
      e.stopPropagation();

      dragSession.current = {
        offsetX: e.clientX - position.x,
        offsetY: e.clientY - position.y,
        pointerId: e.pointerId,
      };
      isDraggingRef.current = true;
      setIsDragging(true);

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* unsupported */
      }
    },
    [position]
  );

  return {
    position,
    isDragging,
    isDraggingRef,
    onDragHandlePointerDown,
  };
}
