/**
 * Device mockup frames: PNG/SVG under `public/`, plus the screen cutout as % of the asset.
 * Width/height below complete left/top — symmetric bezels were assumed where values were omitted.
 */

export type MockupDeviceScreenInset = {
  /** Distance from the left edge of the frame image to the screen (0–100). */
  leftPct: number;
  /** Distance from the top edge of the frame image to the screen (0–100). */
  topPct: number;
  /** Screen width as % of frame width (0–100). */
  widthPct: number;
  /** Screen height as % of frame height (0–100). */
  heightPct: number;
};

export type MockupDeviceTemplate = {
  id: string;
  label: string;
  /** Served from `public/` */
  frameSrc: string;
  framePixelWidth: number;
  framePixelHeight: number;
  screen: MockupDeviceScreenInset;
  /**
   * CSS border-radius for the screen clip.
   * - `number`: single `%` value (phones ~8.6)
   * - `{ xPct, yPct }`: elliptical `% / %` so corners stay circular on non-square screens
   */
  screenBorderRadiusPct?: number | { xPct: number; yPct: number };
  /**
   * Size the device so the *screen* contain-fits the canvas (stand/bezel may clip).
   * Prefer for desktops with large chins/stands where frame-fit leaves the display tiny.
   */
  fitToScreen?: boolean;
  /**
   * Y position in the frame (0–100) that should sit on the canvas center when
   * `fitToScreen` is set. Defaults to the screen midpoint.
   */
  opticalCenterYPct?: number;
  /** Scale vs contain-fit (1 = fill the padded canvas; ~0.88 leaves presentation margin). */
  fitScale?: number;
};

/** Shared geometry for all iPhone 17 finish variants (swap PNG per color). */
const IPHONE_17_SCREEN: MockupDeviceScreenInset = {
  leftPct: 3.86,
  topPct: 1.55,
  /** 100 − left − right; right assumed = left */
  widthPct: 92.28,
  /** 100 − top − bottom; bottom assumed = top */
  heightPct: 96.9,
};

/** Color finish assets ship at 2×; black asset is 1× with the same proportions. */
const IPHONE_17_COLOR_DIMS = {
  framePixelWidth: 2620,
  framePixelHeight: 5420,
} as const;

const IPHONE_17_BLACK_DIMS = {
  framePixelWidth: 1310,
  framePixelHeight: 2710,
} as const;

/** Shared geometry for all iPhone 17 Pro Max finish variants (swap PNG per finish). */
const IPHONE_17_PRO_MAX_SCREEN: MockupDeviceScreenInset = {
  leftPct: 3.65,
  topPct: 1.45,
  widthPct: 92.7,
  heightPct: 97.1,
};

/** Default Pro Max frame pixel size (silver / orange / blue assets). */
const IPHONE_17_PRO_MAX_DIMS = {
  framePixelWidth: 1424,
  framePixelHeight: 2956,
} as const;

function mockupDeviceFile(filename: string): string {
  return `/mockup-devices/${encodeURIComponent(filename)}`;
}

/** Full-frame mockups under `public/mockup-devices/` — keys are internal `templateId`s. */
const IPHONE_17_FRAME_SRC: Record<string, string> = {
  "iphone-17-black": mockupDeviceFile("iphone-17-black.png"),
  "iphone-17-white": mockupDeviceFile("iphone-17-white.png"),
  "iphone-17-lavender": mockupDeviceFile("iphone-17-lavender.png"),
  "iphone-17-mist-blue": mockupDeviceFile("iphone-17-mist blue.png"),
  "iphone-17-sage": mockupDeviceFile("iphone-17-sage.png"),
};

const IPHONE_17_PRO_MAX_FRAME_SRC: Record<string, string> = {
  "iphone-17-pro-max-silver": mockupDeviceFile(
    "iphone-17-pro-max-silver.png"
  ),
  "iphone-17-pro-max-natural-titanium": mockupDeviceFile(
    "iphone-17-pro-max-orange.png"
  ),
  "iphone-17-pro-max-blue-titanium": mockupDeviceFile(
    "iphone-17-pro-max-blue.png"
  ),
  "iphone-17-pro-max-white-titanium": mockupDeviceFile(
    "iphone-17-pro-max-flat black.png"
  ),
  "iphone-17-pro-max-black-titanium": mockupDeviceFile(
    "iphone-17-pro-max-flat white.png"
  ),
};

export type DeviceStyleOption = {
  templateId: string;
  /** Label under the thumbnail in the Styles row */
  shortLabel: string;
  /** Square swatch under `public/` for the Styles picker */
  coverSrc: string;
};

function deviceStyleCover(filename: string): string {
  return `/images/device-styles-cover/${encodeURIComponent(filename)}`;
}

