"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

import {
  applyCanvasSnap,
  clampMockupScale,
  getBoundsBoxWithinRoot,
  isSnappedToCenter,
  type MockupBoundsBox,
} from "@/lib/mockup-canvas-transform";
import type { MockupResizeHandleId } from "@/components/mockup-selection-handles";

type DragSession = {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  pointerId: number;
};

type ResizeSession = {
  centerX: number;
  centerY: number;
  startDistance: number;
  originScale: number;
  pointerId: number;
};

function isInteractiveDragTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, button:not([data-mockup-resize-handle]), label, a, [contenteditable='true']"
    )
  );
}

function isMockupInteractionTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-mockup-bounds-target], [data-mockup-resize-handle]")
  );
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function useMockupCanvasTransform({
  offsetX,
  offsetY,
  scale,
  setOffset,
  setScale,
  enabled,
  resetKey,
  layoutSyncKey,
}: {
  offsetX: number;
  offsetY: number;
  scale: number;
  setOffset: (x: number, y: number) => void;
  setScale: (value: number) => void;
  enabled: boolean;
  resetKey: string | null;
  /** Bumps bounds remeasurement when canvas layout around the mockup changes. */
  layoutSyncKey?: string;
}) {
  const transformRootRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [bounds, setBounds] = useState<MockupBoundsBox | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const resizeSessionRef = useRef<ResizeSession | null>(null);

  useEffect(() => {
    setIsSelected(false);
  }, [resetKey]);

  useEffect(() => {
    function onDocumentPointerDown(event: PointerEvent) {
      if (isMockupInteractionTarget(event.target)) return;
      setIsSelected(false);
    }

    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () =>
      document.removeEventListener("pointerdown", onDocumentPointerDown);
  }, []);

  const measureBounds = useCallback(() => {
    const root = transformRootRef.current;
    if (!root) {
      setBounds(null);
      return;
    }
    const target = root.querySelector("[data-mockup-bounds-target]");
    if (!(target instanceof HTMLElement)) {
      setBounds(null);
      return;
    }
    setBounds(getBoundsBoxWithinRoot(root, target));
  }, []);

  useLayoutEffect(() => {
    measureBounds();
    const root = transformRootRef.current;
    if (!root) return;

    const target = root.querySelector("[data-mockup-bounds-target]");
    if (!(target instanceof HTMLElement)) return;

    const ro = new ResizeObserver(() => {
      measureBounds();
    });
    ro.observe(target);
    ro.observe(root);
    window.addEventListener("resize", measureBounds);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureBounds);
    };
  }, [measureBounds, enabled, resetKey, scale, offsetX, offsetY, layoutSyncKey]);

  useLayoutEffect(() => {
    const root = transformRootRef.current;
    if (root) root.getBoundingClientRect();
    measureBounds();
  }, [measureBounds, layoutSyncKey]);

  const onTransformPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("[data-mockup-resize-handle]")) {
        return;
      }
      if (isInteractiveDragTarget(event.target)) return;
      if (!isMockupInteractionTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
      setIsSelected(true);

      dragSessionRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: offsetX,
        originY: offsetY,
        pointerId: event.pointerId,
      };
      setIsDragging(true);

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* unsupported */
      }
    },
    [enabled, offsetX, offsetY]
  );

  const onResizeHandlePointerDown = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      _handle: MockupResizeHandleId
    ) => {
      if (!enabled || event.button !== 0 || !bounds) return;

      event.preventDefault();
      event.stopPropagation();
      setIsSelected(true);

      const root = transformRootRef.current;
      if (!root) return;

      const rootRect = root.getBoundingClientRect();
      const effectiveScale =
        root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1;
      const centerX = rootRect.left + (bounds.x + bounds.w / 2) * effectiveScale;
      const centerY = rootRect.top + (bounds.y + bounds.h / 2) * effectiveScale;
      const startDistance = Math.max(
        24,
        distance(centerX, centerY, event.clientX, event.clientY)
      );

      resizeSessionRef.current = {
        centerX,
        centerY,
        startDistance,
        originScale: scale,
        pointerId: event.pointerId,
      };
      setIsResizing(true);

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* unsupported */
      }
    },
    [enabled, bounds, scale]
  );

  useEffect(() => {
    if (!isDragging) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    function onPointerMove(event: PointerEvent) {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      const rawX = session.originX + (event.clientX - session.startX);
      const rawY = session.originY + (event.clientY - session.startY);
      const snapped = applyCanvasSnap(rawX, rawY);
      setOffset(snapped.x, snapped.y);
    }

    function endDrag(event: PointerEvent) {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      const rawX = session.originX + (event.clientX - session.startX);
      const rawY = session.originY + (event.clientY - session.startY);
      const snapped = applyCanvasSnap(rawX, rawY);
      setOffset(snapped.x, snapped.y);

      dragSessionRef.current = null;
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

  useEffect(() => {
    if (!isResizing) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    function onPointerMove(event: PointerEvent) {
      const session = resizeSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      const nextDistance = Math.max(
        24,
        distance(session.centerX, session.centerY, event.clientX, event.clientY)
      );
      const nextScale = clampMockupScale(
        session.originScale * (nextDistance / session.startDistance)
      );
      setScale(nextScale);
    }

    function endResize(event: PointerEvent) {
      const session = resizeSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      resizeSessionRef.current = null;
      setIsResizing(false);
    }

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", endResize);
    document.addEventListener("pointercancel", endResize);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endResize);
      document.removeEventListener("pointercancel", endResize);
      document.body.style.userSelect = prevUserSelect;
    };
  }, [isResizing, setScale]);

  const transformStyle = {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    transformOrigin: "center center",
  } satisfies CSSProperties;

  return {
    transformRootRef: transformRootRef as RefObject<HTMLDivElement>,
    isSelected,
    isDragging,
    isResizing,
    isSnappedX: isSnappedToCenter(offsetX),
    isSnappedY: isSnappedToCenter(offsetY),
    bounds,
    onTransformPointerDown,
    onResizeHandlePointerDown,
    transformStyle,
  };
}
