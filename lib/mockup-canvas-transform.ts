export const MOCKUP_SCALE_MIN = 0.25;
export const MOCKUP_SCALE_MAX = 3;
export const MOCKUP_SCALE_DEFAULT = 1;

/** Distance (px) from center where the mockup snaps on each axis. */
export const MOCKUP_SNAP_THRESHOLD = 12;

export function clampMockupScale(value: number): number {
  return (
    Math.round(
      Math.min(MOCKUP_SCALE_MAX, Math.max(MOCKUP_SCALE_MIN, value)) * 100
    ) / 100
  );
}

export function snapAxis(
  value: number,
  threshold = MOCKUP_SNAP_THRESHOLD
): number {
  return Math.abs(value) <= threshold ? 0 : Math.round(value);
}

export function applyCanvasSnap(x: number, y: number): { x: number; y: number } {
  return { x: snapAxis(x), y: snapAxis(y) };
}

export function isSnappedToCenter(value: number): boolean {
  return value === 0;
}

export type MockupBoundsBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Map screen-space rect into a transformed root's local layout coordinates. */
export function getBoundsBoxWithinRoot(
  root: HTMLElement,
  target: Element
): MockupBoundsBox {
  const rootRect = root.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const effectiveScale =
    root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1;

  return {
    x: (targetRect.left - rootRect.left) / effectiveScale,
    y: (targetRect.top - rootRect.top) / effectiveScale,
    w: targetRect.width / effectiveScale,
    h: targetRect.height / effectiveScale,
  };
}
