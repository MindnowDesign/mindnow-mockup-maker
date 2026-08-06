/** Plain canvas modes — no device PNG overlay. */
export const BROWSER_DEVICE_TEMPLATE_ID = "browser";

export function isPlainCanvasTemplateId(id: string | null): boolean {
  return id == null || id === BROWSER_DEVICE_TEMPLATE_ID;
}

export function isBrowserCanvasTemplateId(id: string | null): boolean {
  return id === BROWSER_DEVICE_TEMPLATE_ID;
}