/** Finish presets for iPhone 17 — picker footer + sidebar Styles row. */
export const IPHONE_17_STYLES: DeviceStyleOption[] = [
  {
    templateId: "iphone-17-black",
    shortLabel: "Black",
    coverSrc: deviceStyleCover("iphone 17-color-black.png"),
  },
  {
    templateId: "iphone-17-white",
    shortLabel: "White",
    coverSrc: deviceStyleCover("iphone 17-color-white.png"),
  },
  {
    templateId: "iphone-17-lavender",
    shortLabel: "Lavender",
    coverSrc: deviceStyleCover("iphone 17-color-lavender.png"),
  },
  {
    templateId: "iphone-17-mist-blue",
    shortLabel: "Mist Blue",
    coverSrc: deviceStyleCover("iphone 17-color-mist blue.png"),
  },
  {
    templateId: "iphone-17-sage",
    shortLabel: "Sage",
    coverSrc: deviceStyleCover("iphone 17-color-sage.png"),
  },
];

/** Finish presets for iPhone 17 Pro Max — picker footer + sidebar Styles row. */
export const IPHONE_17_PRO_MAX_STYLES: DeviceStyleOption[] = [
  {
    templateId: "iphone-17-pro-max-silver",
    shortLabel: "Silver",
    coverSrc: deviceStyleCover("silver.png"),
  },
  {
    templateId: "iphone-17-pro-max-natural-titanium",
    shortLabel: "Cosmic Orange",
    coverSrc: deviceStyleCover("cosmic orange.png"),
  },
  {
    templateId: "iphone-17-pro-max-blue-titanium",
    shortLabel: "Deep Blue",
    coverSrc: deviceStyleCover("deep blue.png"),
  },
  {
    templateId: "iphone-17-pro-max-white-titanium",
    shortLabel: "Flat Black",
    coverSrc: deviceStyleCover("flat black.png"),
  },
  {
    templateId: "iphone-17-pro-max-black-titanium",
    shortLabel: "Flat White",
    coverSrc: deviceStyleCover("flat white.png"),
  },
];

export function isIphone17TemplateId(id: string | null): boolean {
  if (!id) return false;
  return IPHONE_17_STYLES.some((s) => s.templateId === id);
}

export function isIphone17ProMaxTemplateId(id: string | null): boolean {
  if (!id) return false;
  return IPHONE_17_PRO_MAX_STYLES.some((s) => s.templateId === id);
}

