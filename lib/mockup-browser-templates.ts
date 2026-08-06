/**
 * Browser chrome bars under `public/mockup-devices/` — top overlay on screenshots.
 * Each SVG is the header only; it scales to the screenshot width and sits on top.
 */

export type BrowserAddressBarInset = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  /** Pill radius as % of bar height. */
  borderRadiusPct: number;
  fill: string;
  textColor: string;
  /** Masks only the URL text strip, preserving omnibox icons (Chrome). */
  urlLabel?: {
    leftPct: number;
    topPct: number;
    widthPct: number;
    heightPct: number;
    /** Left inset for the label, as % of chrome SVG width (after padlock). */
    textPaddingLeftPct: number;
  };
  textAlign?: "left" | "center";
};

export type MockupBrowserTemplate = {
  id: string;
  label: string;
  browser: "chrome" | "safari";
  theme: "light" | "dark";
  /** Served from `public/mockup-devices/` */
  chromeSrc: string;
  /** Square thumbnail for the Browser styles picker (`public/mockup-devices/previews/`). */
  previewSrc: string;
  chromePixelWidth: number;
  chromePixelHeight: number;
  /** Solid fill behind the SVG (covers transparent export edges). */
  chromeBackdrop: string;
  /** Omnibox / address bar box for live URL overlay (percent of chrome SVG). */
  addressBar: BrowserAddressBarInset;
  /** Tab favicon slot (Chrome templates only). */
  favicon?: BrowserFaviconInset;
  /** Active tab title slot (Chrome templates only). */
  tabTitle?: BrowserTabTitleInset;
};

export type BrowserFaviconInset = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  /** Masks the baked-in SVG favicon when a custom upload is active. */
  containerFill: string;
  /** Pill radius as % of slot height (Chrome slot is 16×16 with rx=8). */
  borderRadiusPct: number;
};

export type BrowserTabTitleInset = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  /** Masks the baked-in SVG tab title (e.g. "Google"). */
  fill: string;
  textColor: string;
};

export const DEFAULT_BROWSER_URL = "google.com";

