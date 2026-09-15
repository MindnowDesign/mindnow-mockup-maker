/**
 * Preview-only canvas rounding (stage chrome). Full-bleed background layers
 * use this so capture can flatten them to a rectangle.
 */
export const MOCKUP_CANVAS_CLIP_ATTR = "data-mockup-canvas-clip";

const SQUARE_CLIP_STYLE = `[data-mockup-capture-target],[data-mockup-capture-target] [${MOCKUP_CANVAS_CLIP_ATTR}]{border-radius:0!important;box-shadow:none!important;outline:none!important}`;

/** Temporarily square the canvas clip so html-to-image does not bake in UI rounding. */
export function beginSquareCanvasClip(): () => void {
  const style = document.createElement("style");
  style.setAttribute("data-mockup-export-square", "");
  style.textContent = SQUARE_CLIP_STYLE;
  document.head.appendChild(style);
  return () => {
    style.remove();
  };
}