export const MOCKUP_DEVICE_TEMPLATES: MockupDeviceTemplate[] = [
  ...IPHONE_17_STYLES.map(({ templateId }) => ({
    id: templateId,
    label: "iPhone 17",
    frameSrc: IPHONE_17_FRAME_SRC[templateId]!,
    framePixelWidth:
      templateId === "iphone-17-black"
        ? IPHONE_17_BLACK_DIMS.framePixelWidth
        : IPHONE_17_COLOR_DIMS.framePixelWidth,
    framePixelHeight:
      templateId === "iphone-17-black"
        ? IPHONE_17_BLACK_DIMS.framePixelHeight
        : IPHONE_17_COLOR_DIMS.framePixelHeight,
    screen: { ...IPHONE_17_SCREEN },
  })),
  {
    id: "iphone-17-pro-max-silver",
    label: "iPhone 17 Pro Max",
    frameSrc: IPHONE_17_PRO_MAX_FRAME_SRC["iphone-17-pro-max-silver"],
    framePixelWidth: IPHONE_17_PRO_MAX_DIMS.framePixelWidth,
    framePixelHeight: IPHONE_17_PRO_MAX_DIMS.framePixelHeight,
    screen: { ...IPHONE_17_PRO_MAX_SCREEN },
  },
  {
    id: "iphone-17-pro-max-natural-titanium",
    label: "iPhone 17 Pro Max",
    frameSrc: IPHONE_17_PRO_MAX_FRAME_SRC["iphone-17-pro-max-natural-titanium"],
    framePixelWidth: IPHONE_17_PRO_MAX_DIMS.framePixelWidth,
    framePixelHeight: IPHONE_17_PRO_MAX_DIMS.framePixelHeight,
    screen: { ...IPHONE_17_PRO_MAX_SCREEN },
  },
  {
    id: "iphone-17-pro-max-blue-titanium",
    label: "iPhone 17 Pro Max",
    frameSrc: IPHONE_17_PRO_MAX_FRAME_SRC["iphone-17-pro-max-blue-titanium"],
    framePixelWidth: IPHONE_17_PRO_MAX_DIMS.framePixelWidth,
    framePixelHeight: IPHONE_17_PRO_MAX_DIMS.framePixelHeight,
    screen: { ...IPHONE_17_PRO_MAX_SCREEN },
  },
  {
    id: "iphone-17-pro-max-white-titanium",
    label: "iPhone 17 Pro Max",
    frameSrc: IPHONE_17_PRO_MAX_FRAME_SRC["iphone-17-pro-max-white-titanium"],
    /** `iphone-17-pro-max-flat black.png` — slightly wider canvas than 1424px variants */
    framePixelWidth: 1439,
    framePixelHeight: 2956,
    screen: { ...IPHONE_17_PRO_MAX_SCREEN },
  },
  {
    id: "iphone-17-pro-max-black-titanium",
    label: "iPhone 17 Pro Max",
    frameSrc: IPHONE_17_PRO_MAX_FRAME_SRC["iphone-17-pro-max-black-titanium"],
    /** `iphone-17-pro-max-flat white.png` */
    framePixelWidth: 1438,
    framePixelHeight: 2956,
    screen: { ...IPHONE_17_PRO_MAX_SCREEN },
  },
  {
    id: "tablet-11-space-black",
    label: "Tablet 11″",
    frameSrc: mockupDeviceFile("tablet-11-space-black.png"),
    framePixelWidth: 1868,
    framePixelHeight: 2620,
    /** Hole is 99,100 1668×2420; expand 2px under bezel to avoid canvas bleed. */
    screen: {
      leftPct: (97 / 1868) * 100,
      topPct: (98 / 2620) * 100,
      widthPct: (1672 / 1868) * 100,
      heightPct: (2424 / 2620) * 100,
    },
    /** ~68px circular corner matching the frame screen hole */
    screenBorderRadiusPct: {
      xPct: (70 / 1672) * 100,
      yPct: (70 / 2424) * 100,
    },
  },
  {
    id: "tablet-13-space-black",
    label: "Tablet 13″",
    frameSrc: mockupDeviceFile("tablet-13-space-black.png"),
    framePixelWidth: 2264,
    framePixelHeight: 2952,
    /** Hole is 100,100 2064×2752; expand 2px under bezel to avoid canvas bleed. */
    screen: {
      leftPct: (98 / 2264) * 100,
      topPct: (98 / 2952) * 100,
      widthPct: (2068 / 2264) * 100,
      heightPct: (2756 / 2952) * 100,
    },
    /** ~68px circular corner matching the frame screen hole */
    screenBorderRadiusPct: {
      xPct: (70 / 2068) * 100,
      yPct: (70 / 2756) * 100,
    },
  },
  {
    id: "imac-24",
    label: "iMac 24",
    frameSrc: mockupDeviceFile("imac-24.png"),
    framePixelWidth: 4880,
    framePixelHeight: 5720,
    /** Hole is 200,1600 4480×2520; expand 2px under bezel. */
    screen: {
      leftPct: (198 / 4880) * 100,
      topPct: (1598 / 5720) * 100,
      widthPct: (4484 / 4880) * 100,
      heightPct: (2524 / 5720) * 100,
    },
    screenBorderRadiusPct: {
      xPct: (8 / 4484) * 100,
      yPct: (8 / 2524) * 100,
    },
    /**
     * Size by the display (not the tall stand asset) so landscape canvases
     * still get a large mockup; stand may clip slightly at the edges.
     */
    fitToScreen: true,
    fitScale: 0.9,
  },
  {
    id: "imac-pro",
    label: "iMac Pro",
    frameSrc: mockupDeviceFile("imac-pro.png"),
    framePixelWidth: 5520,
    framePixelHeight: 4316,
    /** Hole is 200,200 5120×2880; expand 2px under bezel. */
    screen: {
      leftPct: (198 / 5520) * 100,
      topPct: (198 / 4316) * 100,
      widthPct: (5124 / 5520) * 100,
      heightPct: (2884 / 4316) * 100,
    },
    screenBorderRadiusPct: {
      xPct: (8 / 5124) * 100,
      yPct: (8 / 2884) * 100,
    },
    fitToScreen: true,
    fitScale: 0.9,
  },
  {
    id: "macbook-pro-16",
    label: "MacBook Pro 16″",
    frameSrc: mockupDeviceFile("macbook-pro-16.png"),
    framePixelWidth: 4893,
    framePixelHeight: 3164,
    /** Full screen hole incl. notch bay: 818,530 3260×2106; expand 2px under bezel. */
    screen: {
      leftPct: (816 / 4893) * 100,
      topPct: (528 / 3164) * 100,
      widthPct: (3264 / 4893) * 100,
      heightPct: (2110 / 3164) * 100,
    },
    screenBorderRadiusPct: {
      xPct: (28 / 3264) * 100,
      yPct: (28 / 2110) * 100,
    },
    fitToScreen: true,
    fitScale: 0.9,
  },
  {
    id: "macbook-air-13",
    label: "MacBook Air 13″",
    frameSrc: mockupDeviceFile("macbook-air-13.png"),
    framePixelWidth: 3840,
    framePixelHeight: 2401,
    /** Hole is 640,401 2560×1599; expand 2px under bezel. */
    screen: {
      leftPct: (638 / 3840) * 100,
      topPct: (399 / 2401) * 100,
      widthPct: (2564 / 3840) * 100,
      heightPct: (1603 / 2401) * 100,
    },
    screenBorderRadiusPct: {
      xPct: (24 / 2564) * 100,
      yPct: (24 / 1603) * 100,
    },
    fitToScreen: true,
    fitScale: 0.9,
  },
];

export const MOCKUP_DEVICE_BY_ID: Record<string, MockupDeviceTemplate> =
  Object.fromEntries(MOCKUP_DEVICE_TEMPLATES.map((t) => [t.id, t]));