/** Trim + drop scheme for display in the chrome bar. */
export function displayBrowserUrl(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return DEFAULT_BROWSER_URL;
  return trimmed.replace(/^https?:\/\//i, "");
}

function capitalizeSiteLabel(label: string): string {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

/**
 * Site label for the Chrome tab — the segment before the TLD
 * (e.g. `www.google.com` → `Google`, `notion.so` → `Notion`).
 */
export function browserTabTitleFromUrl(raw: string | null | undefined): string {
  const host = displayBrowserUrl(raw).split("/")[0]?.split(":")[0] ?? "";
  const normalized = host.replace(/^www\./i, "");
  const parts = normalized.split(".").filter(Boolean);

  if (parts.length >= 2) {
    return capitalizeSiteLabel(parts[parts.length - 2] ?? normalized);
  }

  return capitalizeSiteLabel(parts[0] ?? (normalized || "Google"));
}

/** Persisted value — empty string is allowed while editing. */
export function normalizeBrowserUrl(raw: string | null | undefined): string {
  return (raw ?? "").trim();
}

const CHROME_FAVICON_GEOMETRY = {
  leftPct: (105 / 1280) * 100,
  topPct: (17 / 79) * 100,
  widthPct: (16 / 1280) * 100,
  heightPct: (16 / 79) * 100,
  borderRadiusPct: 50,
} as const;

/** Text strip after favicon, before the tab close control (1280×79 SVG). */
const CHROME_TAB_TITLE_GEOMETRY = {
  leftPct: (127 / 1280) * 100,
  topPct: (19 / 79) * 100,
  widthPct: (185 / 1280) * 100,
  heightPct: (12 / 79) * 100,
} as const;

const CHROME_ADDRESS_BAR_GEOMETRY = {
  leftPct: (108 / 1280) * 100,
  topPct: (46 / 79) * 100,
  widthPct: (1096 / 1280) * 100,
  heightPct: (28 / 79) * 100,
  borderRadiusPct: 50,
} as const;

/** URL text after the padlock, before trailing omnibox icons (1280×79 SVG). */
const CHROME_URL_LABEL_GEOMETRY = {
  /** Padlock ends ~x=130; mask starts at 138 to cover SVG glyph bleed. */
  leftPct: (138 / 1280) * 100,
  topPct: (46 / 79) * 100,
  widthPct: ((1140 - 138) / 1280) * 100,
  heightPct: (28 / 79) * 100,
  /** Text starts at x=146 in the SVG — 8px after the mask edge at 1280px. */
  textPaddingLeftPct: (8 / 1280) * 100,
} as const;

const SAFARI_ADDRESS_BAR_GEOMETRY = {
  leftPct: (382.688 / 1280) * 100,
  topPct: (12.5 / 52) * 100,
  widthPct: (515 / 1280) * 100,
  heightPct: (27 / 52) * 100,
  borderRadiusPct: (6.5 / 27) * 100,
} as const;

/** Bump when SVG/preview assets change so browsers skip stale cached copies. */
const BROWSER_CHROME_ASSET_VERSION = 5;

function mockupBrowserFile(filename: string): string {
  return `/mockup-devices/${encodeURIComponent(filename)}?v=${BROWSER_CHROME_ASSET_VERSION}`;
}

function mockupBrowserPreviewFile(filename: string): string {
  return `/mockup-devices/previews/${encodeURIComponent(filename)}?v=${BROWSER_CHROME_ASSET_VERSION}`;
}

export const MOCKUP_BROWSER_TEMPLATES: MockupBrowserTemplate[] = [
  {
    id: "browser-chrome-light",
    label: "Chrome Light",
    browser: "chrome",
    theme: "light",
    chromeSrc: mockupBrowserFile("browser-chrome-light-01.svg"),
    previewSrc: mockupBrowserPreviewFile("Chrome-light-preview.png"),
    chromePixelWidth: 1280,
    chromePixelHeight: 79,
    chromeBackdrop: "#DFE1E5",
    addressBar: {
      ...CHROME_ADDRESS_BAR_GEOMETRY,
      fill: "#F0F3F4",
      textColor: "#3C4043",
      urlLabel: CHROME_URL_LABEL_GEOMETRY,
      textAlign: "left",
    },
    favicon: {
      ...CHROME_FAVICON_GEOMETRY,
      containerFill: "#FFFFFF",
    },
    tabTitle: {
      ...CHROME_TAB_TITLE_GEOMETRY,
      fill: "#FFFFFF",
      textColor: "#3C4043",
    },
  },
  {
    id: "browser-chrome-dark",
    label: "Chrome Dark",
    browser: "chrome",
    theme: "dark",
    chromeSrc: mockupBrowserFile("browser-chrome-dark-01.svg"),
    previewSrc: mockupBrowserPreviewFile("Chrome-dark-preview.png"),
    chromePixelWidth: 1280,
    chromePixelHeight: 79,
    chromeBackdrop: "#202124",
    addressBar: {
      ...CHROME_ADDRESS_BAR_GEOMETRY,
      fill: "#202124",
      textColor: "#E8EAED",
      urlLabel: CHROME_URL_LABEL_GEOMETRY,
      textAlign: "left",
    },
    favicon: {
      ...CHROME_FAVICON_GEOMETRY,
      containerFill: "#35363A",
    },
    tabTitle: {
      ...CHROME_TAB_TITLE_GEOMETRY,
      fill: "#35363A",
      textColor: "#E8E8E8",
    },
  },
  {
    id: "browser-safari-light",
    label: "Safari Light",
    browser: "safari",
    theme: "light",
    chromeSrc: mockupBrowserFile("browser-safari-light.svg"),
    previewSrc: mockupBrowserPreviewFile("Safari-light-preview.png"),
    chromePixelWidth: 1280,
    chromePixelHeight: 52,
    chromeBackdrop: "#FCFCFC",
    addressBar: {
      ...SAFARI_ADDRESS_BAR_GEOMETRY,
      fill: "#FCFCFC",
      textColor: "rgba(0, 0, 0, 0.7)",
    },
  },
  {
    id: "browser-safari-dark",
    label: "Safari Dark",
    browser: "safari",
    theme: "dark",
    chromeSrc: mockupBrowserFile("browser-safari-dark.svg"),
    previewSrc: mockupBrowserPreviewFile("Safari-dark-preview.png"),
    chromePixelWidth: 1280,
    chromePixelHeight: 52,
    chromeBackdrop: "#1C1C1E",
    addressBar: {
      ...SAFARI_ADDRESS_BAR_GEOMETRY,
      fill: "#1C1C1E",
      textColor: "rgba(255, 255, 255, 0.85)",
    },
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

export function isChromeBrowserTemplateId(id: string | null | undefined): boolean {
  if (!id) return false;
  return MOCKUP_BROWSER_BY_ID[id]?.browser === "chrome";
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
