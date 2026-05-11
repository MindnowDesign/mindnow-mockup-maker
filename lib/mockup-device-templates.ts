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
];

export const MOCKUP_DEVICE_BY_ID: Record<string, MockupDeviceTemplate> =
  Object.fromEntries(MOCKUP_DEVICE_TEMPLATES.map((t) => [t.id, t]));
