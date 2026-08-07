"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

type DragSession = {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  pointerId: number;
};

/** Distance (px) from center where the mockup snaps on each axis. */
const SNAP_THRESHOLD = 12;

function snapAxis(value: number, threshold = SNAP_THRESHOLD): number {
  return Math.abs(value) <= threshold ? 0 : Math.round(value);
}

function applyCanvasSnap(x: number, y: number): { x: number; y: number } {
  return { x: snapAxis(x), y: snapAxis(y) };
}

function isSnappedToCenter(value: number): boolean {
  return value === 0;
}

function isInteractiveDragTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("input, button, label, a, [contenteditable='true']")
  );
}

export function useMockupCanvasDrag({
  offsetX,
  offsetY,
  setOffset,
  enabled,
}: {
  offsetX: number;
  offsetY: number;
  setOffset: (x: number, y: number) => void;
  enabled: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sessionRef = useRef<DragSession | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || e.button !== 0) return;
      if (isInteractiveDragTarget(e.target)) return;

      e.preventDefault();
      e.stopPropagation();

      sessionRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: offsetX,
        originY: offsetY,
        pointerId: e.pointerId,
      };
      setIsDragging(true);

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* unsupported */
      }
    },
    [enabled, offsetX, offsetY]
  );

  useEffect(() => {
    if (!isDragging) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    function onPointerMove(e: PointerEvent) {
      const session = sessionRef.current;
      if (!session || e.pointerId !== session.pointerId) return;

      const rawX = session.originX + (e.clientX - session.startX);
      const rawY = session.originY + (e.clientY - session.startY);
      const snapped = applyCanvasSnap(rawX, rawY);
      setOffset(snapped.x, snapped.y);
    }

    function endDrag(e: PointerEvent) {
      const session = sessionRef.current;
      if (!session || e.pointerId !== session.pointerId) return;

      const rawX = session.originX + (e.clientX - session.startX);
      const rawY = session.originY + (e.clientY - session.startY);
      const snapped = applyCanvasSnap(rawX, rawY);
      setOffset(snapped.x, snapped.y);

      sessionRef.current = null;
      setIsDragging(false);
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
  }, [isDragging, setOffset]);

  const dragStyle = {
    transform: `translate(${offsetX}px, ${offsetY}px)`,
  } satisfies CSSProperties;

  return {
    isDragging,
    isSnappedX: isSnappedToCenter(offsetX),
    isSnappedY: isSnappedToCenter(offsetY),
    onPointerDown,
    dragStyle,
  };
}
