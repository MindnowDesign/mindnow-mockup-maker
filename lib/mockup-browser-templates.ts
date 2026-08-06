/**
 * Browser chrome bars under `public/mockup-devices/` — top overlay on screenshots.
 * Each SVG is the header only; it scales to the screenshot width and sits on top.
 */

export type MockupBrowserTemplate = {
  id: string;
  label: string;
  browser: "chrome" | "safari";
  theme: "light" | "dark";
  /** Served from `public/mockup-devices/` */
  chromeSrc: string;
  chromePixelWidth: number;
  chromePixelHeight: number;
  /** Solid fill behind the SVG (covers transparent export edges). */
  chromeBackdrop: string;
};

/** Bump when SVG assets change so browsers skip stale cached copies. */
const BROWSER_CHROME_ASSET_VERSION = 3;

function mockupBrowserFile(filename: string): string {
  return `/mockup-devices/${encodeURIComponent(filename)}?v=${BROWSER_CHROME_ASSET_VERSION}`;
}

export const MOCKUP_BROWSER_TEMPLATES: MockupBrowserTemplate[] = [
  {
    id: "browser-chrome-light",
    label: "Chrome Light",
    browser: "chrome",
    theme: "light",
    chromeSrc: mockupBrowserFile("browser-chrome-light.svg"),
    chromePixelWidth: 1280,
    chromePixelHeight: 79,
    chromeBackdrop: "#DFE1E5",
  },
  {
    id: "browser-chrome-dark",
    label: "Chrome Dark",
    browser: "chrome",
    theme: "dark",
    chromeSrc: mockupBrowserFile("browser-chrome-dark.svg"),
    chromePixelWidth: 1280,
    chromePixelHeight: 79,
    chromeBackdrop: "#202124",
  },
  {
    id: "browser-safari-light",
    label: "Safari Light",
    browser: "safari",
    theme: "light",
    chromeSrc: mockupBrowserFile("browser-safari-light.svg"),
    chromePixelWidth: 1280,
    chromePixelHeight: 52,
    chromeBackdrop: "#FCFCFC",
  },
  {
    id: "browser-safari-dark",
    label: "Safari Dark",
    browser: "safari",
    theme: "dark",
    chromeSrc: mockupBrowserFile("browser-safari-dark.svg"),
    chromePixelWidth: 1280,
    chromePixelHeight: 52,
    chromeBackdrop: "#1C1C1E",
  },
];

export const MOCKUP_BROWSER_BY_ID: Record<string, MockupBrowserTemplate> =
  Object.fromEntries(MOCKUP_BROWSER_TEMPLATES.map((t) => [t.id, t]));

const BROWSER_TEMPLATE_IDS = new Set(
  MOCKUP_BROWSER_TEMPLATES.map((t) => t.id)
);

export function isBrowserTemplateId(id: string | null | undefined): boolean {
  return id != null && BROWSER_TEMPLATE_IDS.has(id);
}

/** Maps legacy saves to a concrete browser chrome asset. */
export function normalizeDeviceTemplateId(
  id: string | null | undefined
): string | null {
  if (id === "browser") return "browser-chrome-light";
  return id ?? null;
}

/** Chrome bar height as a fraction of screenshot width (constant at any scale). */
export function browserChromeHeightRatio(template: MockupBrowserTemplate): number {
  return template.chromePixelHeight / template.chromePixelWidth;
}

/**
 * Contain-fit a screenshot plus a browser bar stacked above it (bar does not overlap media).
 * Both share the same width; total height = chrome band + full image height at that width.
 */
export function fitBrowserScreenshotDimensions(
  natural: { w: number; h: number },
  viewport: { w: number; h: number },
  chromeHeightRatio: number
): { w: number; chromeH: number; imageH: number; h: number } {
  const heightPerWidth = chromeHeightRatio + natural.h / natural.w;
  const fitW = Math.min(viewport.w, viewport.h / heightPerWidth);
  /** Sub-pixel widths keep chrome SVG aspect locked to the bar box (no letterboxing gaps). */
  const w = Math.max(1, fitW);
  const chromeH = w * chromeHeightRatio;
  const imageH = (w * natural.h) / natural.w;
  return { w, chromeH, imageH, h: chromeH + imageH };
}
