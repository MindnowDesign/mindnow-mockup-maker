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
};

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

/** Finish presets for iPhone 17 Pro Max (canvas frame only). */
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

export function isIphone17ProMaxTemplateId(id: string | null): boolean {
  if (!id) return false;
  return IPHONE_17_PRO_MAX_STYLES.some((s) => s.templateId === id);
}

export const MOCKUP_DEVICE_TEMPLATES: MockupDeviceTemplate[] = [
  {
    id: "iphone-17-black",
    label: "iPhone 17",
    frameSrc: "/mockup-devices/iphone-17-black.png",
    framePixelWidth: 1310,
    framePixelHeight: 2710,
    screen: {
      leftPct: 3.86,
      topPct: 1.55,
      /** 100 − left − right; right assumed = left */
      widthPct: 92.28,
      /** 100 − top − bottom; bottom assumed = top */
      heightPct: 96.9,
    },
  },
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
];

export const MOCKUP_DEVICE_BY_ID: Record<string, MockupDeviceTemplate> =
  Object.fromEntries(MOCKUP_DEVICE_TEMPLATES.map((t) => [t.id, t]));
